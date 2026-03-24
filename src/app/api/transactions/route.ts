import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      items, 
      patientNik, 
      patientName, 
      doctorName, 
      doctorSip, 
      paymentMethod 
    } = body;

    // Use a transaction to ensure atomic operations with a higher timeout
    const result = await prisma.$transaction(async (tx) => {
      // 1. Find or create patient
      let patient = null;
      if (patientNik) {
        patient = await tx.patient.upsert({
          where: { nik: patientNik },
          update: { name: patientName },
          create: { nik: patientNik, name: patientName },
        });
      }

      // 2. Calculate totals and create transaction
      const totalAmount = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
      const invoiceNumber = `INV-${Date.now()}`;

      const transaction = await tx.transaction.create({
        data: {
          invoiceNumber,
          patientId: patient?.id,
          doctorName,
          doctorSip,
          totalAmount,
          paymentMethod,
          status: "COMPLETED",
          items: {
            create: items.map((item: any) => ({
              productId: item.id,
              quantity: item.quantity,
              price: item.price,
              subtotal: item.price * item.quantity,
            })),
          },
        },
      });

      // 3. Update stock using FEFO (First Expired, First Out)
      for (const item of items) {
        let remainingToDeduct = item.quantity;

        // Get active batches for this product ordered by expiry date
        const batches = await tx.productBatch.findMany({
          where: {
            productId: item.id,
            currentQuantity: { gt: 0 },
            expiryDate: { gt: new Date() },
          },
          orderBy: { expiryDate: "asc" },
        });

        if (batches.length === 0) {
          throw new Error(`Stok untuk produk ${item.name} habis, sudah kedaluwarsa, atau tidak memiliki data batch.`);
        }

        for (const batch of batches) {
          if (remainingToDeduct <= 0) break;

          const deduction = Math.min(batch.currentQuantity, remainingToDeduct);
          
          await tx.productBatch.update({
            where: { id: batch.id },
            data: { currentQuantity: batch.currentQuantity - deduction },
          });

          remainingToDeduct -= deduction;
        }

        if (remainingToDeduct > 0) {
          throw new Error(`Stok batch untuk ${item.name} tidak mencukupi (Sisa kurang: ${remainingToDeduct})`);
        }

        // Update overall product stock
        await tx.product.update({
          where: { id: item.id },
          data: { stock: { decrement: item.quantity } },
        });

        // Record stock movement (Regulatory Snapshot)
        await tx.stockMovement.create({
          data: {
            productId: item.id,
            type: "OUT",
            quantity: item.quantity,
            reason: "SALE",
            referenceId: transaction.id,
            patientName: patient?.name,
            patientAddress: patient?.address,
            doctorName: transaction.doctorName,
            doctorSip: transaction.doctorSip,
          },
        });
      }

      // 4. Fetch the full transaction with patient data
      const fullTransaction = await tx.transaction.findUnique({
        where: { id: transaction.id },
        include: { patient: true }
      });

      return {
        ...fullTransaction,
        patientName: fullTransaction?.patient?.name
      };
    }, {
      maxWait: 10000, // Wait for a connection up to 10s
      timeout: 30000, // Complete transaction within 30s
    });

    // Mock SatuSehat RME Integration
    console.log(`[SatuSehat] Syncing transaction ${result.invoiceNumber} to SatuSehat EMR...`);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Transaction failed:", error);
    return NextResponse.json({ error: error.message || "Transaction failed" }, { status: 500 });
  }
}
