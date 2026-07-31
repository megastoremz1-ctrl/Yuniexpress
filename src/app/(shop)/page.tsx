import { prisma } from "@/lib/db";
import HomePageClient from "./HomePageClient";

// Cache for 5 minutes - shuffle happens client-side (each visitor sees different order)
export const revalidate = 300;

async function getHomeData() {
  try {
    const allProducts = await prisma.product.findMany({
      where: { status: "APPROVED" },
      select: {
        id: true, title: true, slug: true, priceMZN: true,
        originalPriceMZN: true, rating: true, reviewCount: true,
        sold: true, freeShipping: true,
        images: { take: 1, orderBy: { order: "asc" }, select: { url: true, alt: true } },
      },
      take: 120,
    }) || [];

    const banners = await prisma.banner.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
      take: 5,
      select: { id: true, title: true, subtitle: true, image: true, link: true },
    }) || [];

    const categories = await prisma.category.findMany({
      where: { featured: true },
      orderBy: { order: "asc" },
      take: 12,
      select: { id: true, name: true, slug: true, image: true, icon: true },
    }) || [];

    const settings = await prisma.setting.findMany({
      select: { key: true, value: true },
    }) || [];

    const settingsMap: Record<string, string> = {};
    if (Array.isArray(settings)) {
      settings.forEach((s: any) => { settingsMap[s.key] = s.value; });
    }

    const mapProduct = (p: any) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      priceMZN: p.priceMZN,
      originalPriceMZN: p.originalPriceMZN,
      rating: p.rating,
      reviewCount: p.reviewCount,
      sold: p.sold,
      freeShipping: p.freeShipping,
      images: Array.isArray(p.images) ? p.images.map((img: any) => ({ url: img.url, alt: img.alt })) : [],
    });

    // Don't shuffle server-side - client does it for each visitor
    const allMapped = Array.isArray(allProducts) && allProducts.length > 0
      ? allProducts.map(mapProduct)
      : [];

    return {
      banners: Array.isArray(banners) ? banners.map((b: any) => ({
        id: b.id, title: b.title, subtitle: b.subtitle, image: b.image, link: b.link,
      })) : [],
      featuredProducts: allMapped.slice(0, 24),
      newProducts: allMapped.slice(24, 72),
      categories: Array.isArray(categories) ? categories.map((c: any) => ({
        id: c.id, name: c.name, slug: c.slug, image: c.image, icon: c.icon,
      })) : [],
      settings: settingsMap,
    };
  } catch (error) {
    console.error("Homepage data error:", error);
    return {
      banners: [],
      featuredProducts: [],
      newProducts: [],
      categories: [],
      settings: {},
    };
  }
}

export default async function HomePage() {
  const data = await getHomeData();
  return <HomePageClient {...data} />;
}
