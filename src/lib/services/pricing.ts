import axios from "axios";
import { prisma } from "../db";

// Get current exchange rate from database or API
export async function getExchangeRate(): Promise<number> {
  // First, try to get from database (cached rate)
  const cached = await prisma.exchangeRate.findFirst({
    where: {
      fromCurrency: "USD",
      toCurrency: "MZN",
    },
    orderBy: { createdAt: "desc" },
  });

  // If rate is less than 1 hour old, use it
  if (cached && Date.now() - cached.createdAt.getTime() < 3600000) {
    return cached.rate;
  }

  // Otherwise, fetch from exchangeratesapi.io
  try {
    const apiKey = process.env.EXCHANGE_RATE_API_KEY;
    let rate: number;

    if (apiKey) {
      // exchangeratesapi.io (free plan only supports EUR base)
      // So we get EUR→USD and EUR→MZN, then calculate USD→MZN
      const response = await axios.get(
        `https://api.exchangeratesapi.io/v1/latest?access_key=${apiKey}&symbols=USD,MZN`
      );

      if (response.data.success && response.data.rates) {
        const eurToUsd = response.data.rates.USD;
        const eurToMzn = response.data.rates.MZN;
        rate = eurToMzn / eurToUsd; // USD → MZN
      } else {
        throw new Error("API response invalid");
      }
    } else {
      // Fallback: use free API (no key needed)
      const response = await axios.get(
        "https://api.exchangerate-api.com/v4/latest/USD"
      );
      rate = response.data.rates.MZN || 63.5;
    }

    // Save to database
    await prisma.exchangeRate.create({
      data: {
        fromCurrency: "USD",
        toCurrency: "MZN",
        rate,
        source: apiKey ? "exchangeratesapi.io" : "free-api",
      },
    });

    console.log(`Exchange rate updated: 1 USD = ${rate.toFixed(2)} MZN`);
    return rate;
  } catch (error) {
    // If API fails, use cached or default
    if (cached) return cached.rate;
    return 63.5; // Default fallback rate
  }
}

// Get the configured margin percentage
export async function getMarginPercent(): Promise<number> {
  const setting = await prisma.setting.findUnique({
    where: { key: "default_margin_percent" },
  });

  if (setting) {
    return parseFloat(setting.value);
  }

  return parseFloat(process.env.DEFAULT_MARGIN_PERCENT || "25");
}

// Convert USD price to MZN with margin AND estimated shipping included
export async function convertPrice(
  priceUSD: number,
  originalPriceUSD?: number,
  customMargin?: number
): Promise<{
  priceMZN: number;
  originalPriceMZN: number | null;
}> {
  const rate = await getExchangeRate();
  const margin = customMargin ?? (await getMarginPercent());

  // Estimate shipping cost based on product price (China → Mozambique)
  // Real AliExpress shipping to MZ: ~$3-5 for cheap items, $15-50 for expensive/heavy
  const estimatedShippingUSD = estimateShippingCost(priceUSD);

  // Final price = (product + shipping) × rate × margin
  const totalUSD = priceUSD + estimatedShippingUSD;
  const basePriceMZN = totalUSD * rate;
  const priceMZN = Math.ceil(basePriceMZN * (1 + margin / 100));

  let originalPriceMZN: number | null = null;
  if (originalPriceUSD && originalPriceUSD > priceUSD) {
    const totalOriginalUSD = originalPriceUSD + estimatedShippingUSD;
    const baseOriginalMZN = totalOriginalUSD * rate;
    originalPriceMZN = Math.ceil(baseOriginalMZN * (1 + margin / 100));
  }

  return { priceMZN, originalPriceMZN };
}

// Estimate real shipping cost from China to Mozambique based on product value
function estimateShippingCost(priceUSD: number): number {
  // Based on real AliExpress shipping rates to Africa/Mozambique:
  // - Items < $5: shipping ~$2-3
  // - Items $5-20: shipping ~$3-5
  // - Items $20-50: shipping ~$5-10
  // - Items $50-100: shipping ~$10-20
  // - Items $100-200: shipping ~$20-40
  // - Items $200+: shipping ~$40-60
  if (priceUSD < 5) return 2.5;
  if (priceUSD < 20) return 4;
  if (priceUSD < 50) return 8;
  if (priceUSD < 100) return 15;
  if (priceUSD < 200) return 30;
  return 50;
}

// Bulk convert prices (for sync operations)
export async function bulkConvertPrices(
  products: Array<{ id: string; priceUSD: number; originalPriceUSD: number }>
): Promise<void> {
  const rate = await getExchangeRate();
  const margin = await getMarginPercent();

  for (const product of products) {
    const basePriceMZN = product.priceUSD * rate;
    const priceMZN = Math.ceil(basePriceMZN * (1 + margin / 100));

    let originalPriceMZN: number | null = null;
    if (product.originalPriceUSD > product.priceUSD) {
      const baseOriginalMZN = product.originalPriceUSD * rate;
      originalPriceMZN = Math.ceil(baseOriginalMZN * (1 + margin / 100));
    }

    await prisma.product.update({
      where: { id: product.id },
      data: { priceMZN, originalPriceMZN },
    });
  }
}

// Format price for display
export function formatPriceMZN(price: number): string {
  return new Intl.NumberFormat("pt-MZ", {
    style: "currency",
    currency: "MZN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}
