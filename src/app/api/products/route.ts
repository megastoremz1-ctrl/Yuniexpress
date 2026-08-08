import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSearchVariants } from "@/lib/translations/dictionary";

/**
 * ============================================================
 * YuniExpress - Products API
 * ============================================================
 *
 * Funcionalidades:
 *
 * - Pesquisa inteligente
 * - Português / Inglês
 * - Relevância por título
 * - Relevância por descrição
 * - Relevância por categoria
 * - Relevância por tags
 * - Deduplicação
 * - Mistura de categorias na listagem normal
 * - Paginação
 * - Filtros
 * - Ordenação
 *
 * REGRA IMPORTANTE:
 *
 * PESQUISA:
 *   relevância > diversidade
 *
 * LISTAGEM NORMAL:
 *   diversidade > ordem fixa
 *
 * ============================================================
 */

/**
 * ============================================================
 * NORMALIZAÇÃO
 * ============================================================
 */

function normalizeText(text: string = ""): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * ============================================================
 * TOKENIZAÇÃO
 * ============================================================
 */

function tokenize(text: string): string[] {
  return Array.from(
    new Set(
      normalizeText(text)
        .split(/\s+/)
        .map((word) => word.trim())
        .filter((word) => word.length >= 2)
    )
  );
}

/**
 * ============================================================
 * VERIFICAR PALAVRAS
 * ============================================================
 */

function allWordsIncluded(
  text: string,
  words: string[]
): boolean {
  const normalized = normalizeText(text);

  if (!normalized || !words.length) {
    return false;
  }

  return words.every((word) =>
    normalized.includes(word)
  );
}

/**
 * ============================================================
 * DEDUPLICAÇÃO
 * ============================================================
 *
 * Prioridade:
 *
 * 1. aliexpressId
 * 2. título + categoria
 *
 * Isto evita o mesmo produto aparecer várias vezes.
 * ============================================================
 */

function getProductDedupKey(
  product: any
): string {
  if (product.aliexpressId) {
    return `ali:${String(
      product.aliexpressId
    ).trim()}`;
  }

  const title = normalizeText(
    product.title || ""
  );

  const category =
    product.category?.id ||
    product.category?.slug ||
    "uncategorized";

  return `title:${title}|category:${category}`;
}

/**
 * ============================================================
 * REMOVER DUPLICADOS
 * ============================================================
 */

function deduplicateProducts(
  products: any[]
): any[] {
  const seen = new Set<string>();
  const result: any[] = [];

  for (const product of products) {
    const key =
      getProductDedupKey(product);

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(product);
  }

  return result;
}

/**
 * ============================================================
 * RELEVÂNCIA DA PESQUISA
 * ============================================================
 *
 * Quanto maior o score:
 * maior a relevância.
 *
 * Ordem de importância:
 *
 * 1. Título exato
 * 2. Frase no título
 * 3. Todas as palavras no título
 * 4. Título em inglês
 * 5. Tags
 * 6. Categoria
 * 7. Descrição
 * 8. Rating / vendas
 *
 * ============================================================
 */

function calculateRelevance(
  product: any,
  search: string
): number {
  const query =
    normalizeText(search);

  const queryWords =
    tokenize(search);

  if (!query || !queryWords.length) {
    return 0;
  }

  const title =
    normalizeText(
      product.title || ""
    );

  const titleEn =
    normalizeText(
      product.titleEn || ""
    );

  const description =
    normalizeText(
      product.description || ""
    );

  const descriptionEn =
    normalizeText(
      product.descriptionEn || ""
    );

  const categoryName =
    normalizeText(
      product.category?.name || ""
    );

  const categorySlug =
    normalizeText(
      product.category?.slug || ""
    );

  const tags =
    Array.isArray(product.tags)
      ? product.tags.map(
          (tag: any) =>
            normalizeText(
              tag.tag || ""
            )
        )
      : [];

  const tagsText =
    tags.join(" ");

  let score = 0;

  /**
   * ==========================================================
   * 1. TÍTULO EXATO
   * ==========================================================
   */

  if (title === query) {
    score += 5000;
  }

  if (titleEn === query) {
    score += 4800;
  }

  /**
   * ==========================================================
   * 2. FRASE COMPLETA NO TÍTULO
   * ==========================================================
   */

  if (
    query.length >= 2 &&
    title.includes(query)
  ) {
    score += 3000;
  }

  if (
    query.length >= 2 &&
    titleEn.includes(query)
  ) {
    score += 2800;
  }

  /**
   * ==========================================================
   * 3. TODAS AS PALAVRAS NO TÍTULO
   * ==========================================================
   */

  const allWordsInTitle =
    allWordsIncluded(
      title,
      queryWords
    );

  const allWordsInTitleEn =
    allWordsIncluded(
      titleEn,
      queryWords
    );

  const allWordsInTags =
    allWordsIncluded(
      tagsText,
      queryWords
    );

  const allWordsInDescription =
    allWordsIncluded(
      description,
      queryWords
    );

  const allWordsInDescriptionEn =
    allWordsIncluded(
      descriptionEn,
      queryWords
    );

  if (allWordsInTitle) {
    score += 2200;
  }

  if (allWordsInTitleEn) {
    score += 2000;
  }

  if (allWordsInTags) {
    score += 900;
  }

  if (allWordsInDescription) {
    score += 500;
  }

  if (allWordsInDescriptionEn) {
    score += 450;
  }

  /**
   * ==========================================================
   * 4. PALAVRAS INDIVIDUAIS
   * ==========================================================
   */

  let titleMatches = 0;
  let titleEnMatches = 0;
  let tagMatches = 0;
  let categoryMatches = 0;
  let descriptionMatches = 0;

  for (const word of queryWords) {
    /**
     * Título
     */
    if (title.includes(word)) {
      titleMatches++;
      score += 500;
    }

    /**
     * Título inglês
     */
    if (titleEn.includes(word)) {
      titleEnMatches++;
      score += 450;
    }

    /**
     * Tags
     */
    if (
      tags.some(
        (tag: string) =>
          tag.includes(word)
      )
    ) {
      tagMatches++;
      score += 220;
    }

    /**
     * Categoria
     */
    if (
      categoryName.includes(word) ||
      categorySlug.includes(word)
    ) {
      categoryMatches++;
      score += 150;
    }

    /**
     * Descrição
     */
    if (
      description.includes(word)
    ) {
      descriptionMatches++;
      score += 80;
    }

    /**
     * Descrição inglês
     */
    if (
      descriptionEn.includes(word)
    ) {
      descriptionMatches++;
      score += 70;
    }
  }

  /**
   * ==========================================================
   * 5. COBERTURA DO TÍTULO
   * ==========================================================
   *
   * Isto é MUITO importante.
   *
   * Pesquisa:
   *
   *   iPhone 15
   *
   * Produto:
   *
   *   iPhone 15 Case
   *
   * deve ficar muito acima de:
   *
   *   Galaxy Charger 15W
   *
   * ==========================================================
   */

  const bestTitleMatches =
    Math.max(
      titleMatches,
      titleEnMatches
    );

  const titleCoverage =
    bestTitleMatches /
    queryWords.length;

  if (
    queryWords.length > 1
  ) {
    /**
     * Todas as palavras
     */
    if (
      bestTitleMatches ===
      queryWords.length
    ) {
      score += 3000;
    }

    /**
     * 75% ou mais
     */
    else if (
      titleCoverage >= 0.75
    ) {
      score += 1000;
    }

    /**
     * Apenas metade
     */
    else if (
      titleCoverage >= 0.5
    ) {
      score += 200;
    }

    /**
     * Muito pouca correspondência
     */
    else {
      score -= 700;
    }
  }

  /**
   * ==========================================================
   * 6. FRASE EXATA EM TAG
   * ==========================================================
   */

  if (
    tags.some(
      (tag: string) =>
        tag === query
    )
  ) {
    score += 1200;
  }

  /**
   * ==========================================================
   * 7. CATEGORIA EXATA
   * ==========================================================
   */

  if (
    categoryName === query ||
    categorySlug === query
  ) {
    score += 800;
  }

  /**
   * ==========================================================
   * 8. POPULARIDADE
   * ==========================================================
   *
   * Só serve como desempate.
   *
   * Nunca deve superar a relevância.
   * ==========================================================
   */

  score += Math.min(
    Number(product.rating || 0) * 10,
    50
  );

  score += Math.min(
    Math.log10(
      Number(product.sold || 0) + 1
    ) * 10,
    50
  );

  /**
   * Pequeno bônus para produtos recentes.
   */
  if (product.createdAt) {
    const ageDays =
      Math.max(
        0,
        (
          Date.now() -
          new Date(
            product.createdAt
          ).getTime()
        ) /
          86400000
      );

    if (ageDays <= 30) {
      score += 10;
    }
  }

  return score;
}

/**
 * ============================================================
 * HASH DETERMINÍSTICO
 * ============================================================
 *
 * Usado apenas para a listagem normal.
 *
 * Não usamos random na pesquisa.
 * ============================================================
 */

function stableHash(
  value: string
): number {
  let hash = 0;

  for (
    let i = 0;
    i < value.length;
    i++
  ) {
    hash =
      (hash * 31 +
        value.charCodeAt(i)) |
      0;
  }

  return Math.abs(hash);
}

/**
 * ============================================================
 * MISTURA DE CATEGORIAS
 * ============================================================
 *
 * IMPORTANTE:
 *
 * Esta função NÃO é utilizada na pesquisa.
 *
 * É utilizada apenas quando o cliente está
 * navegando normalmente pelos produtos.
 *
 * Exemplo:
 *
 * Eletrônicos
 * Casa
 * Moda
 * Beleza
 * Desporto
 * Eletrônicos
 * Casa
 * Moda
 *
 * ============================================================
 */

function diversifyProducts(
  products: any[],
  seed = ""
): any[] {
  if (!products.length) {
    return [];
  }

  const groups =
    new Map<string, any[]>();

  /**
   * Agrupar por categoria
   */
  for (const product of products) {
    const categoryId =
      product.category?.id ||
      product.category?.slug ||
      "uncategorized";

    if (!groups.has(categoryId)) {
      groups.set(
        categoryId,
        []
      );
    }

    groups
      .get(categoryId)!
      .push(product);
  }

  /**
   * Ordenar categorias
   * de forma determinística.
   */
  const categories =
    Array.from(
      groups.keys()
    ).sort((a, b) => {
      const hashA =
        stableHash(
          `${seed}:${a}`
        );

      const hashB =
        stableHash(
          `${seed}:${b}`
        );

      return hashA - hashB;
    });

  const result: any[] = [];

  /**
   * Round-robin
   */
  let index = 0;

  while (true) {
    let added = false;

    for (
      const category of categories
    ) {
      const list =
        groups.get(category) || [];

      if (
        index < list.length
      ) {
        result.push(
          list[index]
        );

        added = true;
      }
    }

    if (!added) {
      break;
    }

    index++;
  }

  return result;
}

/**
 * ============================================================
 * MAP PRODUCT
 * ============================================================
 */

function mapProduct(
  product: any
) {
  return {
    id: product.id,

    title:
      product.title,

    slug:
      product.slug,

    priceMZN:
      product.priceMZN,

    originalPriceMZN:
      product.originalPriceMZN,

    rating:
      product.rating,

    reviewCount:
      product.reviewCount,

    sold:
      product.sold,

    freeShipping:
      product.freeShipping,

    category:
      product.category,

    images:
      Array.isArray(
        product.images
      )
        ? product.images.map(
            (img: any) => ({
              url: img.url,
              alt: img.alt,
            })
          )
        : [],
  };
}

/**
 * ============================================================
 * API
 * ============================================================
 */

export async function GET(
  request: NextRequest
) {
  try {
    const { searchParams } =
      new URL(request.url);

    /**
     * ========================================================
     * PAGINAÇÃO
     * ========================================================
     */

    const page = Math.max(
      1,
      parseInt(
        searchParams.get(
          "page"
        ) || "1"
      )
    );

    const limit = Math.min(
      48,
      Math.max(
        1,
        parseInt(
          searchParams.get(
            "limit"
          ) || "24"
        )
      )
    );

    /**
     * ========================================================
     * FILTROS
     * ========================================================
     */

    const category =
      searchParams.get(
        "category"
      );

    const search =
      searchParams
        .get("search")
        ?.trim() || "";

    const minPrice =
      searchParams.get(
        "minPrice"
      );

    const maxPrice =
      searchParams.get(
        "maxPrice"
      );

    const rating =
      searchParams.get(
        "rating"
      );

    const freeShipping =
      searchParams.get(
        "freeShipping"
      );

    const sort =
      searchParams.get(
        "sort"
      ) || "newest";

    const featured =
      searchParams.get(
        "featured"
      );

    /**
     * ========================================================
     * WHERE BASE
     * ========================================================
     */

    const where: any = {
      status: "APPROVED",
    };

    /**
     * Categoria
     */

    if (category) {
      where.category = {
        slug: category,
      };
    }

    /**
     * Preço mínimo
     */

    if (minPrice) {
      const value =
        parseFloat(minPrice);

      if (
        Number.isFinite(value)
      ) {
        where.priceMZN = {
          ...(where.priceMZN ||
            {}),
          gte: value,
        };
      }
    }

    /**
     * Preço máximo
     */

    if (maxPrice) {
      const value =
        parseFloat(maxPrice);

      if (
        Number.isFinite(value)
      ) {
        where.priceMZN = {
          ...(where.priceMZN ||
            {}),
          lte: value,
        };
      }
    }

    /**
     * Rating
     */

    if (rating) {
      const value =
        parseFloat(rating);

      if (
        Number.isFinite(value)
      ) {
        where.rating = {
          gte: value,
        };
      }
    }

    /**
     * Envio grátis
     */

    if (
      freeShipping === "true"
    ) {
      where.freeShipping = true;
    }

    /**
     * Destaques
     */

    if (
      featured === "true"
    ) {
      where.featured = true;
    }

    /**
     * ========================================================
     * ORDENAÇÃO
     * ========================================================
     */

    let orderBy: any = {
      createdAt: "desc",
    };

    switch (sort) {
      case "price_asc":
        orderBy = {
          priceMZN: "asc",
        };
        break;

      case "price_desc":
        orderBy = {
          priceMZN: "desc",
        };
        break;

      case "popular":
        orderBy = {
          sold: "desc",
        };
        break;

      case "rating":
        orderBy = {
          rating: "desc",
        };
        break;

      case "newest":
      default:
        orderBy = {
          createdAt: "desc",
        };
        break;
    }

    /**
     * ========================================================
     * PESQUISA
     * ========================================================
     *
     * A pesquisa tem tratamento completamente separado.
     *
     * NÃO misturamos categorias aqui.
     *
     * ========================================================
     */

    if (search) {
      const searchVariants =
        getSearchVariants(
          search
        );

      const variants =
        Array.from(
          new Set([
            search,
            ...searchVariants,
          ])
        )
          .map(
            (item) =>
              String(item)
                .trim()
          )
          .filter(Boolean);

      const queryWords =
        tokenize(search);

      /**
       * ======================================================
       * CONDIÇÕES DE FRASE
       * ======================================================
       */

      const phraseConditions =
        variants.flatMap(
          (variant) => [
            {
              title: {
                contains:
                  variant,
                mode:
                  "insensitive",
              },
            },

            {
              titleEn: {
                contains:
                  variant,
                mode:
                  "insensitive",
              },
            },

            {
              description: {
                contains:
                  variant,
                mode:
                  "insensitive",
              },
            },

            {
              descriptionEn: {
                contains:
                  variant,
                mode:
                  "insensitive",
              },
            },

            {
              tags: {
                some: {
                  tag: {
                    contains:
                      variant,
                    mode:
                      "insensitive",
                  },
                },
              },
            },

            {
              category: {
                name: {
                  contains:
                    variant,
                  mode:
                    "insensitive",
                },
              },
            },

            {
              category: {
                slug: {
                  contains:
                    variant,
                  mode:
                    "insensitive",
                },
              },
            },
          ]
        );

      /**
       * ======================================================
       * CONDIÇÕES POR PALAVRA
       * ======================================================
       */

      const wordConditions =
        queryWords.flatMap(
          (word) => [
            {
              title: {
                contains:
                  word,
                mode:
                  "insensitive",
              },
            },

            {
              titleEn: {
                contains:
                  word,
                mode:
                  "insensitive",
              },
            },

            {
              description: {
                contains:
                  word,
                mode:
                  "insensitive",
              },
            },

            {
              descriptionEn: {
                contains:
                  word,
                mode:
                  "insensitive",
              },
            },

            {
              tags: {
                some: {
                  tag: {
                    contains:
                      word,
                    mode:
                      "insensitive",
                  },
                },
              },
            },

            {
              category: {
                name: {
                  contains:
                    word,
                  mode:
                    "insensitive",
                },
              },
            },

            {
              category: {
                slug: {
                  contains:
                    word,
                  mode:
                    "insensitive",
                },
              },
            },
          ]
        );

      where.OR = [
        ...phraseConditions,
        ...wordConditions,
      ];

      /**
       * ======================================================
       * BUSCAR CANDIDATOS
       * ======================================================
       *
       * Buscamos bastante para depois calcular
       * relevância no servidor.
       * ======================================================
       */

      const candidates =
        await prisma.product.findMany({
          where,

          include: {
            images: {
              orderBy: {
                order: "asc",
              },
              take: 1,
            },

            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },

            tags: {
              select: {
                tag: true,
              },
            },
          },

          take: 1500,
        });

      /**
       * ======================================================
       * DEDUPLICAR
       * ======================================================
       */

      const uniqueCandidates =
        deduplicateProducts(
          candidates
        );

      /**
       * ======================================================
       * CALCULAR RELEVÂNCIA
       * ======================================================
       */

      const scored =
        uniqueCandidates
          .map(
            (product: any) => ({
              product,

              score:
                calculateRelevance(
                  product,
                  search
                ),
            })
          )
          .filter(
            (item) =>
              item.score > 0
          );

      /**
       * ======================================================
       * ORDENAR
       * ======================================================
       *
       * IMPORTANTE:
       *
       * Aqui NÃO existe:
       *
       * diversifyProducts()
       *
       * Porque pesquisa deve respeitar relevância.
       * ======================================================
       */

      scored.sort(
        (a, b) => {
          if (
            b.score !==
            a.score
          ) {
            return (
              b.score -
              a.score
            );
          }

          /**
           * Rating
           */

          if (
            Number(
              b.product.rating
            ) !==
            Number(
              a.product.rating
            )
          ) {
            return (
              Number(
                b.product.rating
              ) -
              Number(
                a.product.rating
              )
            );
          }

          /**
           * Vendidos
           */

          if (
            Number(
              b.product.sold
            ) !==
            Number(
              a.product.sold
            )
          ) {
            return (
              Number(
                b.product.sold
              ) -
              Number(
                a.product.sold
              )
            );
          }

          /**
           * Mais recente
           */

          return (
            new Date(
              b.product.createdAt
            ).getTime() -
            new Date(
              a.product.createdAt
            ).getTime()
          );
        }
      );

      /**
       * ======================================================
       * RESULTADO DA PESQUISA
       * ======================================================
       */

      const finalSearchProducts =
        scored.map(
          (item) =>
            item.product
        );

      /**
       * ======================================================
       * PAGINAÇÃO
       * ======================================================
       */

      const total =
        finalSearchProducts.length;

      const start =
        (page - 1) *
        limit;

      const paginated =
        finalSearchProducts.slice(
          start,
          start + limit
        );

      return NextResponse.json({
        products:
          paginated.map(
            mapProduct
          ),

        pagination: {
          page,
          limit,
          total,

          totalPages:
            Math.ceil(
              total / limit
            ),
        },
      });
    }

    /**
     * ========================================================
     * LISTAGEM NORMAL
     * ========================================================
     *
     * Aqui SIM misturamos categorias.
     *
     * Isto é utilizado quando o cliente entra em:
     *
     * /shop
     *
     * ou:
     *
     * Ver mais produtos
     *
     * sem uma pesquisa.
     * ========================================================
     */

    const candidateLimit =
      Math.min(
        1500,
        Math.max(
          limit * 15,
          300
        )
      );

    const candidates =
      await prisma.product.findMany({
        where,

        include: {
          images: {
            orderBy: {
              order: "asc",
            },
            take: 1,
          },

          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },

        orderBy,

        take: candidateLimit,
      });

    /**
     * ========================================================
     * DEDUPLICAR
     * ========================================================
     */

    const uniqueProducts =
      deduplicateProducts(
        candidates
      );

    /**
     * ========================================================
     * MISTURA
     * ========================================================
     *
     * Só fazemos no newest.
     *
     * Se o cliente escolheu:
     *
     * preço
     * popularidade
     * rating
     *
     * respeitamos a ordenação.
     * ========================================================
     */

    let finalProducts =
      uniqueProducts;

    if (
      sort === "newest"
    ) {
      finalProducts =
        diversifyProducts(
          uniqueProducts,
          `products-page:${page}`
        );
    }

    /**
     * ========================================================
     * PAGINAÇÃO
     * ========================================================
     */

    const total =
      finalProducts.length;

    const start =
      (page - 1) *
      limit;

    const paginated =
      finalProducts.slice(
        start,
        start + limit
      );

    /**
     * ========================================================
     * RESPONSE
     * ========================================================
     */

    return NextResponse.json({
      products:
        paginated.map(
          mapProduct
        ),

      pagination: {
        page,
        limit,
        total,

        totalPages:
          Math.ceil(
            total / limit
          ),
      },
    });
  } catch (error) {
    console.error(
      "Products API error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Erro ao carregar produtos",
      },
      {
        status: 500,
      }
    );
  }
}
