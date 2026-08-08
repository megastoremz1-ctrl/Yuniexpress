import crypto from "crypto";

import { prisma } from "@/lib/db";

const ALIEXPRESS_API_URL =
  process.env.ALIEXPRESS_API_URL ||
  "https://eco.taobao.com/router/rest";

const APP_KEY =
  process.env.ALIEXPRESS_APP_KEY ||
  process.env.ALIEXPRESS_APPKEY;

const APP_SECRET =
  process.env.ALIEXPRESS_APP_SECRET ||
  process.env.ALIEXPRESS_APPSECRET;

const TRACKING_ID =
  process.env.ALIEXPRESS_TRACKING_ID ||
  "yuniexpress";

const PAGE_SIZE = 50;

/**
 * ============================================================
 * TIPOS
 * ============================================================
 */

export type AliExpressProduct = {
  product_id?: string | number;

  product_title?: string;

  product_main_image_url?: string;

  product_small_image_urls?: string[];

  product_detail_url?: string;

  promotion_link?: string;

  sale_price?: string | number;

  original_price?: string | number;

  app_sale_price?: string | number;

  first_level_category_id?: string | number;

  first_level_category_name?: string;

  second_level_category_id?: string | number;

  second_level_category_name?: string;

  evaluate_rate?: string;

  lastest_volume?: string | number;

  shop_id?: string | number;

  shop_url?: string;

  ship_to_days?: string;
};

type AliExpressResponse = {
  aliexpress_affiliate_product_query_response?: {
    resp_result?: {
      resp_code?: number | string;
      resp_msg?: string;
      result?: {
        current_page_no?: number;
        current_record_count?: number;
        total_page_no?: number;
        total_record_count?: number;
        products?: {
          product?: AliExpressProduct[];
        };
      };
    };
  };
};

/**
 * ============================================================
 * ASSINATURA TOP API
 * ============================================================
 */

function createSignature(
  params: Record<string, string>,
  secret: string
) {
  const sortedKeys = Object.keys(params).sort();

  let source = "";

  for (const key of sortedKeys) {
    const value = params[key];

    if (
      key &&
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      source += key + value;
    }
  }

  return crypto
    .createHmac("md5", secret)
    .update(source, "utf8")
    .digest("hex")
    .toUpperCase();
}

/**
 * ============================================================
 * DATA / HORA
 * GMT+8
 * ============================================================
 */

function getAliExpressTimestamp() {
  const now = new Date();

  const formatter = new Intl.DateTimeFormat(
    "en-CA",
    {
      timeZone: "Asia/Shanghai",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }
  );

  const parts = formatter.formatToParts(now);

  const get = (type: string) =>
    parts.find((part) => part.type === type)
      ?.value || "";

  return `${get("year")}-${get("month")}-${get(
    "day"
  )} ${get("hour")}:${get("minute")}:${get(
    "second"
  )}`;
}

/**
 * ============================================================
 * PESQUISAR NO ALIEXPRESS
 * ============================================================
 */

export async function searchAliExpress(
  keywords: string,
  page = 1,
  pageSize = PAGE_SIZE
): Promise<AliExpressProduct[]> {
  if (!APP_KEY || !APP_SECRET) {
    console.warn(
      "[AliExpress] API credentials não configuradas."
    );

    return [];
  }

  const cleanKeywords = keywords
    .trim()
    .replace(/\s+/g, " ");

  if (!cleanKeywords) {
    return [];
  }

  const params: Record<string, string> = {
    app_key: APP_KEY,

    format: "json",

    method:
      "aliexpress.affiliate.product.query",

    sign_method: "hmac",

    timestamp:
      getAliExpressTimestamp(),

    v: "2.0",

    keywords: cleanKeywords,

    page_no: String(
      Math.max(1, page)
    ),

    page_size: String(
      Math.min(50, Math.max(1, pageSize))
    ),

    fields: [
      "commission_rate",
      "discount",
      "evaluate_rate",
      "first_level_category_id",
      "first_level_category_name",
      "lastest_volume",
      "original_price",
      "product_detail_url",
      "product_id",
      "product_main_image_url",
      "product_small_image_urls",
      "product_title",
      "promotion_link",
      "sale_price",
      "second_level_category_id",
      "second_level_category_name",
      "shop_id",
      "shop_url",
      "ship_to_days",
    ].join(","),

    target_currency: "USD",

    target_language: "EN",

    tracking_id: TRACKING_ID,

    /**
     * Moçambique
     */
    ship_to_country: "MZ",
  };

  params.sign =
    createSignature(
      params,
      APP_SECRET
    );

  try {
    const response =
      await fetch(
        ALIEXPRESS_API_URL,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/x-www-form-urlencoded;charset=UTF-8",
          },

          body:
            new URLSearchParams(
              params
            ).toString(),

          cache: "no-store",
        }
      );

    if (!response.ok) {
      console.error(
        "[AliExpress] HTTP error:",
        response.status
      );

      return [];
    }

    const data =
      (await response.json()) as AliExpressResponse;

    const result =
      data
        ?.aliexpress_affiliate_product_query_response
        ?.resp_result;

    if (
      String(result?.resp_code) !==
      "200"
    ) {
      console.error(
        "[AliExpress] API error:",
        result?.resp_code,
        result?.resp_msg
      );

      return [];
    }

    return (
      result?.result?.products?.product ||
      []
    );
  } catch (error) {
    console.error(
      "[AliExpress] Search error:",
      error
    );

    return [];
  }
}

/**
 * ============================================================
 * TAXA USD → MZN
 * ============================================================
 */

async function getUsdMznRate() {
  const exchangeRate =
    await prisma.exchangeRate.findFirst({
      where: {
        fromCurrency: "USD",
        toCurrency: "MZN",
      },

      orderBy: {
        createdAt: "desc",
      },
    });

  if (
    exchangeRate &&
    Number.isFinite(
      exchangeRate.rate
    ) &&
    exchangeRate.rate > 0
  ) {
    return exchangeRate.rate;
  }

  const envRate = Number(
    process.env.USD_MZN_RATE
  );

  if (
    Number.isFinite(envRate) &&
    envRate > 0
  ) {
    return envRate;
  }

  throw new Error(
    "Taxa USD/MZN não encontrada."
  );
}

/**
 * ============================================================
 * MARGEM
 * ============================================================
 */

function getMarginPercent() {
  const value = Number(
    process.env.PRODUCT_MARGIN_PERCENT
  );

  if (
    Number.isFinite(value) &&
    value >= 0
  ) {
    return value;
  }

  return 25;
}

/**
 * ============================================================
 * SLUG DE CATEGORIA
 * ============================================================
 */

function categorySlug(
  id: string | number | undefined,
  name: string | undefined
) {
  const cleanId = String(
    id || "unknown"
  )
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, "");

  const cleanName =
    String(name || "category")
      .toLowerCase()
      .normalize("NFD")
      .replace(
        /[\u0300-\u036f]/g,
        ""
      )
      .replace(
        /[^a-z0-9]+/g,
        "-"
      )
      .replace(
        /^-+|-+$/g,
        ""
      );

  return `ali-${cleanId}-${cleanName || "category"}`;
}

/**
 * ============================================================
 * CATEGORIA ALIEXPRESS
 * ============================================================
 */

async function getOrCreateCategory(
  product: AliExpressProduct
) {
  const firstId =
    product.first_level_category_id;

  const firstName =
    product.first_level_category_name;

  const secondId =
    product.second_level_category_id;

  const secondName =
    product.second_level_category_name;

  if (!firstName) {
    return null;
  }

  /**
   * Categoria principal
   */
  const parentSlug =
    categorySlug(
      firstId,
      firstName
    );

  let parent =
    await prisma.category.findUnique({
      where: {
        slug: parentSlug,
      },
    });

  if (!parent) {
    parent =
      await prisma.category.create({
        data: {
          name: firstName,

          nameEn: firstName,

          slug: parentSlug,

          featured: false,

          order: 999,
        },
      });
  }

  /**
   * Subcategoria
   */
  if (
    secondName &&
    secondName.trim() &&
    secondName.trim() !==
      firstName.trim()
  ) {
    const childSlug =
      categorySlug(
        secondId,
        secondName
      );

    let child =
      await prisma.category.findUnique({
        where: {
          slug: childSlug,
        },
      });

    if (!child) {
      child =
        await prisma.category.create({
          data: {
            name: secondName,

            nameEn: secondName,

            slug: childSlug,

            parentId: parent.id,

            featured: false,

            order: 999,
          },
        });
    }

    return child;
  }

  return parent;
}

/**
 * ============================================================
 * SALVAR PRODUTO DO ALIEXPRESS
 * ============================================================
 */

export async function saveAliExpressProduct(
  ali: AliExpressProduct
) {
  if (!ali.product_id) {
    return null;
  }

  const aliexpressId =
    String(
      ali.product_id
    ).trim();

  if (!aliexpressId) {
    return null;
  }

  /**
   * Já existe?
   */
  const existing =
    await prisma.product.findUnique({
      where: {
        aliexpressId,
      },

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
    });

  if (existing) {
    return existing;
  }

  const title =
    String(
      ali.product_title ||
        ""
    ).trim();

  if (!title) {
    return null;
  }

  const salePrice =
    Number(
      ali.sale_price ??
        ali.app_sale_price
    );

  const originalPrice =
    Number(
      ali.original_price ??
        salePrice
    );

  if (
    !Number.isFinite(
      salePrice
    ) ||
    salePrice <= 0
  ) {
    return null;
  }

  const rate =
    await getUsdMznRate();

  const marginPercent =
    getMarginPercent();

  const priceMZN =
    Math.ceil(
      salePrice *
        rate *
        (1 +
          marginPercent / 100)
    );

  const originalPriceMZN =
    Number.isFinite(
      originalPrice
    )
      ? Math.ceil(
          originalPrice *
            rate
        )
      : null;

  const category =
    await getOrCreateCategory(
      ali
    );

  const slug =
    `ali-${aliexpressId}`;

  /**
   * Imagens
   */
  const images =
    Array.from(
      new Set(
        [
          ali.product_main_image_url,

          ...(Array.isArray(
            ali.product_small_image_urls
          )
            ? ali.product_small_image_urls
            : []),
        ].filter(
          (
            url
          ): url is string =>
            Boolean(
              url
            )
        )
      )
    ).slice(0, 8);

  /**
   * Rating
   */
  const evaluateRate =
    String(
      ali.evaluate_rate ||
        ""
    ).replace(
      "%",
      ""
    );

  const ratingValue =
    Number(
      evaluateRate
    );

  const rating =
    Number.isFinite(
      ratingValue
    )
      ? Math.min(
          5,
          Math.max(
            0,
            ratingValue /
              20
          )
        )
      : 0;

  /**
   * Criar produto
   */
  const product =
    await prisma.product.create({
      data: {
        aliexpressId,

        title,

        titleEn: title,

        slug,

        description:
          `Produto importado do AliExpress. ${title}`,

        descriptionEn:
          title,

        categoryId:
          category?.id ||
          null,

        originalPriceUSD:
          Number.isFinite(
            originalPrice
          )
            ? originalPrice
            : salePrice,

        priceUSD:
          salePrice,

        priceMZN,

        originalPriceMZN,

        marginPercent,

        stock: 1,

        minOrder: 1,

        sold: Number(
          ali.lastest_volume ||
            0
        ),

        status:
          "APPROVED",

        featured: false,

        rating,

        reviewCount: 0,

        shippingDays:
          ali.ship_to_days ||
          "15-30 dias",

        freeShipping: false,

        aliexpressUrl:
          ali.product_detail_url ||
          null,

        affiliateUrl:
          ali.promotion_link ||
          ali.product_detail_url ||
          null,

        sellerId:
          ali.shop_id
            ? String(
                ali.shop_id
              )
            : null,

        sellerName: null,

        lastSyncAt:
          new Date(),

        images: {
          create: images.map(
            (
              url,
              index
            ) => ({
              url,

              alt: title,

              order: index,
            })
          ),
        },

        tags: {
          create: [
            {
              tag: "AliExpress",
            },

            {
              tag: "Importado",
            },
          ],
        },
      },

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
    });

  return product;
}

/**
 * ============================================================
 * PESQUISA + IMPORTAÇÃO
 * ============================================================
 */

export async function searchAndImportAliExpress(
  search: string,
  minimumResults = 24
) {
  const results =
    await searchAliExpress(
      search,
      1,
      50
    );

  if (!results.length) {
    return [];
  }

  const saved = [];

  for (
    const item of results
  ) {
    try {
      const product =
        await saveAliExpressProduct(
          item
        );

      if (product) {
        saved.push(
          product
        );
      }

      if (
        saved.length >=
        minimumResults
      ) {
        break;
      }
    } catch (error) {
      console.error(
        "[AliExpress] Product save error:",
        error
      );
    }
  }

  return saved;
}
