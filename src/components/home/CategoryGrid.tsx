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
} from "lucide-react";
import { CategoryData } from "@/types";

const defaultCategories = [
  { name: "Telemóveis", slug: "phones", icon: Smartphone, color: "bg-blue-50 text-blue-600" },
  { name: "Moda", slug: "fashion", icon: Shirt, color: "bg-pink-50 text-pink-600" },
  { name: "Casa", slug: "home", icon: Home, color: "bg-green-50 text-green-600" },
  { name: "Beleza", slug: "beauty", icon: Sparkles, color: "bg-purple-50 text-purple-600" },
  { name: "Desporto", slug: "sports", icon: Dumbbell, color: "bg-orange-50 text-orange-600" },
  { name: "Gaming", slug: "gaming", icon: Gamepad2, color: "bg-red-50 text-red-600" },
  { name: "Automóveis", slug: "automotive", icon: Car, color: "bg-gray-50 text-gray-600" },
  { name: "Relógios", slug: "watches", icon: Watch, color: "bg-yellow-50 text-yellow-600" },
];

interface CategoryGridProps {
  categories?: CategoryData[];
}

export default function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Categorias</h2>
        <Link href="/categories" className="text-sm text-yellow-600 hover:underline">
          Ver todas
        </Link>
      </div>

      <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
        {defaultCategories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/category/${cat.slug}`}
            className="flex flex-col items-center gap-2 group"
          >
            <div
              className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl ${cat.color} flex items-center justify-center group-hover:scale-110 transition-transform`}
            >
              <cat.icon size={24} />
            </div>
            <span className="text-xs text-gray-700 text-center font-medium">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
