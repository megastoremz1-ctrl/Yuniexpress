import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendOrderNotification } from "@/lib/services/onesignal";

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

// Get all orders (admin)
export async function GET(request: NextRequest) {
  const admin = await checkAdmin();
  if (!admin) return NextResponse.json({ error: "Acesso negado" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const status = searchParams.get("status");

  const where: any = {};
  if (status) where.status = status;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        user: { select: { name: true, email: true, phone: true } },
        address: true,
        items: true,
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  return NextResponse.json({
    orders: orders.map((o: any) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customer: {
        name: o.user.name || "Sem nome",
        email: o.user.email,
        phone: o.user.phone || o.address?.phone || "",
      },
      address: o.address ? {
        name: o.address.name,
        phone: o.address.phone,
        province: o.address.province,
        city: o.address.city,
        address: o.address.address,
      } : null,
      totalMZN: o.totalMZN,
      subtotalMZN: o.subtotalMZN,
      discountMZN: o.discountMZN,
      status: o.status,
      paymentStatus: o.paymentStatus,
      paymentMethod: o.paymentMethod,
      trackingNumber: o.trackingNumber,
      createdAt: o.createdAt.toISOString(),
      items: o.items.map((i: any) => ({
        id: i.id,
        title: i.title,
        image: i.image,
        quantity: i.quantity,
        priceMZN: i.priceMZN,
        variant: i.variant,
      })),
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

// Update order status
export async function PUT(request: NextRequest) {
  const admin = await checkAdmin();
  if (!admin) return NextResponse.json({ error: "Acesso negado" }, { status: 403 });

  const { orderId, status, trackingNumber, trackingUrl } = await request.json();

  if (!orderId || !status) {
    return NextResponse.json({ error: "orderId e status são obrigatórios" }, { status: 400 });
  }

  const validStatuses = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    return NextResponse.json({ error: "Encomenda não encontrada" }, { status: 404 });
  }

  const updateData: any = { status };
  if (trackingNumber) updateData.trackingNumber = trackingNumber;
  if (trackingUrl) updateData.trackingUrl = trackingUrl;
  if (status === "SHIPPED") updateData.shippedAt = new Date();
  if (status === "DELIVERED") updateData.deliveredAt = new Date();

  if (status === "CANCELLED") updateData.paymentStatus = "FAILED";

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: updateData,
    include: { items: true },
  });

  // Send notification to customer
  const msg = status === "CANCELLED"
    ? "A sua encomenda foi cancelada. Os itens foram devolvidos ao seu carrinho."
    : getStatusMessage(status, trackingNumber);

  try {
    await sendOrderNotification(order.userId, order.orderNumber, status);
    await prisma.notification.create({
      data: {
        userId: order.userId,
        title: `Encomenda #${order.orderNumber}`,
        message: msg,
        type: "order",
        data: { orderId, status, trackingNumber, items: status === "CANCELLED" ? updated.items : undefined },
      },
    });
  } catch {}

  return NextResponse.json({ success: true, order: updated });
}

function getStatusMessage(status: string, trackingNumber?: string): string {
  const messages: Record<string, string> = {
    CONFIRMED: "A sua encomenda foi confirmada e está a ser preparada.",
    PROCESSING: "A sua encomenda está em processamento.",
    SHIPPED: `A sua encomenda foi enviada!${trackingNumber ? ` Tracking: ${trackingNumber}` : ""}`,
    DELIVERED: "A sua encomenda foi entregue com sucesso!",
    CANCELLED: "A sua encomenda foi cancelada.",
  };
  return messages[status] || `Estado actualizado: ${status}`;
}
