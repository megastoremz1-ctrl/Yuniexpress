"use client";

import Link from "next/link";
import {
  Smartphone,
  Shirt,
  Home,
  Sparkles,
  Dumbbell,
  Gamepad2,
  Car,
  Watch,
  Monitor,
  ShoppingBag,
} from "lucide-react";

const categories = [
  { name: "Telemóveis", slug: "phones", icon: Smartphone, color: "bg-blue-50 text-blue-600", desc: "Smartphones e acessórios" },
  { name: "Electrónica", slug: "electronics", icon: Monitor, color: "bg-indigo-50 text-indigo-600", desc: "Gadgets e dispositivos" },
  { name: "Moda", slug: "fashion", icon: Shirt, color: "bg-pink-50 text-pink-600", desc: "Roupa e acessórios" },
  { name: "Casa & Jardim", slug: "home", icon: Home, color: "bg-green-50 text-green-600", desc: "Decoração e utensílios" },
  { name: "Beleza & Saúde", slug: "beauty", icon: Sparkles, color: "bg-purple-50 text-purple-600", desc: "Skincare e cosméticos" },
  { name: "Desporto", slug: "sports", icon: Dumbbell, color: "bg-orange-50 text-orange-600", desc: "Fitness e equipamento" },
  { name: "Gaming", slug: "gaming", icon: Gamepad2, color: "bg-red-50 text-red-600", desc: "Jogos e acessórios" },
  { name: "Automóveis", slug: "automotive", icon: Car, color: "bg-gray-50 text-gray-600", desc: "Acessórios auto" },
  { name: "Relógios", slug: "watches", icon: Watch, color: "bg-yellow-50 text-yellow-600", desc: "Smartwatches e relógios" },
  { name: "Computadores", slug: "computers", icon: Monitor, color: "bg-cyan-50 text-cyan-600", desc: "Laptops e periféricos" },
];

export default function CategoriesPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Todas as Categorias</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/category/${cat.slug}`}
            className="flex items-center gap-4 p-4 bg-white rounded-xl border hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <div className={`w-12 h-12 rounded-xl ${cat.color} flex items-center justify-center shrink-0`}>
              <cat.icon size={22} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{cat.name}</h3>
              <p className="text-xs text-gray-500">{cat.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
