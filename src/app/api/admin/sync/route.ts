import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
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

async function searchAliExpress(keywords: string, pageNo: number = 1, pageSize: number = 20) {
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
    sort: "LAST_VOLUME_DESC",
  };
  const sign = signRequest(params, APP_SECRET);
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded;charset=utf-8" },
    body: new URLSearchParams({ ...params, sign }),
  });
  return res.json();
}

function generateSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").slice(0, 80) + "-" + Date.now().toString(36);
}

// Extract variants from product title (like AliExpress does)
function extractVariantsFromTitle(title: string, basePriceMZN: number): { name: string; value: string; priceMZN: number; stock: number }[] {
  const variants: { name: string; value: string; priceMZN: number; stock: number }[] = [];
  const titleLower = title.toLowerCase();

  // Storage/capacity: 4GB, 8GB, 16GB, 32GB, 64GB, 128GB, 256GB, 512GB, 1TB
  const storageMatch = title.match(/(\d+)\s*(?:GB|TB)/gi);
  if (storageMatch && storageMatch.length >= 2) {
    const sizes = [...new Set(storageMatch.map(s => s.trim()))].slice(0, 6);
    const baseSize = parseInt(sizes[0]);
    sizes.forEach((size, i) => {
      const sizeNum = parseInt(size);
      const multiplier = Math.max(1, sizeNum / baseSize);
      const price = Math.ceil(basePriceMZN * Math.min(multiplier, 5));
      variants.push({ name: "Capacidade", value: size.toUpperCase(), priceMZN: price, stock: 50 - i * 5 });
    });
    return variants;
  }

  // Length: 1m, 2m, 3m, 5m, 10m, 15m, 20m
  const lengthMatch = title.match(/(\d+)\s*m(?:\s|,|\/|$)/gi);
  if (lengthMatch && lengthMatch.length >= 2) {
    const lengths = [...new Set(lengthMatch.map(s => s.trim()))].slice(0, 5);
    const baseLen = parseInt(lengths[0]) || 1;
    lengths.forEach((len, i) => {
      const lenNum = parseInt(len) || 1;
      const multiplier = Math.max(1, lenNum / baseLen);
      const price = Math.ceil(basePriceMZN * Math.min(multiplier, 6));
      variants.push({ name: "Tamanho", value: len.replace(/\s/g, ""), priceMZN: price, stock: 40 });
    });
    return variants;
  }

  // Sizes: S, M, L, XL, XXL, XXXL or 36-46
  if (titleLower.includes("dress") || titleLower.includes("shirt") || titleLower.includes("jacket") ||
      titleLower.includes("hoodie") || titleLower.includes("pants") || titleLower.includes("blouse") ||
      titleLower.includes("sweater") || titleLower.includes("coat") || titleLower.includes("skirt")) {
    const sizes = ["S", "M", "L", "XL", "XXL"];
    sizes.forEach((size, i) => {
      const price = i >= 3 ? Math.ceil(basePriceMZN * (1 + (i - 2) * 0.05)) : basePriceMZN;
      variants.push({ name: "Tamanho", value: size, priceMZN: price, stock: 30 });
    });
    return variants;
  }

  // Shoe sizes
  if (titleLower.includes("shoe") || titleLower.includes("sneaker") || titleLower.includes("boot") ||
      titleLower.includes("sandal") || titleLower.includes("slipper")) {
    const sizes = ["38", "39", "40", "41", "42", "43", "44"];
    sizes.forEach((size) => {
      variants.push({ name: "Tamanho", value: size, priceMZN: basePriceMZN, stock: 20 });
    });
    return variants;
  }

  // Colors (from title or common products)
  if (titleLower.includes("color") || titleLower.includes("black") || titleLower.includes("white") ||
      titleLower.includes("earphone") || titleLower.includes("earbuds") || titleLower.includes("headphone") ||
      titleLower.includes("case") || titleLower.includes("cover") || titleLower.includes("watch band")) {
    const colors = ["Preto", "Branco"];
    if (titleLower.includes("blue") || titleLower.includes("color")) colors.push("Azul");
    if (titleLower.includes("red") || titleLower.includes("color")) colors.push("Vermelho");
    if (titleLower.includes("pink") || titleLower.includes("color")) colors.push("Rosa");
    colors.forEach((color) => {
      variants.push({ name: "Cor", value: color, priceMZN: basePriceMZN, stock: 40 });
    });
    return variants;
  }

  return variants;
}

// Admin manual sync - uses session auth instead of cron secret
export async function POST(request: NextRequest) {
  try {
    // Verify admin
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const log = await prisma.syncLog.create({
      data: { type: "manual", status: "running", message: "Manual sync by admin" },
    });

    // Get rate and margin
    const rateRecord = await prisma.exchangeRate.findFirst({
      where: { fromCurrency: "USD", toCurrency: "MZN" },
      orderBy: { createdAt: "desc" },
    });
    const rate = rateRecord?.rate || 63.5;

    const marginSetting = await prisma.setting.findUnique({ where: { key: "default_margin_percent" } });
    const margin = marginSetting ? parseFloat(marginSetting.value) : 25;

    // Sync keywords
    const syncTasks = [
      { keywords: "smartphone accessories", category: "phones" },
      { keywords: "bluetooth earphones wireless", category: "electronics" },
      { keywords: "women fashion clothing", category: "fashion-women" },
      { keywords: "men casual shoes", category: "fashion-men" },
      { keywords: "skin care products", category: "beauty" },
      { keywords: "home decoration modern", category: "home" },
      { keywords: "fitness yoga equipment", category: "sports" },
      { keywords: "smart watch 2024", category: "watches" },
      { keywords: "laptop bag backpack", category: "bags" },
      { keywords: "baby toys educational", category: "baby" },
      { keywords: "car accessories interior", category: "automotive" },
      { keywords: "led strip lights", category: "lighting" },
    ];

    // Pick 6 random categories
    const shuffled = syncTasks.sort(() => Math.random() - 0.5).slice(0, 6);

    let totalProcessed = 0;
    let totalFailed = 0;

    for (const task of shuffled) {
      try {
        const randomPage = Math.floor(Math.random() * 3) + 1;
        const data = await searchAliExpress(task.keywords, randomPage, 15);
        const products = data?.aliexpress_affiliate_product_query_response?.resp_result?.result?.products?.product || [];

        const category = await prisma.category.findUnique({ where: { slug: task.category } });

        for (const p of products) {
          try {
            const priceUSD = parseFloat(p.target_sale_price || p.original_price || "0");
            const originalUSD = parseFloat(p.target_original_price || p.original_price || priceUSD.toString());
            if (priceUSD <= 0) continue;

            const priceMZN = Math.ceil(priceUSD * rate * (1 + margin / 100));
            const originalMZN = originalUSD > priceUSD ? Math.ceil(originalUSD * rate * (1 + margin / 100)) : null;
            const productId = String(p.product_id);

            const existing = await prisma.product.findUnique({ where: { aliexpressId: productId } });

            if (existing) {
              await prisma.product.update({
                where: { aliexpressId: productId },
                data: { priceUSD, originalPriceUSD: originalUSD, priceMZN, originalPriceMZN: originalMZN, lastSyncAt: new Date() },
              });
            } else {
              const mainImage = p.product_main_image_url || "";
              const smallImages: string[] = (p.product_small_image_urls?.string || []).slice(0, 4);

              // Extract variants from title
              const variants = extractVariantsFromTitle(p.product_title, priceMZN);

              await prisma.product.create({
                data: {
                  aliexpressId: productId,
                  title: p.product_title,
                  slug: generateSlug(p.product_title),
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
                  status: "APPROVED",
                  featured: Math.random() < 0.2,
                  categoryId: category?.id || null,
                  images: {
                    create: [
                      ...(mainImage ? [{ url: mainImage, order: 0 }] : []),
                      ...smallImages.map((url: string, i: number) => ({ url, order: i + 1 })),
                    ],
                  },
                  ...(variants.length > 0 ? {
                    variants: {
                      create: variants.map((v) => ({
                        name: v.name,
                        value: v.value,
                        priceMZN: v.priceMZN,
                        stock: v.stock,
                      })),
                    },
                  } : {}),
                },
              });
            }
            totalProcessed++;
          } catch {
            totalFailed++;
          }
        }
      } catch (err: any) {
        console.error(`Sync error for ${task.keywords}:`, err.message);
      }
    }

    await prisma.syncLog.update({
      where: { id: log.id },
      data: {
        status: "completed",
        message: `Synced: ${shuffled.map(t => t.category).join(", ")}`,
        itemsProcessed: totalProcessed,
        itemsFailed: totalFailed,
        completedAt: new Date(),
      },
    });

    const totalProducts = await prisma.product.count({ where: { status: "APPROVED" } });

    return NextResponse.json({
      success: true,
      message: `Sincronização concluída! ${totalProcessed} produtos processados.`,
      processed: totalProcessed,
      failed: totalFailed,
      totalProducts,
      categories: shuffled.map(t => t.category),
    });
  } catch (error: any) {
    console.error("Admin sync error:", error);
    return NextResponse.json({ error: "Erro na sincronização: " + error.message }, { status: 500 });
  }
}
