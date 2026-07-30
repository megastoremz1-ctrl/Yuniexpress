"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Package,
  LayoutDashboard,
  ShoppingBag,
  Image,
  Settings,
  LogOut,
  Menu,
  X,
  RefreshCw,
} from "lucide-react";
import { signOut } from "next-auth/react";

const adminNavItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Produtos", icon: ShoppingBag },
  { href: "/admin/orders", label: "Encomendas", icon: Package },
  { href: "/admin/banners", label: "Banners", icon: Image },
  { href: "/admin/settings", label: "Configurações", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-yellow-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes((session.user as any).role)) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-gray-900 text-white px-4 py-3 flex items-center justify-between">
        <button onClick={() => setSidebarOpen(true)} className="p-1">
          <Menu size={24} />
        </button>
        <Link href="/admin" className="flex items-center gap-2">
          <img src="/icons/icon-192x192.png" alt="YuniExpress" className="w-7 h-7 rounded" />
          <span className="font-bold text-sm">
            <span className="text-yellow-500">Admin</span> Panel
          </span>
        </Link>
        <Link href="/" className="text-xs text-gray-400 hover:text-white">
          ← Loja
        </Link>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-72 h-full bg-gray-900 text-white flex flex-col">
            <div className="p-4 flex items-center justify-between">
              <Link href="/admin" className="flex items-center gap-2">
                <img src="/icons/icon-192x192.png" alt="" className="w-8 h-8 rounded-lg" />
                <span className="font-bold"><span className="text-yellow-500">Yuni</span>Express</span>
              </Link>
              <button onClick={() => setSidebarOpen(false)} className="p-1">
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 px-3 space-y-1">
              {adminNavItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
                      isActive ? "bg-yellow-500/20 text-yellow-400" : "text-gray-300 hover:bg-gray-800"
                    }`}
                  >
                    <item.icon size={18} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="p-4 border-t border-gray-800">
              <Link href="/" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-400 hover:text-white">
                ← Voltar à Loja
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-400 hover:text-white w-full"
              >
                <LogOut size={16} />
                Sair
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-gray-900 text-white flex-col fixed h-full">
        <div className="p-6">
          <Link href="/admin" className="flex items-center gap-2">
            <img src="/icons/icon-192x192.png" alt="YuniExpress" className="w-8 h-8 rounded-lg" />
            <span className="font-bold">
              <span className="text-yellow-500">Yuni</span>Express
            </span>
          </Link>
          <p className="text-xs text-gray-400 mt-1">Painel Administrativo</p>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {adminNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
                  isActive ? "bg-yellow-500/20 text-yellow-400" : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <Link href="/" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-400 hover:text-white mb-2">
            ← Voltar à Loja
          </Link>
          <div className="flex items-center gap-3 px-4 py-2 mb-2">
            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-sm font-bold text-white">
              {session.user.name?.[0] || "A"}
            </div>
            <div className="text-sm">
              <p className="font-medium truncate">{session.user.name}</p>
              <p className="text-xs text-gray-400">Admin</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors w-full"
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 p-4 lg:p-8 pt-16 lg:pt-8">{children}</main>
    </div>
  );
}
