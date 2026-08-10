import { prisma } from "@/lib/db";
import HomePageClient from "./HomePageClient";

export const dynamic = "force-dynamic";

/**
 * ============================================================
 * SELEÇÃO INTELIGENTE DE PRODUTOS
 * ============================================================
 *
 * Objetivo:
 *
 * - Misturar produtos de diferentes categorias
 * - Evitar vários produtos da mesma categoria seguidos
 * - Dar oportunidade para categorias menores aparecerem
 * - Evitar repetir produtos
 * - Criar uma homepage mais parecida com marketplaces
 */
function smartProductSelection(
  products: any[],
  limit = 24
) {
  if (!products.length) {
    return [];
  }

  /**
   * Agrupar produtos por categoria
   */
  const groups: Record<string, any[]> = {};

  for (const product of products) {
    const categoryId =
      product.category?.id ||
      product.category?.slug ||
      "other";

    if (!groups[categoryId]) {
      groups[categoryId] = [];
    }

    groups[categoryId].push(product);
  }

  /**
   * Embaralhar produtos dentro de cada categoria
   */
  for (const categoryId of Object.keys(groups)) {
    groups[categoryId] = [...groups[categoryId]].sort(
      () => Math.random() - 0.5
    );
  }

  /**
   * Categorias disponíveis
   */
  let categories = Object.keys(groups);

  /**
   * Embaralhar categorias
   */
  categories = categories.sort(
    () => Math.random() - 0.5
  );

  /**
   * Controlar posição de cada categoria
   */
  const indexes: Record<string, number> = {};

  for (const categoryId of categories) {
    indexes[categoryId] = 0;
  }

  const result: any[] = [];

  /**
   * ============================================================
   * RODÍZIO ENTRE CATEGORIAS
   * ============================================================
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
   * ...
   */
  while (
    result.length < limit &&
    categories.length > 0
  ) {
    let addedInRound = false;

    /**
     * Alterar a ordem das categorias a cada rodada
     * para evitar um padrão fixo.
     */
    categories = [...categories].sort(
      () => Math.random() - 0.5
    );

    for (const categoryId of categories) {
      const categoryProducts =
        groups[categoryId];

      const index =
        indexes[categoryId] ?? 0;

      /**
       * Ainda existem produtos nessa categoria?
       */
      if (
        categoryProducts &&
        index < categoryProducts.length
      ) {
        const product =
          categoryProducts[index];

        indexes[categoryId] = index + 1;

        /**
         * Evitar duplicados
         */
        if (
          !result.some(
            (item) => item.id === product.id
          )
        ) {
          result.push(product);
          addedInRound = true;
        }
      }

      if (result.length >= limit) {
        break;
      }
    }

    /**
     * Evitar loop infinito
     */
    if (!addedInRound) {
      break;
    }

    /**
     * Remover categorias que já ficaram sem produtos
     */
    categories = categories.filter(
      (categoryId) =>
        indexes[categoryId] <
        groups[categoryId].length
    );
  }

  /**
   * Última mistura para deixar a homepage
   * menos previsível.
   */
  return result.sort(
    () => Math.random() - 0.5
  );
}

/**
 * ============================================================
 * HOME DATA
 * ============================================================
 */
async function getHomeData() {
  try {
    /**
     * ========================================================
     * PRODUTOS
     * ========================================================
     *
     * Buscamos um conjunto maior de produtos.
     *
     * Antes:
     * take: 80
     *
     * Agora:
     * take: 300
     *
     * Isso permite que a seleção inteligente tenha
     * muito mais categorias para escolher.
     */
    const products =
      await prisma.product.findMany({
        where: {
          status: "APPROVED",
        },

        take: 300,

        select: {
          id: true,
          title: true,
          slug: true,

          priceMZN: true,
          originalPriceMZN: true,

          rating: true,
          reviewCount: true,

          sold: true,
          freeShipping: true,

          category: {
            select: {
              id: true,
              name: true,
            },
          },

          images: {
            take: 1,

            select: {
              url: true,
              alt: true,
            },
          },
        },

        /**
         * Não usamos "sold desc" aqui.
         *
         * Se usássemos:
         *
         * sold: "desc"
         *
         * o conjunto inicial poderia ficar
         * muito concentrado nos mesmos tipos
         * de produtos.
         *
         * Com createdAt temos produtos mais recentes
         * disponíveis para a seleção inteligente.
         */
        orderBy: {
          createdAt: "desc",
        },
      });

    /**
     * ========================================================
     * BANNERS
     * ========================================================
     */
    const banners =
      await prisma.banner.findMany({
        where: {
          active: true,
        },

        take: 5,

        orderBy: {
          order: "asc",
        },

        select: {
          id: true,
          title: true,
          subtitle: true,
          image: true,
          link: true,
        },
      });

    /**
     * ========================================================
     * CATEGORIAS
     * ========================================================
     *
     * Mantemos as categorias em destaque
     * para a seção de categorias da homepage.
     */
    const categories =
      await prisma.category.findMany({
        where: {
          featured: true,
        },

        take: 12,

        orderBy: {
          order: "asc",
        },

        select: {
          id: true,
          name: true,
          slug: true,
          icon: true,
          image: true,
        },
      });

    /**
     * ========================================================
     * SETTINGS
     * ========================================================
     */
    const settings =
      await prisma.setting.findMany();

    const settingsMap: Record<
      string,
      any
    > = {};

    settings.forEach((setting) => {
      settingsMap[setting.key] =
        setting.value;
    });

    /**
     * ========================================================
     * MAP PRODUCT
     * ========================================================
     */
    function mapProduct(product: any) {
      return {
        id: product.id,

        title:
          product.title?.length > 80
            ? product.title.substring(
                0,
                80
              ) + "..."
            : product.title,

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
          product.images,
      };
    }

    /**
     * ========================================================
     * PREPARAR PRODUTOS
     * ========================================================
     */
    const mappedProducts =
      products.map(mapProduct);

    /**
     * ========================================================
     * MISTURAR CATEGORIAS
     * ========================================================
     *
     * Selecionamos 24 produtos de forma inteligente.
     */
    const selected =
      smartProductSelection(
        mappedProducts,
        24
      );

    /**
     * ========================================================
     * RETORNO
     * ========================================================
     *
     * Mantemos exatamente a estrutura esperada
     * pelo HomePageClient atual:
     *
     * featuredProducts
     * newProducts
     * categories
     * banners
     * settings
     */
    return {
      banners,

      featuredProducts:
        selected.slice(0, 12),

      newProducts:
        selected.slice(12, 24),

      categories,

      settings: settingsMap,
    };
  } catch (error) {
    console.error(
      "Home data error:",
      error
    );

    return {
      banners: [],
      featuredProducts: [],
      newProducts: [],
      categories: [],
      settings: {},
    };
  }
}

/**
 * ============================================================
 * HOME PAGE
 * ============================================================
 */
export default async function HomePage() {
  const data =
    await getHomeData();

  return (
    <HomePageClient
      {...data}
    />
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> 7fbe44c (fix: add cloudflare r2 sdk)
