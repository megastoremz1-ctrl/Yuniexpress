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
  RefreshCw,
  Megaphone,
  Image as ImageIcon,
  Target,
  Ticket,
  Mail,
  Bell,
  BarChart3,
  Settings,
  ChevronRight,
} from "lucide-react";

interface Stats {
  products: {
    total: number;
    pending: number;
    approved: number;
  };

  orders: {
    total: number;
    today: number;
    thisMonth: number;
  };

  revenue: {
    total: number;
    thisMonth: number;
  };

  customers: {
    total: number;
    newThisMonth: number;
  };
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
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setRefreshing(true);

      const res = await fetch("/api/admin/stats", {
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error("Erro ao carregar estatísticas");
      }

      const data = await res.json();

      setStats(data.stats || null);
      setRecentOrders(data.recentOrders || []);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("pt-MZ", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);

  const statusConfig: Record<
    string,
    {
      label: string;
      color: string;
      icon: any;
    }
  > = {
    PENDING: {
      label: "Pendente",
      color: "bg-yellow-100 text-yellow-700",
      icon: Clock,
    },

    CONFIRMED: {
      label: "Confirmada",
      color: "bg-blue-100 text-blue-700",
      icon: CheckCircle,
    },

    PROCESSING: {
      label: "Processando",
      color: "bg-purple-100 text-purple-700",
      icon: RefreshCw,
    },

    SHIPPED: {
      label: "Enviada",
      color: "bg-indigo-100 text-indigo-700",
      icon: Truck,
    },

    DELIVERED: {
      label: "Entregue",
      color: "bg-green-100 text-green-700",
      icon: CheckCircle,
    },

    CANCELLED: {
      label: "Cancelada",
      color: "bg-red-100 text-red-700",
      icon: XCircle,
    },
  };

  /*
   * ============================================================
   * LOADING
   * ============================================================
   */

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-4 w-72 bg-gray-200 rounded mt-3 animate-pulse" />
          </div>

          <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-32 bg-white rounded-xl border shadow-sm animate-pulse"
            />
          ))}
        </div>

        <div className="h-72 bg-white rounded-xl border shadow-sm animate-pulse" />

        <div className="h-96 bg-white rounded-xl border shadow-sm animate-pulse" />
      </div>
    );
  }

  /*
   * ============================================================
   * MARKETING MODULES
   * ============================================================
   */

  const marketingModules = [
    {
      title: "Analytics",
      description: "Analise o desempenho das campanhas",
      href: "/admin/marketing/analytics",
      icon: BarChart3,
      className:
        "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100",
    },

    {
      title: "Anúncios",
      description: "Gerir anúncios da loja",
      href: "/admin/marketing/announcements",
      icon: Megaphone,
      className:
        "bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100",
    },

    {
      title: "Banners",
      description: "Criar banners promocionais",
      href: "/admin/marketing/banners",
      icon: ImageIcon,
      className:
        "bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100",
    },

    {
      title: "Campanhas",
      description: "Criar e gerir campanhas",
      href: "/admin/marketing/campaigns",
      icon: Target,
      className:
        "bg-green-50 border-green-200 text-green-700 hover:bg-green-100",
    },

    {
      title: "Cupons",
      description: "Gerir descontos e cupons",
      href: "/admin/marketing/coupons",
      icon: Ticket,
      className:
        "bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100",
    },

    {
      title: "Emails",
      description: "Enviar campanhas por email",
      href: "/admin/marketing/emails",
      icon: Mail,
      className:
        "bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100",
    },

    {
      title: "Popups",
      description: "Criar popups promocionais",
      href: "/admin/marketing/popups",
      icon: Target,
      className:
        "bg-pink-50 border-pink-200 text-pink-700 hover:bg-pink-100",
    },

    {
      title: "Push",
      description: "Notificações push",
      href: "/admin/marketing/push",
      icon: Bell,
      className:
        "bg-red-50 border-red-200 text-red-700 hover:bg-red-100",
    },
  ];

  /*
   * ============================================================
   * DASHBOARD
   * ============================================================
   */

  return (
    <div className="space-y-8">
      {/* ======================================================
          HEADER
      ======================================================= */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Dashboard
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Visão geral da sua loja YuniExpress
          </p>
        </div>

        <button
          onClick={fetchStats}
          disabled={refreshing}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
        >
          <RefreshCw
            size={15}
            className={refreshing ? "animate-spin" : ""}
          />

          {refreshing ? "A actualizar..." : "Actualizar"}
        </button>
      </div>

      {/* ======================================================
          STATS
      ======================================================= */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* RECEITA */}

        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <DollarSign
                className="text-green-600"
                size={24}
              />
            </div>

            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full font-medium flex items-center gap-1">
              <ArrowUpRight size={12} />
              Este mês
            </span>
          </div>

          <p className="text-sm text-gray-500">
            Receita Total
          </p>

          <p className="text-2xl font-bold text-gray-900 mt-1">
            {formatPrice(stats?.revenue.total || 0)} MT
          </p>

          <p className="text-xs text-gray-500 mt-2">
            {formatPrice(stats?.revenue.thisMonth || 0)} MT
            este mês
          </p>
        </div>

        {/* ENCOMENDAS */}

        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Package
                className="text-blue-600"
                size={24}
              />
            </div>

            <Link
              href="/admin/orders"
              className="text-xs text-blue-600 hover:underline"
            >
              Ver todas
            </Link>
          </div>

          <p className="text-sm text-gray-500">
            Encomendas
          </p>

          <p className="text-2xl font-bold text-gray-900 mt-1">
            {stats?.orders.total || 0}
          </p>

          <div className="flex gap-3 mt-2 text-xs text-gray-500">
            <span>
              {stats?.orders.today || 0} hoje
            </span>

            <span>•</span>

            <span>
              {stats?.orders.thisMonth || 0} este mês
            </span>
          </div>
        </div>

        {/* PRODUTOS */}

        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <ShoppingBag
                className="text-yellow-600"
                size={24}
              />
            </div>

            <Link
              href="/admin/products"
              className="text-xs text-yellow-600 hover:underline"
            >
              Gerir
            </Link>
          </div>

          <p className="text-sm text-gray-500">
            Produtos
          </p>

          <p className="text-2xl font-bold text-gray-900 mt-1">
            {stats?.products.total || 0}
          </p>

          <div className="flex gap-3 mt-2 text-xs">
            <span className="text-green-600">
              {stats?.products.approved || 0} activos
            </span>

            <span className="text-yellow-600">
              {stats?.products.pending || 0} pendentes
            </span>
          </div>
        </div>

        {/* CLIENTES */}

        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Users
                className="text-purple-600"
                size={24}
              />
            </div>
          </div>

          <p className="text-sm text-gray-500">
            Clientes
          </p>

          <p className="text-2xl font-bold text-gray-900 mt-1">
            {stats?.customers.total || 0}
          </p>

          <p className="text-xs text-green-600 mt-2">
            +{stats?.customers.newThisMonth || 0} novos este mês
          </p>
        </div>
      </div>

      {/* ======================================================
          MARKETING
      ======================================================= */}

      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Marketing
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Aumente as vendas e alcance mais clientes
            </p>
          </div>

          <Link
            href="/admin/marketing"
            className="flex items-center gap-1 text-sm text-yellow-600 hover:text-yellow-700 font-medium"
          >
            Abrir Marketing
            <ChevronRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {marketingModules.map((module) => {
            const Icon = module.icon;

            return (
              <Link
                key={module.href}
                href={module.href}
                className={`group p-5 rounded-xl border transition-all hover:shadow-sm ${module.className}`}
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 bg-white/70 rounded-lg flex items-center justify-center">
                    <Icon size={20} />
                  </div>

                  <ChevronRight
                    size={18}
                    className="opacity-50 group-hover:translate-x-1 transition-transform"
                  />
                </div>

                <h3 className="font-semibold mt-4">
                  {module.title}
                </h3>

                <p className="text-xs opacity-75 mt-1">
                  {module.description}
                </p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ======================================================
          QUICK ACTIONS
      ======================================================= */}

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Acesso rápido
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/admin/products?status=PENDING"
            className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-center hover:bg-yellow-100 transition-colors"
          >
            <p className="text-2xl font-bold text-yellow-700">
              {stats?.products.pending || 0}
            </p>

            <p className="text-xs text-yellow-600 mt-1">
              Produtos para aprovar
            </p>
          </Link>

          <Link
            href="/admin/orders"
            className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-center hover:bg-blue-100 transition-colors"
          >
            <p className="text-2xl font-bold text-blue-700">
              {stats?.orders.today || 0}
            </p>

            <p className="text-xs text-blue-600 mt-1">
              Encomendas hoje
            </p>
          </Link>

          <Link
            href="/admin/marketing/campaigns"
            className="p-4 bg-purple-50 border border-purple-200 rounded-xl text-center hover:bg-purple-100 transition-colors"
          >
            <p className="text-2xl font-bold text-purple-700">
              Campanhas
            </p>

            <p className="text-xs text-purple-600 mt-1">
              Criar promoção
            </p>
          </Link>

          <Link
            href="/admin/settings"
            className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-center hover:bg-gray-100 transition-colors"
          >
            <p className="text-2xl font-bold text-gray-700">
              Config
            </p>

            <p className="text-xs text-gray-600 mt-1">
              Logo, margens, etc.
            </p>
          </Link>
        </div>
      </div>

      {/* ======================================================
          RECENT ORDERS
      ======================================================= */}

      <div className="bg-white rounded-xl border shadow-sm">
        <div className="p-6 border-b flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Encomendas Recentes
            </h2>

            <p className="text-xs text-gray-500 mt-1">
              Últimas encomendas recebidas na loja
            </p>
          </div>

          <Link
            href="/admin/orders"
            className="text-sm text-yellow-600 hover:underline"
          >
            Ver todas →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-6 py-3 text-left">
                  Encomenda
                </th>

                <th className="px-6 py-3 text-left">
                  Cliente
                </th>

                <th className="px-6 py-3 text-left">
                  Total
                </th>

                <th className="px-6 py-3 text-left">
                  Estado
                </th>

                <th className="px-6 py-3 text-left">
                  Pagamento
                </th>

                <th className="px-6 py-3 text-left">
                  Data
                </th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => {
                  const st =
                    statusConfig[order.status] || {
                      label: order.status,
                      color:
                        "bg-gray-100 text-gray-700",
                      icon: Clock,
                    };

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        #{order.orderNumber}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {order.customer}
                      </td>

                      <td className="px-6 py-4 text-sm font-semibold">
                        {formatPrice(order.totalMZN)} MT
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-medium ${st.color}`}
                        >
                          {st.label}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                            order.paymentStatus ===
                            "PAID"
                              ? "bg-green-100 text-green-700"
                              : order.paymentStatus ===
                                "FAILED"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {order.paymentStatus ===
                          "PAID"
                            ? "Pago"
                            : order.paymentStatus ===
                              "FAILED"
                            ? "Falhou"
                            : "Pendente"}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(
                          order.createdAt
                        ).toLocaleDateString("pt-MZ")}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    <Package
                      size={40}
                      className="mx-auto mb-3 text-gray-300"
                    />

                    Nenhuma encomenda ainda.
                    <br />

                    <span className="text-xs">
                      As encomendas aparecerão aqui.
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================
          ADMIN SHORTCUTS
      ======================================================= */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/admin/marketing"
          className="flex items-center justify-between p-5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Megaphone size={22} />

            <div>
              <p className="font-semibold">
                Central de Marketing
              </p>

              <p className="text-xs text-gray-400 mt-1">
                Campanhas, banners, emails e mais
              </p>
            </div>
          </div>

          <ChevronRight size={18} />
        </Link>

        <Link
          href="/admin/products"
          className="flex items-center justify-between p-5 bg-white border rounded-xl hover:shadow-sm transition-all"
        >
          <div className="flex items-center gap-3">
            <ShoppingBag
              size={22}
              className="text-yellow-500"
            />

            <div>
              <p className="font-semibold text-gray-900">
                Gerir Produtos
              </p>

              <p className="text-xs text-gray-500 mt-1">
                Catálogo e sincronização
              </p>
            </div>
          </div>

          <ChevronRight
            size={18}
            className="text-gray-400"
          />
        </Link>

        <Link
          href="/admin/settings"
          className="flex items-center justify-between p-5 bg-white border rounded-xl hover:shadow-sm transition-all"
        >
          <div className="flex items-center gap-3">
            <Settings
              size={22}
              className="text-gray-600"
            />

            <div>
              <p className="font-semibold text-gray-900">
                Configurações
              </p>

              <p className="text-xs text-gray-500 mt-1">
                Identidade e parâmetros da loja
              </p>
            </div>
          </div>

          <ChevronRight
            size={18}
            className="text-gray-400"
          />
        </Link>
      </div>
    </div>
  );
}