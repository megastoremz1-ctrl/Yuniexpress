import axios from "axios";
import crypto from "crypto";

const PAYGO_BASE_URL = "https://api.paygo.co.mz/v1";

interface PayGoConfig {
  apiKey: string;
  apiSecret: string;
  merchantId: string;
  callbackUrl: string;
}

function getConfig(): PayGoConfig {
  return {
    apiKey: process.env.PAYGO_API_KEY!,
    apiSecret: process.env.PAYGO_API_SECRET!,
    merchantId: process.env.PAYGO_MERCHANT_ID!,
    callbackUrl: process.env.PAYGO_CALLBACK_URL!,
  };
}

// Generate signature for PayGo requests
function generateSignature(payload: string, secret: string): string {
  return crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
}

export interface PaymentRequest {
  orderId: string;
  amount: number; // Amount in MZN
  phone: string; // Customer phone number
  method: "mpesa" | "emola" | "mkesh"; // Payment method
  description?: string;
}

export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  status?: string;
  message?: string;
}

// Initiate a payment
export async function initiatePayment(
  request: PaymentRequest
): Promise<PaymentResponse> {
  const config = getConfig();

  const payload = {
    merchant_id: config.merchantId,
    order_id: request.orderId,
    amount: request.amount,
    currency: "MZN",
    phone: request.phone,
    payment_method: request.method,
    description: request.description || `Pagamento YuniExpress #${request.orderId}`,
    callback_url: config.callbackUrl,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/account/orders`,
  };

  const signature = generateSignature(
    JSON.stringify(payload),
    config.apiSecret
  );

  try {
    const response = await axios.post(`${PAYGO_BASE_URL}/payments`, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
        "X-Signature": signature,
      },
    });

    return {
      success: true,
      transactionId: response.data.transaction_id,
      status: response.data.status,
    };
  } catch (error: any) {
    console.error("PayGo payment error:", error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || "Erro ao processar pagamento",
    };
  }
}

// Verify payment status
export async function verifyPayment(transactionId: string): Promise<{
  status: string;
  paid: boolean;
  amount?: number;
}> {
  const config = getConfig();

  try {
    const response = await axios.get(
      `${PAYGO_BASE_URL}/payments/${transactionId}`,
      {
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
        },
      }
    );

    return {
      status: response.data.status,
      paid: response.data.status === "completed",
      amount: response.data.amount,
    };
  } catch (error: any) {
    console.error("PayGo verify error:", error.message);
    return { status: "error", paid: false };
  }
}

// Validate webhook signature
export function validateWebhookSignature(
  body: string,
  signature: string
): boolean {
  const config = getConfig();
  const expectedSignature = generateSignature(body, config.apiSecret);
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

// Process refund
export async function processRefund(
  transactionId: string,
  amount?: number
): Promise<PaymentResponse> {
  const config = getConfig();

  try {
    const response = await axios.post(
      `${PAYGO_BASE_URL}/refunds`,
      {
        transaction_id: transactionId,
        amount, // Partial refund if amount specified
      },
      {
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
        },
      }
    );

    return {
      success: true,
      transactionId: response.data.refund_id,
      status: response.data.status,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Erro ao processar reembolso",
    };
  }
}
