/**
 * Portuguese ↔ English Translation Dictionary
 * 
 * Covers common product search terms used in Mozambique e-commerce.
 * Bidirectional: can translate PT→EN and EN→PT.
 * 
 * Categories covered:
 * - Electronics & Tech
 * - Fashion & Clothing
 * - Home & Garden
 * - Beauty & Health
 * - Sports & Fitness
 * - Automotive
 * - Toys & Games
 * - Accessories
 * - General descriptors
 */

// Format: [Portuguese, English]
const DICTIONARY: [string, string][] = [
  // === ELECTRONICS & TECH ===
  ["telemóvel", "phone"],
  ["telemovel", "phone"],
  ["celular", "phone"],
  ["smartphone", "smartphone"],
  ["computador", "computer"],
  ["portátil", "laptop"],
  ["portatil", "laptop"],
  ["teclado", "keyboard"],
  ["rato", "mouse"],
  ["ecrã", "screen"],
  ["ecra", "screen"],
  ["monitor", "monitor"],
  ["fones", "earphones"],
  ["fones de ouvido", "headphones"],
  ["auriculares", "earbuds"],
  ["auscultadores", "headphones"],
  ["carregador", "charger"],
  ["cabo", "cable"],
  ["cabo usb", "usb cable"],
  ["bateria", "battery"],
  ["powerbank", "power bank"],
  ["coluna", "speaker"],
  ["alto-falante", "speaker"],
  ["caixa de som", "bluetooth speaker"],
  ["câmara", "camera"],
  ["camara", "camera"],
  ["câmera", "camera"],
  ["webcam", "webcam"],
  ["impressora", "printer"],
  ["pen drive", "flash drive"],
  ["disco externo", "external hard drive"],
  ["memória", "memory card"],
  ["cartão de memória", "memory card"],
  ["tablet", "tablet"],
  ["relógio inteligente", "smartwatch"],
  ["relogio inteligente", "smartwatch"],
  ["pulseira inteligente", "smart band"],
  ["drone", "drone"],
  ["consola", "console"],
  ["controlo", "controller"],
  ["gamepad", "gamepad"],
  ["projetor", "projector"],
  ["router", "router"],
  ["adaptador", "adapter"],
  ["conversor", "converter"],
  ["hub usb", "usb hub"],
  ["microfone", "microphone"],
  ["tripé", "tripod"],
  ["tripe", "tripod"],
  ["ring light", "ring light"],
  ["luz led", "led light"],
  ["ventoinha", "fan"],
  ["refrigeração", "cooling"],

  // === CAPAS & PROTECÇÃO ===
  ["capa", "case"],
  ["capa de telemóvel", "phone case"],
  ["capa de telemovel", "phone case"],
  ["capa de silicone", "silicone case"],
  ["capa magnética", "magnetic case"],
  ["película", "screen protector"],
  ["pelicula", "screen protector"],
  ["vidro temperado", "tempered glass"],
  ["protector de ecrã", "screen protector"],

  // === FASHION & CLOTHING ===
  ["roupa", "clothes"],
  ["vestido", "dress"],
  ["camisa", "shirt"],
  ["camiseta", "t-shirt"],
  ["t-shirt", "t-shirt"],
  ["calças", "pants"],
  ["calcas", "pants"],
  ["calças de ganga", "jeans"],
  ["jeans", "jeans"],
  ["saia", "skirt"],
  ["casaco", "jacket"],
  ["blusão", "jacket"],
  ["blusao", "jacket"],
  ["hoodie", "hoodie"],
  ["suéter", "sweater"],
  ["fato", "suit"],
  ["fato de treino", "tracksuit"],
  ["shorts", "shorts"],
  ["calções", "shorts"],
  ["calcoes", "shorts"],
  ["cueca", "underwear"],
  ["soutien", "bra"],
  ["meia", "socks"],
  ["meias", "socks"],
  ["pijama", "pajamas"],
  ["biquíni", "bikini"],
  ["biquini", "bikini"],
  ["maiô", "swimsuit"],
  ["chapéu", "hat"],
  ["chapeu", "hat"],
  ["boné", "cap"],
  ["bone", "cap"],
  ["lenço", "scarf"],
  ["lenco", "scarf"],
  ["gravata", "tie"],
  ["cinto", "belt"],
  ["luvas", "gloves"],

  // === SHOES ===
  ["sapatos", "shoes"],
  ["sapato", "shoes"],
  ["ténis", "sneakers"],
  ["tenis", "sneakers"],
  ["sapatilhas", "sneakers"],
  ["botas", "boots"],
  ["sandálias", "sandals"],
  ["sandalias", "sandals"],
  ["chinelos", "slippers"],
  ["salto alto", "high heels"],

  // === ACCESSORIES ===
  ["relógio", "watch"],
  ["relogio", "watch"],
  ["óculos", "glasses"],
  ["oculos", "glasses"],
  ["óculos de sol", "sunglasses"],
  ["oculos de sol", "sunglasses"],
  ["pulseira", "bracelet"],
  ["colar", "necklace"],
  ["brincos", "earrings"],
  ["anel", "ring"],
  ["carteira", "wallet"],
  ["mala", "bag"],
  ["mochila", "backpack"],
  ["bolsa", "handbag"],
  ["mala de viagem", "travel bag"],
  ["mala de mão", "handbag"],

  // === HOME & GARDEN ===
  ["casa", "home"],
  ["cozinha", "kitchen"],
  ["panela", "pot"],
  ["frigideira", "frying pan"],
  ["prato", "plate"],
  ["copo", "cup"],
  ["garrafa", "bottle"],
  ["garrafa térmica", "thermos bottle"],
  ["toalha", "towel"],
  ["lençol", "bed sheet"],
  ["almofada", "pillow"],
  ["cortina", "curtain"],
  ["tapete", "rug"],
  ["candeeiro", "lamp"],
  ["lâmpada", "light bulb"],
  ["lampada", "bulb"],
  ["ventilador", "fan"],
  ["ar condicionado", "air conditioner"],
  ["aspirador", "vacuum cleaner"],
  ["organizador", "organizer"],
  ["prateleira", "shelf"],
  ["espelho", "mirror"],
  ["vaso", "vase"],
  ["planta artificial", "artificial plant"],
  ["decoração", "decoration"],
  ["decoracao", "decoration"],
  ["moldura", "photo frame"],
  ["relógio de parede", "wall clock"],
  ["ferramentas", "tools"],
  ["chave de fenda", "screwdriver"],
  ["alicate", "pliers"],
  ["fita", "tape"],

  // === BEAUTY & HEALTH ===
  ["maquilhagem", "makeup"],
  ["batom", "lipstick"],
  ["base", "foundation"],
  ["rímel", "mascara"],
  ["rimel", "mascara"],
  ["sombra", "eyeshadow"],
  ["pincel", "brush"],
  ["pincéis", "brushes"],
  ["perfume", "perfume"],
  ["creme", "cream"],
  ["protetor solar", "sunscreen"],
  ["shampoo", "shampoo"],
  ["condicionador", "conditioner"],
  ["secador", "hair dryer"],
  ["alisador", "hair straightener"],
  ["máquina de barbear", "electric shaver"],
  ["escova de dentes", "toothbrush"],
  ["escova elétrica", "electric toothbrush"],
  ["balança", "scale"],
  ["termómetro", "thermometer"],
  ["massajador", "massager"],
  ["unhas", "nails"],
  ["extensão de cabelo", "hair extension"],
  ["peruca", "wig"],

  // === SPORTS & FITNESS ===
  ["desporto", "sports"],
  ["bola", "ball"],
  ["bola de futebol", "football"],
  ["futebol", "football"],
  ["basquetebol", "basketball"],
  ["ginásio", "gym"],
  ["halteres", "dumbbells"],
  ["tapete de yoga", "yoga mat"],
  ["bicicleta", "bicycle"],
  ["capacete", "helmet"],
  ["garrafa de água", "water bottle"],
  ["pesca", "fishing"],
  ["camping", "camping"],
  ["tenda", "tent"],
  ["saco de dormir", "sleeping bag"],
  ["lanterna", "flashlight"],

  // === AUTOMOTIVE ===
  ["carro", "car"],
  ["automóvel", "automobile"],
  ["pneu", "tire"],
  ["volante", "steering wheel"],
  ["GPS", "GPS"],
  ["câmera de ré", "backup camera"],
  ["suporte de telemóvel", "phone mount"],
  ["ambientador", "car air freshener"],
  ["aspirador de carro", "car vacuum"],
  ["lavagem", "car wash"],
  ["limpeza", "cleaning"],
  ["luz led carro", "car led light"],

  // === TOYS & KIDS ===
  ["brinquedo", "toy"],
  ["brinquedos", "toys"],
  ["boneca", "doll"],
  ["carrinho", "toy car"],
  ["lego", "building blocks"],
  ["puzzle", "puzzle"],
  ["peluche", "plush toy"],
  ["bebé", "baby"],
  ["bebe", "baby"],
  ["fralda", "diaper"],
  ["biberão", "baby bottle"],
  ["carrinho de bebé", "stroller"],

  // === GENERAL DESCRIPTORS ===
  ["barato", "cheap"],
  ["novo", "new"],
  ["grande", "big"],
  ["pequeno", "small"],
  ["mini", "mini"],
  ["sem fio", "wireless"],
  ["sem fios", "wireless"],
  ["bluetooth", "bluetooth"],
  ["portátil", "portable"],
  ["impermeável", "waterproof"],
  ["impermeavel", "waterproof"],
  ["original", "original"],
  ["profissional", "professional"],
  ["infantil", "kids"],
  ["masculino", "men"],
  ["feminino", "women"],
  ["homem", "men"],
  ["mulher", "women"],
  ["preto", "black"],
  ["branco", "white"],
  ["vermelho", "red"],
  ["azul", "blue"],
  ["verde", "green"],
  ["rosa", "pink"],
  ["dourado", "gold"],
  ["prateado", "silver"],
];

// Build lookup maps for fast O(1) translations
const ptToEnMap = new Map<string, string>();
const enToPtMap = new Map<string, string>();

DICTIONARY.forEach(([pt, en]) => {
  ptToEnMap.set(pt.toLowerCase(), en.toLowerCase());
  enToPtMap.set(en.toLowerCase(), pt.toLowerCase());
});

/**
 * Translate a single term from Portuguese to English
 */
export function translatePtToEn(term: string): string | null {
  return ptToEnMap.get(term.toLowerCase()) || null;
}

/**
 * Translate a single term from English to Portuguese
 */
export function translateEnToPt(term: string): string | null {
  return enToPtMap.get(term.toLowerCase()) || null;
}

/**
 * Translate a full search query from Portuguese to English.
 * Tries multi-word matches first (greedy), then single words.
 * Returns the original + translated version for broader search.
 */
export function translateSearchQuery(query: string): {
  original: string;
  translated: string;
  hasTranslation: boolean;
} {
  const normalized = query.trim().toLowerCase();
  
  // 1. Try full phrase match first
  const fullMatch = ptToEnMap.get(normalized);
  if (fullMatch) {
    return { original: query, translated: fullMatch, hasTranslation: true };
  }

  // 2. Try multi-word combinations (greedy matching)
  const words = normalized.split(/\s+/);
  const translatedWords: string[] = [];
  let hasAnyTranslation = false;
  let i = 0;

  while (i < words.length) {
    let matched = false;

    // Try longest phrases first (up to 4 words)
    for (let len = Math.min(4, words.length - i); len > 0; len--) {
      const phrase = words.slice(i, i + len).join(" ");
      const translation = ptToEnMap.get(phrase);

      if (translation) {
        translatedWords.push(translation);
        hasAnyTranslation = true;
        i += len;
        matched = true;
        break;
      }
    }

    // No match found, keep original word
    if (!matched) {
      translatedWords.push(words[i]);
      i++;
    }
  }

  return {
    original: query,
    translated: translatedWords.join(" "),
    hasTranslation: hasAnyTranslation,
  };
}

/**
 * Get search variants for a query.
 * Returns both the original query and translated versions to search with.
 * This maximizes search results by searching in both languages.
 */
export function getSearchVariants(query: string): string[] {
  const variants = new Set<string>();
  const normalized = query.trim().toLowerCase();
  
  // Always include original
  variants.add(normalized);

  // Try PT → EN
  const ptToEn = translateSearchQuery(normalized);
  if (ptToEn.hasTranslation) {
    variants.add(ptToEn.translated);
  }

  // Try EN → PT (in case user searches in English)
  const enTranslation = enToPtMap.get(normalized);
  if (enTranslation) {
    variants.add(enTranslation);
  }

  // Also try individual words
  const words = normalized.split(/\s+/);
  words.forEach((word) => {
    const enWord = ptToEnMap.get(word);
    if (enWord) variants.add(enWord);
    const ptWord = enToPtMap.get(word);
    if (ptWord) variants.add(ptWord);
  });

  return Array.from(variants);
}

/**
 * Dictionary stats for debugging
 */
export function getDictionaryStats() {
  return {
    totalTerms: DICTIONARY.length,
    ptToEnEntries: ptToEnMap.size,
    enToPtEntries: enToPtMap.size,
  };
}
