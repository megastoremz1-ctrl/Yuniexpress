import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "24");
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const rating = searchParams.get("rating");
    const freeShipping = searchParams.get("freeShipping");
    const sort = searchParams.get("sort") || "newest";
    const featured = searchParams.get("featured");

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      status: "APPROVED",
    };

    if (category) {
      where.category = { slug: category };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (minPrice) {
      where.priceMZN = { ...where.priceMZN, gte: parseFloat(minPrice) };
    }

    if (maxPrice) {
      where.priceMZN = { ...where.priceMZN, lte: parseFloat(maxPrice) };
    }

    if (rating) {
      where.rating = { gte: parseFloat(rating) };
    }

    if (freeShipping === "true") {
      where.freeShipping = true;
    }

    if (featured === "true") {
      where.featured = true;
    }

    // Build orderBy
    let orderBy: any = { createdAt: "desc" };
    switch (sort) {
      case "price_asc":
        orderBy = { priceMZN: "asc" };
        break;
      case "price_desc":
        orderBy = { priceMZN: "desc" };
        break;
      case "popular":
        orderBy = { sold: "desc" };
        break;
      case "rating":
        orderBy = { rating: "desc" };
        break;
      case "newest":
      default:
        orderBy = { createdAt: "desc" };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          images: { orderBy: { order: "asc" }, take: 2 },
          category: { select: { id: true, name: true, slug: true } },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      products: products.map((p: any) => ({
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
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Products API error:", error);
    return NextResponse.json(
      { error: "Erro ao carregar produtos" },
      { status: 500 }
    );
  }
}
