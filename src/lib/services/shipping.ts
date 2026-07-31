/**
 * Calculate shipping cost - realistic for China → Mozambique
 * 
 * LÓGICA:
 * - Produtos caros (margem grande) → FRETE GRÁTIS (absorvido na margem)
 * - Produtos baratos (margem pequena) → Cliente paga frete
 * 
 * Com margem de 25%, o lucro em MT é:
 * - Produto $5 → lucro ~80 MT (não cobre frete)
 * - Produto $20 → lucro ~320 MT (cobre frete standard)
 * - Produto $50+ → lucro ~800+ MT (cobre frete facilmente)
 */

export interface ShippingOption {
  name: string;
  price: number; // in MZN
  days: string;
  free: boolean;
}

export function calculateShipping(productPriceMZN: number, quantity: number = 1): ShippingOption[] {
  const totalValue = productPriceMZN * quantity;

  // Produtos acima de 1500 MT (~$18+): FRETE GRÁTIS
  // Margem de 25% = ~375+ MT de lucro, cobre frete real ($3-5)
  if (totalValue >= 1500) {
    return [
      {
        name: "Envio Standard Grátis",
        price: 0,
        days: "20-40 dias",
        free: true,
      },
      {
        name: "Envio Expresso",
        price: Math.ceil(totalValue * 0.05), // 5% para expresso
        days: "10-18 dias",
        free: false,
      },
    ];
  }

  // Produtos 800-1500 MT (~$10-18): Frete baixo
  // Margem = 200-375 MT, frete real ~$3 = 190 MT
  if (totalValue >= 800) {
    return [
      {
        name: "Envio Standard",
        price: 99,
        days: "25-40 dias",
        free: false,
      },
      {
        name: "Envio Rápido",
        price: 299,
        days: "12-20 dias",
        free: false,
      },
    ];
  }

  // Produtos 400-800 MT (~$5-10): Frete médio
  // Margem = 100-200 MT, não cobre frete
  if (totalValue >= 400) {
    return [
      {
        name: "Envio Standard",
        price: 149,
        days: "30-45 dias",
        free: false,
      },
      {
        name: "Envio Rápido",
        price: 349,
        days: "15-25 dias",
        free: false,
      },
    ];
  }

  // Produtos < 400 MT (< $5): Frete proporcional
  // Margem muito pequena, cliente paga frete
  return [
    {
      name: "Envio Standard",
      price: 199,
      days: "30-50 dias",
      free: false,
    },
    {
      name: "Envio Rápido",
      price: 399,
      days: "15-25 dias",
      free: false,
    },
  ];
}

// Get the cheapest shipping option
export function getCheapestShipping(productPriceMZN: number, quantity: number = 1): ShippingOption {
  const options = calculateShipping(productPriceMZN, quantity);
  return options[0];
}

// Format shipping for display
export function formatShipping(option: ShippingOption): string {
  if (option.free) return "Frete Grátis";
  return `${option.price} MT`;
}
