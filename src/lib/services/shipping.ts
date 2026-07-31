/**
 * Calculate shipping cost based on product price (AliExpress-like estimation)
 * These are realistic estimates for shipping from China to Mozambique
 * 
 * Margin (25%) is on the product price only - shipping is separate
 */

export interface ShippingOption {
  name: string;
  price: number; // in MZN
  days: string; // estimated delivery time
  free: boolean;
}

export function calculateShipping(productPriceMZN: number, quantity: number = 1): ShippingOption[] {
  const options: ShippingOption[] = [];
  const totalValue = productPriceMZN * quantity;

  // Free shipping threshold: above 5000 MT
  if (totalValue >= 5000) {
    options.push({
      name: "AliExpress Standard Shipping",
      price: 0,
      days: "25-45 dias",
      free: true,
    });
    options.push({
      name: "Envio Expresso",
      price: Math.ceil(totalValue * 0.08), // 8% of value
      days: "12-20 dias",
      free: false,
    });
    return options;
  }

  // Products under 500 MT (cheap items)
  if (totalValue < 500) {
    options.push({
      name: "AliExpress Standard Shipping",
      price: 190,
      days: "30-50 dias",
      free: false,
    });
    options.push({
      name: "ePacket",
      price: 320,
      days: "20-35 dias",
      free: false,
    });
    return options;
  }

  // Products 500 - 2000 MT
  if (totalValue < 2000) {
    options.push({
      name: "AliExpress Standard Shipping",
      price: 250,
      days: "25-45 dias",
      free: false,
    });
    options.push({
      name: "ePacket",
      price: 450,
      days: "18-30 dias",
      free: false,
    });
    return options;
  }

  // Products 2000 - 5000 MT
  options.push({
    name: "AliExpress Standard Shipping",
    price: 380,
    days: "25-40 dias",
    free: false,
  });
  options.push({
    name: "Envio Expresso",
    price: 650,
    days: "12-20 dias",
    free: false,
  });

  return options;
}

// Get the cheapest shipping option
export function getCheapestShipping(productPriceMZN: number, quantity: number = 1): ShippingOption {
  const options = calculateShipping(productPriceMZN, quantity);
  return options[0]; // First is always cheapest
}

// Format shipping for display
export function formatShipping(option: ShippingOption): string {
  if (option.free) return "Frete Grátis";
  return `${option.price} MT`;
}
