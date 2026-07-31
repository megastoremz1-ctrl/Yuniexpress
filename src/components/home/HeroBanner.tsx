"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BannerData } from "@/types";

interface HeroBannerProps {
  banners: BannerData[];
}

export default function HeroBanner({ banners }: HeroBannerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  if (banners.length === 0) {
    return (
      <div className="relative w-full rounded-xl overflow-hidden bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center justify-center" style={{ aspectRatio: "1920/700" }}>
        <div className="text-center text-white p-6">
          <h2 className="text-2xl md:text-4xl font-bold mb-3">
            Bem-vindo ao YuniExpress
          </h2>
          <p className="text-base md:text-lg opacity-90">
            Produtos internacionais, preços em Meticais
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full rounded-xl overflow-hidden" style={{ aspectRatio: "1920/700" }}>
      {banners.map((banner, index) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-opacity duration-500 ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          {banner.link ? (
            <Link href={banner.link} className="block w-full h-full">
              <img
                src={banner.image}
                alt={banner.title || "Banner"}
                className="w-full h-full object-cover"
              />
            </Link>
          ) : (
            <img
              src={banner.image}
              alt={banner.title || "Banner"}
              className="w-full h-full object-cover"
            />
          )}
          {(banner.title || banner.subtitle) && (
            <div className="absolute inset-0 bg-black/30 flex items-center">
              <div className="container mx-auto px-8">
                {banner.title && (
                  <h2 className="text-2xl md:text-4xl font-bold text-white mb-2">
                    {banner.title}
                  </h2>
                )}
                {banner.subtitle && (
                  <p className="text-lg text-white/90">{banner.subtitle}</p>
                )}
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Navigation arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={() =>
              setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length)
            }
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % banners.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
          >
            <ChevronRight size={20} />
          </button>

          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentSlide
                    ? "bg-white w-6"
                    : "bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
