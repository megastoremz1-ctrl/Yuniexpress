import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET single order with full details for tracking
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { id } = await params;

    const order = await prisma.order.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        items: {
          include: {
            product: {
              select: { slug: true, images: { select: { url: true }, take: 1 } },
            },
          },
        },
        address: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Encomenda não encontrada" }, { status: 404 });
    }

    // Build tracking timeline based on order status and dates
    const timeline = buildTimeline(order);

    return NextResponse.json({
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        subtotalMZN: order.subtotalMZN,
        shippingMZN: order.shippingMZN,
        discountMZN: order.discountMZN,
        totalMZN: order.totalMZN,
        trackingNumber: order.trackingNumber,
        trackingUrl: order.trackingUrl,
        shippedAt: order.shippedAt?.toISOString() || null,
        deliveredAt: order.deliveredAt?.toISOString() || null,
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
        notes: order.notes,
        address: order.address
          ? {
              name: order.address.name,
              phone: order.address.phone,
              province: order.address.province,
              city: order.address.city,
              district: order.address.district,
              address: order.address.address,
            }
          : null,
        items: order.items.map((item: any) => ({
          id: item.id,
          title: item.title,
          image: item.image || item.product?.images?.[0]?.url || null,
          variant: item.variant,
          quantity: item.quantity,
          priceMZN: item.priceMZN,
          totalMZN: item.totalMZN,
          productSlug: item.product?.slug || null,
        })),
        timeline,
      },
    });
  } catch (error) {
    console.error("Get order error:", error);
    return NextResponse.json({ error: "Erro ao carregar encomenda" }, { status: 500 });
  }
}

// Build a tracking timeline array from order data
function buildTimeline(order: any) {
  const steps = [
    {
      key: "PENDING",
      label: "Encomenda Criada",
      description: "A sua encomenda foi recebida e aguarda pagamento.",
      date: order.createdAt.toISOString(),
      completed: true,
    },
    {
      key: "CONFIRMED",
      label: "Pagamento Confirmado",
      description: "O pagamento foi processado com sucesso.",
      date: order.paymentStatus === "PAID" ? order.updatedAt.toISOString() : null,
      completed: ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"].includes(order.status),
    },
    {
      key: "PROCESSING",
      label: "Em Processamento",
      description: "A encomenda está a ser processada pelo fornecedor.",
      date: null,
      completed: ["PROCESSING", "SHIPPED", "DELIVERED"].includes(order.status),
    },
    {
      key: "SHIPPED",
      label: "Enviada",
      description: order.trackingNumber
        ? `Enviada com rastreamento: ${order.trackingNumber}`
        : "O produto foi enviado pelo fornecedor internacional.",
      date: order.shippedAt?.toISOString() || null,
      completed: ["SHIPPED", "DELIVERED"].includes(order.status),
    },
    {
      key: "DELIVERED",
      label: "Entregue",
      description: "A encomenda foi entregue com sucesso.",
      date: order.deliveredAt?.toISOString() || null,
      completed: order.status === "DELIVERED",
    },
  ];

  // If cancelled, replace timeline
  if (order.status === "CANCELLED") {
    return [
      {
        key: "PENDING",
        label: "Encomenda Criada",
        description: "A encomenda foi recebida.",
        date: order.createdAt.toISOString(),
        completed: true,
      },
      {
        key: "CANCELLED",
        label: "Cancelada",
        description: order.notes || "A encomenda foi cancelada.",
        date: order.updatedAt.toISOString(),
        completed: true,
        isCancelled: true,
      },
    ];
  }

  return steps;
}
