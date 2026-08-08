import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSearchVariants } from "@/lib/translations/dictionary";

function normalizeText(text: string = ""): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function tokenize(text: string): string[] {
  return normalizeText(text)
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length >= 2);
}

function calculateRelevance(product: any, search: string): number {
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
    ? product.tags.map((t: any) => normalizeText(t.tag || ""))
    : [];

  let score = 0;

  /**
   * ========================================
   * CORRESPONDÊNCIA EXATA DO TÍTULO
   * ========================================
   */

  if (title === query) {
    score += 1000;
  }

  if (titleEn === query) {
    score += 950;
  }

  /**
   * ========================================
   * TÍTULO CONTÉM A PESQUISA
   * ========================================
   */

  if (title.includes(query)) {
    score += 500;
  }

  if (titleEn.includes(query)) {
    score += 450;
  }

  /**
   * ========================================
   * PALAVRAS INDIVIDUAIS
   * ========================================
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
   * ========================================
   * CATEGORIA
   * ========================================
   */

  if (categoryName === query) {
    score += 250;
  }

  /**
   * ========================================
   * TAG EXATA
   * ========================================
   */

  if (
    tags.some(
      (tag: string) => tag === query
    )
  ) {
    score += 300;
  }

  /**
   * ========================================
   * POPULARIDADE
   * ========================================
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(
      request.url
    );

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

    const category =
      searchParams.get("category");

    const search =
      searchParams.get("search")?.trim() || "";

    const minPrice =
      searchParams.get("minPrice");

    const maxPrice =
      searchParams.get("maxPrice");

    const rating =
      searchParams.get("rating");

    const freeShipping =
      searchParams.get("freeShipping");

    const sort =
      searchParams.get("sort") || "newest";

    const featured =
      searchParams.get("featured");

    /**
     * ========================================
     * WHERE BASE
     * ========================================
     */

    const where: any = {
      status: "APPROVED",
    };

    /**
     * ========================================
     * CATEGORIA
     * ========================================
     */

    if (category) {
      where.category = {
        slug: category,
      };
    }

    /**
     * ========================================
     * PREÇO
     * ========================================
     */

    if (minPrice) {
      where.priceMZN = {
        ...(where.priceMZN || {}),
        gte: parseFloat(minPrice),
      };
    }

    if (maxPrice) {
      where.priceMZN = {
        ...(where.priceMZN || {}),
        lte: parseFloat(maxPrice),
      };
    }

    /**
     * ========================================
     * RATING
     * ========================================
     */

    if (rating) {
      where.rating = {
        gte: parseFloat(rating),
      };
    }

    /**
     * ========================================
     * ENVIO GRÁTIS
     * ========================================
     */

    if (freeShipping === "true") {
      where.freeShipping = true;
    }

    /**
     * ========================================
     * DESTAQUES
     * ========================================
     */

    if (featured === "true") {
      where.featured = true;
    }

    /**
     * ========================================
     * PESQUISA
     * ========================================
     */

    if (search) {
      const searchVariants =
        getSearchVariants(search);

      const variants = Array.from(
        new Set([
          search,
          ...searchVariants,
        ])
      ).filter(Boolean);

      const searchConditions =
        variants.flatMap((variant) => [
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
        ]);

      where.OR = searchConditions;
    }

    /**
     * ========================================
     * PESQUISA COM RELEVÂNCIA
     * ========================================
     */

    if (search) {
      /**
       * Para pesquisa, buscamos um conjunto maior
       * de candidatos e depois calculamos relevância.
       *
       * Isso evita mostrar produtos aleatórios.
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
            (item) => item.score > 0
          )
          .sort(
            (a, b) =>
              b.score - a.score
          );

      const total = scored.length;

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
              title: product.title,
              slug: product.slug,
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
     * ========================================
     * ORDENAÇÃO NORMAL
     * ========================================
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
    }

    /**
     * ========================================
     * PRODUTOS
     * ========================================
     */

    const [
      products,
      total,
    ] = await Promise.all([
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
          (page - 1) * limit,

        take: limit,
      }),

      prisma.product.count({
        where,
      }),
    ]);

    return NextResponse.json({
      products:
        products.map(
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
