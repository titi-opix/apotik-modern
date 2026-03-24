import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 1. Fetch Transactions with items and patient/doctor info
    const transactions = await prisma.transaction.findMany({
      include: {
        items: {
          include: { product: true }
        },
        patient: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // 2. Fetch Expenses
    const expenses = await prisma.expense.findMany({
      orderBy: { date: "desc" },
    });

    // 3. Fetch Products with batches
    const products = await prisma.product.findMany({
      include: {
        batches: {
          where: { currentQuantity: { gt: 0 } },
          orderBy: { expiryDate: "asc" }
        }
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      transactions,
      expenses,
      products
    });
  } catch (error) {
    console.error("Report data fetch failed:", error);
    return NextResponse.json({ error: "Failed to fetch report data" }, { status: 500 });
  }
}
