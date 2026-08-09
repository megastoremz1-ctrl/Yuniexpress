import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * ============================================================
 * CONFIGURAÇÕES PERMITIDAS
 * ============================================================
 */

const ALLOWED_SETTINGS = [
  "store_name",
  "store_logo",
  "store_tagline",
  "support_email",
  "support_phone",
  "default_margin_percent",
  "announcement_bar",
  "announcement_active",
  "homepage_title",
];

/**
 * ============================================================
 * VERIFICAR ADMIN
 * ============================================================
 */

async function checkAdmin() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: {
        id: String(session.user.id),
      },
      select: {
        id: true,
        role: true,
      },
    });

    if (!user) {
      return null;
    }

    if (
      user.role !== "ADMIN" &&
      user.role !== "SUPER_ADMIN"
    ) {
      return null;
    }

    return user;
  } catch (error) {
    console.error(
      "Settings admin authentication error:",
      error
    );

    return null;
  }
}

/**
 * ============================================================
 * GET
 * ============================================================
 */

export async function GET() {
  try {
    const admin = await checkAdmin();

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          error: "Acesso negado",
        },
        { status: 403 }
      );
    }

    const settings =
      await prisma.setting.findMany({
        where: {
          key: {
            in: ALLOWED_SETTINGS,
          },
        },

        orderBy: {
          key: "asc",
        },
      });

    const settingsMap: Record<
      string,
      string
    > = {};

    for (const setting of settings) {
      /**
       * Segurança:
       *
       * Se ainda existir um logo antigo
       * em Base64, não o enviamos para
       * o navegador.
       */
      if (
        setting.key === "store_logo" &&
        setting.value.startsWith("data:image/")
      ) {
        settingsMap[setting.key] = "";
        continue;
      }

      settingsMap[setting.key] =
        setting.value;
    }

    return NextResponse.json(
      {
        success: true,
        settings: settingsMap,
      },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error: unknown) {
    console.error(
      "GET /api/admin/settings error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Erro ao carregar configurações",
      },
      {
        status: 500,
      }
    );
  }
}

/**
 * ============================================================
 * POST
 * ============================================================
 */

export async function POST(
  request: NextRequest
) {
  try {
    const admin = await checkAdmin();

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          error: "Acesso negado",
        },
        {
          status: 403,
        }
      );
    }

    /**
     * --------------------------------------------------------
     * LER JSON
     * --------------------------------------------------------
     */

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "JSON inválido",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Dados inválidos",
        },
        {
          status: 400,
        }
      );
    }

    const settings = (
      body as {
        settings?: unknown;
      }
    ).settings;

    if (
      !settings ||
      typeof settings !== "object" ||
      Array.isArray(settings)
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "O campo settings é obrigatório",
        },
        {
          status: 400,
        }
      );
    }

    /**
     * --------------------------------------------------------
     * FILTRAR SOMENTE CONFIGURAÇÕES PERMITIDAS
     * --------------------------------------------------------
     */

    const rawSettings =
      settings as Record<
        string,
        unknown
      >;

    const entries =
      Object.entries(rawSettings)
        .filter(([key]) =>
          ALLOWED_SETTINGS.includes(key)
        );

    if (entries.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Nenhuma configuração válida enviada",
        },
        {
          status: 400,
        }
      );
    }

    /**
     * --------------------------------------------------------
     * IMPEDIR BASE64
     * --------------------------------------------------------
     */

    for (const [key, value] of entries) {
      if (
        key === "store_logo" &&
        typeof value === "string" &&
        value.startsWith("data:image/")
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "O logo não pode ser guardado como Base64. Use uma URL de imagem.",
          },
          {
            status: 400,
          }
        );
      }
    }

    /**
     * --------------------------------------------------------
     * TRANSAÇÃO
     * --------------------------------------------------------
     */

    await prisma.$transaction(
      entries.map(
        ([key, value]) =>
          prisma.setting.upsert({
            where: {
              key,
            },

            update: {
              value:
                value === null ||
                value === undefined
                  ? ""
                  : String(value),
            },

            create: {
              key,

              value:
                value === null ||
                value === undefined
                  ? ""
                  : String(value),

              type:
                key === "store_logo"
                  ? "image"
                  : "string",
            },
          })
      )
    );

    /**
     * --------------------------------------------------------
     * LER CONFIGURAÇÕES NOVAMENTE
     * --------------------------------------------------------
     */

    const savedSettings =
      await prisma.setting.findMany({
        where: {
          key: {
            in: ALLOWED_SETTINGS,
          },
        },

        orderBy: {
          key: "asc",
        },
      });

    const settingsMap: Record<
      string,
      string
    > = {};

    for (const setting of savedSettings) {
      if (
        setting.key === "store_logo" &&
        setting.value.startsWith("data:image/")
      ) {
        settingsMap[setting.key] = "";
        continue;
      }

      settingsMap[setting.key] =
        setting.value;
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "Configurações guardadas com sucesso",
        settings: settingsMap,
      },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error: unknown) {
    console.error(
      "POST /api/admin/settings error:",
      error
    );

    let message =
      "Erro ao guardar configurações";

    if (error instanceof Error) {
      message = error.message;
    } else if (
      typeof error === "string"
    ) {
      message = error;
    }

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      {
        status: 500,
      }
    );
  }
}
