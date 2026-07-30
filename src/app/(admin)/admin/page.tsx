"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Package,
  Users,
  TrendingUp,
  ArrowUpRight,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  DollarSign,
  Eye,
  RefreshCw,
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

  const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    PENDING: { label: "Pendente", color: "bg-yellow-100 text-yellow-700", icon: Clock },
    CONFIRMED: { label: "Confirmada", color: "bg-blue-100 text-blue-700", icon: CheckCircle },
    PROCESSING: { label: "Processando", color: "bg-purple-100 text-purple-700", icon: RefreshCw },
    SHIPPED: { label: "Enviada", color: "bg-indigo-100 text-indigo-700", icon: Truck },
    DELIVERED: { label: "Entregue", color: "bg-green-100 text-green-700", icon: CheckCircle },
    CANCELLED: { label: "Cancelada", color: "bg-red-100 text-red-700", icon: XCircle },
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-white rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-96 bg-white rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Visão geral do seu marketplace</p>
        </div>
        <button
          onClick={fetchStats}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
        >
          <RefreshCw size={14} />
          Actualizar
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <DollarSign className="text-green-600" size={24} />
            </div>
            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full font-medium flex items-center gap-1">
              <ArrowUpRight size={12} />
              Este mês
            </span>
          </div>
          <p className="text-sm text-gray-500">Receita Total</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {formatPrice(stats?.revenue.total || 0)} MT
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {formatPrice(stats?.revenue.thisMonth || 0)} MT este mês
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Package className="text-blue-600" size={24} />
            </div>
            <Link href="/admin/orders" className="text-xs text-blue-600 hover:underline">
              Ver todas
            </Link>
          </div>
          <p className="text-sm text-gray-500">Encomendas</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.orders.total || 0}</p>
          <div className="flex gap-3 mt-2 text-xs text-gray-500">
            <span>{stats?.orders.today || 0} hoje</span>
            <span>•</span>
            <span>{stats?.orders.thisMonth || 0} este mês</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <ShoppingBag className="text-yellow-600" size={24} />
            </div>
            <Link href="/admin/products" className="text-xs text-yellow-600 hover:underline">
              Gerir
            </Link>
          </div>
          <p className="text-sm text-gray-500">Produtos</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.products.total || 0}</p>
          <div className="flex gap-3 mt-2 text-xs">
            <span className="text-green-600">{stats?.products.approved || 0} activos</span>
            <span className="text-yellow-600">{stats?.products.pending || 0} pendentes</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Users className="text-purple-600" size={24} />
            </div>
          </div>
          <p className="text-sm text-gray-500">Clientes</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.customers.total || 0}</p>
          <p className="text-xs text-green-600 mt-2">
            +{stats?.customers.newThisMonth || 0} novos este mês
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Link href="/admin/products?status=PENDING" className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-center hover:bg-yellow-100 transition-colors">
          <p className="text-2xl font-bold text-yellow-700">{stats?.products.pending || 0}</p>
          <p className="text-xs text-yellow-600 mt-1">Produtos para aprovar</p>
        </Link>
        <Link href="/admin/orders" className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-center hover:bg-blue-100 transition-colors">
          <p className="text-2xl font-bold text-blue-700">{stats?.orders.today || 0}</p>
          <p className="text-xs text-blue-600 mt-1">Encomendas hoje</p>
        </Link>
        <Link href="/admin/banners" className="p-4 bg-purple-50 border border-purple-200 rounded-xl text-center hover:bg-purple-100 transition-colors">
          <p className="text-2xl font-bold text-purple-700">Banners</p>
          <p className="text-xs text-purple-600 mt-1">Gerir promoções</p>
        </Link>
        <Link href="/admin/settings" className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-center hover:bg-gray-100 transition-colors">
          <p className="text-2xl font-bold text-gray-700">Config</p>
          <p className="text-xs text-gray-600 mt-1">Logo, margens, etc.</p>
        </Link>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border shadow-sm">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Encomendas Recentes</h2>
          <Link href="/admin/orders" className="text-sm text-yellow-600 hover:underline">
            Ver todas →
          </Link>
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
                recentOrders.map((order) => {
                  const st = statusConfig[order.status] || { label: order.status, color: "bg-gray-100 text-gray-700", icon: Clock };
                  return (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        #{order.orderNumber}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{order.customer}</td>
                      <td className="px-6 py-4 text-sm font-semibold">
                        {formatPrice(order.totalMZN)} MT
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${st.color}`}>
                          {st.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          order.paymentStatus === "PAID"
                            ? "bg-green-100 text-green-700"
                            : order.paymentStatus === "FAILED"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}>
                          {order.paymentStatus === "PAID" ? "Pago" : order.paymentStatus === "FAILED" ? "Falhou" : "Pendente"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString("pt-MZ")}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <Package size={40} className="mx-auto mb-3 text-gray-300" />
                    Nenhuma encomenda ainda. As encomendas aparecerão aqui.
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
