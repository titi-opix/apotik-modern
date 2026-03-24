import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { status } = await request.json();
    const { id } = await params;

    const po = await prisma.purchaseOrder.update({
      where: { id },
      data: { 
        status,
        receiveDate: status === "RECEIVED" ? new Date() : undefined
      },
    });

    return NextResponse.json(po);
  } catch (error) {
    console.error("Failed to update PO:", error);
    return NextResponse.json({ error: "Failed to update PO status" }, { status: 500 });
  }
}
