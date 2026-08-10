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

    if (
      !user ||
      (user.role !== "ADMIN" &&
        user.role !== "SUPER_ADMIN")
    ) {
      return null;
    }

    return user;
  } catch (error) {
    console.error(
      "Campaign admin authentication error:",
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
 * Lista todas as campanhas.
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

    const campaigns =
      await prisma.campaign.findMany({
        orderBy: {
          createdAt: "desc",
        },

        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

    return NextResponse.json(
      {
        success: true,
        campaigns,
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
      "GET /api/admin/marketing/campaigns error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Erro ao carregar campanhas",
      },
      { status: 500 }
    );
  }
}

/**
 * ============================================================
 * POST
 * ============================================================
 *
 * Criar campanha.
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
        { status: 403 }
      );
    }

    let body: any;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "JSON inválido",
        },
        { status: 400 }
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
        { status: 400 }
      );
    }

    const title =
      typeof body.title === "string"
        ? body.title.trim()
        : "";

    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : "";

    if (!title) {
      return NextResponse.json(
        {
          success: false,
          error: "O título da campanha é obrigatório",
        },
        { status: 400 }
      );
    }

    if (!description) {
      return NextResponse.json(
        {
          success: false,
          error:
            "A descrição da campanha é obrigatória",
        },
        { status: 400 }
      );
    }

    /**
     * Converter datas.
     */
    let startsAt: Date | null = null;
    let endsAt: Date | null = null;

    if (body.startsAt) {
      const date = new Date(body.startsAt);

      if (Number.isNaN(date.getTime())) {
        return NextResponse.json(
          {
            success: false,
            error: "Data de início inválida",
          },
          { status: 400 }
        );
      }

      startsAt = date;
    }

    if (body.endsAt) {
      const date = new Date(body.endsAt);

      if (Number.isNaN(date.getTime())) {
        return NextResponse.json(
          {
            success: false,
            error: "Data de fim inválida",
          },
          { status: 400 }
        );
      }

      endsAt = date;
    }

    if (
      startsAt &&
      endsAt &&
      endsAt < startsAt
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "A data de fim não pode ser anterior à data de início",
        },
        { status: 400 }
      );
    }

    /**
     * Criar campanha.
     */
    const campaign =
      await prisma.campaign.create({
        data: {
          title,
          description,

          image:
            typeof body.image === "string" &&
            body.image.trim()
              ? body.image.trim()
              : null,

          buttonText:
            typeof body.buttonText === "string" &&
            body.buttonText.trim()
              ? body.buttonText.trim()
              : null,

          buttonLink:
            typeof body.buttonLink === "string" &&
            body.buttonLink.trim()
              ? body.buttonLink.trim()
              : null,

          showBanner:
            body.showBanner === true,

          showPopup:
            body.showPopup === true,

          sendEmail:
            body.sendEmail !== false,

          sendPush:
            body.sendPush === true,

          active:
            body.active !== false,

          startsAt,
          endsAt,

          createdById: admin.id,
        },

        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

    return NextResponse.json(
      {
        success: true,
        message:
          "Campanha criada com sucesso",
        campaign,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error(
      "POST /api/admin/marketing/campaigns error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "Erro ao criar campanha",
      },
      { status: 500 }
    );
  }
}