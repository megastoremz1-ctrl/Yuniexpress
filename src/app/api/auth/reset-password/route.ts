import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token e nova password são obrigatórios" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "A password deve ter pelo menos 6 caracteres" },
        { status: 400 }
      );
    }

    // Find the reset token
    const verificationToken = await prisma.verificationToken.findFirst({
      where: { token },
    });

    if (!verificationToken) {
      return NextResponse.json(
        { error: "Link inválido ou já utilizado" },
        { status: 400 }
      );
    }

    // Check if it's a reset token (identifier starts with "reset_")
    if (!verificationToken.identifier.startsWith("reset_")) {
      return NextResponse.json(
        { error: "Token inválido" },
        { status: 400 }
      );
    }

    // Check expiry
    if (new Date() > verificationToken.expires) {
      await prisma.verificationToken.delete({
        where: {
          identifier_token: {
            identifier: verificationToken.identifier,
            token: verificationToken.token,
          },
        },
      });
      return NextResponse.json(
        { error: "Link expirado. Solicite uma nova recuperação de password." },
        { status: 400 }
      );
    }

    // Extract email from identifier
    const email = verificationToken.identifier.replace("reset_", "");

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user password
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    // Delete the used token
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: verificationToken.identifier,
          token: verificationToken.token,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Password redefinida com sucesso! Pode fazer login.",
    });
  } catch (error: any) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
