import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { validateWebhookSignature } from "@/lib/services/zumbopay";
import { sendOrderNotification } from "@/lib/services/onesignal";

/**
 * =========================================================
 * YuniExpress - ZumboPay Webhook
 * =========================================================
 *
 * URL:
 * https://yuniexpress.shop/api/payments/callback
 *
 * Eventos:
 * - payment.succeeded
 * - payment.failed
 * - payment.refunded
 *
 * Segurança:
 * - x-zumbopay-signature
 * - HMAC-SHA256
 *
 * IMPORTANTE:
 * O corpo bruto (raw body) é utilizado para validar
 * corretamente a assinatura HMAC.
 * =========================================================
 */

export async function POST(request: NextRequest) {
  try {
    // =======================================================
    // 1. RECEBER RAW BODY
    // =======================================================

    const rawBody = await request.text();

    if (!rawBody) {
      console.error("❌ ZumboPay webhook: body vazio");

      return NextResponse.json(
        { error: "Empty webhook body" },
        { status: 400 }
      );
    }

    // =======================================================
    // 2. VALIDAR ASSINATURA
    // =======================================================

    const signature =
      request.headers.get("x-zumbopay-signature") || "";

    if (!signature) {
      console.error(
        "❌ ZumboPay webhook: assinatura ausente"
      );

      return NextResponse.json(
        { error: "Missing signature" },
        { status: 401 }
      );
    }

    const validSignature =
      validateWebhookSignature(
        rawBody,
        signature
      );

    if (!validSignature) {
      console.error(
        "❌ ZumboPay webhook: assinatura inválida"
      );

      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    // =======================================================
    // 3. PARSE DO PAYLOAD
    // =======================================================

    let event: any;

    try {
      event = JSON.parse(rawBody);
    } catch {
      console.error(
        "❌ ZumboPay webhook: JSON inválido"
      );

      return NextResponse.json(
        { error: "Invalid JSON" },
        { status: 400 }
      );
    }

    // =======================================================
    // 4. NORMALIZAR EVENTO
    // =======================================================

    const eventType =
      event?.event ||
      event?.type ||
      "";

    const data =
      event?.data ||
      event ||
      {};

    const reference =
      data?.reference ||
      data?.payment_reference ||
      event?.reference ||
      null;

    const sourceId =
      data?.source_id ||
      event?.source_id ||
      null;

    const paymentId =
      data?.id ||
      data?.payment_id ||
      event?.payment_id ||
      null;

    const amount =
      Number(
        data?.amount ||
        event?.amount ||
        0
      ) || 0;

    console.log(
      "📥 ZumboPay webhook:",
      {
        event: eventType,
        reference,
        sourceId,
        paymentId,
        amount,
      }
    );

    // =======================================================
    // 5. VALIDAR EVENTO
    // =======================================================

    const allowedEvents = [
      "payment.succeeded",
      "payment.failed",
      "payment.refunded",
    ];

    if (!allowedEvents.includes(eventType)) {
      console.log(
        `ℹ️ ZumboPay webhook ignorado: ${eventType || "evento desconhecido"}`
      );

      // É importante responder 200 para não provocar
      // reentregas desnecessárias de eventos que não usamos.
      return NextResponse.json({
        received: true,
        ignored: true,
        event: eventType || null,
      });
    }

    // =======================================================
    // 6. REFERÊNCIA É OBRIGATÓRIA
    // =======================================================

    if (!reference && !sourceId) {
      console.error(
        "❌ ZumboPay webhook: referência/source_id ausente",
        event
      );

      // Não devolver 400 para evitar loops de retry
      // caso o evento seja válido mas não esteja
      // associado a uma encomenda local.
      return NextResponse.json({
        received: true,
        ignored: true,
        reason: "missing_reference",
      });
    }

    // =======================================================
    // 7. LOCALIZAR ENCOMENDA
    // =======================================================

    const order = await prisma.order.findFirst({
      where: {
        OR: [
          ...(reference
            ? [
                {
                  paymentRef: reference,
                },
                {
                  orderNumber: reference,
                },
              ]
            : []),

          ...(sourceId
            ? [
                {
                  orderNumber: sourceId,
                },
              ]
            : []),
        ],
      },
    });

    if (!order) {
      console.error(
        "❌ Order não encontrada para webhook ZumboPay:",
        {
          reference,
          sourceId,
          paymentId,
          eventType,
        }
      );

      // Acknowledge para evitar que a ZumboPay
      // fique reenviando indefinidamente.
      return NextResponse.json({
        received: true,
        ignored: true,
        reason: "order_not_found",
      });
    }

    console.log(
      `🔎 Order encontrada: ${order.orderNumber}`
    );

    // =======================================================
    // 8. PAYMENT SUCCEEDED
    // =======================================================

    if (eventType === "payment.succeeded") {
      /**
       * Idempotência:
       *
       * Se a encomenda já estiver PAID, não devemos
       * enviar novamente notificações ao cliente.
       */

      if (order.paymentStatus === "PAID") {
        console.log(
          `ℹ️ Order ${order.orderNumber} já estava PAID. Webhook ignorado.`
        );

        return NextResponse.json({
          received: true,
          alreadyProcessed: true,
        });
      }

      // -----------------------------------------------------
      // Atualizar encomenda
      // -----------------------------------------------------

      await prisma.order.update({
        where: {
          id: order.id,
        },

        data: {
          paymentStatus: "PAID",

          status: "CONFIRMED",

          paymentRef:
            reference ||
            order.paymentRef ||
            null,
        },
      });

      console.log(
        `✅ Order ${order.orderNumber} PAID`
      );

      // -----------------------------------------------------
      // Notificar cliente
      // -----------------------------------------------------

      try {
        await sendOrderNotification(
          order.userId,
          order.orderNumber,
          "CONFIRMED"
        );
      } catch (notificationError) {
        console.error(
          "⚠️ Erro OneSignal:",
          notificationError
        );
      }

      // -----------------------------------------------------
      // Criar notificação interna
      // -----------------------------------------------------

      try {
        await prisma.notification.create({
          data: {
            userId: order.userId,

            title: "Pagamento confirmado!",

            message: `Encomenda #${
              order.orderNumber
            } paga com sucesso${
              amount > 0
                ? ` (${amount.toFixed(2)} MT)`
                : ""
            }.`,
            
            type: "order",

            data: {
              orderId: order.id,

              orderNumber:
                order.orderNumber,

              paymentReference:
                reference,

              paymentId,

              gateway: "zumbopay",
            },
          },
        });
      } catch (notificationDbError) {
        console.error(
          "⚠️ Erro ao criar notificação:",
          notificationDbError
        );
      }

      return NextResponse.json({
        received: true,
        success: true,
        event: eventType,
        orderId: order.id,
        orderNumber: order.orderNumber,
        paymentStatus: "PAID",
      });
    }

    // =======================================================
    // 9. PAYMENT FAILED
    // =======================================================

    if (eventType === "payment.failed") {
      /**
       * Nunca transformar um pagamento já confirmado
       * em FAILED.
       *
       * Isto protege contra uma situação em que:
       *
       * succeeded → failed
       *
       * por ordem de entrega inesperada dos webhooks.
       */

      if (order.paymentStatus === "PAID") {
        console.warn(
          `⚠️ FAILED recebido depois de PAID para ${order.orderNumber}. Ignorado.`
        );

        return NextResponse.json({
          received: true,
          ignored: true,
          reason: "already_paid",
        });
      }

      await prisma.order.update({
        where: {
          id: order.id,
        },

        data: {
          paymentStatus: "FAILED",

          paymentRef:
            reference ||
            order.paymentRef ||
            null,
        },
      });

      console.log(
        `❌ Order ${order.orderNumber} FAILED`
      );

      return NextResponse.json({
        received: true,
        success: true,
        event: eventType,
        orderId: order.id,
        orderNumber: order.orderNumber,
        paymentStatus: "FAILED",
      });
    }

    // =======================================================
    // 10. PAYMENT REFUNDED
    // =======================================================

    if (eventType === "payment.refunded") {
      await prisma.order.update({
        where: {
          id: order.id,
        },

        data: {
          paymentStatus: "REFUNDED",

          status: "REFUNDED",

          paymentRef:
            reference ||
            order.paymentRef ||
            null,
        },
      });

      console.log(
        `↩️ Order ${order.orderNumber} REFUNDED`
      );

      return NextResponse.json({
        received: true,
        success: true,
        event: eventType,
        orderId: order.id,
        orderNumber: order.orderNumber,
        paymentStatus: "REFUNDED",
      });
    }

    // =======================================================
    // 11. FALLBACK
    // =======================================================

    return NextResponse.json({
      received: true,
    });
  } catch (error: any) {
    console.error(
      "❌ ZumboPay webhook error:",
      error?.message || error
    );

    /**
     * Erro interno:
     *
     * Retornamos 500 para permitir que a ZumboPay
     * possa tentar entregar novamente o evento.
     */
    return NextResponse.json(
      {
        error: "Internal error",
      },
      {
        status: 500,
      }
    );
  }
}
