import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  createPayment,
  createCharge,
} from "@/lib/services/zumbopay";

/**
 * =========================================================
 * YuniExpress - Initiate Payment
 * =========================================================
 *
 * POST /api/payments/initiate
 *
 * Fluxos:
 *
 * 1. M-Pesa/e-Mola + telefone
 *    -> STK Push via ZumboPay /charges
 *
 * 2. Checkout
 *    -> ZumboPay Hosted Checkout /payments
 *    -> M-Pesa + e-Mola + Visa/Mastercard
 *
 * O webhook responsável pela confirmação definitiva é:
 *
 * https://yuniexpress.shop/api/payments/callback
 * =========================================================
 */

export async function POST(request: NextRequest) {
  try {
    // =======================================================
    // 1. AUTENTICAÇÃO
    // =======================================================

    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Não autenticado",
        },
        {
          status: 401,
        }
      );
    }

    // =======================================================
    // 2. LER BODY
    // =======================================================

    let body: any;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "JSON inválido.",
        },
        {
          status: 400,
        }
      );
    }

    const orderId =
      typeof body?.orderId === "string"
        ? body.orderId.trim()
        : "";

    const method =
      typeof body?.method === "string"
        ? body.method.trim().toLowerCase()
        : "";

    const phone =
      typeof body?.phone === "string"
        ? body.phone.trim()
        : "";

    // =======================================================
    // 3. VALIDAR ORDER ID
    // =======================================================

    if (!orderId) {
      return NextResponse.json(
        {
          success: false,
          error: "Order ID é obrigatório.",
        },
        {
          status: 400,
        }
      );
    }

    // =======================================================
    // 4. VALIDAR MÉTODO
    // =======================================================

    const allowedMethods = [
      "mpesa",
      "emola",
      "card",
      "checkout",
    ];

    if (
      method &&
      !allowedMethods.includes(method)
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Método de pagamento inválido.",
        },
        {
          status: 400,
        }
      );
    }

    // =======================================================
    // 5. PROCURAR ENCOMENDA
    // =======================================================

    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
    });

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: "Encomenda não encontrada.",
        },
        {
          status: 404,
        }
      );
    }

    // =======================================================
    // 6. GARANTIR QUE A ENCOMENDA PERTENCE AO CLIENTE
    // =======================================================

    if (order.userId !== session.user.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Encomenda não encontrada.",
        },
        {
          status: 404,
        }
      );
    }

    // =======================================================
    // 7. VERIFICAR SE JÁ FOI PAGA
    // =======================================================

    if (order.paymentStatus === "PAID") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Esta encomenda já foi paga.",
        },
        {
          status: 400,
        }
      );
    }

    // =======================================================
    // 8. VALIDAR VALOR
    // =======================================================

    const amount = Number(order.totalMZN);

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      console.error(
        "❌ Valor inválido da encomenda:",
        {
          orderId,
          totalMZN: order.totalMZN,
        }
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "O valor da encomenda é inválido.",
        },
        {
          status: 400,
        }
      );
    }

    // =======================================================
    // 9. STK PUSH - M-PESA / E-MOLA
    // =======================================================
    //
    // Só usamos /charges quando o cliente:
    //
    // - escolheu M-Pesa ou e-Mola
    // - forneceu o telefone
    //
    // A ZumboPay irá enviar o pedido STK para o telefone.
    // =======================================================

    if (
      (method === "mpesa" ||
        method === "emola") &&
      phone
    ) {
      console.log(
        "📲 Iniciando STK ZumboPay:",
        {
          orderId,
          orderNumber: order.orderNumber,
          method,
          amount,
        }
      );

      const charge = await createCharge({
        amount,

        phone,

        customerName:
          session.user.name ||
          "Cliente YuniExpress",

        /**
         * orderNumber é utilizado como source_id
         * e chave de idempotência.
         */
        sourceId: order.orderNumber,

        method,
      });

      // =====================================================
      // STK FALHOU
      // =====================================================

      if (!charge.success) {
        console.error(
          "❌ ZumboPay STK falhou:",
          {
            orderId,
            orderNumber: order.orderNumber,
            method,
            error: charge.error,
          }
        );

        return NextResponse.json(
          {
            success: false,

            type: "stk_push",

            message:
              charge.error ||
              "Não foi possível iniciar o pagamento.",
          },
          {
            status: 400,
          }
        );
      }

      // =====================================================
      // GUARDAR REFERÊNCIA
      // =====================================================

      await prisma.order.update({
        where: {
          id: order.id,
        },

        data: {
          paymentRef:
            charge.reference ||
            order.paymentRef ||
            null,

          paymentMethod:
            `zumbopay_${method}`,
        },
      });

      console.log(
        "✅ ZumboPay STK iniciado:",
        {
          orderNumber: order.orderNumber,

          reference:
            charge.reference,

          status:
            charge.status,
        }
      );

      // =====================================================
      // RESPOSTA
      // =====================================================

      return NextResponse.json({
        success: true,

        type: "stk_push",

        reference:
          charge.reference || null,

        status:
          charge.status || "pending",

        paymentMethod:
          `zumbopay_${method}`,

        amount,

        message:
          charge.status === "success"
            ? "Pagamento confirmado!"
            : "Confirme o pagamento no seu telemóvel usando o PIN.",
      });
    }

    // =======================================================
    // 10. CHECKOUT HOSPEDADO
    // =======================================================
    //
    // Usado para:
    //
    // - Card
    // - M-Pesa
    // - e-Mola
    //
    // A ZumboPay devolve checkoutUrl.
    // =======================================================

    console.log(
      "🌐 Criando checkout ZumboPay:",
      {
        orderId,
        orderNumber: order.orderNumber,
        amount,
      }
    );

    const payment = await createPayment({
      title:
        `YuniExpress #${order.orderNumber}`,

      amount,

      orderNumber:
        order.orderNumber,

      channels: [
        "mpesa",
        "emola",
        "card",
      ],
    });

    // =======================================================
    // 11. CHECKOUT FALHOU
    // =======================================================

    if (
      !payment.success ||
      !payment.checkoutUrl
    ) {
      console.error(
        "❌ ZumboPay checkout falhou:",
        {
          orderId,
          orderNumber: order.orderNumber,
          error: payment.error,
          raw: payment.raw,
        }
      );

      return NextResponse.json(
        {
          success: false,

          type: "checkout",

          message:
            payment.error ||
            "Não foi possível criar o pagamento.",
        },
        {
          status: 400,
        }
      );
    }

    // =======================================================
    // 12. GUARDAR REFERÊNCIA DO PAGAMENTO
    // =======================================================

    await prisma.order.update({
      where: {
        id: order.id,
      },

      data: {
        paymentRef:
          payment.reference ||
          order.paymentRef ||
          null,

        paymentMethod:
          "zumbopay_checkout",
      },
    });

    // =======================================================
    // 13. RESPOSTA COM CHECKOUT URL
    // =======================================================

    console.log(
      "✅ ZumboPay checkout criado:",
      {
        orderNumber:
          order.orderNumber,

        reference:
          payment.reference,

        paymentId:
          payment.paymentId,

        checkoutUrl:
          payment.checkoutUrl,
      }
    );

    return NextResponse.json({
      success: true,

      type: "checkout",

      checkoutUrl:
        payment.checkoutUrl,

      reference:
        payment.reference || null,

      paymentId:
        payment.paymentId || null,

      status:
        payment.status || "active",

      paymentMethod:
        "zumbopay_checkout",

      amount,

      message:
        "Redirecione o cliente para a página de pagamento.",
    });
  } catch (error: any) {
    // =======================================================
    // ERRO GERAL
    // =======================================================

    console.error(
      "❌ Payment initiation error:",
      error?.message || error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          "Erro ao processar pagamento.",

        message:
          error?.message || undefined,
      },
      {
        status: 500,
      }
    );
  }
}
