import crypto from "crypto";
import { prisma } from "../db";
import { convertPrice } from "./pricing";

const API_URL = "https://api-sg.aliexpress.com/sync";
// Fallback gateway (some regions use taobao gateway)
const API_URL_FALLBACK = "https://gw.api.taobao.com/router/rest";

interface AliExpressConfig {
  appKey: string;
  appSecret: string;
  trackingId: string;
}

function getConfig(): AliExpressConfig {
  return {
    appKey: process.env.ALIEXPRESS_APP_KEY || "525112",
    appSecret: process.env.ALIEXPRESS_APP_SECRET || "NWikYHEWhXXKP4laNeb8Mpq0ZharJwSU",
    trackingId: process.env.ALIEXPRESS_TRACKING_ID || "",
  };
}

// Sort object keys alphabetically
function sortObject(obj: Record<string, any>): Record<string, any> {
  return Object.keys(obj)
    .sort()
    .reduce((result: Record<string, any>, key) => {
      result[key] = obj[key];
      return result;
    }, {});
}

// Sign API request using HMAC-MD5 (AliExpress official method)
function signRequest(params: Record<string, string>, secret: string): string {
  const sortedParams = sortObject(params);
  const sortedString = Object.keys(sortedParams).reduce((acc, key) => {
    return `${acc}${key}${sortedParams[key]}`;
  }, "");

  // Wrap with secret on both sides
  const bookstandString = `${secret}${sortedString}${secret}`;

  // MD5 hash, uppercase
  const sign = crypto
    .createHash("md5")
    .update(bookstandString, "utf8")
    .digest("hex")
    .toUpperCase();

  return sign;
}

// Get current timestamp in Asia/Shanghai timezone (required by AliExpress)
function getTimestamp(): string {
  const now = new Date();
  // Convert to Shanghai time (UTC+8)
  const shanghaiOffset = 8 * 60; // minutes
  const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
  const shanghaiTime = new Date(utcTime + shanghaiOffset * 60000);

  const year = shanghaiTime.getFullYear();
  const month = String(shanghaiTime.getMonth() + 1).padStart(2, "0");
  const day = String(shanghaiTime.getDate()).padStart(2, "0");
  const hours = String(shanghaiTime.getHours()).padStart(2, "0");
  const minutes = String(shanghaiTime.getMinutes()).padStart(2, "0");
  const seconds = String(shanghaiTime.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// Execute API call to AliExpress
async function apiCall(method: string, extraParams: Record<string, string> = {}) {
  const config = getConfig();
  const timestamp = getTimestamp();

  const baseParams: Record<string, string> = {
    method,
    app_key: config.appKey,
    sign_method: "md5",
    timestamp,
    format: "json",
    v: "2.0",
    ...extraParams,
  };

  // Remove empty values
  Object.keys(baseParams).forEach((key) => {
    if (!baseParams[key]) delete baseParams[key];
  });

  const sign = signRequest(baseParams, config.appSecret);
  const allParams = { ...baseParams, sign };

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
      },
      body: new URLSearchParams(allParams),
    });

    const data = await res.json();

    // If first gateway fails, try fallback
    if (data.error_response) {
      console.log("Trying fallback gateway...");
      const res2 = await fetch(API_URL_FALLBACK, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
        },
        body: new URLSearchParams(allParams),
      });
      return await res2.json();
    }

    return data;
  } catch (error: any) {
    console.error(`AliExpress API error [${method}]:`, error.message);
    throw error;
  }
}

// Affiliate API - Get product details by ID
export async function getAffiliateProductDetails(productIds: string[]) {
  const config = getConfig();

  return apiCall("aliexpress.affiliate.productdetail.get", {
    product_ids: productIds.join(","),
    tracking_id: config.trackingId,
    target_currency: "USD",
    target_language: "PT",
    fields:
      "commission_rate,sale_price,original_price,product_title,product_main_image_url,product_small_image_urls,evaluate_rate,original_price_currency,sale_price_currency,discount,ship_to_days,lastest_volume",
  });
}

// Affiliate API - Search/query products (hot products)
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

  const extraParams: Record<string, string> = {
    tracking_id: config.trackingId,
    target_currency: "USD",
    target_language: "PT",
    page_no: String(params.pageNo || 1),
    page_size: String(params.pageSize || 50),
    sort: params.sort || "SALE_PRICE_ASC",
  };

  if (params.keywords) extraParams.keywords = params.keywords;
  if (params.categoryIds) extraParams.category_ids = params.categoryIds;
  if (params.minPrice) extraParams.min_sale_price = String(params.minPrice);
  if (params.maxPrice) extraParams.max_sale_price = String(params.maxPrice);

  return apiCall("aliexpress.affiliate.product.query", extraParams);
}

// Get hot/trending products
export async function getHotProducts(params: {
  categoryIds?: string;
  pageNo?: number;
  pageSize?: number;
} = {}) {
  const config = getConfig();

  return apiCall("aliexpress.affiliate.hotproduct.query", {
    tracking_id: config.trackingId,
    target_currency: "USD",
    target_language: "PT",
    page_no: String(params.pageNo || 1),
    page_size: String(params.pageSize || 50),
    category_ids: params.categoryIds || "",
  });
}

// Generate affiliate link for a product URL
export async function generateAffiliateLink(productUrl: string) {
  const config = getConfig();

  return apiCall("aliexpress.affiliate.link.generate", {
    tracking_id: config.trackingId,
    source_values: productUrl,
    promotion_link_type: "0",
  });
}

// Get categories
export async function getCategories() {
  return apiCall("aliexpress.affiliate.category.get", {});
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

    // Navigate the response structure
    const responseKey = "aliexpress_affiliate_product_query_response";
    const products =
      result?.[responseKey]?.resp_result?.result?.products?.product ||
      result?.[responseKey]?.result?.products?.product ||
      [];

    if (!products || products.length === 0) {
      await prisma.syncLog.update({
        where: { id: log.id },
        data: {
          status: "completed",
          message: "No products returned from API",
          itemsProcessed: 0,
          completedAt: new Date(),
        },
      });
      return { success: true, processed: 0, failed: 0, message: "No products found" };
    }

    let processed = 0;
    let failed = 0;

    for (const product of products) {
      try {
        const priceUSD = parseFloat(
          product.sale_price?.amount ||
            product.app_sale_price?.amount ||
            product.target_sale_price ||
            "0"
        );
        const originalPriceUSD = parseFloat(
          product.original_price?.amount ||
            product.target_original_price ||
            priceUSD.toString()
        );

        if (priceUSD <= 0) {
          failed++;
          continue;
        }

        const { priceMZN, originalPriceMZN } = await convertPrice(
          priceUSD,
          originalPriceUSD
        );

        const slug = generateSlug(product.product_title);
        const productId = String(product.product_id);

        // Collect images
        const mainImage = product.product_main_image_url || "";
        const smallImages: string[] =
          product.product_small_image_urls?.string || [];

        await prisma.product.upsert({
          where: { aliexpressId: productId },
          update: {
            priceUSD,
            originalPriceUSD,
            priceMZN,
            originalPriceMZN,
            stock: 100,
            sold: product.lastest_volume || 0,
            rating: Math.min(5, parseFloat(product.evaluate_rate || "0") / 20),
            freeShipping: true,
            lastSyncAt: new Date(),
          },
          create: {
            aliexpressId: productId,
            title: product.product_title,
            slug,
            description: product.product_title, // Will be enriched later
            originalPriceUSD,
            priceUSD,
            priceMZN,
            originalPriceMZN,
            stock: 100,
            sold: product.lastest_volume || 0,
            rating: Math.min(5, parseFloat(product.evaluate_rate || "0") / 20),
            shippingDays: product.ship_to_days
              ? `${product.ship_to_days} dias`
              : "15-45 dias",
            freeShipping: true,
            aliexpressUrl: product.product_detail_url || "",
            affiliateUrl: product.promotion_link || "",
            status: "PENDING",
            images: {
              create: [
                ...(mainImage ? [{ url: mainImage, order: 0 }] : []),
                ...smallImages.map((url: string, i: number) => ({
                  url,
                  order: i + 1,
                })),
              ],
            },
          },
        });
        processed++;
      } catch (err: any) {
        console.error(
          `Failed to sync product ${product.product_id}:`,
          err.message
        );
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
