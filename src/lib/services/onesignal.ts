import axios from "axios";

const ONESIGNAL_API_URL = "https://onesignal.com/api/v1";

interface NotificationPayload {
  title: string;
  message: string;
  url?: string;
  data?: Record<string, any>;
  imageUrl?: string;
}

// Send notification to all users
export async function sendNotificationToAll(
  payload: NotificationPayload
): Promise<boolean> {
  try {
    await axios.post(
      `${ONESIGNAL_API_URL}/notifications`,
      {
        app_id: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
        included_segments: ["All"],
        headings: { en: payload.title, pt: payload.title },
        contents: { en: payload.message, pt: payload.message },
        url: payload.url,
        data: payload.data,
        big_picture: payload.imageUrl,
      },
      {
        headers: {
          Authorization: `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    return true;
  } catch (error: any) {
    console.error("OneSignal error:", error.response?.data || error.message);
    return false;
  }
}

// Send notification to specific user(s) by external user ID
export async function sendNotificationToUser(
  userId: string | string[],
  payload: NotificationPayload
): Promise<boolean> {
  const userIds = Array.isArray(userId) ? userId : [userId];

  try {
    await axios.post(
      `${ONESIGNAL_API_URL}/notifications`,
      {
        app_id: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
        include_external_user_ids: userIds,
        headings: { en: payload.title, pt: payload.title },
        contents: { en: payload.message, pt: payload.message },
        url: payload.url,
        data: payload.data,
        big_picture: payload.imageUrl,
      },
      {
        headers: {
          Authorization: `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    return true;
  } catch (error: any) {
    console.error("OneSignal error:", error.response?.data || error.message);
    return false;
  }
}

// Send order status notification
export async function sendOrderNotification(
  userId: string,
  orderNumber: string,
  status: string
): Promise<void> {
  const statusMessages: Record<string, string> = {
    CONFIRMED: "A sua encomenda foi confirmada!",
    PROCESSING: "A sua encomenda está a ser processada.",
    SHIPPED: "A sua encomenda foi enviada!",
    DELIVERED: "A sua encomenda foi entregue!",
    CANCELLED: "A sua encomenda foi cancelada.",
  };

  const message = statusMessages[status] || `Estado da encomenda: ${status}`;

  await sendNotificationToUser(userId, {
    title: `Encomenda #${orderNumber}`,
    message,
    url: `/account/orders`,
    data: { type: "order_update", orderNumber, status },
  });
}

// Send promotional notification
export async function sendPromotionNotification(
  title: string,
  message: string,
  imageUrl?: string,
  url?: string
): Promise<void> {
  await sendNotificationToAll({
    title,
    message,
    imageUrl,
    url: url || "/",
    data: { type: "promotion" },
  });
}
