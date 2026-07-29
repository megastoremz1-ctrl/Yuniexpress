"use client";

import HeroBanner from "@/components/home/HeroBanner";
import CategoryGrid from "@/components/home/CategoryGrid";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import { BannerData, ProductCard, CategoryData } from "@/types";
import { Zap, Truck, Shield, HeadphonesIcon } from "lucide-react";

interface HomePageClientProps {
  banners: BannerData[];
  featuredProducts: ProductCard[];
  newProducts: ProductCard[];
  categories: CategoryData[];
}

export default function HomePageClient({
  banners,
  featuredProducts,
  newProducts,
  categories,
}: HomePageClientProps) {
  return (
    <div className="container mx-auto px-4 py-6">
      {/* Hero Banner */}
      <HeroBanner banners={banners} />

      {/* Trust badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-8">
        <div className="flex items-center gap-3 p-4 bg-white rounded-xl border">
          <Truck className="text-yellow-500 shrink-0" size={24} />
          <div>
            <p className="text-sm font-semibold text-gray-900">Entrega em MZ</p>
            <p className="text-xs text-gray-500">Em todo o país</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 bg-white rounded-xl border">
          <Shield className="text-yellow-500 shrink-0" size={24} />
          <div>
            <p className="text-sm font-semibold text-gray-900">Pagamento Seguro</p>
            <p className="text-xs text-gray-500">M-Pesa, e-Mola</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 bg-white rounded-xl border">
          <Zap className="text-yellow-500 shrink-0" size={24} />
          <div>
            <p className="text-sm font-semibold text-gray-900">Preços em MT</p>
            <p className="text-xs text-gray-500">Sem surpresas</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 bg-white rounded-xl border">
          <HeadphonesIcon className="text-yellow-500 shrink-0" size={24} />
          <div>
            <p className="text-sm font-semibold text-gray-900">Suporte 24/7</p>
            <p className="text-xs text-gray-500">Sempre disponível</p>
          </div>
        </div>
      </div>

      {/* Categories */}
      <CategoryGrid categories={categories} />

      {/* Featured Products */}
      <FeaturedProducts
        title="Produtos em Destaque"
        products={featuredProducts}
        viewAllLink="/search?featured=true"
      />

      {/* Flash Sale Banner */}
      <div className="my-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl p-6 md:p-8 text-white">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="fill-white" size={24} />
          <h2 className="text-2xl font-bold">Super Ofertas</h2>
        </div>
        <p className="text-white/80 mb-4">
          Descontos incríveis por tempo limitado
        </p>
      </div>

      {/* New Arrivals */}
      <FeaturedProducts
        title="Novos Produtos"
        products={newProducts}
        viewAllLink="/search?sort=newest"
      />

      {/* Newsletter / Promo section */}
      <div className="my-12 bg-yellow-50 rounded-2xl p-8 text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Receba ofertas exclusivas
        </h3>
        <p className="text-gray-600 mb-6">
          Subscreva para receber notificações de promoções e novos produtos
        </p>
        <div className="flex max-w-md mx-auto gap-2">
          <input
            type="email"
            placeholder="O seu email..."
            className="flex-1 px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
          <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
            Subscrever
          </button>
        </div>
      </div>
    </div>
  );
}
