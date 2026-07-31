"use client";

import { useEffect, useRef } from "react";

const partners = [
  {
    name: "PayGo",
    logo: "/partners/paygo.svg",
    url: "https://paygo.ao",
  },
  {
    name: "ZumboPay",
    logo: "/partners/zumbopay.svg",
    url: "https://zumbopay.com",
  },
  {
    name: "PaySuite",
    logo: "/partners/paysuite.svg",
    url: "https://paysuite.co.mz",
  },
  {
    name: "AliExpress",
    logo: "/partners/aliexpress.svg",
    url: "https://aliexpress.com",
  },
  {
    name: "M-Pesa",
    logo: "/partners/mpesa.svg",
    url: "https://www.vodacom.co.mz/mpesa",
  },
  {
    name: "e-Mola",
    logo: "/partners/emola.svg",
    url: "https://emola.movitel.co.mz",
  },
];

// Duplicate for seamless infinite scroll
const allPartners = [...partners, ...partners];

export default function PartnersCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    let animationId: number;
    let scrollPos = 0;
    const speed = 0.5; // pixels per frame

    const animate = () => {
      scrollPos += speed;
      // Reset when we've scrolled through the first set
      const halfWidth = container.scrollWidth / 2;
      if (scrollPos >= halfWidth) {
        scrollPos = 0;
      }
      container.scrollLeft = scrollPos;
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    // Pause on hover
    const handleMouseEnter = () => cancelAnimationFrame(animationId);
    const handleMouseLeave = () => {
      animationId = requestAnimationFrame(animate);
    };

    container.addEventListener("mouseenter", handleMouseEnter);
    container.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      cancelAnimationFrame(animationId);
      container.removeEventListener("mouseenter", handleMouseEnter);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <section className="bg-white border-t border-b border-gray-100 py-8 lg:py-10">
      <div className="container mx-auto px-4">
        <p className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wider mb-6">
          Parceiros de Confiança
        </p>
      </div>

      {/* Carousel */}
      <div
        ref={scrollRef}
        className="overflow-hidden no-scrollbar"
      >
        <div className="flex items-center gap-12 lg:gap-16 w-max px-8">
          {allPartners.map((partner, idx) => (
            <a
              key={`${partner.name}-${idx}`}
              href={partner.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center shrink-0 h-12 lg:h-14 opacity-60 hover:opacity-100 grayscale hover:grayscale-0 transition-all duration-300"
              title={partner.name}
            >
              <img
                src={partner.logo}
                alt={partner.name}
                className="h-full w-auto max-w-[140px] lg:max-w-[160px] object-contain"
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
