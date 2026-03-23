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

    // Use a transaction to ensure atomic operations
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

      // 2. Create the transaction
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

      // 3. Update stock and record movement
      for (const item of items) {
        await tx.product.update({
          where: { id: item.id },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });

        await tx.stockMovement.create({
          data: {
            productId: item.id,
            type: "OUT",
            quantity: item.quantity,
            reason: "SALE",
            referenceId: transaction.id,
          },
        });
      }

      return transaction;
    });

    // Mock SatuSehat RME Integration
    console.log(`[SatuSehat] Syncing transaction ${result.invoiceNumber} to SatuSehat EMR...`);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Transaction failed:", error);
    return NextResponse.json({ error: error.message || "Transaction failed" }, { status: 500 });
  }
}
