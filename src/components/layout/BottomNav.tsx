"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, ShoppingCart, User, Grid3X3 } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useSession } from "next-auth/react";

export default function BottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const cartItems = useCartStore((s) => s.items);
  const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const tabs = [
    { href: "/", label: "Início", icon: Home },
    { href: "/categories", label: "Categorias", icon: Grid3X3 },
    { href: "/search", label: "Pesquisar", icon: Search },
    { href: "/cart", label: "Carrinho", icon: ShoppingCart, badge: totalCartItems },
    { href: session ? "/account" : "/login", label: "Conta", icon: User },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-gray-100 lg:hidden safe-area-bottom shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-around h-[60px] max-w-lg mx-auto px-1">
        {tabs.map((tab) => {
          const active = isActive(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center flex-1 h-full relative group transition-all duration-200 ${
                active ? "text-yellow-600" : "text-gray-400 active:text-gray-600"
              }`}
            >
              {/* Active indicator dot */}
              {active && (
                <span className="absolute top-1 w-1 h-1 bg-yellow-500 rounded-full" />
              )}

              <div className="relative mt-0.5">
                <tab.icon
                  size={active ? 22 : 20}
                  strokeWidth={active ? 2.2 : 1.6}
                  className="transition-all duration-200"
                />
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-yellow-500 text-white text-[9px] font-bold min-w-[16px] h-[16px] rounded-full flex items-center justify-center px-0.5 shadow-sm">
                    {tab.badge > 99 ? "99+" : tab.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] mt-0.5 transition-all duration-200 ${
                  active ? "font-semibold text-yellow-600" : "font-normal"
                }`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
