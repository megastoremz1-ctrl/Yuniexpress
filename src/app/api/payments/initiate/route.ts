import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createPayment, createCharge } from "@/lib/services/zumbopay";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { orderId, method, phone } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: "Order ID é obrigatório" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });

    if (!order || order.userId !== session.user.id) {
      return NextResponse.json({ error: "Encomenda não encontrada" }, { status: 404 });
    }

    if (order.paymentStatus === "PAID") {
      return NextResponse.json({ error: "Esta encomenda já foi paga" }, { status: 400 });
    }

    // Choose payment flow based on method
    if ((method === "mpesa" || method === "emola") && phone) {
      // STK Push - sends PIN popup directly to customer's phone
      const charge = await createCharge({
        amount: order.totalMZN,
        phone,
        customerName: session.user.name || "Cliente",
        sourceId: order.orderNumber,
        method,
      });

      if (charge.success) {
        await prisma.order.update({
          where: { id: orderId },
          data: {
            paymentRef: charge.reference || null,
            paymentMethod: `zumbopay_${method}`,
          },
        });

        return NextResponse.json({
          success: true,
          type: "stk_push",
          reference: charge.reference,
          status: charge.status,
          message: charge.status === "success"
            ? "Pagamento confirmado!"
            : "Confirme o pagamento no seu telemóvel (PIN).",
        });
      } else {
        return NextResponse.json(
          { success: false, message: charge.error },
          { status: 400 }
        );
      }
    } else {
      // Hosted checkout - redirect to ZumboPay page (M-Pesa + e-Mola + Card)
      const payment = await createPayment({
        title: `YuniExpress #${order.orderNumber}`,
        amount: order.totalMZN,
        orderNumber: order.orderNumber,
        channels: ["mpesa", "emola", "card"],
      });

      if (payment.success && payment.checkoutUrl) {
        await prisma.order.update({
          where: { id: orderId },
          data: {
            paymentRef: payment.reference || null,
            paymentMethod: "zumbopay_checkout",
          },
        });

        return NextResponse.json({
          success: true,
          type: "checkout",
          checkoutUrl: payment.checkoutUrl,
          reference: payment.reference,
          message: "Redirecione para a página de pagamento.",
        });
      } else {
        return NextResponse.json(
          { success: false, message: payment.error },
          { status: 400 }
        );
      }
    }
  } catch (error: any) {
    console.error("Payment error:", error);
    return NextResponse.json(
      { error: "Erro ao processar pagamento: " + (error.message || "") },
      { status: 500 }
    );
  }
}
