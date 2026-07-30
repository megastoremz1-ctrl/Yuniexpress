"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ProductCard from "@/components/product/ProductCard";
import { ProductCard as ProductCardType } from "@/types";
import { ChevronRight, SlidersHorizontal } from "lucide-react";

const categoryNames: Record<string, string> = {
  electronics: "Electrónica",
  fashion: "Moda",
  home: "Casa & Jardim",
  beauty: "Beleza & Saúde",
  sports: "Desporto",
  toys: "Brinquedos",
  automotive: "Automóveis",
  phones: "Telemóveis",
  watches: "Relógios",
  computers: "Computadores",
  gaming: "Gaming",
};

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [products, setProducts] = useState<ProductCardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("popular");

  const categoryName = categoryNames[slug] || slug;

  useEffect(() => {
    fetchProducts();
  }, [slug, sort, page]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        category: slug,
        sort,
        page: page.toString(),
        limit: "24",
      });

      const res = await fetch(`/api/products?${params}`);
      const data = await res.json();
      setProducts(data.products || []);
      setTotal(data.pagination?.total || 0);
    } catch (error) {
      console.error("Error fetching category products:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-yellow-600">
          Início
        </Link>
        <ChevronRight size={14} />
        <span className="text-gray-900 font-medium">{categoryName}</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{categoryName}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {total} {total === 1 ? "produto" : "produtos"}
          </p>
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/30"
        >
          <option value="popular">Mais vendidos</option>
          <option value="newest">Mais recentes</option>
          <option value="price_asc">Preço: Menor → Maior</option>
          <option value="price_desc">Preço: Maior → Menor</option>
          <option value="rating">Melhor avaliação</option>
        </select>
      </div>

      {/* Products */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border animate-pulse">
              <div className="aspect-square bg-gray-200 rounded-t-xl" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-gray-200 rounded" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
                <div className="h-5 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination */}
          {total > 24 && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 border rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
              >
                Anterior
              </button>
              <span className="px-4 py-2 text-sm text-gray-600">
                Página {page} de {Math.ceil(total / 24)}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= Math.ceil(total / 24)}
                className="px-4 py-2 border rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
              >
                Próxima
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <SlidersHorizontal size={24} className="text-gray-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Nenhum produto nesta categoria
          </h2>
          <p className="text-gray-500 mb-4">
            Estamos a adicionar novos produtos constantemente.
          </p>
          <Link
            href="/"
            className="text-yellow-600 hover:underline font-medium"
          >
            Ver todos os produtos
          </Link>
        </div>
      )}
    </div>
  );
}
