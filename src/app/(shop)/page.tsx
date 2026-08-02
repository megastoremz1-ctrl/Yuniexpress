import { prisma } from "@/lib/db";
import HomePageClient from "./HomePageClient";

export const dynamic = "force-dynamic";

async function getHomeData() {
  try {
    const allProducts = await prisma.product.findMany({
      where: {
        status: "APPROVED",
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 40,
      select: {
        id: true,
        title: true,
        slug: true,
        priceMZN: true,
        originalPriceMZN: true,
        rating: true,
        reviewCount: true,
        sold: true,
        freeShipping: true,
        images: {
          take: 1,
          orderBy: {
            order: "asc",
          },
          select: {
            url: true,
            alt: true,
          },
        },
      },
    });


    const banners = await prisma.banner.findMany({
      where: {
        active: true,
      },
      orderBy: {
        order: "asc",
      },
      take: 5,
      select: {
        id: true,
        title: true,
        subtitle: true,
        image: true,
        link: true,
      },
    });


    const categories = await prisma.category.findMany({
      where: {
        featured: true,
      },
      orderBy: {
        order: "asc",
      },
      take: 12,
      select: {
        id: true,
        name: true,
        slug: true,
        image: true,
        icon: true,
      },
    });


    const settings = await prisma.setting.findMany({
      select: {
        key: true,
        value: true,
      },
    });


    const settingsMap: Record<string, string> = {};

    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });


    const mapProduct = (p: any) => ({
      id: p.id,

      // evita títulos gigantes vindos da AliExpress
      title:
        p.title && p.title.length > 80
          ? p.title.substring(0, 80) + "..."
          : p.title,

      slug: p.slug,

      priceMZN: p.priceMZN,
      originalPriceMZN: p.originalPriceMZN,

      rating: p.rating,
      reviewCount: p.reviewCount,

      sold: p.sold,
      freeShipping: p.freeShipping,

      images: Array.isArray(p.images)
        ? p.images.map((img: any) => ({
            url: img.url,
            alt: img.alt,
          }))
        : [],
    });


    const products = allProducts.map(mapProduct);


    return {
      banners: banners.map((b) => ({
        id: b.id,
        title: b.title,
        subtitle: b.subtitle,

        // mantém somente URL da imagem
        image: b.image,

        link: b.link,
      })),

      featuredProducts: products.slice(0, 12),

      newProducts: products.slice(12, 24),

      categories: categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        image: c.image,
        icon: c.icon,
      })),

      settings: settingsMap,
    };


  } catch (error) {

    console.error(
      "Homepage data error:",
      error
    );


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


  return (
    <HomePageClient
      {...data}
    />
  );
}
