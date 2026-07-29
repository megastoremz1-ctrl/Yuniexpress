import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { syncProducts } from "@/lib/services/aliexpress";
import { bulkConvertPrices, getExchangeRate } from "@/lib/services/pricing";

// Cron endpoint for automatic sync (protected by secret)
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get("secret") || request.headers.get("x-cron-secret");

    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const syncType = body.type || "all";

    const results: Record<string, any> = {};

    // Sync exchange rate
    if (syncType === "all" || syncType === "exchange_rate") {
      try {
        const rate = await getExchangeRate();
        results.exchangeRate = { success: true, rate };
      } catch (error: any) {
        results.exchangeRate = { success: false, error: error.message };
      }
    }

    // Sync prices (recalculate MZN prices based on current rate)
    if (syncType === "all" || syncType === "prices") {
      try {
        const products = await prisma.product.findMany({
          where: { status: "APPROVED" },
          select: { id: true, priceUSD: true, originalPriceUSD: true },
        });
        await bulkConvertPrices(products);
        results.prices = { success: true, updated: products.length };
      } catch (error: any) {
        results.prices = { success: false, error: error.message };
      }
    }

    // Sync new products from AliExpress
    if (syncType === "all" || syncType === "products") {
      const categories = [
        "electronics",
        "fashion",
        "beauty",
        "home",
        "sports",
        "phones",
      ];
      results.products = [];

      for (const cat of categories) {
        const result = await syncProducts(cat);
        results.products.push({ category: cat, ...result });
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results,
    });
  } catch (error: any) {
    console.error("Sync error:", error);
    return NextResponse.json(
      { error: "Sync failed", message: error.message },
      { status: 500 }
    );
  }
}

// Get sync status/logs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get("secret") || request.headers.get("x-cron-secret");

    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const logs = await prisma.syncLog.findMany({
      orderBy: { startedAt: "desc" },
      take: 20,
    });

    const lastRate = await prisma.exchangeRate.findFirst({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      logs,
      lastExchangeRate: lastRate,
    });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao carregar logs" }, { status: 500 });
  }
}
