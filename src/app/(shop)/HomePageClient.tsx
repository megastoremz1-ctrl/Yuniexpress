"use client";

import { useState, useEffect } from "react";
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
  const [recommendations, setRecommendations] = useState<ProductCard[]>([]);

  useEffect(() => {
    // Fetch personalized recommendations
    fetch("/api/recommendations?limit=12")
      .then((r) => r.json())
      .then((d) => setRecommendations(d.products || []))
      .catch(() => {});
  }, []);
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

      {/* Personalized Recommendations */}
      {recommendations.length > 0 && (
        <FeaturedProducts
          title="Recomendados Para Si"
          products={recommendations}
          viewAllLink="/search?sort=popular"
        />
      )}

      {/* Newsletter / Promo section */}
      <NewsletterSection />
    </div>
  );
}

function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setMessage(data.message || data.error);
      if (res.ok) setEmail("");
    } catch {
      setMessage("Erro ao processar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="my-12 bg-yellow-50 rounded-2xl p-8 text-center">
      <h3 className="text-2xl font-bold text-gray-900 mb-2">
        Receba ofertas exclusivas
      </h3>
      <p className="text-gray-600 mb-6">
        Subscreva para receber notificações de promoções e novos produtos
      </p>
      <form onSubmit={handleSubmit} className="flex max-w-md mx-auto gap-2">
        <input
          type="email"
          placeholder="O seu email..."
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="flex-1 px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-yellow-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          {loading ? "..." : "Subscrever"}
        </button>
      </form>
      {message && (
        <p className="mt-3 text-sm text-green-700 font-medium">{message}</p>
      )}
    </div>
  );
}
