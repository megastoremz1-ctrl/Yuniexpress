import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        images: { orderBy: { order: "asc" } },
        variants: true,
        category: { select: { id: true, name: true, slug: true } },
        reviews: {
          include: {
            user: { select: { name: true, image: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Produto não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
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
    });
  } catch (error: any) {
    console.error("Product detail API error:", error);
    return NextResponse.json(
      { error: "Erro ao carregar produto" },
      { status: 500 }
    );
  }
}
