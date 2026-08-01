import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET reviews for a product
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!productId) {
      return NextResponse.json({ error: "productId é obrigatório" }, { status: 400 });
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { productId },
        include: {
          user: { select: { name: true, image: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.review.count({ where: { productId } }),
    ]);

    // Calculate rating distribution
    const allReviews = await prisma.review.findMany({
      where: { productId },
      select: { rating: true },
    });

    const distribution = [0, 0, 0, 0, 0]; // 1-5 stars
    allReviews.forEach((r) => {
      distribution[r.rating - 1]++;
    });

    const avgRating = allReviews.length > 0
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
      : 0;

    return NextResponse.json({
      reviews: reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        images: r.images,
        verified: r.verified,
        createdAt: r.createdAt.toISOString(),
        user: { name: r.user.name, image: r.user.image },
      })),
      stats: {
        total,
        avgRating: Math.round(avgRating * 10) / 10,
        distribution,
      },
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Get reviews error:", error);
    return NextResponse.json({ error: "Erro ao carregar avaliações" }, { status: 500 });
  }
}

// POST a new review
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { productId, rating, comment } = await request.json();

    if (!productId || !rating) {
      return NextResponse.json(
        { error: "Produto e classificação são obrigatórios" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Classificação deve ser entre 1 e 5" },
        { status: 400 }
      );
    }

    // Check if user already reviewed this product
    const existing = await prisma.review.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Já avaliou este produto. Pode editar a sua avaliação." },
        { status: 400 }
      );
    }

    // Check if user purchased the product (for verified badge)
    const hasPurchased = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          userId: session.user.id,
          paymentStatus: "PAID",
        },
      },
    });

    // Create review
    const review = await prisma.review.create({
      data: {
        userId: session.user.id,
        productId,
        rating,
        comment: comment || null,
        verified: !!hasPurchased,
      },
      include: {
        user: { select: { name: true, image: true } },
      },
    });

    // Update product rating stats
    const allReviews = await prisma.review.findMany({
      where: { productId },
      select: { rating: true },
    });

    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await prisma.product.update({
      where: { id: productId },
      data: {
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: allReviews.length,
      },
    });

    return NextResponse.json(
      {
        review: {
          id: review.id,
          rating: review.rating,
          comment: review.comment,
          verified: review.verified,
          createdAt: review.createdAt.toISOString(),
          user: review.user,
        },
        message: "Avaliação publicada com sucesso!",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create review error:", error);
    return NextResponse.json({ error: "Erro ao publicar avaliação" }, { status: 500 });
  }
}

// PUT - Update existing review
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { reviewId, rating, comment } = await request.json();

    if (!reviewId || !rating) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    // Verify ownership
    const existing = await prisma.review.findFirst({
      where: { id: reviewId, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Avaliação não encontrada" }, { status: 404 });
    }

    const updated = await prisma.review.update({
      where: { id: reviewId },
      data: { rating, comment: comment || null },
      include: { user: { select: { name: true, image: true } } },
    });

    // Recalculate product rating
    const allReviews = await prisma.review.findMany({
      where: { productId: existing.productId },
      select: { rating: true },
    });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await prisma.product.update({
      where: { id: existing.productId },
      data: { rating: Math.round(avgRating * 10) / 10 },
    });

    return NextResponse.json({
      review: {
        id: updated.id,
        rating: updated.rating,
        comment: updated.comment,
        verified: updated.verified,
        createdAt: updated.createdAt.toISOString(),
        user: updated.user,
      },
      message: "Avaliação actualizada!",
    });
  } catch (error) {
    console.error("Update review error:", error);
    return NextResponse.json({ error: "Erro ao actualizar" }, { status: 500 });
  }
}
