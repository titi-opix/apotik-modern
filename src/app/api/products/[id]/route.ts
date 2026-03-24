import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { quantity, batchNumber, expiryDate, reason, pbfName, invoiceNumber } = body;

    if (!expiryDate) {
      return NextResponse.json({ error: "Tanggal kedaluwarsa (ED) wajib diisi" }, { status: 400 });
    }

    const amount = parseInt(quantity);
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create new batch
      const batch = await tx.productBatch.create({
        data: {
          productId: id,
          batchNumber: batchNumber || `RESTOCK-${Date.now()}`,
          expiryDate: new Date(expiryDate),
          initialQuantity: amount,
          currentQuantity: amount,
        },
      });

      // 2. Update total product stock
      await tx.product.update({
        where: { id },
        data: { stock: { increment: amount } },
      });

      // 3. Record movement
        await tx.stockMovement.create({
          data: {
            productId: id,
            type: "IN",
            quantity: amount,
            reason: reason || "PURCHASE",
            referenceId: batch.id,
            pbfName: pbfName,
            invoiceNumber: invoiceNumber,
          },
        });

      return batch;
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Restock failed:", error);
    return NextResponse.json({ error: error.message || "Failed to restock" }, { status: 500 });
  }
}
