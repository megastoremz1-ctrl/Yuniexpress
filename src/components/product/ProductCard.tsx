"use client";

import Link from "next/link";
import { Heart, Star, Truck } from "lucide-react";
import { useWishlistStore } from "@/store/wishlist";
import { ProductCard as ProductCardType } from "@/types";
import { getCheapestShipping } from "@/lib/services/shipping";

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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-MZ", {
      style: "decimal",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="relative group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      {/* Image */}
      <Link href={`/product/${product.slug}`} className="relative block aspect-square overflow-hidden bg-gray-100">
        {product.images[0] && (
          <img
            src={product.images[0].url}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        )}
        {discount > 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            -{discount}%
          </div>
        )}
        {(() => {
          const shipping = getCheapestShipping(product.priceMZN);
          return (
            <div className={`absolute bottom-2 left-2 ${shipping.free ? "bg-green-500" : "bg-blue-500"} text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1`}>
              <Truck size={10} />
              {shipping.free ? "Frete Grátis" : `Envio ${shipping.price} MT`}
            </div>
          );
        })()}
      </Link>

      {/* Wishlist button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
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
        className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full shadow-sm hover:bg-white transition-colors z-10"
      >
        <Heart
          size={16}
          className={inWishlist ? "fill-red-500 text-red-500" : "text-gray-400"}
        />
      </button>

      {/* Info */}
      <div className="p-3">
        <Link href={`/product/${product.slug}`}>
          <h3 className="text-sm text-gray-800 line-clamp-2 mb-2 group-hover:text-yellow-600 transition-colors">
            {product.title}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-lg font-bold text-red-600">
            {formatPrice(product.priceMZN)} MT
          </span>
          {product.originalPriceMZN && (
            <span className="text-xs text-gray-400 line-through">
              {formatPrice(product.originalPriceMZN)} MT
            </span>
          )}
        </div>

        {/* Rating & sold */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <div className="flex items-center gap-0.5">
            <Star size={12} className="fill-yellow-400 text-yellow-400" />
            <span>{product.rating.toFixed(1)}</span>
          </div>
          <span>|</span>
          <span>{product.sold > 0 ? `${product.sold} vendidos` : "Novo"}</span>
        </div>
      </div>
    </div>
  );
}
