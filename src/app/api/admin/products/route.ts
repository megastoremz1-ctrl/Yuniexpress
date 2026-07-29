import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { convertPrice } from "@/lib/services/pricing";

// Middleware to check admin role
async function checkAdmin() {
  const session = await auth();
  if (!session?.user?.id) return null;
  
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  
  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) return null;
  return session.user;
}

// Get all products (admin view - includes pending)
export async function GET(request: NextRequest) {
  const admin = await checkAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const status = searchParams.get("status");
  const search = searchParams.get("search");

  const where: any = {};
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { aliexpressId: { contains: search } },
    ];
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        images: { take: 1, orderBy: { order: "asc" } },
        category: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return NextResponse.json({
    products,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

// Update product (approve, edit price, etc.)
export async function PUT(request: NextRequest) {
  const admin = await checkAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const body = await request.json();
  const { id, status, marginPercent, featured, categoryId, title, description } = body;

  if (!id) {
    return NextResponse.json({ error: "Product ID obrigatório" }, { status: 400 });
  }

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
  }

  const updateData: any = {};
  
  if (status) updateData.status = status;
  if (featured !== undefined) updateData.featured = featured;
  if (categoryId) updateData.categoryId = categoryId;
  if (title) updateData.title = title;
  if (description) updateData.description = description;
  
  // Recalculate MZN price if margin changed
  if (marginPercent !== undefined) {
    updateData.marginPercent = marginPercent;
    const { priceMZN, originalPriceMZN } = await convertPrice(
      product.priceUSD,
      product.originalPriceUSD,
      marginPercent
    );
    updateData.priceMZN = priceMZN;
    updateData.originalPriceMZN = originalPriceMZN;
  }

  const updated = await prisma.product.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json({ product: updated });
}

// Bulk approve/reject products
export async function PATCH(request: NextRequest) {
  const admin = await checkAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const { productIds, action } = await request.json();

  if (!productIds?.length || !action) {
    return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
  }

  const validActions = ["APPROVED", "REJECTED", "PENDING"];
  if (!validActions.includes(action)) {
    return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
  }

  const result = await prisma.product.updateMany({
    where: { id: { in: productIds } },
    data: { status: action },
  });

  return NextResponse.json({
    message: `${result.count} produtos atualizados`,
    count: result.count,
  });
}
