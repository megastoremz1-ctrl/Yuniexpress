"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  User,
  Package,
  Heart,
  MapPin,
  Bell,
  Settings,
  LogOut,
  ChevronRight,
  Star,
  ShieldCheck,
} from "lucide-react";

export default function AccountPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-yellow-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!session) {
    redirect("/login");
  }

  const menuItems = [
    { href: "/account/orders", label: "Minhas Encomendas", icon: Package, desc: "Ver histórico de compras" },
    { href: "/wishlist", label: "Lista de Desejos", icon: Heart, desc: "Produtos guardados" },
    { href: "/account/addresses", label: "Endereços", icon: MapPin, desc: "Gerir endereços de entrega" },
    { href: "/account/reviews", label: "Avaliações", icon: Star, desc: "As suas avaliações" },
    { href: "/account/notifications", label: "Notificações", icon: Bell, desc: "Centro de notificações" },
    { href: "/account/settings", label: "Configurações", icon: Settings, desc: "Editar perfil e preferências" },
  ];

  const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes((session.user as any)?.role);

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      {/* Admin Panel Button - Only for admins */}
      {isAdmin && (
        <Link
          href="/admin"
          className="flex items-center gap-3 p-4 bg-gray-900 text-white rounded-2xl mb-4 hover:bg-gray-800 transition-colors"
        >
          <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center">
            <ShieldCheck size={20} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="font-semibold">Painel Administrativo</p>
            <p className="text-xs text-gray-400">Gerir produtos, encomendas e configurações</p>
          </div>
          <ChevronRight size={18} className="text-gray-400" />
        </Link>
      )}

      {/* Profile header */}
      <div className="bg-white rounded-2xl p-6 border mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center border-2 border-yellow-200">
            {session.user?.image ? (
              <img
                src={session.user.image}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-yellow-500 flex items-center justify-center text-white text-2xl font-bold">
                {session.user?.name?.[0] || "U"}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900 truncate">{session.user?.name}</h1>
            <p className="text-sm text-gray-500 truncate">{session.user?.email}</p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="bg-white rounded-2xl border overflow-hidden">
        {menuItems.map((item, idx) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors ${
              idx > 0 ? "border-t" : ""
            }`}
          >
            <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center">
              <item.icon size={20} className="text-yellow-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{item.label}</p>
              <p className="text-xs text-gray-500">{item.desc}</p>
            </div>
            <ChevronRight size={16} className="text-gray-400" />
          </Link>
        ))}
      </div>

      {/* Logout */}
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="w-full mt-6 flex items-center justify-center gap-2 p-4 bg-white rounded-2xl border text-red-600 hover:bg-red-50 transition-colors"
      >
        <LogOut size={18} />
        <span className="font-medium">Terminar Sessão</span>
      </button>
    </div>
  );
}
