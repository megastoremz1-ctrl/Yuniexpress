import crypto from "crypto";

/**
 * =========================================================
 * YuniExpress - ZumboPay Payment Gateway
 * =========================================================
 *
 * API:
 * https://zumbopay.com/api/public/v1
 *
 * Suporte:
 * - M-Pesa STK Push
 * - e-Mola STK Push
 * - M-Pesa Checkout
 * - e-Mola Checkout
 * - Visa / Mastercard 3DS Checkout
 *
 * Webhook:
 * https://yuniexpress.shop/api/payments/callback
 * =========================================================
 */

const ZUMBO_API_URL =
  process.env.ZUMBOPAY_API_URL ||
  "https://zumbopay.com/api/public/v1";

const ZUMBO_TIMEOUT_MS = 30_000;

// =========================================================
// CONFIGURAÇÃO
// =========================================================

interface ZumboConfig {
  apiKey: string;
  merchantId: string;

  walletMpesa: string;
  walletEmola: string;
  walletCard: string;

  webhookSecret: string;
}

function getConfig(): ZumboConfig {
  return {
    apiKey: process.env.ZUMBOPAY_API_KEY || "",
    merchantId: process.env.ZUMBOPAY_MERCHANT_ID || "",

    walletMpesa: process.env.ZUMBOPAY_WALLET_MPESA || "",
    walletEmola: process.env.ZUMBOPAY_WALLET_EMOLA || "",
    walletCard: process.env.ZUMBOPAY_WALLET_CARD || "",

    webhookSecret: process.env.ZUMBOPAY_WEBHOOK_SECRET || "",
  };
}

// =========================================================
// VALIDAÇÃO DA CONFIGURAÇÃO
// =========================================================

function validateApiConfig(config: ZumboConfig): void {
  if (!config.apiKey) {
    throw new Error("ZUMBOPAY_API_KEY não configurada.");
  }

  if (!config.merchantId) {
    throw new Error("ZUMBOPAY_MERCHANT_ID não configurado.");
  }
}

// =========================================================
// HELPERS
// =========================================================

function normalizePhone(phone: string): string {
  let normalized = String(phone || "")
    .trim()
    .replace(/\s+/g, "")
    .replace(/-/g, "");

  // Remove +258
  if (normalized.startsWith("+258")) {
    normalized = normalized.substring(4);
  }

  // Remove 258 duplicado caso exista
  if (normalized.startsWith("258258")) {
    normalized = normalized.substring(3);
  }

  // Adiciona código de Moçambique
  if (!normalized.startsWith("258")) {
    normalized = `258${normalized}`;
  }

  return normalized;
}

function isValidMozambiquePhone(phone: string): boolean {
  return /^258(84|85|86|87)\d{7}$/.test(phone);
}

function getWalletForMethod(
  method: "mpesa" | "emola" | "card",
  config: ZumboConfig
): string {
  switch (method) {
    case "mpesa":
      return config.walletMpesa;

    case "emola":
      return config.walletEmola;

    case "card":
      return config.walletCard;

    default:
      return "";
  }
}

function getPrimaryWallet(
  channels: ("mpesa" | "emola" | "card")[],
  config: ZumboConfig
): string {
  // A wallet principal deve corresponder ao primeiro
  // método solicitado quando possível.
  for (const channel of channels) {
    const wallet = getWalletForMethod(channel, config);

    if (wallet) {
      return wallet;
    }
  }

  return "";
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit
): Promise<Response> {
  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, ZUMBO_TIMEOUT_MS);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function parseResponse(response: Response): Promise<any> {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return {
      error: {
        message: text.substring(0, 500),
      },
    };
  }
}

function getErrorMessage(
  data: any,
  fallback: string
): string {
  return (
    data?.error?.message ||
    data?.message ||
    data?.error ||
    fallback
  );
}

// =========================================================
// STK PUSH
// M-PESA / E-MOLA
// =========================================================

export interface ChargeRequest {
  amount: number;

  /**
   * Número do cliente.
   *
   * Exemplos:
   * 841234567
   * 861234567
   * 258841234567
   */
  phone: string;

  customerName?: string;

  /**
   * Identificador único do pedido.
   * Também utilizado para idempotência.
   */
  sourceId: string;

  method: "mpesa" | "emola";
}

export interface ChargeResponse {
  success: boolean;

  status?: "success" | "pending";

  reference?: string;

  error?: string;

  raw?: any;
}

/**
 * =========================================================
 * CREATE CHARGE
 * =========================================================
 *
 * Usa:
 *
 * POST /charges
 *
 * Para:
 * - M-Pesa STK
 * - e-Mola STK
 *
 * A ZumboPay utiliza:
 * - wallet_id
 * - amount
 * - msisdn
 * - customer_name
 * - source_id
 *
 * source_id + Idempotency-Key ajudam a impedir
 * cobranças duplicadas.
 * =========================================================
 */

export async function createCharge(
  request: ChargeRequest
): Promise<ChargeResponse> {
  const config = getConfig();

  try {
    validateApiConfig(config);

    if (!request.amount || Number(request.amount) <= 0) {
      return {
        success: false,
        error: "Valor do pagamento inválido.",
      };
    }

    if (!request.sourceId) {
      return {
        success: false,
        error: "sourceId é obrigatório.",
      };
    }

    const walletId = getWalletForMethod(
      request.method,
      config
    );

    if (!walletId) {
      return {
        success: false,
        error: `Wallet ${request.method} não configurada.`,
      };
    }

    const phone = normalizePhone(request.phone);

    if (!isValidMozambiquePhone(phone)) {
      return {
        success: false,
        error:
          "Número de telefone inválido. Use um número M-Pesa/e-Mola válido.",
      };
    }

    const response = await fetchWithTimeout(
      `${ZUMBO_API_URL}/charges`,
      {
        method: "POST",

        headers: {
          Authorization: `Bearer ${config.apiKey}`,

          "X-Merchant-Id": config.merchantId,

          "Content-Type": "application/json",

          Accept: "application/json",

          "Idempotency-Key": request.sourceId,
        },

        body: JSON.stringify({
          wallet_id: walletId,

          amount: Number(request.amount),

          msisdn: phone,

          customer_name:
            request.customerName ||
            "Cliente YuniExpress",

          source_id: request.sourceId,
        }),
      }
    );

    const data = await parseResponse(response);

    if (response.status === 200 || response.status === 202) {
      const status =
        data?.data?.status ||
        data?.status ||
        "pending";

      return {
        success: true,

        status:
          status === "success"
            ? "success"
            : "pending",

        reference:
          data?.data?.reference ||
          data?.reference ||
          undefined,

        raw: data,
      };
    }

    return {
      success: false,

      error: getErrorMessage(
        data,
        `Pagamento ${request.method.toUpperCase()} recusado pela ZumboPay.`
      ),

      raw: data,
    };
  } catch (error: any) {
    console.error(
      "❌ ZumboPay charge error:",
      error?.message || error
    );

    if (error?.name === "AbortError") {
      return {
        success: false,
        error:
          "A ZumboPay demorou demasiado tempo a responder.",
      };
    }

    return {
      success: false,
      error:
        error?.message ||
        "Erro de conexão com a ZumboPay.",
    };
  }
}

// =========================================================
// CHECKOUT HOSPEDADO
// M-PESA + E-MOLA + CARD
// =========================================================

export interface PaymentRequest {
  title: string;

  amount: number;

  /**
   * Número interno da encomenda YuniExpress.
   *
   * Exemplo:
   * YUNI-2026-000123
   */
  orderNumber: string;

  channels?: (
    | "mpesa"
    | "emola"
    | "card"
  )[];
}

export interface PaymentResponse {
  success: boolean;

  checkoutUrl?: string;

  reference?: string;

  paymentId?: string;

  status?: string;

  error?: string;

  raw?: any;
}

/**
 * =========================================================
 * CREATE HOSTED PAYMENT
 * =========================================================
 *
 * Usa:
 *
 * POST /payments
 *
 * Retorna:
 *
 * checkout_url
 *
 * O cliente pode escolher:
 * - M-Pesa
 * - e-Mola
 * - Visa
 * - Mastercard
 *
 * O wallet_id principal é selecionado com base
 * nos canais solicitados.
 * =========================================================
 */

export async function createPayment(
  request: PaymentRequest
): Promise<PaymentResponse> {
  const config = getConfig();

  try {
    validateApiConfig(config);

    if (!request.amount || Number(request.amount) <= 0) {
      return {
        success: false,
        error: "Valor do pagamento inválido.",
      };
    }

    if (!request.orderNumber) {
      return {
        success: false,
        error: "orderNumber é obrigatório.",
      };
    }

    const channels =
      request.channels?.length
        ? request.channels
        : ["mpesa", "emola", "card"];

    const walletId = getPrimaryWallet(
      channels,
      config
    );

    if (!walletId) {
      return {
        success: false,
        error:
          "Nenhuma wallet ZumboPay configurada para os canais selecionados.",
      };
    }

    /**
     * Idempotency-Key:
     *
     * Impede a criação de múltiplos pagamentos
     * para a mesma encomenda quando o cliente
     * clicar várias vezes.
     */
    const idempotencyKey =
      `yuniexpress-${request.orderNumber}`;

    const response = await fetchWithTimeout(
      `${ZUMBO_API_URL}/payments`,
      {
        method: "POST",

        headers: {
          Authorization: `Bearer ${config.apiKey}`,

          "X-Merchant-Id": config.merchantId,

          "Content-Type": "application/json",

          Accept: "application/json",

          "Idempotency-Key": idempotencyKey,
        },

        body: JSON.stringify({
          title: request.title,

          amount: Number(request.amount),

          currency: "MZN",

          channels,

          wallet_id: walletId,

          max_uses: 1,
        }),
      }
    );

    const data = await parseResponse(response);

    if (response.status === 201) {
      const checkoutUrl =
        data?.data?.checkout_url ||
        data?.checkout_url ||
        data?.url ||
        null;

      const reference =
        data?.data?.reference ||
        data?.reference ||
        undefined;

      const paymentId =
        data?.data?.id ||
        data?.id ||
        undefined;

      const status =
        data?.data?.status ||
        data?.status ||
        "active";

      if (!checkoutUrl) {
        console.error(
          "❌ ZumboPay não retornou checkout_url:",
          data
        );

        return {
          success: false,
          error:
            "A ZumboPay criou o pagamento, mas não devolveu o checkout URL.",
          raw: data,
        };
      }

      return {
        success: true,

        checkoutUrl,

        reference,

        paymentId,

        status,

        raw: data,
      };
    }

    return {
      success: false,

      error: getErrorMessage(
        data,
        "Erro ao criar pagamento na ZumboPay."
      ),

      raw: data,
    };
  } catch (error: any) {
    console.error(
      "❌ ZumboPay payment error:",
      error?.message || error
    );

    if (error?.name === "AbortError") {
      return {
        success: false,
        error:
          "A ZumboPay demorou demasiado tempo a responder.",
      };
    }

    return {
      success: false,
      error:
        error?.message ||
        "Erro de conexão com a ZumboPay.",
    };
  }
}

// =========================================================
// VALIDAR WEBHOOK
// HMAC-SHA256
// =========================================================

/**
 * =========================================================
 * VERIFY WEBHOOK SIGNATURE
 * =========================================================
 *
 * Header:
 *
 * x-zumbopay-signature
 *
 * A assinatura é:
 *
 * HMAC-SHA256(rawBody, webhookSecret)
 *
 * É extremamente importante utilizar o corpo bruto
 * recebido pelo webhook.
 * =========================================================
 */

export function validateWebhookSignature(
  rawBody: string,
  signature: string
): boolean {
  const config = getConfig();

  if (!config.webhookSecret) {
    console.error(
      "❌ ZUMBOPAY_WEBHOOK_SECRET não configurado."
    );

    return false;
  }

  if (!rawBody || !signature) {
    return false;
  }

  try {
    const expected = crypto
      .createHmac(
        "sha256",
        config.webhookSecret
      )
      .update(rawBody, "utf8")
      .digest("hex");

    const receivedBuffer = Buffer.from(
      signature.trim(),
      "hex"
    );

    const expectedBuffer = Buffer.from(
      expected,
      "hex"
    );

    /**
     * timingSafeEqual exige buffers
     * com exatamente o mesmo tamanho.
     */
    if (
      receivedBuffer.length !==
      expectedBuffer.length
    ) {
      return false;
    }

    return crypto.timingSafeEqual(
      receivedBuffer,
      expectedBuffer
    );
  } catch (error) {
    console.error(
      "❌ Erro ao validar assinatura ZumboPay:",
      error
    );

    return false;
  }
}

// =========================================================
// CONSULTAR ESTADO DO PAGAMENTO
// =========================================================

export interface PaymentStatusResponse {
  success: boolean;

  data?: any;

  error?: string;
}

/**
 * =========================================================
 * GET PAYMENT STATUS
 * =========================================================
 *
 * GET /payments/:reference
 * =========================================================
 */

export async function getPaymentStatus(
  reference: string
): Promise<PaymentStatusResponse> {
  const config = getConfig();

  try {
    validateApiConfig(config);

    if (!reference) {
      return {
        success: false,
        error: "Reference é obrigatória.",
      };
    }

    const response = await fetchWithTimeout(
      `${ZUMBO_API_URL}/payments/${encodeURIComponent(
        reference
      )}`,
      {
        method: "GET",

        headers: {
          Authorization: `Bearer ${config.apiKey}`,

          "X-Merchant-Id": config.merchantId,

          Accept: "application/json",
        },
      }
    );

    const data = await parseResponse(response);

    if (response.ok) {
      return {
        success: true,
        data,
      };
    }

    return {
      success: false,

      error: getErrorMessage(
        data,
        "Não foi possível consultar o pagamento."
      ),

      data,
    };
  } catch (error: any) {
    console.error(
      "❌ ZumboPay status error:",
      error?.message || error
    );

    return {
      success: false,

      error:
        error?.message ||
        "Erro de conexão com a ZumboPay.",
    };
  }
}

// =========================================================
// VALIDAR CONFIGURAÇÃO DO MERCHANT
// =========================================================

export interface MerchantValidationResponse {
  success: boolean;

  ready?: boolean;

  missing?: string[];

  data?: any;

  error?: string;
}

/**
 * =========================================================
 * VALIDATE MERCHANT
 * =========================================================
 *
 * GET /merchant/validate
 *
 * Útil para testar a configuração antes de produção.
 * =========================================================
 */

export async function validateMerchant(): Promise<MerchantValidationResponse> {
  const config = getConfig();

  try {
    validateApiConfig(config);

    const response = await fetchWithTimeout(
      `${ZUMBO_API_URL}/merchant/validate`,
      {
        method: "GET",

        headers: {
          Authorization: `Bearer ${config.apiKey}`,

          "X-Merchant-Id": config.merchantId,

          Accept: "application/json",
        },
      }
    );

    const data = await parseResponse(response);

    if (response.ok) {
      return {
        success: true,

        ready: data?.data?.ready,

        missing: data?.data?.missing || [],

        data,
      };
    }

    return {
      success: false,

      error: getErrorMessage(
        data,
        "Não foi possível validar a conta ZumboPay."
      ),

      data,
    };
  } catch (error: any) {
    console.error(
      "❌ ZumboPay merchant validation error:",
      error?.message || error
    );

    return {
      success: false,

      error:
        error?.message ||
        "Erro de conexão com a ZumboPay.",
    };
  }
}
