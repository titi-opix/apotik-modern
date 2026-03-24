import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "../../../lib/prisma";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export async function GET() {
  try {
    // Force dynamic behavior in Next.js 15
    await headers();
    
    const products = await prisma.product.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const product = await prisma.product.create({
      data: {
        kfaCode: body.kfaCode,
        name: body.name,
        brandName: body.brandName,
        genericName: body.genericName,
        category: body.category,
        form: body.form,
        strength: body.strength,
        unit: body.unit,
        stock: parseInt(body.stock) || 0,
        price: parseFloat(body.price) || 0,
        expiryDate: body.expiryDate ? new Date(body.expiryDate) : null,
      },
    });
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
