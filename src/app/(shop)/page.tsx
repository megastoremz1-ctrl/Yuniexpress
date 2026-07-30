import { prisma } from "@/lib/db";
import HomePageClient from "./HomePageClient";

async function getHomeData() {
  try {
    const [banners, featuredProducts, newProducts, categories, settings] = await Promise.all([
      prisma.banner.findMany({
        where: { active: true },
        orderBy: { order: "asc" },
        take: 8,
      }),
      prisma.product.findMany({
        where: { status: "APPROVED", featured: true },
        include: { images: { take: 2, orderBy: { order: "asc" } } },
        orderBy: { sold: "desc" },
        take: 12,
      }),
      prisma.product.findMany({
        where: { status: "APPROVED" },
        include: { images: { take: 2, orderBy: { order: "asc" } } },
        orderBy: { createdAt: "desc" },
        take: 30,
      }),
      prisma.category.findMany({
        where: { featured: true },
        orderBy: { order: "asc" },
        take: 16,
      }),
      prisma.setting.findMany(),
    ]);

    const settingsMap: Record<string, string> = {};
    settings.forEach((s: any) => { settingsMap[s.key] = s.value; });

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
      images: p.images.map((img: any) => ({ url: img.url, alt: img.alt })),
    });

    return {
      banners: banners.map((b: any) => ({
        id: b.id,
        title: b.title,
        subtitle: b.subtitle,
        image: b.image,
        link: b.link,
      })),
      featuredProducts: featuredProducts.map(mapProduct),
      newProducts: newProducts.map(mapProduct),
      categories: categories.map((c: any) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        image: c.image,
        icon: c.icon,
      })),
      settings: settingsMap,
    };
  } catch (error) {
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
