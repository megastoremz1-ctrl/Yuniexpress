import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET user's own reviews
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const reviews = await prisma.review.findMany({
      where: { userId: session.user.id },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            slug: true,
            images: { select: { url: true }, take: 1 },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      reviews: reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        verified: r.verified,
        createdAt: r.createdAt.toISOString(),
        product: {
          id: r.product.id,
          title: r.product.title,
          slug: r.product.slug,
          image: r.product.images[0]?.url || null,
        },
      })),
    });
  } catch (error) {
    console.error("Get user reviews error:", error);
    return NextResponse.json({ error: "Erro ao carregar avaliações" }, { status: 500 });
  }
}
