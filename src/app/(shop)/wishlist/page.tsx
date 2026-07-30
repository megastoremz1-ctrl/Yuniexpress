"use client";

import Link from "next/link";

import { Heart, ShoppingCart, Star, Trash2 } from "lucide-react";
import { useWishlistStore } from "@/store/wishlist";
import { useCartStore } from "@/store/cart";
import Button from "@/components/ui/Button";
import toast from "react-hot-toast";

export default function WishlistPage() {
  const { items, removeItem } = useWishlistStore();
  const addToCart = useCartStore((s) => s.addItem);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("pt-MZ", { style: "decimal", minimumFractionDigits: 0 }).format(price);

  const handleAddToCart = (item: typeof items[0]) => {
    addToCart({
      id: `cart-${item.productId}-${Date.now()}`,
      productId: item.productId,
      title: item.title,
      image: item.image,
      priceMZN: item.priceMZN,
      originalPriceMZN: item.originalPriceMZN,
      quantity: 1,
      stock: 100,
    });
    toast.success("Adicionado ao carrinho!");
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Heart size={64} className="mx-auto text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Lista de Desejos Vazia</h1>
        <p className="text-gray-500 mb-6">
          Ainda não adicionou nenhum produto à lista de desejos.
        </p>
        <Link href="/">
          <Button>Explorar Produtos</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Lista de Desejos ({items.length})
      </h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {items.map((item) => (
          <div key={item.id} className="bg-white rounded-xl border overflow-hidden group">
            <div className="relative aspect-square bg-gray-100">
              {item.image && (
                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
              )}
              <button
                onClick={() => removeItem(item.productId)}
                className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full shadow-sm hover:bg-red-50 transition-colors"
              >
                <Trash2 size={14} className="text-red-500" />
              </button>
            </div>
            <div className="p-3">
              <h3 className="text-sm text-gray-800 line-clamp-2 mb-2">{item.title}</h3>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-lg font-bold text-red-600">
                  {formatPrice(item.priceMZN)} MT
                </span>
                {item.originalPriceMZN && (
                  <span className="text-xs text-gray-400 line-through">
                    {formatPrice(item.originalPriceMZN)} MT
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 mb-3">
                <Star size={12} className="fill-yellow-400 text-yellow-400" />
                <span className="text-xs text-gray-500">{item.rating.toFixed(1)}</span>
              </div>
              <button
                onClick={() => handleAddToCart(item)}
                className="w-full flex items-center justify-center gap-1 bg-yellow-500 hover:bg-yellow-600 text-white text-sm py-2 rounded-lg font-medium transition-colors"
              >
                <ShoppingCart size={14} />
                Comprar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
