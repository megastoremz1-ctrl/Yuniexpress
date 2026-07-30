import crypto from "crypto";

/**
 * PaySuite Payment Gateway Integration
 * https://docs.paysuite.co.mz
 *
 * Supports: M-Pesa, e-Mola, Credit/Debit Card
 * API Base: https://paysuite.tech/api/v1
 */

const PAYSUITE_API_URL = "https://paysuite.tech/api/v1";

interface PaySuiteConfig {
  apiToken: string;
  webhookSecret: string;
}

function getConfig(): PaySuiteConfig {
  return {
    apiToken: process.env.PAYSUITE_API_TOKEN || "2363|lmEXGhIQP7bhDIVq9eDzSyjfDnlsXwzUNJfwvmPOd52573ef",
    webhookSecret: process.env.PAYSUITE_WEBHOOK_SECRET || "whsec_5687765dfd0788a160882db4e8bffeab4b8f3c537bd42832",
  };
}

// ==================== CREATE PAYMENT ====================

export interface CreatePaymentRequest {
  amount: number; // Amount in MZN
  reference: string; // Unique reference (e.g., order number)
  description?: string; // Payment description
  method?: "mpesa" | "emola" | "credit_card"; // Payment method
  returnUrl?: string; // URL to redirect after payment
  callbackUrl?: string; // Webhook URL for notifications
}

export interface CreatePaymentResponse {
  success: boolean;
  paymentId?: string;
  checkoutUrl?: string;
  status?: string;
  error?: string;
}

/**
 * Create a new payment request via PaySuite
 * Returns a checkout URL where the customer completes payment
 */
export async function createPayment(
  request: CreatePaymentRequest
): Promise<CreatePaymentResponse> {
  const config = getConfig();

  const payload: Record<string, any> = {
    amount: request.amount.toFixed(2),
    reference: request.reference.replace(/[^a-zA-Z0-9]/g, ""), // Only letters and numbers
    description: (request.description || `Pagamento YuniExpress ${request.reference}`).slice(0, 125),
    return_url: request.returnUrl || `${process.env.NEXT_PUBLIC_APP_URL}/account/orders`,
  };

  // Add method if specified (otherwise PaySuite shows all options)
  if (request.method) {
    payload.method = request.method;
  }

  // Add callback URL for webhook notifications
  if (request.callbackUrl) {
    payload.callback_url = request.callbackUrl;
  }

  try {
    const response = await fetch(`${PAYSUITE_API_URL}/payments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (response.ok && data.status === "success") {
      return {
        success: true,
        paymentId: data.data.id,
        checkoutUrl: data.data.checkout_url,
        status: data.data.status,
      };
    } else {
      return {
        success: false,
        error: data.message || "Erro ao criar pagamento",
      };
    }
  } catch (error: any) {
    console.error("PaySuite create payment error:", error.message);
    return {
      success: false,
      error: "Erro de conexão com o gateway de pagamento",
    };
  }
}

// ==================== GET PAYMENT STATUS ====================

export interface PaymentStatus {
  id: string;
  amount: number;
  reference: string;
  status: "pending" | "paid" | "failed" | "cancelled";
  transaction?: {
    id: string;
    status: string;
    transactionId: string;
    paidAt: string;
  };
}

/**
 * Check the status of a payment
 */
export async function getPaymentStatus(paymentId: string): Promise<PaymentStatus | null> {
  const config = getConfig();

  try {
    const response = await fetch(`${PAYSUITE_API_URL}/payments/${paymentId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${config.apiToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    const data = await response.json();

    if (response.ok && data.status === "success") {
      return {
        id: data.data.id,
        amount: data.data.amount,
        reference: data.data.reference,
        status: data.data.status,
        transaction: data.data.transaction
          ? {
              id: data.data.transaction.id,
              status: data.data.transaction.status,
              transactionId: data.data.transaction.transaction_id,
              paidAt: data.data.transaction.paid_at,
            }
          : undefined,
      };
    }

    return null;
  } catch (error: any) {
    console.error("PaySuite get payment error:", error.message);
    return null;
  }
}

// ==================== REFUNDS ====================

export interface RefundRequest {
  paymentId: string;
  amount: number;
  reason: string;
}

export interface RefundResponse {
  success: boolean;
  refundId?: string;
  status?: string;
  error?: string;
}

/**
 * Create a refund for a completed payment
 */
export async function createRefund(request: RefundRequest): Promise<RefundResponse> {
  const config = getConfig();

  try {
    const response = await fetch(`${PAYSUITE_API_URL}/refunds`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        payment_id: request.paymentId,
        amount: request.amount.toFixed(2),
        reason: request.reason,
      }),
    });

    const data = await response.json();

    if (response.ok && data.status === "success") {
      return {
        success: true,
        refundId: data.data.id,
        status: data.data.status,
      };
    } else {
      return {
        success: false,
        error: data.message || "Erro ao processar reembolso",
      };
    }
  } catch (error: any) {
    console.error("PaySuite refund error:", error.message);
    return {
      success: false,
      error: "Erro de conexão com o gateway de pagamento",
    };
  }
}

// ==================== WEBHOOK VALIDATION ====================

/**
 * Validate PaySuite webhook signature
 * The signature is in the X-Webhook-Signature header
 * It's an HMAC-SHA256 of the raw request body using the webhook secret
 */
export function validateWebhookSignature(
  payload: string,
  signature: string
): boolean {
  const config = getConfig();

  const calculatedSignature = crypto
    .createHmac("sha256", config.webhookSecret)
    .update(payload)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(calculatedSignature)
    );
  } catch {
    return false;
  }
}

/**
 * Parse webhook event
 */
export interface WebhookEvent {
  event: "payment.success" | "payment.failed";
  data: {
    id: string;
    amount: number;
    reference: string;
    transaction?: {
      id: string;
      method: string;
      paid_at: string;
    };
    error?: string;
  };
  created_at: number;
  request_id: string;
}

export function parseWebhookEvent(body: string): WebhookEvent | null {
  try {
    return JSON.parse(body) as WebhookEvent;
  } catch {
    return null;
  }
}
