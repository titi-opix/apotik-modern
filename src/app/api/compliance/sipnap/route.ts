import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
  try {
    // Fetch products in NARKOTIKA or PSIKOTROPIKA categories
    const products = await prisma.product.findMany({
      where: {
        category: {
          in: ["NARKOTIKA", "PSIKOTROPIKA"],
        },
      },
      include: {
        transactionItems: {
          include: {
            transaction: true,
          },
        },
        movements: true,
      },
    });

    // Format data for reporting
    const reportData = products.map((p) => {
      const sales = p.transactionItems.reduce((sum, item) => sum + item.quantity, 0);
      return {
        id: p.id,
        name: p.name,
        category: p.category,
        kfaCode: p.kfaCode,
        currentStock: p.stock,
        totalSales: sales,
        unit: p.unit,
      };
    });

    return NextResponse.json(reportData);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items to report" }, { status: 400 });
    }

    // Simulate sending to Kemenkes SIPNAP portal
    console.log(`[SIPNAP] Sending report for ${items.length} items to Kemenkes...`);
    
    // In a real scenario, we might record the report submission in a 'ComplianceReport' table
    
    return NextResponse.json({ 
      success: true, 
      message: "Laporan SIPNAP berhasil dikirim ke portal Kemenkes RI.",
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
