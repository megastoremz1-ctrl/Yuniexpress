import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// Get user's cart
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.user.id },
      include: {
        product: {
          include: {
            images: { orderBy: { order: "asc" }, take: 1 },
          },
        },
      },
    });

    return NextResponse.json({
      items: cartItems.map((item: any) => ({
        id: item.id,
        productId: item.productId,
        title: item.product.title,
        image: item.product.images[0]?.url || "",
        priceMZN: item.product.priceMZN,
        originalPriceMZN: item.product.originalPriceMZN,
        quantity: item.quantity,
        variant: item.variant,
        stock: item.product.stock,
      })),
    });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao carregar carrinho" }, { status: 500 });
  }
}

// Add item to cart
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { productId, quantity = 1, variant } = await request.json();

    if (!productId) {
      return NextResponse.json({ error: "Product ID é obrigatório" }, { status: 400 });
    }

    // Check product exists and is available
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || product.status !== "APPROVED") {
      return NextResponse.json({ error: "Produto não disponível" }, { status: 404 });
    }

    // Upsert cart item
    const cartItem = await prisma.cartItem.upsert({
      where: {
        userId_productId_variant: {
          userId: session.user.id,
          productId,
          variant: variant || "",
        },
      },
      update: {
        quantity: { increment: quantity },
      },
      create: {
        userId: session.user.id,
        productId,
        quantity,
        variant: variant || "",
      },
    });

    return NextResponse.json({ item: cartItem }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao adicionar ao carrinho" }, { status: 500 });
  }
}

// Update cart item quantity
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { itemId, quantity } = await request.json();

    if (!itemId || quantity === undefined) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id: itemId } });
      return NextResponse.json({ message: "Item removido" });
    }

    const item = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });

    return NextResponse.json({ item });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar carrinho" }, { status: 500 });
  }
}

// Remove item from cart
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("itemId");

    if (!itemId) {
      return NextResponse.json({ error: "Item ID é obrigatório" }, { status: 400 });
    }

    await prisma.cartItem.delete({ where: { id: itemId } });

    return NextResponse.json({ message: "Item removido do carrinho" });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao remover do carrinho" }, { status: 500 });
  }
}
