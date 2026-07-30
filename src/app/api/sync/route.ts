import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";

const APP_KEY = process.env.ALIEXPRESS_APP_KEY || "525112";
const APP_SECRET = process.env.ALIEXPRESS_APP_SECRET || "NWikYHEWhXXKP4laNeb8Mpq0ZharJwSU";
const API_URL = "https://api-sg.aliexpress.com/sync";

function sortObject(obj: Record<string, any>) {
  return Object.keys(obj).sort().reduce((r: Record<string, any>, k) => { r[k] = obj[k]; return r; }, {});
}

function signRequest(params: Record<string, string>, secret: string): string {
  const sorted = sortObject(params);
  const str = Object.keys(sorted).reduce((a, k) => a + k + sorted[k], "");
  return crypto.createHash("md5").update(secret + str + secret, "utf8").digest("hex").toUpperCase();
}

function getTimestamp(): string {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const sh = new Date(utc + 8 * 60 * 60000);
  return sh.toISOString().replace("T", " ").slice(0, 19);
}

async function searchAliExpress(keywords: string, pageNo: number = 1, pageSize: number = 20, sort: string = "LAST_VOLUME_DESC") {
  const params: Record<string, string> = {
    method: "aliexpress.affiliate.product.query",
    app_key: APP_KEY,
    sign_method: "md5",
    timestamp: getTimestamp(),
    format: "json",
    v: "2.0",
    keywords,
    target_currency: "USD",
    target_language: "EN",
    page_no: String(pageNo),
    page_size: String(pageSize),
    sort,
  };
  const sign = signRequest(params, APP_SECRET);
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded;charset=utf-8" },
    body: new URLSearchParams({ ...params, sign }),
  });
  return res.json();
}

// Get exchange rate
async function getRate(): Promise<number> {
  const cached = await prisma.exchangeRate.findFirst({
    where: { fromCurrency: "USD", toCurrency: "MZN" },
    orderBy: { createdAt: "desc" },
  });
  return cached?.rate || 63.5;
}

// Get margin
async function getMargin(): Promise<number> {
  const setting = await prisma.setting.findUnique({ where: { key: "default_margin_percent" } });
  return setting ? parseFloat(setting.value) : 25;
}

function generateSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").slice(0, 80) + "-" + Date.now().toString(36);
}

// Sync products - ADDS new ones, UPDATES existing, NEVER deletes
async function syncCategory(keywords: string, categorySlug: string, rate: number, margin: number) {
  let processed = 0;
  let failed = 0;

  // Randomly pick a page to get different products each time
  const randomPage = Math.floor(Math.random() * 5) + 1;
  
  const data = await searchAliExpress(keywords, randomPage, 20);
  const products = data?.aliexpress_affiliate_product_query_response?.resp_result?.result?.products?.product || [];

  if (products.length === 0) return { processed: 0, failed: 0 };

  const category = await prisma.category.findUnique({ where: { slug: categorySlug } });

  for (const p of products) {
    try {
      const priceUSD = parseFloat(p.target_sale_price || p.original_price || "0");
      const originalUSD = parseFloat(p.target_original_price || p.original_price || priceUSD.toString());
      if (priceUSD <= 0) { failed++; continue; }

      const priceMZN = Math.ceil(priceUSD * rate * (1 + margin / 100));
      const originalMZN = originalUSD > priceUSD ? Math.ceil(originalUSD * rate * (1 + margin / 100)) : null;
      const productId = String(p.product_id);

      const mainImage = p.product_main_image_url || "";
      const smallImages: string[] = (p.product_small_image_urls?.string || []).slice(0, 5);

      // Check if product already exists
      const existing = await prisma.product.findUnique({ where: { aliexpressId: productId } });

      if (existing) {
        // UPDATE existing product (prices, stock, etc.) - never delete
        await prisma.product.update({
          where: { aliexpressId: productId },
          data: {
            priceUSD,
            originalPriceUSD: originalUSD,
            priceMZN,
            originalPriceMZN: originalMZN,
            sold: p.lastest_volume || existing.sold,
            lastSyncAt: new Date(),
          },
        });
      } else {
        // ADD new product
        const slug = generateSlug(p.product_title);
        await prisma.product.create({
          data: {
            aliexpressId: productId,
            title: p.product_title,
            slug,
            description: p.product_title,
            originalPriceUSD: originalUSD,
            priceUSD,
            priceMZN,
            originalPriceMZN: originalMZN,
            marginPercent: margin,
            stock: 100,
            sold: p.lastest_volume || 0,
            rating: 4.5,
            shippingDays: "15-45 dias",
            freeShipping: true,
            aliexpressUrl: p.product_detail_url || "",
            affiliateUrl: p.promotion_link || "",
            status: "APPROVED", // Auto-approve new synced products
            featured: Math.random() < 0.3, // 30% chance featured
            categoryId: category?.id || null,
            images: {
              create: [
                ...(mainImage ? [{ url: mainImage, order: 0 }] : []),
                ...smallImages.map((url: string, i: number) => ({ url, order: i + 1 })),
              ],
            },
          },
        });
      }
      processed++;
    } catch (err: any) {
      failed++;
    }
  }

  return { processed, failed };
}

// Main sync endpoint - adds new products hourly, updates existing
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get("secret") || request.headers.get("x-cron-secret");

    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const log = await prisma.syncLog.create({
      data: { type: "products", status: "running", message: "Hourly sync started" },
    });

    const rate = await getRate();
    const margin = await getMargin();

    // Sync different categories with varied keywords to get diverse products
    const syncTasks = [
      { keywords: "smartphone case cover", category: "phones" },
      { keywords: "wireless earbuds headphones", category: "electronics" },
      { keywords: "women summer dress 2024", category: "fashion" },
      { keywords: "face cream skincare", category: "beauty" },
      { keywords: "home organizer storage", category: "home" },
      { keywords: "fitness gym equipment", category: "sports" },
      { keywords: "smart watch band", category: "watches" },
      { keywords: "laptop stand holder", category: "computers" },
      { keywords: "led light decoration", category: "home" },
      { keywords: "men sneakers shoes", category: "fashion" },
      { keywords: "portable charger power bank", category: "electronics" },
      { keywords: "kitchen gadget tool", category: "home" },
    ];

    // Pick 4 random categories to sync each time (to spread load)
    const shuffled = syncTasks.sort(() => Math.random() - 0.5).slice(0, 4);

    let totalProcessed = 0;
    let totalFailed = 0;

    for (const task of shuffled) {
      const result = await syncCategory(task.keywords, task.category, rate, margin);
      totalProcessed += result.processed;
      totalFailed += result.failed;
    }

    await prisma.syncLog.update({
      where: { id: log.id },
      data: {
        status: "completed",
        message: `Synced ${shuffled.map(t => t.category).join(", ")}`,
        itemsProcessed: totalProcessed,
        itemsFailed: totalFailed,
        completedAt: new Date(),
      },
    });

    // Also update exchange rate
    try {
      const apiKey = process.env.EXCHANGE_RATE_API_KEY;
      if (apiKey) {
        const rateRes = await fetch(`https://api.exchangeratesapi.io/v1/latest?access_key=${apiKey}&symbols=USD,MZN`);
        const rateData = await rateRes.json();
        if (rateData.success) {
          const newRate = rateData.rates.MZN / rateData.rates.USD;
          await prisma.exchangeRate.create({
            data: { fromCurrency: "USD", toCurrency: "MZN", rate: parseFloat(newRate.toFixed(4)), source: "exchangeratesapi.io" },
          });
        }
      }
    } catch {}

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      processed: totalProcessed,
      failed: totalFailed,
      categories: shuffled.map(t => t.category),
    });
  } catch (error: any) {
    console.error("Sync error:", error);
    return NextResponse.json({ error: "Sync failed", message: error.message }, { status: 500 });
  }
}

// Get sync status
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret") || request.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const logs = await prisma.syncLog.findMany({ orderBy: { startedAt: "desc" }, take: 20 });
  const productCount = await prisma.product.count();
  const approvedCount = await prisma.product.count({ where: { status: "APPROVED" } });

  return NextResponse.json({ logs, productCount, approvedCount });
}
