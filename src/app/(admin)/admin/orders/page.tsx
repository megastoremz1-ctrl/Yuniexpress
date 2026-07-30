"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  Package, Search, Eye, X, Truck, CheckCircle, Clock,
  XCircle, RefreshCw, ChevronDown, MapPin, Phone, User,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface OrderItem {
  id: string;
  title: string;
  image: string | null;
  quantity: number;
  priceMZN: number;
  variant: string | null;
}

interface AdminOrder {
  id: string;
  orderNumber: string;
  customer: { name: string; email: string; phone: string };
  address: { name: string; phone: string; province: string; city: string; address: string } | null;
  totalMZN: number;
  subtotalMZN: number;
  discountMZN: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string | null;
  trackingNumber: string | null;
  createdAt: string;
  items: OrderItem[];
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  PENDING: { label: "Pendente", color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: Clock },
  CONFIRMED: { label: "Confirmada", color: "bg-blue-100 text-blue-700 border-blue-200", icon: CheckCircle },
  PROCESSING: { label: "Processando", color: "bg-purple-100 text-purple-700 border-purple-200", icon: RefreshCw },
  SHIPPED: { label: "Enviada", color: "bg-indigo-100 text-indigo-700 border-indigo-200", icon: Truck },
  DELIVERED: { label: "Entregue", color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle },
  CANCELLED: { label: "Cancelada", color: "bg-red-100 text-red-700 border-red-200", icon: XCircle },
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [updating, setUpdating] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: "20" });
      if (statusFilter) params.set("status", statusFilter);

      const res = await fetch(`/api/admin/orders?${params}`);
      const data = await res.json();
      setOrders(data.orders || []);
      setTotal(data.pagination?.total || 0);
    } catch (error) {
      toast.error("Erro ao carregar encomendas");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !newStatus) return;
    setUpdating(true);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          status: newStatus,
          trackingNumber: trackingNumber || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Encomenda actualizada para: ${statusConfig[newStatus]?.label || newStatus}`);
        setSelectedOrder(null);
        setNewStatus("");
        setTrackingNumber("");
        fetchOrders();
      } else {
        toast.error(data.error || "Erro ao actualizar");
      }
    } catch {
      toast.error("Erro ao actualizar encomenda");
    } finally {
      setUpdating(false);
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("pt-MZ", { style: "decimal", minimumFractionDigits: 0 }).format(price);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Encomendas</h1>
          <p className="text-sm text-gray-500 mt-1">{total} encomendas no total</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border mb-6 flex flex-wrap items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-yellow-500/30 focus:outline-none"
        >
          <option value="">Todos os estados</option>
          <option value="PENDING">Pendentes</option>
          <option value="CONFIRMED">Confirmadas</option>
          <option value="PROCESSING">Em processamento</option>
          <option value="SHIPPED">Enviadas</option>
          <option value="DELIVERED">Entregues</option>
          <option value="CANCELLED">Canceladas</option>
        </select>
        <button onClick={fetchOrders} className="p-2 hover:bg-gray-100 rounded-lg">
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Orders */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-white rounded-xl animate-pulse" />)}
        </div>
      ) : orders.length > 0 ? (
        <div className="space-y-3">
          {orders.map((order) => {
            const st = statusConfig[order.status] || statusConfig.PENDING;
            const StIcon = st.icon;
            return (
              <div key={order.id} className="bg-white rounded-xl border p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-bold text-gray-900">#{order.orderNumber}</span>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${st.color}`}>
                        <StIcon size={10} className="inline mr-1" />
                        {st.label}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        order.paymentStatus === "PAID" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {order.paymentStatus === "PAID" ? "Pago" : "Pendente"}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <User size={12} />
                        {order.customer.name}
                      </span>
                      {order.customer.phone && (
                        <span className="flex items-center gap-1">
                          <Phone size={12} />
                          {order.customer.phone}
                        </span>
                      )}
                      <span className="text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString("pt-MZ")}
                      </span>
                    </div>
                    {/* Items preview */}
                    <div className="flex items-center gap-2 mt-2">
                      {order.items.slice(0, 3).map((item) => (
                        <div key={item.id} className="w-10 h-10 bg-gray-100 rounded overflow-hidden">
                          {item.image && <img src={item.image} alt="" className="w-full h-full object-cover" />}
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <span className="text-xs text-gray-500">+{order.items.length - 3}</span>
                      )}
                      <span className="ml-2 text-sm text-gray-500">
                        {order.items.reduce((s, i) => s + i.quantity, 0)} itens
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold text-gray-900">{formatPrice(order.totalMZN)} MT</p>
                    <button
                      onClick={() => { setSelectedOrder(order); setNewStatus(order.status); }}
                      className="mt-2 text-xs bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
                    >
                      Gerir →
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Pagination */}
          {total > 20 && (
            <div className="flex items-center justify-between pt-4">
              <span className="text-sm text-gray-500">
                {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} de {total}
              </span>
              <div className="flex gap-2">
                <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-50">Anterior</button>
                <button onClick={() => setPage(page + 1)} disabled={page * 20 >= total} className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-50">Próxima</button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl border">
          <Package size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="font-medium text-gray-700">Nenhuma encomenda encontrada</p>
          <p className="text-sm text-gray-500 mt-1">As encomendas dos clientes aparecerão aqui</p>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedOrder(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white rounded-t-2xl">
              <h2 className="text-lg font-bold">Encomenda #{selectedOrder.orderNumber}</h2>
              <button onClick={() => setSelectedOrder(null)} className="p-1 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Customer Info */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Cliente</h3>
                <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-1">
                  <p><strong>{selectedOrder.customer.name}</strong></p>
                  <p className="text-gray-600">{selectedOrder.customer.email}</p>
                  {selectedOrder.customer.phone && <p className="text-gray-600">{selectedOrder.customer.phone}</p>}
                </div>
              </div>

              {/* Address */}
              {selectedOrder.address && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Endereço de Entrega</h3>
                  <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-1">
                    <p><strong>{selectedOrder.address.name}</strong> — {selectedOrder.address.phone}</p>
                    <p className="text-gray-600">{selectedOrder.address.address}</p>
                    <p className="text-gray-600">{selectedOrder.address.city}, {selectedOrder.address.province}</p>
                  </div>
                </div>
              )}

              {/* Items */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Itens ({selectedOrder.items.length})
                </h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                      <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden shrink-0">
                        {item.image && <img src={item.image} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 line-clamp-1">{item.title}</p>
                        {item.variant && <p className="text-xs text-gray-500">Variante: {item.variant}</p>}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-medium">{formatPrice(item.priceMZN)} MT</p>
                        <p className="text-xs text-gray-500">×{item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t text-right">
                  <p className="text-lg font-bold">{formatPrice(selectedOrder.totalMZN)} MT</p>
                </div>
              </div>

              {/* Update Status */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Alterar Estado</h3>
                <div className="space-y-3">
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-yellow-500/30 focus:outline-none"
                  >
                    <option value="PENDING">Pendente</option>
                    <option value="CONFIRMED">Confirmada</option>
                    <option value="PROCESSING">Em processamento</option>
                    <option value="SHIPPED">Enviada</option>
                    <option value="DELIVERED">Entregue</option>
                    <option value="CANCELLED">Cancelada</option>
                  </select>

                  {newStatus === "SHIPPED" && (
                    <Input
                      label="Número de rastreamento (opcional)"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="Ex: LZ123456789CN"
                    />
                  )}

                  <Button
                    onClick={handleUpdateStatus}
                    loading={updating}
                    fullWidth
                    disabled={newStatus === selectedOrder.status}
                  >
                    {newStatus === selectedOrder.status
                      ? "Selecione um novo estado"
                      : `Actualizar para: ${statusConfig[newStatus]?.label || newStatus}`}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
