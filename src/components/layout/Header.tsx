"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Menu,
  X,
  ChevronDown,
  Package,
} from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";

export default function Header() {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const cartItems = useCartStore((s) => s.items);
  const wishlistItems = useWishlistStore((s) => s.items);

  const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
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
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <img
              src="/images/logo.png"
              alt="YuniExpress"
              className="h-10 w-auto hidden sm:block"
            />
            <img
              src="/icons/icon-192x192.png"
              alt="YuniExpress"
              className="h-10 w-10 sm:hidden rounded-lg"
            />
          </Link>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-4">
            <div className="relative">
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

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
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
                className="hidden sm:flex items-center gap-2 p-2 text-gray-600 hover:text-yellow-600 transition-colors"
              >
                <User size={22} />
                <span className="text-sm font-medium max-w-[100px] truncate">
                  {session.user.name?.split(" ")[0]}
                </span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="hidden sm:flex items-center gap-1 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <User size={16} />
                Entrar
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Categories bar */}
      <nav className="hidden lg:block border-t bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-6 py-2 text-sm">
            <Link
              href="/category/electronics"
              className="text-gray-700 hover:text-yellow-600 font-medium transition-colors"
            >
              Electrónica
            </Link>
            <Link
              href="/category/fashion"
              className="text-gray-700 hover:text-yellow-600 font-medium transition-colors"
            >
              Moda
            </Link>
            <Link
              href="/category/home"
              className="text-gray-700 hover:text-yellow-600 font-medium transition-colors"
            >
              Casa & Jardim
            </Link>
            <Link
              href="/category/beauty"
              className="text-gray-700 hover:text-yellow-600 font-medium transition-colors"
            >
              Beleza & Saúde
            </Link>
            <Link
              href="/category/sports"
              className="text-gray-700 hover:text-yellow-600 font-medium transition-colors"
            >
              Desporto
            </Link>
            <Link
              href="/category/toys"
              className="text-gray-700 hover:text-yellow-600 font-medium transition-colors"
            >
              Brinquedos
            </Link>
            <Link
              href="/category/automotive"
              className="text-gray-700 hover:text-yellow-600 font-medium transition-colors"
            >
              Automóveis
            </Link>
            <Link
              href="/category/phones"
              className="text-gray-700 hover:text-yellow-600 font-medium transition-colors"
            >
              Telemóveis
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-t shadow-lg z-50">
          <div className="container mx-auto px-4 py-4 space-y-3">
            {!session?.user && (
              <Link
                href="/login"
                className="block w-full text-center bg-yellow-500 text-white py-2.5 rounded-lg font-medium"
              >
                Entrar / Registar
              </Link>
            )}
            <Link href="/category/electronics" className="block py-2 text-gray-700">
              Electrónica
            </Link>
            <Link href="/category/fashion" className="block py-2 text-gray-700">
              Moda
            </Link>
            <Link href="/category/home" className="block py-2 text-gray-700">
              Casa & Jardim
            </Link>
            <Link href="/category/beauty" className="block py-2 text-gray-700">
              Beleza & Saúde
            </Link>
            <Link href="/category/sports" className="block py-2 text-gray-700">
              Desporto
            </Link>
            <Link href="/account/orders" className="block py-2 text-gray-700">
              Minhas Encomendas
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
