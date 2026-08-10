import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID!;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID!;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY!;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME!;

const R2_ENDPOINT =
  process.env.R2_ENDPOINT ||
  `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;

const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL;

const s3 = new S3Client({
  region: "auto",
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

async function checkAdmin() {
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
}

export async function POST(request: NextRequest) {
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

    if (
      !R2_ACCOUNT_ID ||
      !R2_ACCESS_KEY_ID ||
      !R2_SECRET_ACCESS_KEY ||
      !R2_BUCKET_NAME
    ) {
      console.error("R2 environment variables missing");

      return NextResponse.json(
        {
          success: false,
          error: "Cloudflare R2 não está configurado.",
        },
        { status: 500 }
      );
    }

    const formData = await request.formData();

    const file = formData.get("file");
    const purpose =
      String(formData.get("purpose") || "general");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          error: "Nenhum ficheiro enviado.",
        },
        { status: 400 }
      );
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/svg+xml",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Tipo de ficheiro não suportado. Use JPG, PNG, WebP, GIF ou SVG.",
        },
        { status: 400 }
      );
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      return NextResponse.json(
        {
          success: false,
          error: "Ficheiro muito grande. Máximo: 5MB.",
        },
        { status: 400 }
      );
    }

    const extensionMap: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/gif": "gif",
      "image/svg+xml": "svg",
    };

    const extension =
      extensionMap[file.type] || "bin";

    const randomId =
      `${Date.now().toString(36)}-${Math.random()
        .toString(36)
        .slice(2, 10)}`;

    const safePurpose = purpose
      .replace(/[^a-zA-Z0-9-_]/g, "")
      .toLowerCase();

    const key =
      `yuniexpress/${safePurpose}/${randomId}.${extension}`;

    const bytes = await file.arrayBuffer();

    await s3.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
        Body: Buffer.from(bytes),
        ContentType: file.type,
        CacheControl:
          "public, max-age=31536000, immutable",
      })
    );

    /**
     * URL pública
     *
     * Exemplo:
     * https://cdn.yuniexpress.shop/yuniexpress/logo/abc.png
     */
    const publicUrl = R2_PUBLIC_URL
      ? `${R2_PUBLIC_URL.replace(/\/$/, "")}/${key}`
      : `${R2_ENDPOINT}/${R2_BUCKET_NAME}/${key}`;

    /**
     * Para logo, guardar somente a URL.
     */
    if (purpose === "logo") {
      await prisma.setting.upsert({
        where: {
          key: "store_logo",
        },

        update: {
          value: publicUrl,
          type: "image",
        },

        create: {
          key: "store_logo",
          value: publicUrl,
          type: "image",
        },
      });
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      key,
      purpose,
      message:
        "Imagem carregada com sucesso para o Cloudflare R2.",
    });
  } catch (error) {
    console.error(
      "Cloudflare R2 upload error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Erro ao carregar imagem.",
      },
      { status: 500 }
    );
  }
}