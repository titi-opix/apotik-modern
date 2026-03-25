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

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`[API] Attempting to delete product: ${id}`);

    await prisma.$transaction(async (tx) => {
      // 0. Verify product exists
      const product = await tx.product.findUnique({ where: { id } });
      if (!product) {
        console.warn(`[API] Product ${id} not found for deletion`);
        throw new Error("Produk sudah tidak ada atau telah dihapus.");
      }

      console.log(`[API] Product found: ${product.name}. Deleting associated records...`);

      // 1. Delete associated data first
      await tx.productBatch.deleteMany({ where: { productId: id } });
      await tx.stockMovement.deleteMany({ where: { productId: id } });
      await tx.transactionItem.deleteMany({ where: { productId: id } });
      await tx.purchaseOrderItem.deleteMany({ where: { productId: id } });

      // 2. Delete the product
      await tx.product.delete({ where: { id } });
      console.log(`[API] Product ${id} deleted successfully`);
    });

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error: any) {
    console.error("Delete product failed:", error);
    return NextResponse.json({ error: error.message || "Failed to delete product" }, { status: 500 });
  }
}
