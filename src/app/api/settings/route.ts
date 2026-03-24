import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "../../../lib/prisma";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export async function GET() {
  try {
    // Force dynamic behavior in Next.js 15
    await headers();
    
    const config = await (prisma as any).configuration.findMany();
    // Convert array to object for easier frontend use
    const settings = config.reduce((acc: Record<string, string>, item: any) => {
      acc[item.key] = item.value;
      return acc;
    }, {});

    
    return NextResponse.json(settings);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { settings } = body;

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json({ error: "Invalid settings data" }, { status: 400 });
    }

    // Update settings in a transaction
    await prisma.$transaction(
      Object.entries(settings).map(([key, value]) => 
        (prisma as any).configuration.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value) },
        })
      )
    );


    return NextResponse.json({ success: true, message: "Pengaturan berhasil disimpan." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
