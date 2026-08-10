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
 * VALIDAR ID
 * ============================================================
 */
function getCampaignId(
  context: { params: Promise<{ id: string }> }
) {
  return context.params.then((params) =>
    String(params.id || "").trim()
  );
}

/**
 * ============================================================
 * GET
 * ============================================================
 *
 * Buscar uma campanha específica.
 */
export async function GET(
  request: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  }
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

    const id = await getCampaignId(context);

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "ID da campanha não informado",
        },
        { status: 400 }
      );
    }

    const campaign =
      await prisma.campaign.findUnique({
        where: {
          id,
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

    if (!campaign) {
      return NextResponse.json(
        {
          success: false,
          error: "Campanha não encontrada",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        campaign,
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
      "GET /api/admin/marketing/campaigns/[id] error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Erro ao carregar campanha",
      },
      { status: 500 }
    );
  }
}

/**
 * ============================================================
 * PATCH
 * ============================================================
 *
 * Atualizar campanha.
 */
export async function PATCH(
  request: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  }
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

    const id = await getCampaignId(context);

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "ID da campanha não informado",
        },
        { status: 400 }
      );
    }

    /**
     * Verificar se existe.
     */
    const existing =
      await prisma.campaign.findUnique({
        where: {
          id,
        },
      });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: "Campanha não encontrada",
        },
        { status: 404 }
      );
    }

    /**
     * Ler JSON.
     */
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

    /**
     * ========================================================
     * CAMPOS
     * ========================================================
     */

    const data: any = {};

    if (body.title !== undefined) {
      if (
        typeof body.title !== "string" ||
        !body.title.trim()
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "O título da campanha é obrigatório",
          },
          { status: 400 }
        );
      }

      data.title = body.title.trim();
    }

    if (body.description !== undefined) {
      if (
        typeof body.description !== "string" ||
        !body.description.trim()
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "A descrição da campanha é obrigatória",
          },
          { status: 400 }
        );
      }

      data.description =
        body.description.trim();
    }

    /**
     * Imagem.
     */
    if (body.image !== undefined) {
      data.image =
        typeof body.image === "string" &&
        body.image.trim()
          ? body.image.trim()
          : null;
    }

    /**
     * Botão.
     */
    if (body.buttonText !== undefined) {
      data.buttonText =
        typeof body.buttonText === "string" &&
        body.buttonText.trim()
          ? body.buttonText.trim()
          : null;
    }

    /**
     * Link.
     */
    if (body.buttonLink !== undefined) {
      data.buttonLink =
        typeof body.buttonLink === "string" &&
        body.buttonLink.trim()
          ? body.buttonLink.trim()
          : null;
    }

    /**
     * Banner.
     */
    if (body.showBanner !== undefined) {
      data.showBanner =
        body.showBanner === true;
    }

    /**
     * Popup.
     */
    if (body.showPopup !== undefined) {
      data.showPopup =
        body.showPopup === true;
    }

    /**
     * Email.
     */
    if (body.sendEmail !== undefined) {
      data.sendEmail =
        body.sendEmail === true;
    }

    /**
     * Push.
     */
    if (body.sendPush !== undefined) {
      data.sendPush =
        body.sendPush === true;
    }

    /**
     * Ativa.
     */
    if (body.active !== undefined) {
      data.active =
        body.active === true;
    }

    /**
     * ========================================================
     * DATAS
     * ========================================================
     */

    let startsAt =
      existing.startsAt;

    let endsAt =
      existing.endsAt;

    if (body.startsAt !== undefined) {
      if (
        body.startsAt === null ||
        body.startsAt === ""
      ) {
        startsAt = null;
      } else {
        const date =
          new Date(body.startsAt);

        if (Number.isNaN(date.getTime())) {
          return NextResponse.json(
            {
              success: false,
              error:
                "Data de início inválida",
            },
            { status: 400 }
          );
        }

        startsAt = date;
      }

      data.startsAt = startsAt;
    }

    if (body.endsAt !== undefined) {
      if (
        body.endsAt === null ||
        body.endsAt === ""
      ) {
        endsAt = null;
      } else {
        const date =
          new Date(body.endsAt);

        if (Number.isNaN(date.getTime())) {
          return NextResponse.json(
            {
              success: false,
              error:
                "Data de fim inválida",
            },
            { status: 400 }
          );
        }

        endsAt = date;
      }

      data.endsAt = endsAt;
    }

    /**
     * Verificar intervalo.
     */
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
     * Não há nada para atualizar.
     */
    if (
      Object.keys(data).length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Nenhuma alteração enviada",
        },
        { status: 400 }
      );
    }

    /**
     * ========================================================
     * ATUALIZAR
     * ========================================================
     */

    const campaign =
      await prisma.campaign.update({
        where: {
          id,
        },

        data,

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
          "Campanha atualizada com sucesso",
        campaign,
      },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error: any) {
    console.error(
      "PATCH /api/admin/marketing/campaigns/[id] error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "Erro ao atualizar campanha",
      },
      { status: 500 }
    );
  }
}

/**
 * ============================================================
 * DELETE
 * ============================================================
 *
 * Apagar campanha.
 */
export async function DELETE(
  request: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  }
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

    const id = await getCampaignId(context);

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "ID da campanha não informado",
        },
        { status: 400 }
      );
    }

    /**
     * Verificar existência.
     */
    const existing =
      await prisma.campaign.findUnique({
        where: {
          id,
        },
        select: {
          id: true,
          title: true,
        },
      });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: "Campanha não encontrada",
        },
        { status: 404 }
      );
    }

    /**
     * Apagar.
     */
    await prisma.campaign.delete({
      where: {
        id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message:
          "Campanha apagada com sucesso",
        deletedId: existing.id,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(
      "DELETE /api/admin/marketing/campaigns/[id] error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "Erro ao apagar campanha",
      },
      { status: 500 }
    );
  }
}