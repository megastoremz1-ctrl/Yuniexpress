import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { validateWebhookSignature, parseWebhookEvent } from "@/lib/services/paysuite";
import { sendOrderNotification } from "@/lib/services/onesignal";

/**
 * PaySuite Webhook Handler
 *
 * Receives payment.success and payment.failed events
 * Validates signature via X-Webhook-Signature header (HMAC-SHA256)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-webhook-signature") || "";

    // Validate webhook signature
    if (!validateWebhookSignature(body, signature)) {
      console.error("Invalid PaySuite webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // Parse the event
    const event = parseWebhookEvent(body);
    if (!event) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    console.log(`PaySuite webhook: ${event.event} for reference ${event.data.reference}`);

    // Find order by payment reference (PaySuite payment ID) or order number
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { paymentRef: event.data.id },
          { orderNumber: event.data.reference },
        ],
      },
    });

    if (!order) {
      console.error(`Order not found for PaySuite payment: ${event.data.id} / ${event.data.reference}`);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Process event
    if (event.event === "payment.success") {
      // Payment successful!
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "PAID",
          status: "CONFIRMED",
          paymentRef: event.data.id,
          paymentMethod: event.data.transaction?.method
            ? `paysuite_${event.data.transaction.method}`
            : order.paymentMethod,
        },
      });

      // Send push notification to user
      await sendOrderNotification(order.userId, order.orderNumber, "CONFIRMED");

      // Create in-app notification
      await prisma.notification.create({
        data: {
          userId: order.userId,
          title: "Pagamento confirmado!",
          message: `O pagamento da encomenda #${order.orderNumber} (${event.data.amount} MT) foi confirmado com sucesso via ${event.data.transaction?.method || "PaySuite"}.`,
          type: "order",
          data: {
            orderId: order.id,
            orderNumber: order.orderNumber,
            amount: event.data.amount,
            method: event.data.transaction?.method,
          },
        },
      });

      console.log(`✅ Order ${order.orderNumber} payment confirmed!`);
    } else if (event.event === "payment.failed") {
      // Payment failed
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "FAILED",
        },
      });

      // Notify user
      await prisma.notification.create({
        data: {
          userId: order.userId,
          title: "Pagamento falhou",
          message: `O pagamento da encomenda #${order.orderNumber} falhou: ${event.data.error || "Tente novamente"}`,
          type: "order",
          data: {
            orderId: order.id,
            orderNumber: order.orderNumber,
            error: event.data.error,
          },
        },
      });

      console.log(`❌ Order ${order.orderNumber} payment failed: ${event.data.error}`);
    }

    // Always respond 200 to acknowledge receipt
    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("PaySuite webhook error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
