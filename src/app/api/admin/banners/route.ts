import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function checkAdmin() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) return null;
  return session.user;
}

// Get all banners
export async function GET(request: NextRequest) {
  const admin = await checkAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const banners = await prisma.banner.findMany({
    orderBy: { order: "asc" },
  });

  return NextResponse.json({ banners });
}

// Create banner
export async function POST(request: NextRequest) {
  const admin = await checkAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const { title, subtitle, image, link } = await request.json();

  if (!image) {
    return NextResponse.json({ error: "Imagem obrigatória" }, { status: 400 });
  }

  const maxOrder = await prisma.banner.aggregate({ _max: { order: true } });

  const banner = await prisma.banner.create({
    data: {
      title: title || null,
      subtitle: subtitle || null,
      image,
      link: link || null,
      order: (maxOrder._max.order || 0) + 1,
    },
  });

  return NextResponse.json({ banner }, { status: 201 });
}

// Update banner
export async function PUT(request: NextRequest) {
  const admin = await checkAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const { id, ...data } = await request.json();

  if (!id) {
    return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });
  }

  const banner = await prisma.banner.update({
    where: { id },
    data,
  });

  return NextResponse.json({ banner });
}

// Delete banner
export async function DELETE(request: NextRequest) {
  const admin = await checkAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });
  }

  await prisma.banner.delete({ where: { id } });

  return NextResponse.json({ message: "Banner eliminado" });
}
