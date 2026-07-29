import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [
    totalProducts,
    pendingProducts,
    approvedProducts,
    totalOrders,
    todayOrders,
    monthOrders,
    totalRevenue,
    monthRevenue,
    totalCustomers,
    newCustomersMonth,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { status: "PENDING" } }),
    prisma.product.count({ where: { status: "APPROVED" } }),
    prisma.order.count(),
    prisma.order.count({ where: { createdAt: { gte: today } } }),
    prisma.order.count({ where: { createdAt: { gte: thisMonth } } }),
    prisma.order.aggregate({
      _sum: { totalMZN: true },
      where: { paymentStatus: "PAID" },
    }),
    prisma.order.aggregate({
      _sum: { totalMZN: true },
      where: { paymentStatus: "PAID", createdAt: { gte: thisMonth } },
    }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.user.count({
      where: { role: "CUSTOMER", createdAt: { gte: thisMonth } },
    }),
  ]);

  // Recent orders
  const recentOrders = await prisma.order.findMany({
    include: {
      user: { select: { name: true, email: true } },
      items: { select: { title: true, quantity: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return NextResponse.json({
    stats: {
      products: { total: totalProducts, pending: pendingProducts, approved: approvedProducts },
      orders: {
        total: totalOrders,
        today: todayOrders,
        thisMonth: monthOrders,
      },
      revenue: {
        total: totalRevenue._sum.totalMZN || 0,
        thisMonth: monthRevenue._sum.totalMZN || 0,
      },
      customers: {
        total: totalCustomers,
        newThisMonth: newCustomersMonth,
      },
    },
    recentOrders: recentOrders.map((o: any) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customer: o.user.name || o.user.email,
      totalMZN: o.totalMZN,
      status: o.status,
      paymentStatus: o.paymentStatus,
      createdAt: o.createdAt.toISOString(),
      itemCount: o.items.reduce((sum: number, i: any) => sum + i.quantity, 0),
    })),
  });
}
