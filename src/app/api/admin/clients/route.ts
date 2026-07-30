import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

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

// Get all clients
export async function GET(request: NextRequest) {
  const admin = await checkAdmin();
  if (!admin) return NextResponse.json({ error: "Acesso negado" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const search = searchParams.get("search");

  const where: any = { role: "CUSTOMER" };
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { phone: { contains: search } },
    ];
  }

  const [clients, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
        createdAt: true,
        _count: { select: { orders: true, reviews: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  // Get total spent per client
  const clientsWithSpend = await Promise.all(
    clients.map(async (client: any) => {
      const totalSpent = await prisma.order.aggregate({
        where: { userId: client.id, paymentStatus: "PAID" },
        _sum: { totalMZN: true },
      });
      return {
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        image: client.image,
        createdAt: client.createdAt.toISOString(),
        totalOrders: client._count.orders,
        totalReviews: client._count.reviews,
        totalSpent: totalSpent._sum.totalMZN || 0,
      };
    })
  );

  return NextResponse.json({
    clients: clientsWithSpend,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}
