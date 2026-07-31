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
    }
  };

  const announcementActive = settings.announcement_active === "true" && settings.announcement_bar;

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      {/* Announcement bar */}
      {announcementActive && (
        <div className="bg-yellow-500 text-black text-xs py-1.5 text-center font-medium">
          {settings.announcement_bar}
        </div>
      )}

      {/* Top bar */}
      <div className="bg-gray-900 text-white text-xs py-1.5">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <span>Entrega em Mocambique | Pagamento em Meticais</span>
          <div className="hidden md:flex items-center gap-4">
            <Link href="/account/orders" className="hover:text-yellow-400">
              Minhas Encomendas
            </Link>
            <Link href="/help" className="hover:text-yellow-400">
              Ajuda
            </Link>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-3 lg:gap-4">
          {/* Mobile menu button */}
          <button
            className="lg:hidden p-1.5"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Logo - uses custom logo from settings or default */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            {settings.store_logo ? (
              <img
                src={settings.store_logo}
                alt={settings.store_name || "YuniExpress"}
                className="h-10 w-auto hidden sm:block"
              />
            ) : (
              <img
                src="/images/logo.png"
                alt="YuniExpress"
                className="h-10 w-auto hidden sm:block"
              />
            )}
            <img
              src="/icons/icon-192x192.png"
              alt="YuniExpress"
              className="h-8 w-8 sm:hidden rounded-lg"
            />
          </Link>

          {/* Search bar - DESKTOP only (inline) */}
          <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-2xl mx-4">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Pesquisar produtos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border-2 border-yellow-500 rounded-full py-2.5 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/30"
              />
              <button
                type="submit"
                className="absolute right-1 top-1 bottom-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full px-4 transition-colors"
              >
                <Search size={18} />
              </button>
            </div>
          </form>

          {/* Mobile: spacer (search is in dedicated row below) */}
          <div className="lg:hidden flex-1" />

          {/* Actions - Desktop */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="relative p-2 text-gray-600 hover:text-yellow-600 transition-colors"
            >
              <Heart size={22} />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-2 text-gray-600 hover:text-yellow-600 transition-colors"
            >
              <ShoppingCart size={22} />
              {totalCartItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-yellow-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                  {totalCartItems}
                </span>
              )}
            </Link>

            {/* User */}
            {session?.user ? (
              <Link
                href="/account"
                className="flex items-center gap-1.5 p-2 text-gray-600 hover:text-yellow-600 transition-colors"
              >
                <User size={20} />
                <span className="text-sm font-medium max-w-[100px] truncate">
                  {session.user.name?.split(" ")[0]}
                </span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <User size={14} />
                <span>Entrar</span>
              </Link>
            )}
          </div>

          {/* Mobile: Wishlist icon only (cart is in bottom nav) */}
          <Link
            href="/wishlist"
            className="lg:hidden relative p-1.5 text-gray-600"
          >
            <Heart size={20} />
            {wishlistItems.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {wishlistItems.length}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile search bar - dedicated full-width row */}
      <div className="lg:hidden border-t bg-white px-4 py-2">
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
              className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full p-2 transition-colors"
            >
              <Search size={14} />
            </button>
          </div>
        </form>
      </div>

      {/* Categories bar */}
      <nav className="hidden lg:block border-t bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-6 py-2 text-sm">
            <Link href="/category/electronics" className="text-gray-700 hover:text-yellow-600 font-medium transition-colors">Electrónica</Link>
            <Link href="/category/fashion" className="text-gray-700 hover:text-yellow-600 font-medium transition-colors">Moda</Link>
            <Link href="/category/home" className="text-gray-700 hover:text-yellow-600 font-medium transition-colors">Casa & Jardim</Link>
            <Link href="/category/beauty" className="text-gray-700 hover:text-yellow-600 font-medium transition-colors">Beleza & Saúde</Link>
            <Link href="/category/sports" className="text-gray-700 hover:text-yellow-600 font-medium transition-colors">Desporto</Link>
            <Link href="/category/toys" className="text-gray-700 hover:text-yellow-600 font-medium transition-colors">Brinquedos</Link>
            <Link href="/category/automotive" className="text-gray-700 hover:text-yellow-600 font-medium transition-colors">Automóveis</Link>
            <Link href="/category/phones" className="text-gray-700 hover:text-yellow-600 font-medium transition-colors">Telemóveis</Link>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-t shadow-lg z-50">
          <div className="container mx-auto px-4 py-4 space-y-3">
            {!session?.user && (
              <Link href="/login" className="block w-full text-center bg-yellow-500 text-white py-2.5 rounded-lg font-medium">
                Entrar / Registar
              </Link>
            )}
            <Link href="/category/electronics" className="block py-2 text-gray-700">Electrónica</Link>
            <Link href="/category/fashion" className="block py-2 text-gray-700">Moda</Link>
            <Link href="/category/home" className="block py-2 text-gray-700">Casa & Jardim</Link>
            <Link href="/category/beauty" className="block py-2 text-gray-700">Beleza & Saúde</Link>
            <Link href="/category/sports" className="block py-2 text-gray-700">Desporto</Link>
            <Link href="/account/orders" className="block py-2 text-gray-700">Minhas Encomendas</Link>
          </div>
        </div>
      )}
    </header>
  );
}
