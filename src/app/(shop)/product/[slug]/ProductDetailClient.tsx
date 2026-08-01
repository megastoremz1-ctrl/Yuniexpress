"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import {
  Star,
  Heart,
  ShoppingCart,
  Truck,
  Shield,
  Minus,
  Plus,
  ChevronRight,
  Share2,
} from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";
import { ProductDetail, ReviewData } from "@/types";
import Button from "@/components/ui/Button";
import ReviewForm from "@/components/reviews/ReviewForm";

interface ProductDetailClientProps {
  product: ProductDetail;
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const { data: session } = useSession();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const addToCart = useCartStore((s) => s.addItem);
  const { toggleItem, isInWishlist } = useWishlistStore();
  const inWishlist = isInWishlist(product.id);

  const [showCartPopup, setShowCartPopup] = useState(false);

  // Get the active price based on selected variant
  const getActivePrice = () => {
    if (selectedVariant && product.variants.length > 0) {
      const variant = product.variants.find((v) => v.value === selectedVariant);
      if (variant?.priceMZN) return variant.priceMZN;
    }
    return product.priceMZN;
  };

  const activePrice = getActivePrice();

  const discount = product.originalPriceMZN
    ? Math.round(
        ((product.originalPriceMZN - activePrice) / product.originalPriceMZN) * 100
      )
    : 0;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("pt-MZ", { style: "decimal", minimumFractionDigits: 0 }).format(price);

  const handleAddToCart = () => {
    if (product.variants.length > 0 && !selectedVariant) {
      // Only require variant if there are real variants from AliExpress
      toast.error("Selecione uma opção antes de adicionar ao carrinho");
      return;
    }
    addToCart({
      id: `cart-${product.id}-${selectedVariant || "default"}-${Date.now()}`,
      productId: product.id,
      title: product.title + (selectedVariant ? ` (${selectedVariant})` : ""),
      image: product.images[0]?.url || "",
      priceMZN: activePrice,
      originalPriceMZN: product.originalPriceMZN,
      quantity,
      variant: selectedVariant || undefined,
      stock: product.stock,
    });
    setShowCartPopup(true);

    // Track view for recommendations
    fetch("/api/recommendations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "view", value: product.id }),
    }).catch(() => {});
  };

  const handleBuyNow = () => {
    if (product.variants.length > 0 && !selectedVariant) {
      toast.error("Selecione uma opção antes de comprar");
      return;
    }
    addToCart({
      id: `cart-${product.id}-${selectedVariant || "default"}-${Date.now()}`,
      productId: product.id,
      title: product.title + (selectedVariant ? ` (${selectedVariant})` : ""),
      image: product.images[0]?.url || "",
      priceMZN: activePrice,
      originalPriceMZN: product.originalPriceMZN,
      quantity,
      variant: selectedVariant || undefined,
      stock: product.stock,
    });
    window.location.href = "/checkout";
  };

  const handleWishlist = () => {
    toggleItem({
      id: `wish-${product.id}`,
      productId: product.id,
      title: product.title,
      image: product.images[0]?.url || "",
      priceMZN: product.priceMZN,
      originalPriceMZN: product.originalPriceMZN,
      rating: product.rating,
    });
    toast.success(inWishlist ? "Removido da lista de desejos" : "Adicionado à lista de desejos");
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-yellow-600">Início</Link>
        <ChevronRight size={14} />
        {product.category && (
          <>
            <Link href={`/category/${product.category.slug}`} className="hover:text-yellow-600">
              {product.category.name}
            </Link>
            <ChevronRight size={14} />
          </>
        )}
        <span className="text-gray-900 truncate">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Images */}
        <div>
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-white border mb-4">
            {product.images[selectedImage] && (
              <img
                src={product.images[selectedImage].url}
                alt={product.title}
                className="w-full h-full object-contain p-4"
              />
            )}
            {discount > 0 && (
              <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                -{discount}%
              </div>
            )}
          </div>
          
          {/* Thumbnail strip */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                  idx === selectedImage ? "border-yellow-500" : "border-gray-200"
                }`}
              >
                <img
                  src={img.url}
                  alt={`${product.title} ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
            {product.title}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={16}
                  className={
                    star <= Math.round(product.rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }
                />
              ))}
              <span className="text-sm text-gray-600 ml-1">
                {product.rating.toFixed(1)}
              </span>
            </div>
            <span className="text-sm text-gray-500">
              {product.reviewCount} avaliações
            </span>
            <span className="text-sm text-gray-500">
              {product.sold} vendidos
            </span>
          </div>

          {/* Price - updates based on selected variant */}
          <div className="bg-orange-50 p-4 rounded-xl mb-6">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-red-600">
                {formatPrice(activePrice)} MT
              </span>
              {product.originalPriceMZN && product.originalPriceMZN > activePrice && (
                <span className="text-lg text-gray-400 line-through">
                  {formatPrice(product.originalPriceMZN)} MT
                </span>
              )}
              {discount > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                  -{discount}%
                </span>
              )}
            </div>
            {selectedVariant && (
              <p className="text-xs text-gray-500 mt-1">
                Preço para: <strong>{selectedVariant}</strong>
              </p>
            )}
          </div>

          {/* Variants with prices */}
          {product.variants.length > 0 && (
            <div className="mb-6">
              {/* Group variants by name */}
              {Object.entries(
                product.variants.reduce((groups: Record<string, typeof product.variants>, v) => {
                  if (!groups[v.name]) groups[v.name] = [];
                  groups[v.name].push(v);
                  return groups;
                }, {})
              ).map(([name, variants]) => (
                <div key={name} className="mb-3">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">{name}</h3>
                  <div className="flex flex-wrap gap-2">
                    {variants.map((variant) => (
                      <button
                        key={variant.id}
                        onClick={() => setSelectedVariant(variant.value)}
                        className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
                          selectedVariant === variant.value
                            ? "border-yellow-500 bg-yellow-50 text-yellow-700"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        <span>{variant.value}</span>
                        {variant.priceMZN && variant.priceMZN !== product.priceMZN && (
                          <span className="ml-1 text-xs font-bold text-red-600">
                            {new Intl.NumberFormat("pt-MZ").format(variant.priceMZN)} MT
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quantity */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Quantidade</h3>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 rounded-lg border flex items-center justify-center hover:bg-gray-50"
              >
                <Minus size={16} />
              </button>
              <span className="w-12 text-center font-semibold">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                className="w-10 h-10 rounded-lg border flex items-center justify-center hover:bg-gray-50"
              >
                <Plus size={16} />
              </button>
              <span className="text-sm text-gray-500">
                {product.stock} disponíveis
              </span>
            </div>
          </div>

          {/* Actions - AliExpress style */}
          <div className="flex gap-3 mb-6">
            <Button onClick={handleAddToCart} variant="outline" size="lg" className="flex-1">
              <ShoppingCart size={18} className="mr-2" />
              Adicionar ao Carrinho
            </Button>
            <Button onClick={handleBuyNow} size="lg" className="flex-1">
              Comprar Agora
            </Button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleWishlist}
              className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-colors text-sm ${
                inWishlist
                  ? "border-red-500 text-red-500 bg-red-50"
                  : "border-gray-200 text-gray-500 hover:border-red-300"
              }`}
            >
              <Heart size={18} className={inWishlist ? "fill-current" : ""} />
              {inWishlist ? "Na lista" : "Favoritos"}
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 border-gray-200 text-gray-500 hover:border-gray-300 transition-colors text-sm">
              <Share2 size={18} />
              Partilhar
            </button>
          </div>

          {/* Shipping info - real costs */}
          <div className="space-y-3 p-4 bg-white rounded-xl border">
            {(() => {
              const { calculateShipping } = require("@/lib/services/shipping");
              const options = calculateShipping(activePrice, quantity);
              return options.map((opt: any, i: number) => (
                <div key={i} className="flex items-center gap-3">
                  <Truck size={18} className={opt.free ? "text-green-500" : "text-blue-500"} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{opt.name}</p>
                      <span className={`text-sm font-bold ${opt.free ? "text-green-600" : "text-gray-900"}`}>
                        {opt.free ? "GRÁTIS" : `${opt.price} MT`}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Entrega estimada: {opt.days}
                    </p>
                  </div>
                </div>
              ));
            })()}
            <div className="flex items-center gap-3 pt-2 border-t">
              <Shield size={18} className="text-blue-500" />
              <div>
                <p className="text-sm font-medium">Proteção ao Comprador</p>
                <p className="text-xs text-gray-500">
                  Reembolso total se não receber o produto
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      {product.description && (
        <div className="mt-12 bg-white rounded-2xl p-6 border">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Descrição do Produto</h2>
          <div
            className="prose prose-sm max-w-none text-gray-700"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
        </div>
      )}

      {/* Reviews */}
      <div className="mt-8 bg-white rounded-2xl p-6 border">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Avaliações ({product.reviewCount})
        </h2>

        {/* Review Form */}
        <div className="mb-6">
          <ReviewForm productId={product.id} onReviewSubmitted={() => window.location.reload()} />
        </div>

        {product.reviews.length > 0 ? (
          <div className="space-y-4">
            {product.reviews.map((review) => (
              <div key={review.id} className="border-b pb-4 last:border-0">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={14}
                        className={
                          star <= review.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium">{review.user.name || "Anónimo"}</span>
                  {review.verified && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                      Verificado
                    </span>
                  )}
                </div>
                {review.comment && (
                  <p className="text-sm text-gray-600">{review.comment}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(review.createdAt).toLocaleDateString("pt-MZ")}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Ainda não há avaliações para este produto.</p>
        )}
      </div>

      {/* Cart Popup - AliExpress style */}
      {showCartPopup && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center" onClick={() => setShowCartPopup(false)}>
          <div className="bg-white w-full sm:w-auto sm:min-w-[400px] sm:rounded-2xl rounded-t-2xl p-6 animate-in slide-in-from-bottom" onClick={(e) => e.stopPropagation()}>
            {/* Success header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-gray-900">Adicionado ao carrinho!</p>
                <p className="text-xs text-gray-500">O produto foi adicionado com sucesso</p>
              </div>
            </div>

            {/* Product preview */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-5">
              {product.images[0] && (
                <img src={product.images[0].url} alt="" className="w-16 h-16 object-cover rounded-lg" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800 line-clamp-2">{product.title}</p>
                {selectedVariant && (
                  <p className="text-xs text-gray-500 mt-0.5">{selectedVariant}</p>
                )}
                <p className="text-sm font-bold text-red-600 mt-1">{formatPrice(activePrice)} MT × {quantity}</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <Link
                href="/cart"
                className="flex-1 flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white py-3 rounded-xl font-medium transition-colors text-sm"
              >
                <ShoppingCart size={16} />
                Ver Carrinho
              </Link>
              <button
                onClick={() => setShowCartPopup(false)}
                className="flex-1 py-3 border-2 border-gray-200 hover:border-gray-300 rounded-xl font-medium text-gray-700 text-sm transition-colors"
              >
                Continuar Comprando
              </button>
            </div>

            {/* Or go to checkout */}
            <Link
              href="/checkout"
              className="block w-full text-center mt-3 py-2.5 text-sm text-yellow-600 font-medium hover:underline"
            >
              Finalizar compra agora →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
