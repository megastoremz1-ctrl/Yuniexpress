"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";

import { Package, ChevronRight, Truck, Clock, ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/cart";
import toast from "react-hot-toast";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  totalMZN: number;
  createdAt: string;
  trackingNumber?: string | null;
  items: {
    id: string;
    title: string;
    image: string | null;
    quantity: number;
    priceMZN: number;
  }[];
}

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") fetchOrders();
  }, [status]);

  if (status === "unauthenticated") redirect("/login");

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("pt-MZ", { style: "decimal", minimumFractionDigits: 0 }).format(price);

  const statusLabels: Record<string, { label: string; color: string }> = {
    PENDING: { label: "Pendente", color: "bg-yellow-100 text-yellow-700" },
    CONFIRMED: { label: "Confirmada", color: "bg-blue-100 text-blue-700" },
    PROCESSING: { label: "Em processamento", color: "bg-purple-100 text-purple-700" },
    SHIPPED: { label: "Enviada", color: "bg-indigo-100 text-indigo-700" },
    DELIVERED: { label: "Entregue", color: "bg-green-100 text-green-700" },
    CANCELLED: { label: "Cancelada", color: "bg-red-100 text-red-700" },
  };

  if (status === "loading") {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-yellow-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const addToCart = useCartStore((s) => s.addItem);

  const restoreToCart = (order: Order) => {
    order.items.forEach((item) => {
      addToCart({
        id: `cart-${item.id}-${Date.now()}`,
        productId: item.id,
        title: item.title,
        image: item.image || "",
        priceMZN: item.priceMZN,
        quantity: item.quantity,
        stock: 100,
      });
    });
    toast.success("Produtos devolvidos ao carrinho!");
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/account" className="hover:text-yellow-600">Conta</Link>
        <ChevronRight size={14} />
        <span className="text-gray-900">Minhas Encomendas</span>
      </nav>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Minhas Encomendas</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <Package size={48} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma encomenda</h2>
          <p className="text-gray-500 mb-4">Ainda não fez nenhuma compra.</p>
          <Link href="/" className="text-yellow-600 hover:underline font-medium">
            Explorar produtos
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const st = statusLabels[order.status] || { label: order.status, color: "bg-gray-100 text-gray-700" };
            return (
              <div key={order.id} className="bg-white rounded-xl border p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-sm font-semibold text-gray-900">
                      #{order.orderNumber}
                    </span>
                    <span className="text-xs text-gray-500 ml-3">
                      {new Date(order.createdAt).toLocaleDateString("pt-MZ")}
                    </span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${st.color}`}>
                    {st.label}
                  </span>
                </div>

                <div className="space-y-2">
                  {order.items.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden relative shrink-0">
                        {item.image && (
                          <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 line-clamp-1">{item.title}</p>
                        <p className="text-xs text-gray-500">Qtd: {item.quantity}</p>
                      </div>
                      <span className="text-sm font-medium">{formatPrice(item.priceMZN)} MT</span>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <p className="text-xs text-gray-500">+{order.items.length - 3} mais itens</p>
                  )}
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t">
                  <span className="text-sm font-bold text-gray-900">
                    Total: {formatPrice(order.totalMZN)} MT
                  </span>
                  <div className="flex items-center gap-2">
                    {order.trackingNumber && (
                      <span className="text-xs text-blue-600 flex items-center gap-1">
                        <Truck size={12} />
                        {order.trackingNumber}
                      </span>
                    )}
                    {order.status === "CANCELLED" && (
                      <button
                        onClick={() => restoreToCart(order)}
                        className="text-xs bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded-lg font-medium flex items-center gap-1 transition-colors"
                      >
                        <ShoppingCart size={12} />
                        Restaurar ao Carrinho
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
