import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// Get user's last used address
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ address: null });
    }

    // Get most recent address
    const address = await prisma.address.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    if (address) {
      return NextResponse.json({
        address: {
          name: address.name,
          phone: address.phone,
          province: address.province,
          city: address.city,
          district: address.district,
          address: address.address,
        },
      });
    }

    // No address found, return user name at least
    return NextResponse.json({
      address: {
        name: session.user.name || "",
        phone: "",
        province: "",
        city: "",
        district: "",
        address: "",
      },
    });
  } catch {
    return NextResponse.json({ address: null });
  }
}
