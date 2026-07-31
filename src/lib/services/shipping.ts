/**
 * Shipping is INCLUDED in the product price (hidden from customer)
 * 
 * Formula: Price = (productUSD + shippingUSD) × rate × margin
 * Customer sees: "Frete Grátis" (because it's already in the price)
 * 
 * Real shipping costs (China → Mozambique):
 * - Items < $5: ~$2.5
 * - Items $5-20: ~$4
 * - Items $20-50: ~$8
 * - Items $50-100: ~$15
 * - Items $100-200: ~$30
 * - Items $200+: ~$50
 */

export interface ShippingOption {
  name: string;
  price: number;
  days: string;
  free: boolean;
}

// Shipping is always "free" for the customer (included in product price)
export function calculateShipping(productPriceMZN: number, quantity: number = 1): ShippingOption[] {
  return [
    {
      name: "Envio Standard para Moçambique",
      price: 0,
      days: "15-40 dias",
      free: true,
    },
  ];
}

export function getCheapestShipping(productPriceMZN: number, quantity: number = 1): ShippingOption {
  return {
    name: "Envio Standard para Moçambique",
    price: 0,
    days: "15-40 dias",
    free: true,
  };
}

// Estimate shipping cost in USD (used internally for pricing)
export function estimateShippingUSD(priceUSD: number): number {
  if (priceUSD < 5) return 2.5;
  if (priceUSD < 20) return 4;
  if (priceUSD < 50) return 8;
  if (priceUSD < 100) return 15;
  if (priceUSD < 200) return 30;
  return 50;
}

export function formatShipping(option: ShippingOption): string {
  return "Frete Grátis";
}
