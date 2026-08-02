"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import HeroBanner from "@/components/home/HeroBanner";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import ProductCard from "@/components/product/ProductCard";
import { BannerData, ProductCard as ProductCardType, CategoryData } from "@/types";
import {
  Zap, Truck, Shield, HeadphonesIcon, Smartphone, Shirt, Home,
  Sparkles, Dumbbell, Gamepad2, Car, Watch, Monitor, ShoppingBag,
  Baby, Wrench, Lightbulb, BookOpen, Footprints, PawPrint,
  ChevronRight, Flame, Clock, Star,
} from "lucide-react";

const categoryIcons: Record<string, any> = {
  Monitor, Smartphone, Laptop: Monitor, Shirt, Home, Sparkles,
  Dumbbell, Gamepad2, Car, Watch, ShoppingBag, Footprints,
  Baby, Wrench, Lightbulb, BookOpen, PawPrint, Shield,
};

interface HomePageClientProps {
  banners: BannerData[];
  featuredProducts: ProductCardType[];
  newProducts: ProductCardType[];
  categories: CategoryData[];
  settings: Record<string, string>;
}

export default function HomePageClient({
  banners,
  featuredProducts,
  newProducts,
  categories,
  settings,
}: HomePageClientProps) {
  const [recommendations, setRecommendations] = useState<ProductCardType[]>([]);
  const [activeTab, setActiveTab] = useState<"featured" | "new" | "recommended">("featured");

  // Shuffle products client-side (each visitor sees different order, no extra DB queries)
  function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

const [shuffledFeatured] = useState(() => shuffleArray(featuredProducts));
const [shuffledNew] = useState(() => shuffleArray(newProducts));

  useEffect(() => {
    fetch("/api/recommendations?limit=12")
      .then((r) => r.json())
      .then((d) => setRecommendations(d.products || []))
      .catch(() => {});
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <div className="container mx-auto px-3 pt-2">
        <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-2">
          {/* Category Sidebar - matches banner height */}
          <aside className="hidden lg:block bg-white rounded-lg border overflow-hidden" style={{ aspectRatio: "200/350" }}>
            <div className="p-2.5 bg-gray-900 text-white text-xs font-semibold">
              Categorias
            </div>
            <nav className="overflow-y-auto" style={{ maxHeight: "calc(100% - 36px)" }}>
              {categories.slice(0, 10).map((cat) => {
                const IconComp = categoryIcons[cat.icon || ""] || ShoppingBag;
                return (
                  <Link
                    key={cat.id}
                    href={`/category/${cat.slug}`}
                    className="flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-yellow-50 hover:text-yellow-700 transition-colors group"
                  >
                    <IconComp size={14} className="text-gray-400 group-hover:text-yellow-600" />
                    <span className="flex-1 truncate">{cat.name}</span>
                  </Link>
                );
              })}
              <Link href="/categories" className="flex items-center gap-2 px-3 py-2 text-xs text-yellow-600 font-medium hover:bg-yellow-50">
                Ver todas →
              </Link>
            </nav>
          </aside>

          {/* Main Banner - 1920x700 */}
          <div>
            <HeroBanner banners={banners} />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3">
        {/* Trust Badges */}
        <div className="grid grid-cols-4 gap-2 py-3">
          <div className="flex items-center gap-2 p-2 bg-white rounded-lg border">
            <Truck className="text-green-600 shrink-0" size={16} />
            <p className="text-[10px] font-medium text-gray-700 leading-tight">Frete Grátis</p>
          </div>
          <div className="flex items-center gap-2 p-2 bg-white rounded-lg border">
            <Shield className="text-blue-600 shrink-0" size={16} />
            <p className="text-[10px] font-medium text-gray-700 leading-tight">Pagamento Seguro</p>
          </div>
          <div className="flex items-center gap-2 p-2 bg-white rounded-lg border">
            <Zap className="text-yellow-600 shrink-0" size={16} />
            <p className="text-[10px] font-medium text-gray-700 leading-tight">Preços em MT</p>
          </div>
          <div className="flex items-center gap-2 p-2 bg-white rounded-lg border">
            <HeadphonesIcon className="text-purple-600 shrink-0" size={16} />
            <p className="text-[10px] font-medium text-gray-700 leading-tight">Suporte</p>
          </div>
        </div>

        {/* Mobile Categories - Scrollable */}
        <div className="lg:hidden overflow-x-auto pb-4 no-scrollbar">
          <div className="flex gap-4 min-w-max">
            {categories.slice(0, 12).map((cat) => {
              const IconComp = categoryIcons[cat.icon || ""] || ShoppingBag;
              return (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  className="flex flex-col items-center gap-1.5 w-16 group"
                >
                  <div className="w-12 h-12 bg-yellow-50 rounded-2xl flex items-center justify-center group-hover:bg-yellow-100 group-hover:scale-110 transition-all">
                    <IconComp size={20} className="text-yellow-600" />
                  </div>
                  <span className="text-[10px] text-gray-700 text-center leading-tight font-medium">
                    {cat.name.split(" ")[0]}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Flash Deals Banner */}
        <div className="my-3 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 rounded-lg p-3 text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-black/20 to-transparent" />
          <div className="relative flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Flame size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold flex items-center gap-2">
                Super Ofertas
                <Clock size={16} className="animate-pulse" />
              </h2>
              <p className="text-white/80 text-sm">Descontos até 50% por tempo limitado</p>
            </div>
          </div>
        </div>

        {/* Product Tabs - AliExpress style */}
        <div className="mb-4">
          <div className="flex items-center gap-1 border-b">
            <button
              onClick={() => setActiveTab("featured")}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "featured"
                  ? "border-yellow-500 text-yellow-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Star size={14} className="inline mr-1" />
              Em Destaque
            </button>
            <button
              onClick={() => setActiveTab("new")}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "new"
                  ? "border-yellow-500 text-yellow-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Zap size={14} className="inline mr-1" />
              Novidades
            </button>
            <button
              onClick={() => setActiveTab("recommended")}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "recommended"
                  ? "border-yellow-500 text-yellow-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <HeadphonesIcon size={14} className="inline mr-1" />
              Para Si
            </button>
          </div>
        </div>

        {/* Products Grid - tight and clean */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
          {(activeTab === "featured"
            ? shuffledFeatured
            : activeTab === "new"
            ? shuffledNew
            : recommendations.length > 0
            ? recommendations
            : shuffledNew
          ).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Load more */}
        <div className="text-center py-4">
          <Link
            href={`/search?sort=${activeTab === "new" ? "newest" : "popular"}`}
            className="inline-flex items-center gap-2 px-8 py-3 bg-white border-2 border-yellow-500 text-yellow-600 rounded-full font-medium hover:bg-yellow-50 transition-colors"
          >
            Ver mais produtos
            <ChevronRight size={16} />
          </Link>
        </div>

        {/* Newsletter */}
        <NewsletterSection />
      </div>
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
      setMessage("Erro ao processar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="my-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 text-center border border-yellow-100">
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        Receba ofertas exclusivas
      </h3>
      <p className="text-gray-600 text-sm mb-5">
        Subscreva e receba promoções e novos produtos no seu email
      </p>
      <form onSubmit={handleSubmit} className="flex max-w-md mx-auto gap-2">
        <input
          type="email"
          placeholder="O seu email..."
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="flex-1 px-4 py-3 rounded-full border focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 text-white px-6 py-3 rounded-full font-medium transition-colors text-sm"
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
