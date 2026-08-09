import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
 *
 * Carregar todas as configurações.
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
        {
          status: 403,
          headers: {
            "Cache-Control":
              "no-store, no-cache, must-revalidate",
          },
        }
      );
    }

    const settings =
      await prisma.setting.findMany({
        orderBy: {
          key: "asc",
        },
      });

    const settingsMap: Record<string, string> = {};

    for (const setting of settings) {
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
  } catch (error) {
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
 *
 * Guardar configurações.
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

    const entries = Object.entries(
      settings as Record<string, unknown>
    );

    if (entries.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Nenhuma configuração enviada",
        },
        {
          status: 400,
        }
      );
    }

    /**
     * Guardar todas as configurações
     * numa única transação.
     */
    await prisma.$transaction(
      entries.map(([key, value]) =>
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
            type: "string",
          },
        })
      )
    );

    /**
     * Ler novamente do banco para confirmar
     * exatamente o que foi guardado.
     */
    const savedSettings =
      await prisma.setting.findMany({
        orderBy: {
          key: "asc",
        },
      });

    const settingsMap: Record<string, string> = {};

    for (const setting of savedSettings) {
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
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
