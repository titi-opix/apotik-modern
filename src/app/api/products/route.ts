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
      include: {
        batches: {
          where: { currentQuantity: { gt: 0 } },
          orderBy: { expiryDate: "asc" },
          take: 1
        }
      },
      orderBy: { name: "asc" },
    });

    // Melakukan transformasi data agar expiryDate muncul di level utama (untuk UI)
    const formattedProducts = products.map(p => ({
      ...p,
      expiryDate: p.batches[0]?.expiryDate || null
    }));

    return NextResponse.json(formattedProducts);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      kfaCode, name, brandName, genericName, category, form, strength, unit, price, stock, expiryDate, batchNumber 
    } = body;

    if (!expiryDate) {
      return NextResponse.json({ error: "Tanggal kedaluwarsa (ED) wajib diisi" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // Create product
      const product = await tx.product.create({
        data: {
          kfaCode,
          name,
          brandName,
          genericName,
          category,
          form,
          strength,
          unit,
          stock: parseInt(stock) || 0,
          price: parseFloat(price) || 0,
        },
      });

      // Create initial batch if stock > 0
      if (parseInt(stock) > 0) {
        await tx.productBatch.create({
          data: {
            productId: product.id,
            batchNumber: batchNumber || "INITIAL",
            expiryDate: expiryDate ? new Date(expiryDate) : new Date(new Date().setFullYear(new Date().getFullYear() + 2)),
            initialQuantity: parseInt(stock),
            currentQuantity: parseInt(stock),
          },
        });
      }

      return product;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to create product:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
