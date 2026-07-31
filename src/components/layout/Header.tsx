"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Menu,
  X,
  ChevronRight,
  Smartphone,
  Shirt,
  Home as HomeIcon,
  Sparkles,
  Dumbbell,
  Gamepad2,
  Car,
} from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";

export default function Header() {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const cartItems = useCartStore((s) => s.items);
  const wishlistItems = useWishlistStore((s) => s.items);

  const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    fetch("/api/settings/public")
      .then((r) => r.json())
      .then((d) => setSettings(d.settings || {}))
      .catch(() => {});
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
      setMobileMenuOpen(false);
    }
  };

  const announcementActive = settings.announcement_active === "true" && settings.announcement_bar;

  const mobileCategories = [
    { href: "/category/electronics", label: "Electrónica", icon: Smartphone },
    { href: "/category/fashion", label: "Moda", icon: Shirt },
    { href: "/category/home", label: "Casa & Jardim", icon: HomeIcon },
    { href: "/category/beauty", label: "Beleza & Saúde", icon: Sparkles },
    { href: "/category/sports", label: "Desporto", icon: Dumbbell },
    { href: "/category/toys", label: "Brinquedos", icon: Gamepad2 },
    { href: "/category/automotive", label: "Automóveis", icon: Car },
    { href: "/category/phones", label: "Telemóveis", icon: Smartphone },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      {/* Announcement bar */}
      {announcementActive && (
        <div className="bg-yellow-500 text-black text-xs py-1.5 text-center font-medium px-4 truncate">
          {settings.announcement_bar}
        </div>
      )}

      {/* Top bar - hidden on mobile */}
      <div className="hidden md:block bg-gray-900 text-white text-xs py-1.5">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <span className="text-gray-300">Entrega em Moçambique | Pagamento em Meticais</span>
          <div className="flex items-center gap-4">
            <Link href="/account/orders" className="hover:text-yellow-400 transition-colors">
              Rastrear Encomenda
            </Link>
            <Link href="/help" className="hover:text-yellow-400 transition-colors">
              Ajuda
            </Link>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container mx-auto px-4 py-2.5 lg:py-3">
        <div className="flex items-center gap-3 lg:gap-4">
          {/* Mobile menu button */}
          <button
            className="lg:hidden p-1.5 -ml-1 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            {settings.store_logo ? (
              <img
                src={settings.store_logo}
                alt={settings.store_name || "YuniExpress"}
                className="h-9 lg:h-10 w-auto"
              />
            ) : (
              <>
                <img
                  src="/images/logo.png"
                  alt="YuniExpress"
                  className="h-9 lg:h-10 w-auto hidden sm:block"
                />
                <img
                  src="/icons/icon-192x192.png"
                  alt="YuniExpress"
                  className="h-8 w-8 sm:hidden rounded-lg"
                />
              </>
            )}
          </Link>

          {/* Search bar - Desktop (inline) */}
          <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-xl mx-6">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Pesquisar produtos, marcas e mais..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-full py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 focus:bg-white transition-all placeholder:text-gray-400"
              />
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full p-2 transition-colors shadow-sm"
              >
                <Search size={14} />
              </button>
            </div>
          </form>

          {/* Mobile: spacer */}
          <div className="lg:hidden flex-1" />

          {/* Actions - Desktop */}
          <div className="hidden lg:flex items-center gap-1">
            <Link
              href="/wishlist"
              className="relative p-2.5 text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded-full transition-all"
            >
              <Heart size={21} />
              {wishlistItems.length > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            <Link
              href="/cart"
              className="relative p-2.5 text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded-full transition-all"
            >
              <ShoppingCart size={21} />
              {totalCartItems > 0 && (
                <span className="absolute top-1 right-0.5 bg-yellow-500 text-white text-[10px] min-w-[18px] h-[18px] rounded-full flex items-center justify-center font-bold px-1">
                  {totalCartItems}
                </span>
              )}
            </Link>

            <div className="w-px h-6 bg-gray-200 mx-1" />

            {session?.user ? (
              <Link
                href="/account"
                className="flex items-center gap-2 py-2 px-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="w-7 h-7 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-yellow-700">
                    {session.user.name?.[0]?.toUpperCase() || "U"}
                  </span>
                </div>
                <span className="text-sm font-medium max-w-[80px] truncate">
                  {session.user.name?.split(" ")[0]}
                </span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors shadow-sm"
              >
                <User size={15} />
                <span>Entrar</span>
              </Link>
            )}
          </div>

          {/* Mobile: Wishlist only */}
          <Link
            href="/wishlist"
            className="lg:hidden relative p-1.5 text-gray-600 hover:text-yellow-600 transition-colors"
          >
            <Heart size={20} />
            {wishlistItems.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
                {wishlistItems.length}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile search bar - dedicated row */}
      <div className="lg:hidden border-t border-gray-100 bg-white px-4 py-2">
        <form onSubmit={handleSearch}>
          <div className="relative">
            <input
              id="mobile-search-input"
              type="text"
              placeholder="O que procura hoje?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-full py-2.5 pl-10 pr-12 text-sm focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 focus:bg-white transition-all placeholder:text-gray-400"
            />
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full p-2 transition-colors shadow-sm"
            >
              <Search size={14} />
            </button>
          </div>
        </form>
      </div>

      {/* Categories bar - Desktop */}
      <nav className="hidden lg:block border-t bg-gray-50/80">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-6 py-2 text-sm">
            <Link href="/category/electronics" className="text-gray-700 hover:text-yellow-600 font-medium transition-colors whitespace-nowrap">Electrónica</Link>
            <Link href="/category/fashion" className="text-gray-700 hover:text-yellow-600 font-medium transition-colors whitespace-nowrap">Moda</Link>
            <Link href="/category/home" className="text-gray-700 hover:text-yellow-600 font-medium transition-colors whitespace-nowrap">Casa & Jardim</Link>
            <Link href="/category/beauty" className="text-gray-700 hover:text-yellow-600 font-medium transition-colors whitespace-nowrap">Beleza & Saúde</Link>
            <Link href="/category/sports" className="text-gray-700 hover:text-yellow-600 font-medium transition-colors whitespace-nowrap">Desporto</Link>
            <Link href="/category/toys" className="text-gray-700 hover:text-yellow-600 font-medium transition-colors whitespace-nowrap">Brinquedos</Link>
            <Link href="/category/automotive" className="text-gray-700 hover:text-yellow-600 font-medium transition-colors whitespace-nowrap">Automóveis</Link>
            <Link href="/category/phones" className="text-gray-700 hover:text-yellow-600 font-medium transition-colors whitespace-nowrap">Telemóveis</Link>
          </div>
        </div>
      </nav>

      {/* Mobile menu - slide overlay */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="lg:hidden fixed inset-0 bg-black/30 z-40"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Menu panel */}
          <div className="lg:hidden fixed top-0 left-0 bottom-0 w-[280px] bg-white z-50 shadow-2xl overflow-y-auto animate-fade-in">
            {/* Menu header */}
            <div className="bg-gray-900 text-white p-5 pb-6">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="absolute top-4 right-4 text-white/70 hover:text-white"
              >
                <X size={22} />
              </button>
              {session?.user ? (
                <div className="flex items-center gap-3 mt-2">
                  <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold">
                    {session.user.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{session.user.name}</p>
                    <p className="text-xs text-gray-400">{session.user.email}</p>
                  </div>
                </div>
              ) : (
                <div className="mt-2">
                  <p className="font-semibold text-sm mb-3">Bem-vindo à YuniExpress</p>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="inline-block bg-yellow-500 text-black px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    Entrar / Registar
                  </Link>
                </div>
              )}
            </div>

            {/* Categories */}
            <div className="p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Categorias
              </p>
              <div className="space-y-0.5">
                {mobileCategories.map((cat) => (
                  <Link
                    key={cat.href}
                    href={cat.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 py-2.5 px-2 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
                  >
                    <cat.icon size={18} className="text-gray-400" />
                    <span className="text-sm font-medium flex-1">{cat.label}</span>
                    <ChevronRight size={14} className="text-gray-300" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-gray-100 mx-4" />

            {/* Quick links */}
            <div className="p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Links Rápidos
              </p>
              <div className="space-y-0.5">
                <Link
                  href="/account/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2.5 px-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700 font-medium"
                >
                  Minhas Encomendas
                </Link>
                <Link
                  href="/help"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2.5 px-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700 font-medium"
                >
                  Centro de Ajuda
                </Link>
                <Link
                  href="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2.5 px-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700 font-medium"
                >
                  Sobre Nós
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
