import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "../../../lib/prisma";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export async function GET() {
  try {
    await headers();
    const expenses = await prisma.expense.findMany({
      orderBy: { date: "desc" },
    });
    return NextResponse.json(expenses);
  } catch (error) {
    console.error("Failed to fetch expenses:", error);
    return NextResponse.json({ error: "Failed to fetch expenses" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { description, amount, category, date } = body;

    if (!description || !amount || !category) {
      return NextResponse.json({ error: "Description, amount, and category are required" }, { status: 400 });
    }

    const expense = await prisma.expense.create({
      data: {
        description,
        amount: parseFloat(amount),
        category,
        date: date ? new Date(date) : new Date(),
      },
    });

    return NextResponse.json(expense);
  } catch (error) {
    console.error("Failed to create expense:", error);
    return NextResponse.json({ error: "Failed to create expense" }, { status: 500 });
  }
}
