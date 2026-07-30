import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import ProductDetailClient from "./ProductDetailClient";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let product = await prisma.product.findUnique({
    where: { slug },
    select: { title: true, description: true, priceMZN: true },
  }).catch(() => null);

  if (!product && slug.startsWith("ali-")) {
    product = await prisma.product.findUnique({
      where: { aliexpressId: slug.replace("ali-", "") },
      select: { title: true, description: true, priceMZN: true },
    }).catch(() => null);
  }

  if (!product) return { title: "Produto não encontrado" };

  return {
    title: `${product.title} - YuniExpress`,
    description: product.description?.slice(0, 160),
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Try to find by slug first, then by aliexpressId (for live search results)
  let product = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { order: "asc" } },
      variants: true,
      category: { select: { id: true, name: true, slug: true } },
      reviews: {
        include: { user: { select: { name: true, image: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  }).catch(() => null);

  // If not found by slug, try aliexpressId (for products from live search)
  if (!product && slug.startsWith("ali-")) {
    const aliId = slug.replace("ali-", "");
    product = await prisma.product.findUnique({
      where: { aliexpressId: aliId },
      include: {
        images: { orderBy: { order: "asc" } },
        variants: true,
        category: { select: { id: true, name: true, slug: true } },
        reviews: {
          include: { user: { select: { name: true, image: true } } },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    }).catch(() => null);
  }

  if (!product) notFound();

  const productData = {
    id: product.id,
    title: product.title,
    slug: product.slug,
    description: product.description,
    priceMZN: product.priceMZN,
    originalPriceMZN: product.originalPriceMZN,
    rating: product.rating,
    reviewCount: product.reviewCount,
    sold: product.sold,
    stock: product.stock,
    minOrder: product.minOrder,
    freeShipping: product.freeShipping,
    shippingDays: product.shippingDays,
    category: product.category,
    images: product.images.map((img: any) => ({ url: img.url, alt: img.alt })),
    variants: product.variants.map((v: any) => ({
      id: v.id,
      name: v.name,
      value: v.value,
      priceMZN: v.priceMZN,
      stock: v.stock,
      image: v.image,
    })),
    reviews: product.reviews.map((r: any) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      images: r.images,
      verified: r.verified,
      createdAt: r.createdAt.toISOString(),
      user: r.user,
    })),
  };

  return <ProductDetailClient product={productData} />;
}
