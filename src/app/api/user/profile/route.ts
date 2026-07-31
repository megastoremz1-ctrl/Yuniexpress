import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// Get user profile
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, phone: true, image: true, createdAt: true },
  });

  return NextResponse.json({ user });
}

// Update user profile
export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { name, phone } = await request.json();

  const updateData: any = {};
  if (name !== undefined) updateData.name = name;
  if (phone !== undefined) updateData.phone = phone;

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: updateData,
    select: { id: true, name: true, email: true, phone: true },
  });

  return NextResponse.json({ user, message: "Perfil actualizado com sucesso" });
}
