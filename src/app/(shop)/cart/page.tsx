"use client";

import { useState } from "react";

import Link from "next/link";
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft } from "lucide-react";
import { useCartStore } from "@/store/cart";
import Button from "@/components/ui/Button";

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart } = useCartStore();
  const [couponCode, setCouponCode] = useState("");

  const subtotal = items.reduce((sum, item) => sum + item.priceMZN * item.quantity, 0);
  const formatPrice = (price: number) =>
    new Intl.NumberFormat("pt-MZ", { style: "decimal", minimumFractionDigits: 0 }).format(price);

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Carrinho Vazio</h1>
        <p className="text-gray-500 mb-6">Ainda não adicionou nenhum produto ao carrinho.</p>
        <Link href="/">
          <Button>Continuar Comprando</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Carrinho ({items.length} {items.length === 1 ? "item" : "itens"})
        </h1>
        <button onClick={clearCart} className="text-sm text-red-500 hover:underline">
          Limpar carrinho
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 bg-white p-4 rounded-xl border"
            >
              <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                  {item.title}
                </h3>
                {item.variant && (
                  <p className="text-xs text-gray-500 mb-2">Variante: {item.variant}</p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-red-600">
                    {formatPrice(item.priceMZN)} MT
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 rounded border flex items-center justify-center hover:bg-gray-50"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 rounded border flex items-center justify-center hover:bg-gray-50"
                    >
                      <Plus size={14} />
                    </button>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="ml-2 p-2 text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-white p-6 rounded-xl border h-fit sticky top-24">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Resumo</h2>
          
          {/* Coupon */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Código de cupão"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/30"
            />
            <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors">
              Aplicar
            </button>
          </div>

          <div className="space-y-2 mb-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">{formatPrice(subtotal)} MT</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Envio</span>
              <span className="text-green-600 font-medium">Grátis</span>
            </div>
          </div>

          <div className="border-t pt-4 mb-6">
            <div className="flex justify-between">
              <span className="text-lg font-bold">Total</span>
              <span className="text-lg font-bold text-red-600">
                {formatPrice(subtotal)} MT
              </span>
            </div>
          </div>

          <Link href="/checkout">
            <Button fullWidth size="lg">
              Finalizar Compra
            </Button>
          </Link>

          <Link
            href="/"
            className="flex items-center justify-center gap-1 mt-4 text-sm text-gray-500 hover:text-yellow-600"
          >
            <ArrowLeft size={14} />
            Continuar comprando
          </Link>
        </div>
      </div>
    </div>
  );
}
