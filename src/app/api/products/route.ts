import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSearchVariants } from "@/lib/translations/dictionary";

/**
 * ============================================================
 * YuniExpress - Products API
 * ============================================================
 *
 * Recursos:
 *
 * - Pesquisa inteligente
 * - Relevância por título
 * - Relevância por descrição
 * - Relevância por categoria
 * - Relevância por tags
 * - Traduções / variantes de pesquisa
 * - Mistura inteligente de categorias
 * - Paginação
 * - Filtros
 * - Ordenação
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
    .trim();
}

/**
 * ============================================================
 * TOKENIZAÇÃO
 * ============================================================
 */

function tokenize(text: string): string[] {
  return normalizeText(text)
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length >= 2);
}

/**
 * ============================================================
 * RELEVÂNCIA DA PESQUISA
 * ============================================================
 */

function calculateRelevance(
  product: any,
  search: string
): number {
  const query = normalizeText(search);
  const queryWords = tokenize(search);

  const title = normalizeText(product.title);
  const titleEn = normalizeText(product.titleEn || "");

  const description = normalizeText(
    product.description || ""
  );

  const descriptionEn = normalizeText(
    product.descriptionEn || ""
  );

  const categoryName = normalizeText(
    product.category?.name || ""
  );

  const categorySlug = normalizeText(
    product.category?.slug || ""
  );

  const tags = Array.isArray(product.tags)
    ? product.tags.map((tag: any) =>
        normalizeText(tag.tag || "")
      )
    : [];

  let score = 0;

  /**
   * ==========================================================
   * TÍTULO EXATO
   * ==========================================================
   */

  if (title === query) {
    score += 1000;
  }

  if (titleEn === query) {
    score += 950;
  }

  /**
   * ==========================================================
   * TÍTULO CONTÉM PESQUISA
   * ==========================================================
   */

  if (title.includes(query)) {
    score += 500;
  }

  if (titleEn.includes(query)) {
    score += 450;
  }

  /**
   * ==========================================================
   * PALAVRAS INDIVIDUAIS
   * ==========================================================
   */

  for (const word of queryWords) {
    if (title.includes(word)) {
      score += 120;
    }

    if (titleEn.includes(word)) {
      score += 100;
    }

    if (description.includes(word)) {
      score += 20;
    }

    if (descriptionEn.includes(word)) {
      score += 15;
    }

    if (categoryName.includes(word)) {
      score += 80;
    }

    if (categorySlug.includes(word)) {
      score += 70;
    }

    if (
      tags.some((tag: string) =>
        tag.includes(word)
      )
    ) {
      score += 100;
    }
  }

  /**
   * ==========================================================
   * CATEGORIA EXATA
   * ==========================================================
   */

  if (categoryName === query) {
    score += 250;
  }

  /**
   * ==========================================================
   * TAG EXATA
   * ==========================================================
   */

  if (
    tags.some(
      (tag: string) => tag === query
    )
  ) {
    score += 300;
  }

  /**
   * ==========================================================
   * POPULARIDADE
   * ==========================================================
   */

  score += Math.min(
    Number(product.rating || 0) * 5,
    25
  );

  score += Math.min(
    Math.log10(
      Number(product.sold || 0) + 1
    ) * 5,
    25
  );

  return score;
}

/**
 * ============================================================
 * MISTURA INTELIGENTE DE CATEGORIAS
 * ============================================================
 *
 * Exemplo:
 *
 * Categoria A
 * Categoria B
 * Categoria C
 *
 * Resultado:
 *
 * A1
 * B1
 * C1
 * A2
 * B2
 * C2
 *
 * Isso evita que uma categoria domine toda a página.
 */

function diversifyProducts(
  products: any[]
): any[] {
  if (!products.length) {
    return [];
  }

  const groups = new Map<string, any[]>();

  /**
   * Agrupar produtos por categoria
   */
  for (const product of products) {
    const categoryId =
      product.category?.id ||
      product.category?.slug ||
      "uncategorized";

    if (!groups.has(categoryId)) {
      groups.set(categoryId, []);
    }

    groups.get(categoryId)!.push(product);
  }

  /**
   * Embaralhar a ordem das categorias
   */
  const categories = Array.from(
    groups.keys()
  ).sort(() => Math.random() - 0.5);

  const result: any[] = [];

  /**
   * Índice de cada categoria
   */
  const indexes = new Map<string, number>();

  for (const category of categories) {
    indexes.set(category, 0);

    /**
     * Embaralhar produtos dentro da categoria
     */
    const list = groups.get(category)!;

    list.sort(
      () => Math.random() - 0.5
    );
  }

  /**
   * Round-robin:
   *
   * pega 1 produto de cada categoria
   * antes de voltar para a primeira.
   */

  let hasProducts = true;

  while (hasProducts) {
    hasProducts = false;

    /**
     * Reembaralhar ligeiramente
     * as categorias a cada rodada.
     */
    const roundCategories = [
      ...categories,
    ].sort(
      () => Math.random() - 0.5
    );

    for (const category of roundCategories) {
      const list =
        groups.get(category) || [];

      const index =
        indexes.get(category) || 0;

      if (index < list.length) {
        result.push(list[index]);

        indexes.set(
          category,
          index + 1
        );

        hasProducts = true;
      }
    }
  }

  return result;
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
        searchParams.get("page") || "1"
      )
    );

    const limit = Math.min(
      48,
      Math.max(
        1,
        parseInt(
          searchParams.get("limit") || "24"
        )
      )
    );

    /**
     * ========================================================
     * FILTROS
     * ========================================================
     */

    const category =
      searchParams.get("category");

    const search =
      searchParams
        .get("search")
        ?.trim() || "";

    const minPrice =
      searchParams.get("minPrice");

    const maxPrice =
      searchParams.get("maxPrice");

    const rating =
      searchParams.get("rating");

    const freeShipping =
      searchParams.get(
        "freeShipping"
      );

    const sort =
      searchParams.get("sort") ||
      "newest";

    const featured =
      searchParams.get("featured");

    /**
     * ========================================================
     * WHERE BASE
     * ========================================================
     */

    const where: any = {
      status: "APPROVED",
    };

    /**
     * ========================================================
     * CATEGORIA
     * ========================================================
     */

    if (category) {
      where.category = {
        slug: category,
      };
    }

    /**
     * ========================================================
     * PREÇO MÍNIMO
     * ========================================================
     */

    if (minPrice) {
      where.priceMZN = {
        ...(where.priceMZN || {}),
        gte: parseFloat(minPrice),
      };
    }

    /**
     * ========================================================
     * PREÇO MÁXIMO
     * ========================================================
     */

    if (maxPrice) {
      where.priceMZN = {
        ...(where.priceMZN || {}),
        lte: parseFloat(maxPrice),
      };
    }

    /**
     * ========================================================
     * RATING
     * ========================================================
     */

    if (rating) {
      where.rating = {
        gte: parseFloat(rating),
      };
    }

    /**
     * ========================================================
     * ENVIO GRÁTIS
     * ========================================================
     */

    if (freeShipping === "true") {
      where.freeShipping = true;
    }

    /**
     * ========================================================
     * PRODUTOS EM DESTAQUE
     * ========================================================
     */

    if (featured === "true") {
      where.featured = true;
    }

    /**
     * ========================================================
     * PESQUISA
     * ========================================================
     */

    if (search) {
      const searchVariants =
        getSearchVariants(search);

      const normalizedSearch =
        normalizeText(search);

      const queryWords =
        tokenize(search);

      const variants =
        Array.from(
          new Set([
            search,
            normalizedSearch,
            ...searchVariants,
          ])
        ).filter(Boolean);

      /**
       * Pesquisa por frases/variantes
       */
      const phraseConditions =
        variants.flatMap(
          (variant) => [
            {
              title: {
                contains: variant,
                mode: "insensitive",
              },
            },

            {
              titleEn: {
                contains: variant,
                mode: "insensitive",
              },
            },

            {
              description: {
                contains: variant,
                mode: "insensitive",
              },
            },

            {
              descriptionEn: {
                contains: variant,
                mode: "insensitive",
              },
            },

            {
              tags: {
                some: {
                  tag: {
                    contains: variant,
                    mode: "insensitive",
                  },
                },
              },
            },

            {
              category: {
                name: {
                  contains: variant,
                  mode: "insensitive",
                },
              },
            },

            {
              category: {
                slug: {
                  contains: variant,
                  mode: "insensitive",
                },
              },
            },
          ]
        );

      /**
       * Pesquisa por palavras individuais.
       *
       * Isso melhora casos como:
       *
       * "fone bluetooth"
       *
       * quando o título contém:
       *
       * "Wireless TWS Bluetooth Earbuds"
       */

      const wordConditions =
        queryWords.flatMap(
          (word) => [
            {
              title: {
                contains: word,
                mode: "insensitive",
              },
            },

            {
              titleEn: {
                contains: word,
                mode: "insensitive",
              },
            },

            {
              description: {
                contains: word,
                mode: "insensitive",
              },
            },

            {
              descriptionEn: {
                contains: word,
                mode: "insensitive",
              },
            },

            {
              tags: {
                some: {
                  tag: {
                    contains: word,
                    mode: "insensitive",
                  },
                },
              },
            },

            {
              category: {
                name: {
                  contains: word,
                  mode: "insensitive",
                },
              },
            },

            {
              category: {
                slug: {
                  contains: word,
                  mode: "insensitive",
                },
              },
            },
          ]
        );

      where.OR = [
        ...phraseConditions,
        ...wordConditions,
      ];
    }

    /**
     * ========================================================
     * PESQUISA COM RELEVÂNCIA
     * ========================================================
     */

    if (search) {
      /**
       * Buscar um conjunto maior de candidatos.
       *
       * Depois calculamos a relevância em memória.
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

          take: 500,
        });

      /**
       * Calcular relevância
       */
      const scored =
        candidates
          .map((product: any) => ({
            product,

            score:
              calculateRelevance(
                product,
                search
              ),
          }))
          .filter(
            (item) =>
              item.score > 0
          )
          .sort(
            (a, b) =>
              b.score - a.score
          );

      const total =
        scored.length;

      const start =
        (page - 1) * limit;

      const paginated =
        scored.slice(
          start,
          start + limit
        );

      return NextResponse.json({
        products:
          paginated.map(
            ({ product }: any) => ({
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
                product.images.map(
                  (img: any) => ({
                    url: img.url,
                    alt: img.alt,
                  })
                ),
            })
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
     * ORDENAÇÃO NORMAL
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
     * TOTAL
     * ========================================================
     */

    const total =
      await prisma.product.count({
        where,
      });

    /**
     * ========================================================
     * PRODUTOS NORMAL
     * ========================================================
     *
     * IMPORTANTE:
     *
     * Para "newest" fazemos a mistura
     * por categorias.
     *
     * Para ordenações explícitas:
     *
     * - preço
     * - popular
     * - rating
     *
     * respeitamos a ordenação escolhida.
     */

    const shouldDiversify =
      sort === "newest" ||
      !search;

    if (shouldDiversify) {
      /**
       * Buscar candidatos suficientes
       * para montar várias páginas.
       *
       * Limite máximo para não trazer
       * a tabela inteira do banco.
       */

      const candidateLimit =
        Math.min(
          500,
          Math.max(
            limit * 8,
            120
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
       * Misturar categorias
       */
      const diversified =
        diversifyProducts(
          candidates
        );

      /**
       * Paginação depois da mistura.
       *
       * Isto é importante.
       *
       * Não fazemos:
       *
       * banco -> página -> shuffle
       *
       * Fazemos:
       *
       * banco -> candidatos -> mistura
       * -> paginação
       */

      const start =
        (page - 1) * limit;

      const paginated =
        diversified.slice(
          start,
          start + limit
        );

      return NextResponse.json({
        products:
          paginated.map(
            (p: any) => ({
              id: p.id,

              title: p.title,

              slug: p.slug,

              priceMZN:
                p.priceMZN,

              originalPriceMZN:
                p.originalPriceMZN,

              rating:
                p.rating,

              reviewCount:
                p.reviewCount,

              sold:
                p.sold,

              freeShipping:
                p.freeShipping,

              category:
                p.category,

              images:
                p.images.map(
                  (img: any) => ({
                    url: img.url,
                    alt: img.alt,
                  })
                ),
            })
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
     * ORDENAÇÃO EXPLÍCITA
     * ========================================================
     *
     * Usada quando o cliente escolhe:
     *
     * - preço menor
     * - preço maior
     * - popularidade
     * - avaliação
     */

    const [
      products,
    ] =
      await Promise.all([
        prisma.product.findMany({
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

          skip:
            (page - 1) *
            limit,

          take: limit,
        }),
      ]);

    /**
     * ========================================================
     * RESPONSE
     * ========================================================
     */

    return NextResponse.json({
      products:
        products.map(
          (p: any) => ({
            id: p.id,

            title:
              p.title,

            slug:
              p.slug,

            priceMZN:
              p.priceMZN,

            originalPriceMZN:
              p.originalPriceMZN,

            rating:
              p.rating,

            reviewCount:
              p.reviewCount,

            sold:
              p.sold,

            freeShipping:
              p.freeShipping,

            category:
              p.category,

            images:
              p.images.map(
                (img: any) => ({
                  url: img.url,
                  alt: img.alt,
                })
              ),
          })
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
  } catch (error: any) {
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
