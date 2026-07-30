import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// Get personalized product recommendations based on user's search/view history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "12");

    // Get user's search history from cookie or session
    const session = await auth();
    const searchHistory = request.cookies.get("search_history")?.value || "";
    const viewedProducts = request.cookies.get("viewed_products")?.value || "";

    let recommendedProducts: any[] = [];

    // Strategy 1: If user has viewed products, find similar ones in same categories
    if (viewedProducts) {
      const viewedIds = viewedProducts.split(",").slice(0, 5);
      const viewedItems = await prisma.product.findMany({
        where: { id: { in: viewedIds } },
        select: { categoryId: true },
      });

      const categoryIds = [...new Set(viewedItems.map((p: any) => p.categoryId).filter(Boolean))];

      if (categoryIds.length > 0) {
        recommendedProducts = await prisma.product.findMany({
          where: {
            status: "APPROVED",
            categoryId: { in: categoryIds as string[] },
            id: { notIn: viewedIds },
          },
          include: { images: { take: 2, orderBy: { order: "asc" } } },
          orderBy: { sold: "desc" },
          take: limit,
        });
      }
    }

    // Strategy 2: If user has search history, search by those keywords
    if (recommendedProducts.length < limit && searchHistory) {
      const keywords = searchHistory.split(",").slice(0, 3);
      const keywordFilter = keywords.map((k: string) => ({
        title: { contains: k.trim(), mode: "insensitive" as const },
      }));

      const searchBased = await prisma.product.findMany({
        where: {
          status: "APPROVED",
          OR: keywordFilter,
          id: { notIn: recommendedProducts.map((p: any) => p.id) },
        },
        include: { images: { take: 2, orderBy: { order: "asc" } } },
        orderBy: { sold: "desc" },
        take: limit - recommendedProducts.length,
      });

      recommendedProducts = [...recommendedProducts, ...searchBased];
    }

    // Strategy 3: Fallback - popular products
    if (recommendedProducts.length < limit) {
      const popular = await prisma.product.findMany({
        where: {
          status: "APPROVED",
          id: { notIn: recommendedProducts.map((p: any) => p.id) },
        },
        include: { images: { take: 2, orderBy: { order: "asc" } } },
        orderBy: { sold: "desc" },
        take: limit - recommendedProducts.length,
      });

      recommendedProducts = [...recommendedProducts, ...popular];
    }

    return NextResponse.json({
      products: recommendedProducts.map((p: any) => ({
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
    });
  } catch (error) {
    return NextResponse.json({ products: [] });
  }
}

// Save search/view history
export async function POST(request: NextRequest) {
  try {
    const { type, value } = await request.json();
    // Returns Set-Cookie headers to track history
    const response = NextResponse.json({ success: true });

    if (type === "search" && value) {
      const existing = request.cookies.get("search_history")?.value || "";
      const history = [value, ...existing.split(",").filter(Boolean)].slice(0, 10).join(",");
      response.cookies.set("search_history", history, { maxAge: 30 * 24 * 3600, path: "/" });
    }

    if (type === "view" && value) {
      const existing = request.cookies.get("viewed_products")?.value || "";
      const history = [value, ...existing.split(",").filter(Boolean)].slice(0, 20).join(",");
      response.cookies.set("viewed_products", history, { maxAge: 30 * 24 * 3600, path: "/" });
    }

    return response;
  } catch {
    return NextResponse.json({ success: false });
  }
}
