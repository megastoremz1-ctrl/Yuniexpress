"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { CreditCard, MapPin, Shield } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { calculateShipping } from "@/lib/services/shipping";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { items, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("mpesa");
  const [billingPhone, setBillingPhone] = useState("");
  const [address, setAddress] = useState({
    name: "",
    phone: "",
    province: "",
    city: "",
    district: "",
    address: "",
  });
  const [addressLoaded, setAddressLoaded] = useState(false);

  // Pre-fill address from user's last order or profile
  useEffect(() => {
    if (status === "authenticated" && !addressLoaded) {
      fetch("/api/orders?limit=1")
        .then((r) => r.json())
        .then((data) => {
          if (data.orders && data.orders.length > 0) {
            // Use last order address
          }
        })
        .catch(() => {});

      // Pre-fill name from session
      if (session?.user?.name) {
        setAddress((prev) => ({ ...prev, name: prev.name || session.user?.name || "" }));
      }

      // Try to get last saved address
      fetch("/api/user/address")
        .then((r) => r.json())
        .then((data) => {
          if (data.address) {
            setAddress({
              name: data.address.name || session?.user?.name || "",
              phone: data.address.phone || "",
              province: data.address.province || "",
              city: data.address.city || "",
              district: data.address.district || "",
              address: data.address.address || "",
            });
          }
        })
        .catch(() => {});

      setAddressLoaded(true);
    }
  }, [status, session, addressLoaded]);

  const subtotal = items.reduce((sum, item) => sum + item.priceMZN * item.quantity, 0);
  const formatPrice = (price: number) =>
    new Intl.NumberFormat("pt-MZ", { style: "decimal", minimumFractionDigits: 0 }).format(price);

  // Wait for session to load before checking auth
  if (status === "loading") {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-yellow-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Carrinho Vazio</h1>
        <p className="text-gray-500 mb-6">Adicione produtos ao carrinho para finalizar a compra.</p>
        <Button onClick={() => router.push("/")}>Ver Produtos</Button>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    // Validate address
    if (!address.name || !address.phone || !address.province || !address.city || !address.address) {
      toast.error("Preencha todos os campos do endereço");
      return;
    }

    // Validate billing phone for M-Pesa/e-Mola
    if ((paymentMethod === "mpesa" || paymentMethod === "emola") && !billingPhone) {
      toast.error("Insira o número para cobrança");
      return;
    }

    if (paymentMethod === "mpesa" && billingPhone && !billingPhone.match(/^8[45]/)) {
      toast.error("Número M-Pesa deve começar com 84 ou 85");
      return;
    }

    if (paymentMethod === "emola" && billingPhone && !billingPhone.match(/^8[67]/)) {
      toast.error("Número e-Mola deve começar com 86 ou 87");
      return;
    }

    setLoading(true);
    try {
      // Create order with items from Zustand cart
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            title: item.title,
            image: item.image,
            variant: item.variant,
            quantity: item.quantity,
            priceMZN: item.priceMZN,
          })),
          address,
          paymentMethod: `paysuite_${paymentMethod}`,
        }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        toast.error(orderData.error || "Erro ao criar encomenda");
        setLoading(false);
        return;
      }

      // Initiate payment via ZumboPay
      const payRes = await fetch("/api/payments/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: orderData.order.id,
          method: paymentMethod !== "all" ? paymentMethod : undefined,
          phone: billingPhone ? `258${billingPhone}` : undefined,
        }),
      });

      const payData = await payRes.json();

      if (payData.success) {
        clearCart();
        if (payData.type === "stk_push") {
          // STK push sent - customer confirms on phone
          toast.success(payData.message || "Confirme o pagamento no telemóvel!");
          router.push("/account/orders");
        } else if (payData.checkoutUrl) {
          // Redirect to ZumboPay checkout
          toast.success("Redirecionando para pagamento...");
          window.location.replace(payData.checkoutUrl);
        } else {
          toast.success("Encomenda criada!");
          router.push("/account/orders");
        }
      } else {
        toast.error(payData.message || payData.error || "Erro no pagamento");
      }
    } catch (error: any) {
      toast.error("Erro: " + (error.message || "Tente novamente"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Finalizar Compra</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Address */}
          <div className="bg-white p-6 rounded-xl border">
            <div className="flex items-center gap-2 mb-4">
              <MapPin size={20} className="text-yellow-500" />
              <h2 className="text-lg font-semibold">Endereço de Entrega</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nome completo"
                value={address.name}
                onChange={(e) => setAddress({ ...address, name: e.target.value })}
                required
              />
              <Input
                label="Telemóvel"
                value={address.phone}
                onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                placeholder="84XXXXXXX"
                required
              />
              <Input
                label="Província"
                value={address.province}
                onChange={(e) => setAddress({ ...address, province: e.target.value })}
                required
              />
              <Input
                label="Cidade"
                value={address.city}
                onChange={(e) => setAddress({ ...address, city: e.target.value })}
                required
              />
              <div className="md:col-span-2">
                <Input
                  label="Endereço completo"
                  value={address.address}
                  onChange={(e) => setAddress({ ...address, address: e.target.value })}
                  placeholder="Rua, número, bairro..."
                  required
                />
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white p-6 rounded-xl border">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard size={20} className="text-yellow-500" />
              <h2 className="text-lg font-semibold">Método de Pagamento</h2>
            </div>
            <div className="space-y-3">
              {[
                { id: "mpesa", label: "M-Pesa", description: "Vodacom M-Pesa — PIN no telemóvel" },
                { id: "emola", label: "e-Mola", description: "Movitel e-Mola — PIN no telemóvel" },
                { id: "all", label: "Visa / Mastercard", description: "Cartão de crédito ou débito (3DS)" },
              ].map((method) => (
                <label
                  key={method.id}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                    paymentMethod === method.id
                      ? "border-yellow-500 bg-yellow-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={method.id}
                    checked={paymentMethod === method.id}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-yellow-500 focus:ring-yellow-500"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{method.label}</p>
                    <p className="text-sm text-gray-500">{method.description}</p>
                  </div>
                </label>
              ))}
            </div>

            {/* Phone number for billing (M-Pesa / e-Mola) */}
            {(paymentMethod === "mpesa" || paymentMethod === "emola") && (
              <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número para cobrança ({paymentMethod === "mpesa" ? "M-Pesa 84/85" : "e-Mola 86/87"})
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 bg-white px-3 py-2.5 border rounded-lg">+258</span>
                  <input
                    type="tel"
                    value={billingPhone}
                    onChange={(e) => setBillingPhone(e.target.value.replace(/\D/g, "").slice(0, 9))}
                    placeholder={paymentMethod === "mpesa" ? "84XXXXXXX" : "86XXXXXXX"}
                    className="flex-1 px-4 py-2.5 border rounded-lg text-sm focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 focus:outline-none"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Receberá um pedido de PIN no telemóvel para confirmar o pagamento
                </p>
              </div>
            )}

            {paymentMethod === "all" && (
              <div className="mt-4 p-4 bg-blue-50 rounded-xl">
                <p className="text-xs text-blue-700">
                  Será redirecionado para uma página segura para inserir os dados do cartão (Visa/Mastercard com 3D Secure).
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white p-6 rounded-xl border h-fit sticky top-24">
          <h2 className="text-lg font-semibold mb-4">Resumo da Encomenda</h2>
          
          <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                  {item.image && (
                    <img src={item.image} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-700 line-clamp-1">{item.title}</p>
                  <p className="text-xs text-gray-500">Qtd: {item.quantity}</p>
                </div>
                <span className="text-sm font-medium shrink-0">
                  {formatPrice(item.priceMZN * item.quantity)} MT
                </span>
              </div>
            ))}
          </div>

          <div className="border-t pt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span>{formatPrice(subtotal)} MT</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Envio</span>
              {(() => {
                const shipping = calculateShipping(subtotal, 1);
                const cheapest = shipping[0];
                return cheapest.free ? (
                  <span className="text-green-600 font-medium">Grátis</span>
                ) : (
                  <span>{formatPrice(cheapest.price)} MT</span>
                );
              })()}
            </div>
            <div className="flex justify-between border-t pt-2 text-lg font-bold">
              <span>Total</span>
              {(() => {
                const shipping = calculateShipping(subtotal, 1);
                const shippingCost = shipping[0].free ? 0 : shipping[0].price;
                return <span className="text-red-600">{formatPrice(subtotal + shippingCost)} MT</span>;
              })()}
            </div>
          </div>

          <Button
            onClick={handlePlaceOrder}
            loading={loading}
            fullWidth
            size="lg"
            className="mt-6"
          >
            Confirmar Encomenda
          </Button>

          <div className="flex items-center gap-2 mt-4 text-xs text-gray-500">
            <Shield size={14} className="text-green-500" />
            <span>Pagamento 100% seguro via PaySuite</span>
          </div>
        </div>
      </div>
    </div>
  );
}
