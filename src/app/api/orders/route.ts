import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// Get user's orders
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");

    const where: any = { userId: session.user.id };
    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              product: {
                include: { images: { take: 1, orderBy: { order: "asc" } } },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      orders: orders.map((order: any) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        totalMZN: order.totalMZN,
        createdAt: order.createdAt.toISOString(),
        trackingNumber: order.trackingNumber,
        trackingUrl: order.trackingUrl,
        items: order.items.map((item: any) => ({
          id: item.id,
          title: item.title,
          image: item.image || item.product.images[0]?.url,
          variant: item.variant,
          quantity: item.quantity,
          priceMZN: item.priceMZN,
        })),
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao carregar encomendas" }, { status: 500 });
  }
}

// Create new order
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { addressId, paymentMethod, couponCode } = await request.json();

    if (!addressId || !paymentMethod) {
      return NextResponse.json(
        { error: "Endereço e método de pagamento são obrigatórios" },
        { status: 400 }
      );
    }

    // Get cart items
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.user.id },
      include: {
        product: {
          include: { images: { take: 1, orderBy: { order: "asc" } } },
        },
      },
    });

    if (cartItems.length === 0) {
      return NextResponse.json({ error: "Carrinho vazio" }, { status: 400 });
    }

    // Calculate totals
    let subtotalMZN = 0;
    const orderItems = cartItems.map((item: any) => {
      const total = item.product.priceMZN * item.quantity;
      subtotalMZN += total;
      return {
        productId: item.productId,
        title: item.product.title,
        image: item.product.images[0]?.url || null,
        variant: item.variant,
        quantity: item.quantity,
        priceMZN: item.product.priceMZN,
        totalMZN: total,
      };
    });

    // Apply coupon if provided
    let discountMZN = 0;
    let couponId: string | null = null;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode },
      });

      if (
        coupon &&
        coupon.active &&
        new Date() >= coupon.startDate &&
        new Date() <= coupon.endDate &&
        (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit)
      ) {
        if (coupon.type === "PERCENTAGE") {
          discountMZN = Math.round(subtotalMZN * (coupon.value / 100));
          if (coupon.maxDiscountMZN) {
            discountMZN = Math.min(discountMZN, coupon.maxDiscountMZN);
          }
        } else {
          discountMZN = coupon.value;
        }
        couponId = coupon.id;

        // Increment usage
        await prisma.coupon.update({
          where: { id: coupon.id },
          data: { usedCount: { increment: 1 } },
        });
      }
    }

    const totalMZN = subtotalMZN - discountMZN;

    // Generate order number
    const orderNumber = `YE-${Date.now().toString(36).toUpperCase()}`;

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: session.user.id,
        addressId,
        subtotalMZN,
        discountMZN,
        totalMZN,
        paymentMethod,
        couponId,
        items: {
          create: orderItems,
        },
      },
      include: { items: true },
    });

    // Clear cart
    await prisma.cartItem.deleteMany({
      where: { userId: session.user.id },
    });

    return NextResponse.json(
      {
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          totalMZN: order.totalMZN,
          status: order.status,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create order error:", error);
    return NextResponse.json({ error: "Erro ao criar encomenda" }, { status: 500 });
  }
}
