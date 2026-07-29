import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { initiatePayment } from "@/lib/services/paygo";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { orderId, phone, method } = await request.json();

    if (!orderId || !phone || !method) {
      return NextResponse.json(
        { error: "Order ID, telefone e método de pagamento são obrigatórios" },
        { status: 400 }
      );
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

    // Initiate payment via PayGo
    const payment = await initiatePayment({
      orderId: order.orderNumber,
      amount: order.totalMZN,
      phone,
      method,
      description: `Pagamento YuniExpress #${order.orderNumber}`,
    });

    if (payment.success) {
      // Update order with payment reference
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentRef: payment.transactionId,
          paymentMethod: `paygo_${method}`,
        },
      });

      return NextResponse.json({
        success: true,
        transactionId: payment.transactionId,
        message: "Pagamento iniciado. Confirme no seu telemóvel.",
      });
    } else {
      return NextResponse.json(
        { success: false, message: payment.message || "Erro ao iniciar pagamento" },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("Payment initiation error:", error);
    return NextResponse.json(
      { error: "Erro ao processar pagamento" },
      { status: 500 }
    );
  }
}
