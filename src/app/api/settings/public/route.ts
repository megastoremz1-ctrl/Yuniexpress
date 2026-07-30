import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Public settings - accessible without auth (for homepage, layout, etc.)
export async function GET(request: NextRequest) {
  try {
    const settings = await prisma.setting.findMany({
      where: {
        key: {
          in: [
            "store_name",
            "store_logo",
            "store_tagline",
            "support_email",
            "support_phone",
            "announcement_bar",
            "announcement_active",
            "homepage_title",
            "default_margin_percent",
          ],
        },
      },
    });

    const settingsMap: Record<string, string> = {};
    settings.forEach((s: any) => {
      settingsMap[s.key] = s.value;
    });

    return NextResponse.json({ settings: settingsMap });
  } catch (error) {
    return NextResponse.json({ settings: {} });
  }
}
