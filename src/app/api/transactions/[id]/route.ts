import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Get transaction details to revert stock
      const transaction = await tx.transaction.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!transaction) {
        throw new Error("Transaction not found");
      }

      // 2. Revert stock for each item
      for (const item of transaction.items) {
        // Increment product stock
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });

        // Record stock reversal movement
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            type: "IN",
            quantity: item.quantity,
            reason: "CANCELLED_TRANSACTION",
            referenceId: transaction.id,
          },
        });
      }

      // 3. Delete transaction items (Explicitly)
      await tx.transactionItem.deleteMany({
        where: { transactionId: id },
      });

      // 4. Delete the transaction
      await tx.transaction.delete({
        where: { id },
      });

      return { message: "Transaction deleted and stock reverted" };
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Delete transaction failed:", error);
    return NextResponse.json({ error: error.message || "Failed to delete transaction" }, { status: 500 });
  }
}
