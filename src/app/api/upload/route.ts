import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * ============================================================
 * CONFIGURAÇÃO
 * ============================================================
 */

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
];

/**
 * ============================================================
 * UPLOAD
 * ============================================================
 */

export async function POST(request: NextRequest) {
  try {
    /**
     * --------------------------------------------------------
     * AUTENTICAÇÃO
     * --------------------------------------------------------
     */

    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Não autenticado",
        },
        { status: 401 }
      );
    }

    /**
     * --------------------------------------------------------
     * VERIFICAR ADMIN
     * --------------------------------------------------------
     */

    const user = await prisma.user.findUnique({
      where: {
        id: String(session.user.id),
      },

      select: {
        role: true,
      },
    });

    if (
      !user ||
      (user.role !== "ADMIN" &&
        user.role !== "SUPER_ADMIN")
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Acesso negado",
        },
        { status: 403 }
      );
    }

    /**
     * --------------------------------------------------------
     * VERIFICAR TOKEN DO VERCEL BLOB
     * --------------------------------------------------------
     */

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error(
        "BLOB_READ_WRITE_TOKEN não configurado"
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Armazenamento de imagens não está configurado.",
        },
        { status: 500 }
      );
    }

    /**
     * --------------------------------------------------------
     * FORM DATA
     * --------------------------------------------------------
     */

    const formData = await request.formData();

    const file = formData.get("file");

    const purpose =
      String(
        formData.get("purpose") || "general"
      );

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Nenhum ficheiro válido foi enviado.",
        },
        { status: 400 }
      );
    }

    /**
     * --------------------------------------------------------
     * VALIDAR TIPO
     * --------------------------------------------------------
     */

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Tipo de ficheiro não suportado. Use JPG, PNG, WebP, GIF ou SVG.",
        },
        { status: 400 }
      );
    }

    /**
     * --------------------------------------------------------
     * VALIDAR TAMANHO
     * --------------------------------------------------------
     */

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Ficheiro muito grande. O tamanho máximo é 5MB.",
        },
        { status: 400 }
      );
    }

    /**
     * --------------------------------------------------------
     * LIMPAR NOME DO FICHEIRO
     * --------------------------------------------------------
     */

    const originalName =
      file.name
        .replace(/[^a-zA-Z0-9._-]/g, "-")
        .toLowerCase();

    const timestamp =
      Date.now();

    const random =
      Math.random()
        .toString(36)
        .substring(2, 10);

    /**
     * --------------------------------------------------------
     * ORGANIZAÇÃO DOS UPLOADS
     * --------------------------------------------------------
     *
     * Exemplos:
     *
     * yuniexpress/logo/...
     * yuniexpress/banner/...
     * yuniexpress/product/...
     */

    const folder =
      purpose === "logo"
        ? "logo"
        : purpose === "banner"
        ? "banners"
        : purpose === "product"
        ? "products"
        : "general";

    const pathname =
      `yuniexpress/${folder}/${timestamp}-${random}-${originalName}`;

    /**
     * --------------------------------------------------------
     * UPLOAD PARA VERCEL BLOB
     * --------------------------------------------------------
     */

    const blob = await put(
      pathname,
      file,
      {
        access: "public",
        addRandomSuffix: false,
      }
    );

    /**
     * --------------------------------------------------------
     * SE FOR LOGO
     * --------------------------------------------------------
     *
     * Guardamos APENAS a URL no Prisma.
     *
     * Nunca guardamos Base64.
     */

    if (purpose === "logo") {
      await prisma.setting.upsert({
        where: {
          key: "store_logo",
        },

        update: {
          value: blob.url,
          type: "image",
        },

        create: {
          key: "store_logo",
          value: blob.url,
          type: "image",
        },
      });
    }

    /**
     * --------------------------------------------------------
     * RESPOSTA
     * --------------------------------------------------------
     */

    return NextResponse.json(
      {
        success: true,

        url: blob.url,

        pathname: blob.pathname,

        contentType: file.type,

        size: file.size,

        purpose,

        message:
          "Imagem carregada com sucesso.",
      },
      {
        status: 200,
      }
    );
  } catch (error: unknown) {
    console.error(
      "POST /api/upload error:",
      error
    );

    let message =
      "Erro ao carregar imagem.";

    if (error instanceof Error) {
      message = error.message;
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
