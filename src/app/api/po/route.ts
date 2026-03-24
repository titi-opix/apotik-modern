import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "../../../lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await headers();
    const pos = await prisma.purchaseOrder.findMany({
      include: {
        pbf: true,
        items: {
          include: { product: true }
        }
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(pos);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch PO list" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pbfId, items } = body;

    if (!pbfId || !items || items.length === 0) {
      return NextResponse.json({ error: "PBF and items are required" }, { status: 400 });
    }

    const poCount = await prisma.purchaseOrder.count();
    const poNumber = `PO-${new Date().getFullYear()}-${(poCount + 1).toString().padStart(4, "0")}`;

    const totalAmount = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

    const po = await prisma.purchaseOrder.create({
      data: {
        poNumber,
        pbfId,
        totalAmount,
        status: "PENDING",
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.price * item.quantity
          }))
        }
      },
      include: {
        pbf: true,
        items: {
          include: { product: true }
        }
      }
    });

    return NextResponse.json(po);
  } catch (error: any) {
    console.error("PO Creation failed:", error);
    return NextResponse.json({ error: "Failed to create PO" }, { status: 500 });
  }
}
