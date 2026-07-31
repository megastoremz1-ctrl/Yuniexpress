"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid3X3, ShoppingCart, User } from "lucide-react";
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
    { href: "/cart", label: "Carrinho", icon: ShoppingCart, badge: totalCartItems },
    { href: session ? "/account" : "/login", label: "Conta", icon: User },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 lg:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const active = isActive(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center flex-1 h-full relative transition-colors ${
                active ? "text-yellow-600" : "text-gray-500"
              }`}
            >
              <div className="relative">
                <tab.icon size={22} strokeWidth={active ? 2.5 : 1.8} />
                {tab.badge && tab.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-yellow-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1">
                    {tab.badge > 99 ? "99+" : tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-1 ${active ? "font-semibold" : "font-medium"}`}>
                {tab.label}
              </span>
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-yellow-500 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
