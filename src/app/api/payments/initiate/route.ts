import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createPayment } from "@/lib/services/paysuite";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { orderId, method } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: "Order ID é obrigatório" }, { status: 400 });
    }

    // Get order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order || order.userId !== session.user.id) {
      return NextResponse.json({ error: "Encomenda não encontrada" }, { status: 404 });
    }

    if (order.paymentStatus === "PAID") {
      return NextResponse.json({ error: "Esta encomenda já foi paga" }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://yuniexpressmz.vercel.app";

    // Create payment via PaySuite
    const payment = await createPayment({
      amount: order.totalMZN,
      reference: order.orderNumber,
      description: `Pagamento YuniExpress ${order.orderNumber}`,
      method: method || undefined,
      returnUrl: `${appUrl}/account/orders`,
      callbackUrl: `${appUrl}/api/payments/callback`,
    });

    if (payment.success && payment.paymentId) {
      // Update order with PaySuite payment ID
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentRef: payment.paymentId,
          paymentMethod: method ? `paysuite_${method}` : "paysuite",
        },
      });

      return NextResponse.json({
        success: true,
        paymentId: payment.paymentId,
        checkoutUrl: payment.checkoutUrl,
        message: "Redirecione para a página de pagamento.",
      });
    } else {
      console.error("PaySuite payment failed:", payment.error);
      return NextResponse.json(
        {
          success: false,
          message: payment.error || "Erro ao iniciar pagamento. Tente novamente.",
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("Payment initiation error:", error);
    return NextResponse.json(
      { error: "Erro ao processar pagamento: " + (error.message || "desconhecido") },
      { status: 500 }
    );
  }
}
