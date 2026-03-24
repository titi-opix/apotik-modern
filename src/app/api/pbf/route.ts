import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "../../../lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await headers();
    const pbf = await prisma.pBF.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(pbf);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch PBF list" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, address, phone, pic } = body;

    if (!name) {
      return NextResponse.json({ error: "PBF name is required" }, { status: 400 });
    }

    const pbf = await prisma.pBF.create({
      data: { name, address, phone, pic },
    });

    return NextResponse.json(pbf);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create PBF" }, { status: 500 });
  }
}
