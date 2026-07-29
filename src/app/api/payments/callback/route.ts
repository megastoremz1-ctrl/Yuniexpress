import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { validateWebhookSignature } from "@/lib/services/paygo";
import { sendOrderNotification } from "@/lib/services/onesignal";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-paygo-signature") || "";

    // Validate webhook signature
    if (!validateWebhookSignature(body, signature)) {
      console.error("Invalid PayGo webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const data = JSON.parse(body);
    const { transaction_id, order_id, status, amount } = data;

    // Find order by payment reference or order number
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { paymentRef: transaction_id },
          { orderNumber: order_id },
        ],
      },
    });

    if (!order) {
      console.error(`Order not found for transaction: ${transaction_id}`);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Update order payment status
    if (status === "completed" || status === "success") {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "PAID",
          status: "CONFIRMED",
          paymentRef: transaction_id,
        },
      });

      // Send notification to user
      await sendOrderNotification(order.userId, order.orderNumber, "CONFIRMED");

      // Create notification in database
      await prisma.notification.create({
        data: {
          userId: order.userId,
          title: "Pagamento confirmado",
          message: `O pagamento da encomenda #${order.orderNumber} foi confirmado com sucesso.`,
          type: "order",
          data: { orderId: order.id, orderNumber: order.orderNumber },
        },
      });
    } else if (status === "failed" || status === "cancelled") {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "FAILED",
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Payment callback error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
