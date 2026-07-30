"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Smartphone, Shirt, Home, Sparkles, Dumbbell, Gamepad2, Car, Watch,
  Monitor, ShoppingBag, Baby, Wrench, Lightbulb, BookOpen, Footprints,
  PawPrint, Shield, UtensilsCrossed,
} from "lucide-react";

const iconMap: Record<string, any> = {
  Monitor, Smartphone, Laptop: Monitor, Shirt, Home, Sparkles,
  Dumbbell, Gamepad2, Car, Watch, ShoppingBag, Footprints,
  Baby, Wrench, Lightbulb, BookOpen, PawPrint, Shield, UtensilsCrossed,
};

const colorMap: Record<string, string> = {
  electronics: "bg-indigo-50 text-indigo-600",
  phones: "bg-blue-50 text-blue-600",
  computers: "bg-cyan-50 text-cyan-600",
  "fashion-women": "bg-pink-50 text-pink-600",
  "fashion-men": "bg-slate-50 text-slate-600",
  home: "bg-green-50 text-green-600",
  beauty: "bg-purple-50 text-purple-600",
  sports: "bg-orange-50 text-orange-600",
  toys: "bg-red-50 text-red-600",
  automotive: "bg-gray-50 text-gray-600",
  watches: "bg-yellow-50 text-yellow-600",
  shoes: "bg-amber-50 text-amber-600",
  bags: "bg-rose-50 text-rose-600",
  lighting: "bg-sky-50 text-sky-600",
  tools: "bg-stone-50 text-stone-600",
  security: "bg-emerald-50 text-emerald-600",
  school: "bg-teal-50 text-teal-600",
  baby: "bg-fuchsia-50 text-fuchsia-600",
  pets: "bg-lime-50 text-lime-600",
  food: "bg-orange-50 text-orange-600",
};

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch("/api/products?limit=0")
      .catch(() => {});
    // Fetch categories from settings (they're rendered server-side in homepage)
    // For now use hard-coded list that matches DB
  }, []);

  const allCategories = [
    { name: "Electrónica", slug: "electronics", icon: "Monitor" },
    { name: "Telemóveis & Acessórios", slug: "phones", icon: "Smartphone" },
    { name: "Computadores & Escritório", slug: "computers", icon: "Monitor" },
    { name: "Moda Feminina", slug: "fashion-women", icon: "Shirt" },
    { name: "Moda Masculina", slug: "fashion-men", icon: "Shirt" },
    { name: "Casa & Jardim", slug: "home", icon: "Home" },
    { name: "Beleza & Saúde", slug: "beauty", icon: "Sparkles" },
    { name: "Desporto & Lazer", slug: "sports", icon: "Dumbbell" },
    { name: "Brinquedos & Jogos", slug: "toys", icon: "Gamepad2" },
    { name: "Automóveis & Motos", slug: "automotive", icon: "Car" },
    { name: "Relógios & Jóias", slug: "watches", icon: "Watch" },
    { name: "Sapatos & Calçado", slug: "shoes", icon: "Footprints" },
    { name: "Malas & Acessórios", slug: "bags", icon: "ShoppingBag" },
    { name: "Iluminação", slug: "lighting", icon: "Lightbulb" },
    { name: "Ferramentas", slug: "tools", icon: "Wrench" },
    { name: "Segurança", slug: "security", icon: "Shield" },
    { name: "Material Escolar", slug: "school", icon: "BookOpen" },
    { name: "Bebés & Crianças", slug: "baby", icon: "Baby" },
    { name: "Animais", slug: "pets", icon: "PawPrint" },
    { name: "Alimentação", slug: "food", icon: "UtensilsCrossed" },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Todas as Categorias</h1>
      <p className="text-sm text-gray-500 mb-6">Explore os nossos {allCategories.length} departamentos</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {allCategories.map((cat) => {
          const IconComp = iconMap[cat.icon] || ShoppingBag;
          const color = colorMap[cat.slug] || "bg-gray-50 text-gray-600";
          return (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="flex flex-col items-center gap-3 p-5 bg-white rounded-2xl border hover:shadow-lg hover:-translate-y-1 transition-all group"
            >
              <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <IconComp size={24} />
              </div>
              <span className="text-sm font-medium text-gray-700 text-center leading-tight">
                {cat.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
