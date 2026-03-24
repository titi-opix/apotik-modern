import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "../../../../lib/prisma";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export async function GET() {
  try {
    // Force dynamic behavior in Next.js 15
    await headers();
    
    const products = await prisma.product.findMany({
      orderBy: { name: "asc" },
    });

    const reportData = products.map((p) => ({
      id: p.id,
      name: p.name,
      kfaCode: p.kfaCode,
      stock: p.stock,
      unit: p.unit,
      price: p.price,
      expiryDate: p.expiryDate,
    }));

    return NextResponse.json(reportData);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items to sync" }, { status: 400 });
    }

    // Simulate synchronization with SIMONA portal
    console.log(`[SIMONA] Synchronizing stock for ${items.length} items to SIMONA...`);
    
    return NextResponse.json({ 
      success: true, 
      message: "Data stok berhasil disinkronkan ke portal SIMONA Kemenkes RI.",
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
