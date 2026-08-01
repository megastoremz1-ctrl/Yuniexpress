"use client";

import { useState, useEffect, use } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight,
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  MapPin,
  CreditCard,
  ExternalLink,
  Copy,
  Star,
} from "lucide-react";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";

interface TimelineStep {
  key: string;
  label: string;
  description: string;
  date: string | null;
  completed: boolean;
  isCancelled?: boolean;
}

interface OrderDetail {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string | null;
  subtotalMZN: number;
  shippingMZN: number;
  discountMZN: number;
  totalMZN: number;
  trackingNumber: string | null;
  trackingUrl: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
  updatedAt: string;
  notes: string | null;
  address: {
    name: string;
    phone: string;
    province: string;
    city: string;
    district: string | null;
    address: string;
  } | null;
  items: {
    id: string;
    title: string;
    image: string | null;
    variant: string | null;
    quantity: number;
    priceMZN: number;
    totalMZN: number;
    productSlug: string | null;
  }[];
  timeline: TimelineStep[];
}

export default function OrderTrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session, status: authStatus } = useSession();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authStatus === "authenticated") fetchOrder();
  }, [authStatus]);

  if (authStatus === "unauthenticated") redirect("/login");

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${id}`);
      const data = await res.json();
      if (res.ok) {
        setOrder(data.order);
      } else {
        setError(data.error || "Encomenda não encontrada");
      }
    } catch {
      setError("Erro ao carregar encomenda");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("pt-MZ", { style: "decimal", minimumFractionDigits: 0 }).format(price);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("pt-MZ", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const copyTracking = () => {
    if (order?.trackingNumber) {
      navigator.clipboard.writeText(order.trackingNumber);
      toast.success("Número de rastreamento copiado!");
    }
  };

  const statusColors: Record<string, string> = {
    PENDING: "text-yellow-600",
    CONFIRMED: "text-blue-600",
    PROCESSING: "text-purple-600",
    SHIPPED: "text-indigo-600",
    DELIVERED: "text-green-600",
    CANCELLED: "text-red-600",
  };

  const paymentMethodLabels: Record<string, string> = {
    mpesa: "M-Pesa",
    emola: "e-Mola",
    card: "Cartão Visa/Mastercard",
  };

  if (authStatus === "loading" || loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-yellow-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Package size={48} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-lg font-semibold text-gray-900 mb-2">{error || "Encomenda não encontrada"}</h2>
        <Link href="/account/orders" className="text-yellow-600 hover:underline">
          Voltar às encomendas
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap">
        <Link href="/account" className="hover:text-yellow-600">Conta</Link>
        <ChevronRight size={14} />
        <Link href="/account/orders" className="hover:text-yellow-600">Encomendas</Link>
        <ChevronRight size={14} />
        <span className="text-gray-900">#{order.orderNumber}</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Encomenda #{order.orderNumber}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Criada em {formatDate(order.createdAt)}
          </p>
        </div>
        <span className={`text-sm font-semibold ${statusColors[order.status] || "text-gray-600"}`}>
          {order.status === "PENDING" && "Pendente"}
          {order.status === "CONFIRMED" && "Confirmada"}
          {order.status === "PROCESSING" && "Em processamento"}
          {order.status === "SHIPPED" && "Enviada"}
          {order.status === "DELIVERED" && "Entregue"}
          {order.status === "CANCELLED" && "Cancelada"}
        </span>
      </div>

      {/* Tracking Number */}
      {order.trackingNumber && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Truck size={20} className="text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">Número de Rastreamento</p>
                <p className="text-sm text-blue-700 font-mono">{order.trackingNumber}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={copyTracking}
                className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                title="Copiar"
              >
                <Copy size={16} className="text-blue-600" />
              </button>
              {order.trackingUrl && (
                <a
                  href={order.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                  title="Rastrear"
                >
                  <ExternalLink size={16} className="text-blue-600" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="bg-white rounded-xl border p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <Clock size={18} className="text-yellow-500" />
          Rastreamento
        </h2>

        <div className="relative">
          {order.timeline.map((step, idx) => {
            const isLast = idx === order.timeline.length - 1;
            const Icon = step.isCancelled
              ? XCircle
              : step.completed
              ? CheckCircle
              : Clock;

            return (
              <div key={step.key} className="flex gap-4 relative">
                {/* Line connector */}
                {!isLast && (
                  <div
                    className={`absolute left-[15px] top-[32px] w-0.5 h-[calc(100%-8px)] ${
                      step.completed ? (step.isCancelled ? "bg-red-300" : "bg-green-300") : "bg-gray-200"
                    }`}
                  />
                )}

                {/* Icon */}
                <div className="relative z-10 shrink-0">
                  <Icon
                    size={30}
                    className={
                      step.isCancelled
                        ? "text-red-500"
                        : step.completed
                        ? "text-green-500"
                        : "text-gray-300"
                    }
                  />
                </div>

                {/* Content */}
                <div className={`pb-8 ${isLast ? "pb-0" : ""}`}>
                  <p
                    className={`font-medium text-sm ${
                      step.isCancelled
                        ? "text-red-700"
                        : step.completed
                        ? "text-gray-900"
                        : "text-gray-400"
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{step.description}</p>
                  {step.date && (
                    <p className="text-xs text-gray-400 mt-1">{formatDate(step.date)}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Items */}
      <div className="bg-white rounded-xl border p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Package size={18} className="text-yellow-500" />
          Itens da Encomenda
        </h2>

        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <div className="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                {item.image && (
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                {item.productSlug ? (
                  <Link
                    href={`/product/${item.productSlug}`}
                    className="text-sm text-gray-800 line-clamp-1 hover:text-yellow-600"
                  >
                    {item.title}
                  </Link>
                ) : (
                  <p className="text-sm text-gray-800 line-clamp-1">{item.title}</p>
                )}
                <div className="flex items-center gap-3 mt-0.5">
                  {item.variant && (
                    <span className="text-xs text-gray-500">{item.variant}</span>
                  )}
                  <span className="text-xs text-gray-500">Qtd: {item.quantity}</span>
                </div>
              </div>
              <span className="text-sm font-medium text-gray-900 shrink-0">
                {formatPrice(item.totalMZN)} MT
              </span>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="border-t mt-4 pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Subtotal</span>
            <span>{formatPrice(order.subtotalMZN)} MT</span>
          </div>
          {order.shippingMZN > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Envio</span>
              <span>{formatPrice(order.shippingMZN)} MT</span>
            </div>
          )}
          {order.discountMZN > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Desconto</span>
              <span className="text-green-600">-{formatPrice(order.discountMZN)} MT</span>
            </div>
          )}
          <div className="flex justify-between text-base font-bold pt-2 border-t">
            <span>Total</span>
            <span>{formatPrice(order.totalMZN)} MT</span>
          </div>
        </div>
      </div>

      {/* Delivery Address */}
      {order.address && (
        <div className="bg-white rounded-xl border p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <MapPin size={18} className="text-yellow-500" />
            Endereço de Entrega
          </h2>
          <div className="text-sm text-gray-600 space-y-1">
            <p className="font-medium text-gray-900">{order.address.name}</p>
            <p>{order.address.phone}</p>
            <p>{order.address.address}</p>
            <p>
              {order.address.city}
              {order.address.district ? `, ${order.address.district}` : ""} — {order.address.province}
            </p>
          </div>
        </div>
      )}

      {/* Payment Info */}
      <div className="bg-white rounded-xl border p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <CreditCard size={18} className="text-yellow-500" />
          Pagamento
        </h2>
        <div className="text-sm text-gray-600 space-y-1">
          <p>
            <span className="text-gray-500">Método: </span>
            <span className="font-medium">
              {order.paymentMethod
                ? paymentMethodLabels[order.paymentMethod] || order.paymentMethod
                : "—"}
            </span>
          </p>
          <p>
            <span className="text-gray-500">Estado: </span>
            <span
              className={`font-medium ${
                order.paymentStatus === "PAID"
                  ? "text-green-600"
                  : order.paymentStatus === "FAILED"
                  ? "text-red-600"
                  : "text-yellow-600"
              }`}
            >
              {order.paymentStatus === "PAID" && "Pago"}
              {order.paymentStatus === "PENDING" && "Pendente"}
              {order.paymentStatus === "FAILED" && "Falhou"}
              {order.paymentStatus === "REFUNDED" && "Reembolsado"}
            </span>
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Link href="/account/orders" className="flex-1">
          <Button variant="outline" fullWidth>
            Voltar às Encomendas
          </Button>
        </Link>
        {order.status === "DELIVERED" && (
          <Link href={`/product/${order.items[0]?.productSlug || ""}`} className="flex-1">
            <Button fullWidth>
              <Star size={16} className="mr-2" />
              Avaliar Produtos
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
