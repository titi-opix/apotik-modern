import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function POST() {
  try {
    // Perform reset in a transaction to ensure all or nothing
    await prisma.$transaction(async (tx) => {
      // 1. Delete all transactional data
      // Order matters to avoid foreign key constraints if they are not Cascading
      await tx.stockMovement.deleteMany({});
      await tx.transactionItem.deleteMany({});
      await tx.transaction.deleteMany({});
      await tx.purchaseOrderItem.deleteMany({});
      await tx.purchaseOrder.deleteMany({});
      await tx.productBatch.deleteMany({});
      await tx.product.deleteMany({});
      await tx.patient.deleteMany({});
      await tx.expense.deleteMany({});
      
      // Note: We keep Employee and Configuration
    });

    return NextResponse.json({ message: "Data reset successfully" });
  } catch (error: any) {
    console.error("Data reset failed:", error);
    return NextResponse.json({ error: error.message || "Failed to reset data" }, { status: 500 });
  }
}
