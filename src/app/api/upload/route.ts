import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// Upload image - stores as base64 in database (works on serverless like Vercel)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // Check admin role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const purpose = formData.get("purpose") as string; // "logo", "banner", "product"

    if (!file) {
      return NextResponse.json({ error: "Nenhum ficheiro enviado" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Tipo de ficheiro não suportado. Use: JPG, PNG, WebP, GIF ou SVG" },
        { status: 400 }
      );
    }

    // Max 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Ficheiro muito grande. Máximo: 5MB" },
        { status: 400 }
      );
    }

    // Convert to base64 data URL (works on serverless/Vercel)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;

    // Save reference in database
    const imageId = `img_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    
    await prisma.setting.upsert({
      where: { key: `upload_${imageId}` },
      update: { value: dataUrl },
      create: {
        key: `upload_${imageId}`,
        value: dataUrl,
        type: "image",
      },
    });

    // If it's a logo, also update the store_logo setting
    if (purpose === "logo") {
      await prisma.setting.upsert({
        where: { key: "store_logo" },
        update: { value: dataUrl },
        create: { key: "store_logo", value: dataUrl, type: "image" },
      });
    }

    return NextResponse.json({
      success: true,
      url: dataUrl,
      imageId,
      message: "Imagem carregada com sucesso",
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Erro ao carregar imagem" },
      { status: 500 }
    );
  }
}
