"use client";

import Link from "next/link";
import ProductCard from "@/components/product/ProductCard";
import { ProductCard as ProductCardType } from "@/types";

interface FeaturedProductsProps {
  title: string;
  products: ProductCardType[];
  viewAllLink?: string;
}

export default function FeaturedProducts({
  title,
  products,
  viewAllLink,
}: FeaturedProductsProps) {
  if (products.length === 0) return null;

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        {viewAllLink && (
          <Link href={viewAllLink} className="text-sm text-yellow-600 hover:underline">
            Ver mais
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
