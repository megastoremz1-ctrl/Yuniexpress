import axios from "axios";
import { prisma } from "../db";
import { convertPrice } from "./pricing";

const API_BASE = "https://api-sg.aliexpress.com/sync";

interface AliExpressConfig {
  appKey: string;
  appSecret: string;
  accessToken: string;
  trackingId: string;
}

function getConfig(): AliExpressConfig {
  return {
    appKey: process.env.ALIEXPRESS_APP_KEY!,
    appSecret: process.env.ALIEXPRESS_APP_SECRET!,
    accessToken: process.env.ALIEXPRESS_ACCESS_TOKEN!,
    trackingId: process.env.ALIEXPRESS_TRACKING_ID!,
  };
}

// Sign API request (AliExpress uses HMAC-SHA256)
function signRequest(params: Record<string, string>, secret: string): string {
  const crypto = require("crypto");
  const sorted = Object.keys(params)
    .sort()
    .map((key) => `${key}${params[key]}`)
    .join("");
  const signStr = `${sorted}`;
  return crypto
    .createHmac("sha256", secret)
    .update(signStr)
    .digest("hex")
    .toUpperCase();
}

// Execute API call to AliExpress
async function apiCall(method: string, params: Record<string, any> = {}) {
  const config = getConfig();
  const timestamp = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 14);

  const baseParams: Record<string, string> = {
    app_key: config.appKey,
    method,
    sign_method: "sha256",
    timestamp,
    v: "2.0",
    ...params,
  };

  baseParams.sign = signRequest(baseParams, config.appSecret);

  try {
    const response = await axios.get(API_BASE, {
      params: baseParams,
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error(`AliExpress API error [${method}]:`, error.message);
    throw error;
  }
}

// Affiliate API - Get product details
export async function getAffiliateProductDetails(productIds: string[]) {
  const config = getConfig();

  try {
    const response = await axios.post(
      "https://api-sg.aliexpress.com/sync",
      null,
      {
        params: {
          app_key: config.appKey,
          method: "aliexpress.affiliate.productdetail.get",
          sign_method: "sha256",
          v: "2.0",
          product_ids: productIds.join(","),
          tracking_id: config.trackingId,
          target_currency: "USD",
          target_language: "PT",
          fields: "commission_rate,sale_price,original_price,product_title,product_main_image_url,product_small_image_urls,evaluate_rate,original_price_currency,sale_price_currency,discount,ship_to_days,lastest_volume",
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Error fetching affiliate product details:", error.message);
    return null;
  }
}

// Affiliate API - Search products (hot products)
export async function searchAffiliateProducts(params: {
  keywords?: string;
  categoryIds?: string;
  minPrice?: number;
  maxPrice?: number;
  pageNo?: number;
  pageSize?: number;
  sort?: string;
}) {
  const config = getConfig();

  try {
    const response = await axios.post(
      "https://api-sg.aliexpress.com/sync",
      null,
      {
        params: {
          app_key: config.appKey,
          method: "aliexpress.affiliate.product.query",
          sign_method: "sha256",
          v: "2.0",
          tracking_id: config.trackingId,
          target_currency: "USD",
          target_language: "PT",
          keywords: params.keywords || "",
          category_ids: params.categoryIds || "",
          min_sale_price: params.minPrice,
          max_sale_price: params.maxPrice,
          page_no: params.pageNo || 1,
          page_size: params.pageSize || 50,
          sort: params.sort || "SALE_PRICE_ASC",
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Error searching affiliate products:", error.message);
    return null;
  }
}

// Generate affiliate link
export async function generateAffiliateLink(productUrl: string) {
  const config = getConfig();

  try {
    const response = await axios.post(
      "https://api-sg.aliexpress.com/sync",
      null,
      {
        params: {
          app_key: config.appKey,
          method: "aliexpress.affiliate.link.generate",
          sign_method: "sha256",
          v: "2.0",
          tracking_id: config.trackingId,
          source_values: productUrl,
          promotion_link_type: "0",
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Error generating affiliate link:", error.message);
    return null;
  }
}

// Get order info from AliExpress
export async function getOrderInfo(orderIds: string[]) {
  return apiCall("aliexpress.trade.order.get", {
    order_ids: orderIds.join(","),
  });
}

// Get shipping tracking info
export async function getTrackingInfo(
  logisticsNo: string,
  origin: string = "CN",
  destination: string = "MZ"
) {
  return apiCall("aliexpress.logistics.buyer.freight.get", {
    logistics_no: logisticsNo,
    origin,
    destination,
  });
}

// Sync products from AliExpress to local database
export async function syncProducts(keywords: string, categoryId?: string) {
  const log = await prisma.syncLog.create({
    data: {
      type: "products",
      status: "running",
      message: `Syncing products: ${keywords}`,
    },
  });

  try {
    const result = await searchAffiliateProducts({
      keywords,
      categoryIds: categoryId,
      pageSize: 50,
    });

    if (!result?.aliexpress_affiliate_product_query_response?.resp_result?.result?.products) {
      await prisma.syncLog.update({
        where: { id: log.id },
        data: {
          status: "failed",
          message: "No products returned from API",
          completedAt: new Date(),
        },
      });
      return { success: false, message: "No products found" };
    }

    const products =
      result.aliexpress_affiliate_product_query_response.resp_result.result.products.product;
    let processed = 0;
    let failed = 0;

    for (const product of products) {
      try {
        const priceUSD = parseFloat(product.sale_price?.amount || product.app_sale_price?.amount || "0");
        const originalPriceUSD = parseFloat(product.original_price?.amount || priceUSD.toString());
        const { priceMZN, originalPriceMZN } = await convertPrice(priceUSD, originalPriceUSD);

        const slug = generateSlug(product.product_title);

        await prisma.product.upsert({
          where: { aliexpressId: product.product_id.toString() },
          update: {
            priceUSD,
            originalPriceUSD,
            priceMZN,
            originalPriceMZN,
            stock: 100, // Default stock
            sold: product.lastest_volume || 0,
            rating: parseFloat(product.evaluate_rate || "0") / 20, // Convert to 5-star
            lastSyncAt: new Date(),
          },
          create: {
            aliexpressId: product.product_id.toString(),
            title: product.product_title,
            slug,
            description: product.product_title,
            originalPriceUSD,
            priceUSD,
            priceMZN,
            originalPriceMZN,
            stock: 100,
            sold: product.lastest_volume || 0,
            rating: parseFloat(product.evaluate_rate || "0") / 20,
            shippingDays: product.ship_to_days || "15-45 dias",
            freeShipping: true,
            aliexpressUrl: product.product_detail_url,
            affiliateUrl: product.promotion_link,
            status: "PENDING",
            images: {
              create: [
                { url: product.product_main_image_url, order: 0 },
                ...(product.product_small_image_urls?.string || []).map(
                  (url: string, i: number) => ({ url, order: i + 1 })
                ),
              ],
            },
          },
        });
        processed++;
      } catch (err: any) {
        console.error(`Failed to sync product ${product.product_id}:`, err.message);
        failed++;
      }
    }

    await prisma.syncLog.update({
      where: { id: log.id },
      data: {
        status: "completed",
        itemsProcessed: processed,
        itemsFailed: failed,
        completedAt: new Date(),
      },
    });

    return { success: true, processed, failed };
  } catch (error: any) {
    await prisma.syncLog.update({
      where: { id: log.id },
      data: {
        status: "failed",
        message: error.message,
        completedAt: new Date(),
      },
    });
    return { success: false, message: error.message };
  }
}

function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 80);
  return `${base}-${Date.now().toString(36)}`;
}
