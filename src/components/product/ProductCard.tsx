"use client";

import Link from "next/link";
import { Heart, Star } from "lucide-react";
import { useWishlistStore } from "@/store/wishlist";
import { ProductCard as ProductCardType } from "@/types";

interface ProductCardProps {
  product: ProductCardType;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { toggleItem, isInWishlist } = useWishlistStore();
  const inWishlist = isInWishlist(product.id);

  const discount = product.originalPriceMZN
    ? Math.round(
        ((product.originalPriceMZN - product.priceMZN) / product.originalPriceMZN) * 100
      )
    : 0;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("pt-MZ", { style: "decimal", minimumFractionDigits: 0 }).format(price);

  return (
    <div className="relative group bg-white rounded-lg border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200">
      {/* Image */}
      <Link href={`/product/${product.slug}`} className="block aspect-square overflow-hidden bg-gray-50">
        {product.images[0] ? (
          <img
            src={product.images[0].url}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <span className="text-4xl">📦</span>
          </div>
        )}
        {discount > 0 && (
          <span className="absolute top-1.5 left-1.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
            -{discount}%
          </span>
        )}
      </Link>

      {/* Wishlist */}
      <button
        onClick={(e) => {
          e.preventDefault();
          toggleItem({
            id: `wish-${product.id}`,
            productId: product.id,
            title: product.title,
            image: product.images[0]?.url || "",
            priceMZN: product.priceMZN,
            originalPriceMZN: product.originalPriceMZN,
            rating: product.rating,
          });
        }}
        className="absolute top-1.5 right-1.5 p-1 bg-white/80 backdrop-blur-sm rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-10"
      >
        <Heart size={14} className={inWishlist ? "fill-red-500 text-red-500" : "text-gray-400"} />
      </button>

      {/* Info */}
      <Link href={`/product/${product.slug}`} className="block p-2.5">
        <h3 className="text-xs text-gray-700 line-clamp-2 leading-4 mb-1.5 min-h-[32px]">
          {product.title}
        </h3>

        {/* Price */}
        <div className="flex items-baseline gap-1.5">
          <span className="text-sm font-bold text-red-600">
            {formatPrice(product.priceMZN)}<span className="text-[10px] ml-0.5">MT</span>
          </span>
          {product.originalPriceMZN && (
            <span className="text-[10px] text-gray-400 line-through">
              {formatPrice(product.originalPriceMZN)}
            </span>
          )}
        </div>

        {/* Rating & sold + Free shipping */}
        <div className="flex items-center justify-between mt-1.5">
          <div className="flex items-center gap-1 text-[10px] text-gray-500">
            <Star size={10} className="fill-yellow-400 text-yellow-400" />
            <span>{product.rating.toFixed(1)}</span>
            <span className="text-gray-300">|</span>
            <span>{product.sold > 0 ? `${product.sold}+` : "Novo"}</span>
          </div>
          <span className="text-[9px] text-green-600 font-medium">Frete Grátis</span>
        </div>
      </Link>
    </div>
  );
}
