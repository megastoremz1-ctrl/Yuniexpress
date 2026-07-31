import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { validateWebhookSignature } from "@/lib/services/zumbopay";
import { sendOrderNotification } from "@/lib/services/onesignal";

/**
 * ZumboPay Webhook Handler
 * Events: payment.succeeded, payment.failed, payment.refunded
 * Signature: x-zumbopay-signature (HMAC-SHA256)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-zumbopay-signature") || "";

    // Validate webhook signature
    if (signature && !validateWebhookSignature(body, signature)) {
      console.error("Invalid ZumboPay webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(body);
    const eventType = event.event || event.type;
    const data = event.data || event;

    console.log(`ZumboPay webhook: ${eventType}`, data.reference);

    // Find order by reference (order number)
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { paymentRef: data.reference },
          { orderNumber: data.reference },
          { orderNumber: data.source_id },
        ],
      },
    });

    if (!order) {
      console.error(`Order not found for ZumboPay ref: ${data.reference}`);
      return NextResponse.json({ received: true }); // Don't return 404, acknowledge
    }

    if (eventType === "payment.succeeded" || data.status === "success") {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "PAID",
          status: "CONFIRMED",
          paymentRef: data.reference,
        },
      });

      // Notify customer
      try {
        await sendOrderNotification(order.userId, order.orderNumber, "CONFIRMED");
        await prisma.notification.create({
          data: {
            userId: order.userId,
            title: "Pagamento confirmado!",
            message: `Encomenda #${order.orderNumber} paga com sucesso (${data.amount || order.totalMZN} MT).`,
            type: "order",
            data: { orderId: order.id, orderNumber: order.orderNumber },
          },
        });
      } catch {}

      console.log(`✅ Order ${order.orderNumber} PAID`);
    } else if (eventType === "payment.failed" || data.status === "failed") {
      await prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus: "FAILED" },
      });
      console.log(`❌ Order ${order.orderNumber} FAILED`);
    } else if (eventType === "payment.refunded") {
      await prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus: "REFUNDED", status: "REFUNDED" },
      });
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("ZumboPay webhook error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
