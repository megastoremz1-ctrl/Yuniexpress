"use client";

import { useState, useEffect } from "react";
import {
  ShoppingBag,
  Package,
  Users,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Clock,
} from "lucide-react";

interface Stats {
  products: { total: number; pending: number; approved: number };
  orders: { total: number; today: number; thisMonth: number };
  revenue: { total: number; thisMonth: number };
  customers: { total: number; newThisMonth: number };
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  customer: string;
  totalMZN: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  itemCount: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      setStats(data.stats);
      setRecentOrders(data.recentOrders || []);
    } catch (error) {
      console.error("Error fetching stats:", error);
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

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="grid grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-white rounded-xl" />
          ))}
        </div>
        <div className="h-96 bg-white rounded-xl" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Receita Total</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatPrice(stats?.revenue.total || 0)} MT
              </p>
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <ArrowUp size={12} />
                {formatPrice(stats?.revenue.thisMonth || 0)} MT este mês
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Encomendas</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.orders.total || 0}</p>
              <p className="text-xs text-blue-600 mt-1">
                {stats?.orders.today || 0} hoje | {stats?.orders.thisMonth || 0} este mês
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Package className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Produtos</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.products.total || 0}</p>
              <p className="text-xs text-yellow-600 mt-1">
                {stats?.products.pending || 0} pendentes
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <ShoppingBag className="text-yellow-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Clientes</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.customers.total || 0}</p>
              <p className="text-xs text-purple-600 mt-1">
                +{stats?.customers.newThisMonth || 0} este mês
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Users className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Encomendas Recentes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-6 py-3 text-left">Encomenda</th>
                <th className="px-6 py-3 text-left">Cliente</th>
                <th className="px-6 py-3 text-left">Total</th>
                <th className="px-6 py-3 text-left">Estado</th>
                <th className="px-6 py-3 text-left">Pagamento</th>
                <th className="px-6 py-3 text-left">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      #{order.orderNumber}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{order.customer}</td>
                    <td className="px-6 py-4 text-sm font-medium">
                      {formatPrice(order.totalMZN)} MT
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                          statusColors[order.status] || "bg-gray-100 text-gray-700"
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
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Nenhuma encomenda ainda
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
