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

// Convert USD price to MZN with margin
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

  // Apply conversion and margin
  const basePriceMZN = priceUSD * rate;
  const priceMZN = Math.ceil(basePriceMZN * (1 + margin / 100));

  let originalPriceMZN: number | null = null;
  if (originalPriceUSD && originalPriceUSD > priceUSD) {
    const baseOriginalMZN = originalPriceUSD * rate;
    originalPriceMZN = Math.ceil(baseOriginalMZN * (1 + margin / 100));
  }

  return { priceMZN, originalPriceMZN };
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
