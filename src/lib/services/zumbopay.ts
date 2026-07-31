import crypto from "crypto";

/**
 * ZumboPay Payment Gateway Integration
 * https://zumbopay.com/api/public/v1
 *
 * Supports: M-Pesa (STK push), e-Mola (STK push), Visa/Mastercard (3DS checkout)
 */

const ZUMBO_API_URL = "https://zumbopay.com/api/public/v1";

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

// ==================== STK PUSH (M-Pesa / e-Mola) ====================

export interface ChargeRequest {
  amount: number;
  phone: string; // 258841234567
  customerName?: string;
  sourceId: string; // idempotency key (order number)
  method: "mpesa" | "emola";
}

export interface ChargeResponse {
  success: boolean;
  status?: "success" | "pending";
  reference?: string;
  error?: string;
}

/**
 * Charge via STK push - sends PIN popup to customer's phone
 * M-Pesa (84/85) or e-Mola (86/87) - detected by phone prefix
 */
export async function createCharge(request: ChargeRequest): Promise<ChargeResponse> {
  const config = getConfig();
  const walletId = request.method === "mpesa" ? config.walletMpesa : config.walletEmola;

  if (!walletId) {
    return { success: false, error: `Wallet ${request.method} não configurada` };
  }

  // Ensure phone has 258 prefix
  let phone = request.phone.replace(/\s/g, "");
  if (!phone.startsWith("258")) phone = "258" + phone;

  try {
    const res = await fetch(`${ZUMBO_API_URL}/charges`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "X-Merchant-Id": config.merchantId,
        "Content-Type": "application/json",
        "Idempotency-Key": request.sourceId,
      },
      body: JSON.stringify({
        wallet_id: walletId,
        amount: request.amount,
        msisdn: phone,
        customer_name: request.customerName || "Cliente YuniExpress",
        source_id: request.sourceId,
      }),
    });

    const data = await res.json();

    if (res.status === 200 || res.status === 202) {
      return {
        success: true,
        status: data.data?.status || "pending",
        reference: data.data?.reference,
      };
    } else {
      return {
        success: false,
        error: data.error?.message || "Pagamento recusado",
      };
    }
  } catch (error: any) {
    console.error("ZumboPay charge error:", error.message);
    return { success: false, error: "Erro de conexão com ZumboPay" };
  }
}

// ==================== CHECKOUT HOSPEDADO (M-Pesa + e-Mola + Card) ====================

export interface PaymentRequest {
  title: string;
  amount: number;
  orderNumber: string;
  channels?: ("mpesa" | "emola" | "card")[];
}

export interface PaymentResponse {
  success: boolean;
  checkoutUrl?: string;
  reference?: string;
  error?: string;
}

/**
 * Create hosted checkout - returns URL for customer to complete payment
 * Supports ALL methods: M-Pesa, e-Mola, Visa/Mastercard (3DS)
 */
export async function createPayment(request: PaymentRequest): Promise<PaymentResponse> {
  const config = getConfig();
  const walletId = config.walletMpesa || config.walletEmola || config.walletCard;

  if (!walletId) {
    return { success: false, error: "Nenhuma wallet configurada" };
  }

  try {
    const res = await fetch(`${ZUMBO_API_URL}/payments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "X-Merchant-Id": config.merchantId,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: request.title,
        amount: request.amount,
        currency: "MZN",
        channels: request.channels || ["mpesa", "emola", "card"],
        wallet_id: walletId,
        max_uses: 1,
      }),
    });

    const data = await res.json();

    if (res.status === 201 && data.data?.checkout_url) {
      return {
        success: true,
        checkoutUrl: data.data.checkout_url,
        reference: data.data.reference,
      };
    } else {
      return {
        success: false,
        error: data.error?.message || "Erro ao criar pagamento",
      };
    }
  } catch (error: any) {
    console.error("ZumboPay payment error:", error.message);
    return { success: false, error: "Erro de conexão com ZumboPay" };
  }
}

// ==================== VERIFY WEBHOOK SIGNATURE ====================

export function validateWebhookSignature(rawBody: string, signature: string): boolean {
  const config = getConfig();
  const expected = crypto
    .createHmac("sha256", config.webhookSecret)
    .update(rawBody)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(expected, "hex")
    );
  } catch {
    return false;
  }
}

// ==================== CHECK PAYMENT STATUS ====================

export async function getPaymentStatus(reference: string) {
  const config = getConfig();

  try {
    const res = await fetch(`${ZUMBO_API_URL}/payments/${reference}`, {
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "X-Merchant-Id": config.merchantId,
      },
    });
    return await res.json();
  } catch {
    return null;
  }
}
