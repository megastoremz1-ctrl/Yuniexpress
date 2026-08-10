"use client";

import Link from "next/link";
import {
  BarChart3,
  Megaphone,
  Image as ImageIcon,
  Target,
  Ticket,
  Mail,
  BellRing,
  MousePointerClick,
  TrendingUp,
  Users,
  ShoppingBag,
  ArrowRight,
  Plus,
} from "lucide-react";

const marketingModules = [
  {
    href: "/admin/marketing/analytics",
    title: "Analytics",
    description: "Analise o desempenho das suas ações de marketing",
    icon: BarChart3,
    color: "blue",
  },
  {
    href: "/admin/marketing/announcements",
    title: "Anúncios",
    description: "Gerir mensagens e anúncios da loja",
    icon: Megaphone,
    color: "yellow",
  },
  {
    href: "/admin/marketing/banners",
    title: "Banners",
    description: "Criar banners promocionais para a loja",
    icon: ImageIcon,
    color: "purple",
  },
  {
    href: "/admin/marketing/campaigns",
    title: "Campanhas",
    description: "Criar e gerir campanhas de marketing",
    icon: Target,
    color: "green",
  },
  {
    href: "/admin/marketing/coupons",
    title: "Cupons",
    description: "Gerir descontos e códigos promocionais",
    icon: Ticket,
    color: "orange",
  },
  {
    href: "/admin/marketing/emails",
    title: "Emails",
    description: "Enviar campanhas por email",
    icon: Mail,
    color: "indigo",
  },
  {
    href: "/admin/marketing/popups",
    title: "Popups",
    description: "Criar popups promocionais",
    icon: MousePointerClick,
    color: "pink",
  },
  {
    href: "/admin/marketing/push",
    title: "Push",
    description: "Enviar notificações push aos clientes",
    icon: BellRing,
    color: "red",
  },
];

const colorClasses: Record<
  string,
  {
    card: string;
    icon: string;
    text: string;
  }
> = {
  blue: {
    card: "bg-blue-50 border-blue-200",
    icon: "bg-white text-blue-600",
    text: "text-blue-700",
  },
  yellow: {
    card: "bg-yellow-50 border-yellow-200",
    icon: "bg-white text-yellow-600",
    text: "text-yellow-700",
  },
  purple: {
    card: "bg-purple-50 border-purple-200",
    icon: "bg-white text-purple-600",
    text: "text-purple-700",
  },
  green: {
    card: "bg-green-50 border-green-200",
    icon: "bg-white text-green-600",
    text: "text-green-700",
  },
  orange: {
    card: "bg-orange-50 border-orange-200",
    icon: "bg-white text-orange-600",
    text: "text-orange-700",
  },
  indigo: {
    card: "bg-indigo-50 border-indigo-200",
    icon: "bg-white text-indigo-600",
    text: "text-indigo-700",
  },
  pink: {
    card: "bg-pink-50 border-pink-200",
    icon: "bg-white text-pink-600",
    text: "text-pink-700",
  },
  red: {
    card: "bg-red-50 border-red-200",
    icon: "bg-white text-red-600",
    text: "text-red-700",
  },
};

const quickActions = [
  {
    href: "/admin/marketing/campaigns/new",
    label: "Nova campanha",
    icon: Target,
  },
  {
    href: "/admin/marketing/banners",
    label: "Novo banner",
    icon: ImageIcon,
  },
  {
    href: "/admin/marketing/coupons",
    label: "Criar cupão",
    icon: Ticket,
  },
  {
    href: "/admin/marketing/push",
    label: "Enviar Push",
    icon: BellRing,
  },
];

export default function MarketingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
            <Link
              href="/admin"
              className="transition-colors hover:text-yellow-600"
            >
              Dashboard
            </Link>

            <span>/</span>

            <span className="text-gray-700">Marketing</span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Marketing
          </h1>

          <p className="mt-1 text-gray-500">
            Aumente as vendas e alcance mais clientes
          </p>
        </div>

        <Link
          href="/admin/marketing/campaigns/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-yellow-500 px-5 py-3 font-semibold text-gray-900 shadow-sm transition hover:bg-yellow-400"
        >
          <Plus size={19} />
          Nova campanha
        </Link>
      </div>

      {/* Overview cards */}
      <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <Target size={22} />
            </div>

            <TrendingUp size={18} className="text-green-500" />
          </div>

          <p className="mt-5 text-sm text-gray-500">
            Campanhas ativas
          </p>

          <p className="mt-1 text-3xl font-bold text-gray-900">
            —
          </p>

          <p className="mt-1 text-xs text-gray-400">
            Dados serão ligados ao sistema
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-600">
              <MousePointerClick size={22} />
            </div>

            <TrendingUp size={18} className="text-green-500" />
          </div>

          <p className="mt-5 text-sm text-gray-500">
            Cliques
          </p>

          <p className="mt-1 text-3xl font-bold text-gray-900">
            —
          </p>

          <p className="mt-1 text-xs text-gray-400">
            Últimos 30 dias
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
              <ShoppingBag size={22} />
            </div>

            <TrendingUp size={18} className="text-green-500" />
          </div>

          <p className="mt-5 text-sm text-gray-500">
            Conversões
          </p>

          <p className="mt-1 text-3xl font-bold text-gray-900">
            —
          </p>

          <p className="mt-1 text-xs text-gray-400">
            Últimos 30 dias
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-100 text-yellow-600">
              <Users size={22} />
            </div>

            <TrendingUp size={18} className="text-green-500" />
          </div>

          <p className="mt-5 text-sm text-gray-500">
            Clientes alcançados
          </p>

          <p className="mt-1 text-3xl font-bold text-gray-900">
            —
          </p>

          <p className="mt-1 text-xs text-gray-400">
            Últimos 30 dias
          </p>
        </div>
      </section>

      {/* Marketing modules */}
      <section className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Ferramentas de Marketing
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Escolha uma ferramenta para começar
            </p>
          </div>

          <Link
            href="/admin/marketing/analytics"
            className="hidden items-center gap-1 text-sm font-medium text-yellow-600 hover:text-yellow-700 sm:flex"
          >
            Ver analytics
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {marketingModules.map((module) => {
            const Icon = module.icon;
            const colors = colorClasses[module.color];

            return (
              <Link
                key={module.href}
                href={module.href}
                className={`group rounded-2xl border p-5 transition-all hover:-translate-y-0.5 hover:shadow-md ${colors.card}`}
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl shadow-sm ${colors.icon}`}
                  >
                    <Icon size={21} />
                  </div>

                  <ArrowRight
                    size={18}
                    className={`${colors.text} opacity-60 transition-transform group-hover:translate-x-1`}
                  />
                </div>

                <h3
                  className={`mt-5 text-lg font-bold ${colors.text}`}
                >
                  {module.title}
                </h3>

                <p className="mt-1 text-sm leading-5 text-gray-600">
                  {module.description}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Quick actions */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-bold text-gray-900">
          Acesso rápido
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => {
            const Icon = action.icon;

            return (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-yellow-300 hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-50 text-yellow-600">
                    <Icon size={20} />
                  </div>

                  <span className="font-semibold text-gray-800">
                    {action.label}
                  </span>
                </div>

                <ArrowRight
                  size={18}
                  className="text-gray-400"
                />
              </Link>
            );
          })}
        </div>
      </section>

      {/* Performance placeholder */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
              <BarChart3 size={23} />
            </div>

            <div>
              <h2 className="font-bold text-gray-900">
                Desempenho do Marketing
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Aqui serão apresentados os resultados das suas campanhas,
                anúncios, banners, cupons e notificações.
              </p>
            </div>
          </div>

          <Link
            href="/admin/marketing/analytics"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-yellow-400 hover:text-yellow-600"
          >
            Abrir Analytics
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}