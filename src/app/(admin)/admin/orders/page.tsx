"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Package, Search, Eye } from "lucide-react";

interface AdminOrder {
  id: string;
  orderNumber: string;
  customer: string;
  totalMZN: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  itemCount: number;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });
      if (statusFilter) params.set("status", statusFilter);

      const res = await fetch(`/api/admin/stats`);
      const data = await res.json();
      setOrders(data.recentOrders || []);
      setTotal(data.recentOrders?.length || 0);
    } catch (error) {
      toast.error("Erro ao carregar encomendas");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("pt-MZ", { style: "decimal", minimumFractionDigits: 0 }).format(price);

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-700",
    CONFIRMED: "bg-blue-100 text-blue-700",
    PROCESSING: "bg-purple-100 text-purple-700",
    SHIPPED: "bg-indigo-100 text-indigo-700",
    DELIVERED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestão de Encomendas</h1>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border mb-6 flex items-center gap-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg text-sm"
        >
          <option value="">Todos os estados</option>
          <option value="PENDING">Pendentes</option>
          <option value="CONFIRMED">Confirmadas</option>
          <option value="PROCESSING">Em processamento</option>
          <option value="SHIPPED">Enviadas</option>
          <option value="DELIVERED">Entregues</option>
          <option value="CANCELLED">Canceladas</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
            <tr>
              <th className="px-6 py-3 text-left">Encomenda</th>
              <th className="px-6 py-3 text-left">Cliente</th>
              <th className="px-6 py-3 text-left">Total</th>
              <th className="px-6 py-3 text-left">Estado</th>
              <th className="px-6 py-3 text-left">Pagamento</th>
              <th className="px-6 py-3 text-left">Data</th>
              <th className="px-6 py-3 text-left">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  #{order.orderNumber}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {order.customer}
                </td>
                <td className="px-6 py-4 text-sm font-medium">
                  {formatPrice(order.totalMZN)} MT
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      statusColors[order.status] || "bg-gray-100"
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      order.paymentStatus === "PAID"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {order.paymentStatus}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString("pt-MZ")}
                </td>
                <td className="px-6 py-4">
                  <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded">
                    <Eye size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {orders.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500">
            <Package size={48} className="mx-auto mb-4 text-gray-300" />
            Nenhuma encomenda encontrada
          </div>
        )}
      </div>
    </div>
  );
}
