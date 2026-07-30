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

/**
 * Live search from AliExpress when local DB doesn't have results
 * Fetches products in real-time, converts prices, and optionally saves to DB
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const page = searchParams.get("page") || "1";

    if (!query || query.length < 2) {
      return NextResponse.json({ products: [], source: "none" });
    }

    // Get exchange rate and margin
    const rateRecord = await prisma.exchangeRate.findFirst({
      where: { fromCurrency: "USD", toCurrency: "MZN" },
      orderBy: { createdAt: "desc" },
    });
    const rate = rateRecord?.rate || 63.5;

    const marginSetting = await prisma.setting.findUnique({ where: { key: "default_margin_percent" } });
    const margin = marginSetting ? parseFloat(marginSetting.value) : 25;

    // Search AliExpress
    const params: Record<string, string> = {
      method: "aliexpress.affiliate.product.query",
      app_key: APP_KEY,
      sign_method: "md5",
      timestamp: getTimestamp(),
      format: "json",
      v: "2.0",
      keywords: query,
      target_currency: "USD",
      target_language: "EN",
      page_no: page,
      page_size: "20",
      sort: "LAST_VOLUME_DESC",
    };

    const sign = signRequest(params, APP_SECRET);
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=utf-8" },
      body: new URLSearchParams({ ...params, sign }),
    });

    const data = await res.json();
    const aliProducts = data?.aliexpress_affiliate_product_query_response?.resp_result?.result?.products?.product || [];

    if (aliProducts.length === 0) {
      return NextResponse.json({ products: [], source: "aliexpress", total: 0 });
    }

    // Convert to our format with MZN prices
    const products = aliProducts.map((p: any) => {
      const priceUSD = parseFloat(p.target_sale_price || p.original_price || "0");
      const originalUSD = parseFloat(p.target_original_price || p.original_price || priceUSD.toString());
      const priceMZN = Math.ceil(priceUSD * rate * (1 + margin / 100));
      const originalMZN = originalUSD > priceUSD ? Math.ceil(originalUSD * rate * (1 + margin / 100)) : null;

      return {
        id: `ali-${p.product_id}`,
        aliexpressId: String(p.product_id),
        title: p.product_title,
        slug: `ali-${p.product_id}`,
        priceMZN,
        originalPriceMZN: originalMZN,
        rating: 4.5,
        reviewCount: 0,
        sold: p.lastest_volume || 0,
        freeShipping: true,
        images: [
          { url: p.product_main_image_url, alt: null },
          ...(p.product_small_image_urls?.string || []).slice(0, 3).map((url: string) => ({ url, alt: null })),
        ],
        source: "aliexpress",
        aliexpressUrl: p.product_detail_url,
        promotionLink: p.promotion_link,
      };
    });

    // Auto-save new products to DB (async, don't wait)
    saveProductsToDb(aliProducts, rate, margin).catch(() => {});

    const totalResults = data?.aliexpress_affiliate_product_query_response?.resp_result?.result?.total_record_count || 0;

    return NextResponse.json({
      products,
      source: "aliexpress",
      total: totalResults,
      page: parseInt(page),
    });
  } catch (error: any) {
    console.error("Live search error:", error.message);
    return NextResponse.json({ products: [], source: "error" });
  }
}

// Save AliExpress products to local DB in background
async function saveProductsToDb(aliProducts: any[], rate: number, margin: number) {
  for (const p of aliProducts) {
    try {
      const productId = String(p.product_id);
      const existing = await prisma.product.findUnique({ where: { aliexpressId: productId } });
      if (existing) continue; // Already in DB

      const priceUSD = parseFloat(p.target_sale_price || p.original_price || "0");
      const originalUSD = parseFloat(p.target_original_price || priceUSD.toString());
      if (priceUSD <= 0) continue;

      const priceMZN = Math.ceil(priceUSD * rate * (1 + margin / 100));
      const originalMZN = originalUSD > priceUSD ? Math.ceil(originalUSD * rate * (1 + margin / 100)) : null;
      const mainImage = p.product_main_image_url || "";
      const smallImages: string[] = (p.product_small_image_urls?.string || []).slice(0, 4);

      const slug = p.product_title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").slice(0, 80) + "-" + Date.now().toString(36);

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
          status: "APPROVED",
          featured: false,
          images: {
            create: [
              ...(mainImage ? [{ url: mainImage, order: 0 }] : []),
              ...smallImages.map((url: string, i: number) => ({ url, order: i + 1 })),
            ],
          },
        },
      });
    } catch {}
  }
}
