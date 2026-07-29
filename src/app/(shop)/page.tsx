import { prisma } from "@/lib/db";
import HomePageClient from "./HomePageClient";

async function getHomeData() {
  try {
    const [banners, featuredProducts, newProducts, categories] = await Promise.all([
      prisma.banner.findMany({
        where: {
          active: true,
          OR: [
            { startDate: null },
            { startDate: { lte: new Date() } },
          ],
        },
        orderBy: { order: "asc" },
        take: 5,
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
        take: 24,
      }),
      prisma.category.findMany({
        where: { featured: true, parentId: null },
        orderBy: { order: "asc" },
        take: 8,
      }),
    ]);

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
    };
  } catch (error) {
    // Return empty data if database not connected yet
    return {
      banners: [],
      featuredProducts: [],
      newProducts: [],
      categories: [],
    };
  }
}

export default async function HomePage() {
  const data = await getHomeData();
  return <HomePageClient {...data} />;
}
