import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// Upload profile photo (stores as base64 data URL in user.image)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Nenhum ficheiro enviado" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Tipo de ficheiro não suportado. Use: JPG, PNG ou WebP" },
        { status: 400 }
      );
    }

    // Max 2MB for avatars
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Ficheiro muito grande. Máximo: 2MB" },
        { status: 400 }
      );
    }

    // Convert to base64 data URL
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;

    // Update user image
    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: dataUrl },
    });

    return NextResponse.json({
      success: true,
      url: dataUrl,
      message: "Foto de perfil actualizada",
    });
  } catch (error: any) {
    console.error("Avatar upload error:", error);
    return NextResponse.json(
      { error: "Erro ao carregar foto" },
      { status: 500 }
    );
  }
}
