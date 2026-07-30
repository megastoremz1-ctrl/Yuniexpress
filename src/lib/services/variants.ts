/**
 * Extract product variants from AliExpress product title
 * Uses smart detection to determine the correct variant type
 * Priority: electronics → phone cases → watches → storage → length → clothing → shoes
 */
export function extractVariantsFromTitle(
  title: string,
  basePriceMZN: number
): { name: string; value: string; priceMZN: number; stock: number }[] {
  const titleLower = title.toLowerCase();

  // ===== ELECTRONICS (earbuds, headphones, speakers) → COLORS =====
  if (titleLower.match(/earphone|earbuds|earbud|headphone|headset|tws|airpod|speaker|bluetooth.*head|head.*bluetooth/)) {
    return [
      { name: "Cor", value: "Preto", priceMZN: basePriceMZN, stock: 50 },
      { name: "Cor", value: "Branco", priceMZN: basePriceMZN, stock: 40 },
      { name: "Cor", value: "Azul", priceMZN: basePriceMZN, stock: 30 },
    ];
  }

  // ===== PHONE CASES → PHONE MODEL =====
  if (titleLower.match(/phone case|phone cover|capa.*celular|protetor|screen protector|tempered glass/)) {
    return [
      { name: "Modelo", value: "iPhone 15/15 Pro", priceMZN: basePriceMZN, stock: 50 },
      { name: "Modelo", value: "iPhone 14/14 Pro", priceMZN: basePriceMZN, stock: 40 },
      { name: "Modelo", value: "Samsung S24/S23", priceMZN: Math.ceil(basePriceMZN * 1.05), stock: 40 },
      { name: "Modelo", value: "Samsung A54/A34", priceMZN: basePriceMZN, stock: 50 },
      { name: "Modelo", value: "Xiaomi/Redmi", priceMZN: basePriceMZN, stock: 35 },
    ];
  }

  // ===== SMARTWATCHES → SIZE =====
  if (titleLower.match(/smart\s*watch|smartwatch|watch band|watch strap|relogio.*inteligente/)) {
    return [
      { name: "Tamanho", value: "42mm", priceMZN: basePriceMZN, stock: 35 },
      { name: "Tamanho", value: "44mm", priceMZN: Math.ceil(basePriceMZN * 1.05), stock: 35 },
      { name: "Tamanho", value: "46mm", priceMZN: Math.ceil(basePriceMZN * 1.1), stock: 30 },
    ];
  }

  // ===== MICE, KEYBOARDS → COLORS =====
  if (titleLower.match(/mouse|keyboard|teclado|gamepad|controller|joystick/)) {
    return [
      { name: "Cor", value: "Preto", priceMZN: basePriceMZN, stock: 50 },
      { name: "Cor", value: "Branco", priceMZN: basePriceMZN, stock: 40 },
    ];
  }

  // ===== STORAGE (USB, SD, SSD) - must have 2+ sizes in title =====
  const storageMatch = title.match(/\b(\d+)\s*(?:GB|TB)\b/gi);
  if (storageMatch && storageMatch.length >= 2 && titleLower.match(/usb|flash|drive|memory|card|sd|ssd|pendrive|pen drive/)) {
    const sizes = [...new Set(storageMatch.map(s => s.trim().toUpperCase()))].slice(0, 5);
    const baseSize = parseInt(sizes[0]) || 1;
    return sizes.map((size, i) => {
      const sizeNum = parseInt(size) || 1;
      const multiplier = Math.max(1, Math.log2(sizeNum / baseSize) + 1);
      return { name: "Capacidade", value: size, priceMZN: Math.ceil(basePriceMZN * multiplier), stock: 45 - i * 5 };
    });
  }

  // ===== LED STRIPS, CABLES, WIRES - only for actual length products =====
  if (titleLower.match(/led.*strip|strip.*led|light.*strip|cable|charging.*cable|usb.*cable|wire|fita.*led|rgb.*strip/)) {
    const lengthMatch = title.match(/\b(\d+)\s*m\b/gi);
    if (lengthMatch && lengthMatch.length >= 2) {
      const lengths = [...new Set(lengthMatch.map(s => s.trim().toLowerCase()))].slice(0, 5);
      const baseLen = parseInt(lengths[0]) || 1;
      return lengths.map((len) => {
        const lenNum = parseInt(len) || 1;
        return { name: "Comprimento", value: len, priceMZN: Math.ceil(basePriceMZN * Math.max(1, lenNum / baseLen)), stock: 40 };
      });
    }
  }

  // ===== CLOTHING → SIZES =====
  if (titleLower.match(/dress|shirt|jacket|hoodie|pants|blouse|sweater|coat|skirt|t-shirt|top|vest|jeans|shorts/)) {
    return [
      { name: "Tamanho", value: "S", priceMZN: basePriceMZN, stock: 25 },
      { name: "Tamanho", value: "M", priceMZN: basePriceMZN, stock: 35 },
      { name: "Tamanho", value: "L", priceMZN: basePriceMZN, stock: 35 },
      { name: "Tamanho", value: "XL", priceMZN: Math.ceil(basePriceMZN * 1.05), stock: 25 },
      { name: "Tamanho", value: "XXL", priceMZN: Math.ceil(basePriceMZN * 1.1), stock: 15 },
    ];
  }

  // ===== SHOES → SIZES =====
  if (titleLower.match(/shoe|sneaker|boot|sandal|slipper|loafer|sapato|tenis/)) {
    return [
      { name: "Tamanho", value: "39", priceMZN: basePriceMZN, stock: 20 },
      { name: "Tamanho", value: "40", priceMZN: basePriceMZN, stock: 25 },
      { name: "Tamanho", value: "41", priceMZN: basePriceMZN, stock: 30 },
      { name: "Tamanho", value: "42", priceMZN: basePriceMZN, stock: 30 },
      { name: "Tamanho", value: "43", priceMZN: basePriceMZN, stock: 25 },
      { name: "Tamanho", value: "44", priceMZN: basePriceMZN, stock: 15 },
    ];
  }

  // ===== BAGS → COLORS =====
  if (titleLower.match(/bag|backpack|mochila|purse|wallet|carteira|handbag/)) {
    return [
      { name: "Cor", value: "Preto", priceMZN: basePriceMZN, stock: 40 },
      { name: "Cor", value: "Castanho", priceMZN: basePriceMZN, stock: 30 },
      { name: "Cor", value: "Azul Marinho", priceMZN: basePriceMZN, stock: 25 },
    ];
  }

  // ===== POWER BANKS → CAPACITY =====
  if (titleLower.match(/power bank|powerbank|portable charger|bateria.*portatil/)) {
    return [
      { name: "Capacidade", value: "10000mAh", priceMZN: basePriceMZN, stock: 40 },
      { name: "Capacidade", value: "20000mAh", priceMZN: Math.ceil(basePriceMZN * 1.5), stock: 30 },
      { name: "Capacidade", value: "30000mAh", priceMZN: Math.ceil(basePriceMZN * 2), stock: 20 },
    ];
  }

  // No variants detected
  return [];
}
