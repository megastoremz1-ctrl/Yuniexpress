"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Package,
  LayoutDashboard,
  ShoppingBag,
  Users,
  Image,
  Settings,
  LogOut,
  Menu,
  X,
  Megaphone,
  ChevronDown,
  BarChart3,
  Ticket,
  Mail,
  Bell,
  Target,
  MessageSquare,
} from "lucide-react";
import { signOut } from "next-auth/react";

const adminNavItems = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/products",
    label: "Produtos",
    icon: ShoppingBag,
  },
  {
    href: "/admin/orders",
    label: "Encomendas",
    icon: Package,
  },
  {
    href: "/admin/clients",
    label: "Clientes",
    icon: Users,
  },
  {
    href: "/admin/banners",
    label: "Banners",
    icon: Image,
  },
];

const marketingItems = [
  {
    href: "/admin/marketing",
    label: "Visão geral",
    icon: Megaphone,
  },
  {
    href: "/admin/marketing/analytics",
    label: "Analytics",
    icon: BarChart3,
  },
  {
    href: "/admin/marketing/announcements",
    label: "Anúncios",
    icon: MessageSquare,
  },
  {
    href: "/admin/marketing/banners",
    label: "Banners",
    icon: Image,
  },
  {
    href: "/admin/marketing/campaigns",
    label: "Campanhas",
    icon: Target,
  },
  {
    href: "/admin/marketing/coupons",
    label: "Cupons",
    icon: Ticket,
  },
  {
    href: "/admin/marketing/emails",
    label: "Emails",
    icon: Mail,
  },
  {
    href: "/admin/marketing/popups",
    label: "Popups",
    icon: MessageSquare,
  },
  {
    href: "/admin/marketing/push",
    label: "Push",
    icon: Bell,
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();

  const pathname = usePathname();

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [marketingOpen, setMarketingOpen] =
    useState(
      pathname.startsWith("/admin/marketing")
    );

  /**
   * ============================================================
   * LOADING
   * ============================================================
   */

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">
          A carregar...
        </div>
      </div>
    );
  }

  /**
   * ============================================================
   * ACESSO RESTRITO
   * ============================================================
   */

  if (
    !session?.user ||
    !["ADMIN", "SUPER_ADMIN"].includes(
      (session.user as any).role
    )
  ) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl border p-8 max-w-md w-full text-center shadow-sm">
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Acesso Restrito
          </h1>

          <p className="text-gray-500 mb-6">
            Esta área é apenas para administradores.
          </p>

          <Link
            href="/account"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-gray-900 text-white text-sm hover:bg-gray-800"
          >
            ← Voltar à minha conta
          </Link>
        </div>
      </div>
    );
  }

  /**
   * ============================================================
   * VERIFICAR MARKETING ATIVO
   * ============================================================
   */

  const isMarketingActive =
    pathname.startsWith(
      "/admin/marketing"
    );

  /**
   * ============================================================
   * MARKETING MENU
   * ============================================================
   */

  const renderMarketingMenu = (
    mobile = false
  ) => {
    return (
      <div className="space-y-1">
        <button
          type="button"
          onClick={() =>
            setMarketingOpen(
              (previous) => !previous
            )
          }
          className={`flex items-center justify-between w-full px-4 py-3 rounded-lg text-sm transition-colors ${
            isMarketingActive
              ? "bg-yellow-500/20 text-yellow-400"
              : "text-gray-300 hover:bg-gray-800 hover:text-white"
          }`}
        >
          <span className="flex items-center gap-3">
            <Megaphone size={18} />

            Marketing
          </span>

          <ChevronDown
            size={16}
            className={`transition-transform ${
              marketingOpen
                ? "rotate-180"
                : ""
            }`}
          />
        </button>

        {marketingOpen && (
          <div className="ml-4 pl-3 border-l border-gray-700 space-y-1">
            {marketingItems.map(
              (item) => {
                const isActive =
                  pathname ===
                  item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => {
                      if (mobile) {
                        setSidebarOpen(
                          false
                        );
                      }
                    }}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs transition-colors ${
                      isActive
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "text-gray-400 hover:bg-gray-800 hover:text-white"
                    }`}
                  >
                    <item.icon
                      size={15}
                    />

                    {item.label}
                  </Link>
                );
              }
            )}
          </div>
        )}
      </div>
    );
  };

  /**
   * ============================================================
   * MAIN LAYOUT
   * ============================================================
   */

  return (
    <div className="min-h-screen bg-gray-100">

      {/* ====================================================== */}
      {/* MOBILE HEADER */}
      {/* ====================================================== */}

      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-gray-900 text-white h-14 flex items-center px-4">

        <button
          onClick={() =>
            setSidebarOpen(true)
          }
          className="p-1.5 rounded-lg hover:bg-gray-800"
          aria-label="Abrir menu"
        >
          <Menu size={22} />
        </button>

        <Link
          href="/admin"
          className="ml-3 flex items-center gap-2"
        >
          <img
            src="/icons/icon-192x192.png"
            alt="YuniExpress"
            className="w-8 h-8 rounded-lg"
          />

          <span className="font-bold">
            <span className="text-yellow-500">
              Yuni
            </span>
            Express
          </span>
        </Link>

      </header>

      {/* ====================================================== */}
      {/* MOBILE SIDEBAR */}
      {/* ====================================================== */}

      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">

          {/* Overlay */}

          <div
            className="absolute inset-0 bg-black/50"
            onClick={() =>
              setSidebarOpen(false)
            }
          />

          {/* Sidebar */}

          <aside className="relative w-72 h-full bg-gray-900 text-white flex flex-col shadow-xl">

            {/* Header */}

            <div className="p-4 flex items-center justify-between border-b border-gray-800">

              <Link
                href="/admin"
                onClick={() =>
                  setSidebarOpen(false)
                }
                className="flex items-center gap-2"
              >
                <img
                  src="/icons/icon-192x192.png"
                  alt="YuniExpress"
                  className="w-8 h-8 rounded-lg"
                />

                <span className="font-bold">
                  <span className="text-yellow-500">
                    Yuni
                  </span>
                  Express
                </span>
              </Link>

              <button
                onClick={() =>
                  setSidebarOpen(false)
                }
                className="p-1 rounded-lg hover:bg-gray-800"
              >
                <X size={20} />
              </button>

            </div>

            {/* Navigation */}

            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">

              {adminNavItems.map(
                (item) => {
                  const isActive =
                    pathname ===
                    item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() =>
                        setSidebarOpen(
                          false
                        )
                      }
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
                        isActive
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "text-gray-300 hover:bg-gray-800"
                      }`}
                    >
                      <item.icon
                        size={18}
                      />

                      {item.label}
                    </Link>
                  );
                }
              )}

              {/* Marketing */}

              {renderMarketingMenu(
                true
              )}

            </nav>

            {/* Bottom */}

            <div className="p-4 border-t border-gray-800">

              <Link
                href="/"
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-400 hover:text-white"
                onClick={() =>
                  setSidebarOpen(
                    false
                  )
                }
              >
                ← Voltar à Loja
              </Link>

              <button
                onClick={() =>
                  signOut({
                    callbackUrl:
                      "/login",
                  })
                }
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-400 hover:text-white w-full"
              >
                <LogOut
                  size={16}
                />

                Sair
              </button>

            </div>

          </aside>
        </div>
      )}

      {/* ====================================================== */}
      {/* DESKTOP SIDEBAR */}
      {/* ====================================================== */}

      <aside className="hidden lg:flex w-64 bg-gray-900 text-white flex-col fixed h-full z-40">

        {/* Logo */}

        <div className="p-6">

          <Link
            href="/admin"
            className="flex items-center gap-2"
          >
            <img
              src="/icons/icon-192x192.png"
              alt="YuniExpress"
              className="w-8 h-8 rounded-lg"
            />

            <span className="font-bold">
              <span className="text-yellow-500">
                Yuni
              </span>
              Express
            </span>
          </Link>

          <p className="text-xs text-gray-400 mt-1">
            Painel Administrativo
          </p>

        </div>

        {/* Navigation */}

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">

          {adminNavItems.map(
            (item) => {
              const isActive =
                pathname ===
                item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
                    isActive
                      ? "bg-yellow-500/20 text-yellow-400"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <item.icon
                    size={18}
                  />

                  {item.label}
                </Link>
              );
            }
          )}

          {/* ================================================== */}
          {/* MARKETING */}
          {/* ================================================== */}

          {renderMarketingMenu()}

        </nav>

        {/* Bottom */}

        <div className="p-4 border-t border-gray-800">

          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-400 hover:text-white mb-2"
          >
            ← Voltar à Loja
          </Link>

          <div className="flex items-center gap-3 px-4 py-2 mb-2">

            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-sm font-bold text-white">
              {session.user.name?.[0] ||
                "A"}
            </div>

            <div className="text-sm min-w-0">

              <p className="font-medium truncate">
                {session.user.name}
              </p>

              <p className="text-xs text-gray-400">
                Admin
              </p>

            </div>

          </div>

          <button
            onClick={() =>
              signOut({
                callbackUrl:
                  "/login",
              })
            }
            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors w-full"
          >
            <LogOut
              size={16}
            />

            Sair
          </button>

        </div>

      </aside>

      {/* ====================================================== */}
      {/* MAIN CONTENT */}
      {/* ====================================================== */}

      <main className="lg:ml-64 p-4 lg:p-8 pt-16 lg:pt-8">
        {children}
      </main>

    </div>
  );
}