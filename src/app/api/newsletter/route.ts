import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Email inválido" },
        { status: 400 }
      );
    }

    // Check if already subscribed (using Settings table)
    const existing = await prisma.setting.findUnique({
      where: { key: `newsletter_${email}` },
    });

    if (existing) {
      return NextResponse.json(
        { message: "Este email já está subscrito!" },
        { status: 200 }
      );
    }

    // Save subscription
    await prisma.setting.create({
      data: {
        key: `newsletter_${email}`,
        value: email,
        type: "string",
      },
    });

    return NextResponse.json(
      { message: "Subscrito com sucesso! Receberá as nossas ofertas." },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Newsletter error:", error);
    return NextResponse.json(
      { error: "Erro ao processar subscrição" },
      { status: 500 }
    );
  }
}
