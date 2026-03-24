import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "../../../../lib/prisma";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export async function GET() {
  try {
    // Get dates for current month in Jayapura (WIT)
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Jayapura',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    });
    
    const parts = formatter.formatToParts(now);
    const y = parseInt(parts.find(p => p.type === 'year')?.value || '0');
    const m = parseInt(parts.find(p => p.type === 'month')?.value || '0');
    
    // Start of month in Jayapura
    const startOfMonth = new Date(`${y}-${m.toString().padStart(2, '0')}-01T00:00:00+09:00`);
    
    // Fetch detailed movements for NARKOTIKA or PSIKOTROPIKA categories
    const movements = await prisma.stockMovement.findMany({
      where: {
        /*
        createdAt: {
          gte: startOfMonth,
        },
        */
        product: {
          category: {
            in: ["NARKOTIKA", "PSIKOTROPIKA"],
          },
        },
      },
      include: {
        product: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
 
    // Format data for detailed reporting
    const reportData = movements.map((m) => {
      const isOut = m.type === "OUT" || (m.type === "ADJUSTMENT" && m.quantity < 0);
      
      return {
        id: m.id,
        date: m.createdAt.toISOString().split('T')[0],
        productName: m.product.name,
        kfaCode: m.product.kfaCode,
        category: m.product.category,
        type: m.type,
        quantity: Math.abs(m.quantity),
        unit: m.product.unit,
        
        // Pemasukan (Incoming) Details
        pbfName: m.pbfName || (m.type === "IN" ? "PBF Swasta" : "-"),
        invoiceNumber: m.invoiceNumber || "-",
        
        // Pengeluaran (Outgoing) Details
        patientName: m.patientName || (isOut ? "Umum" : "-"),
        patientAddress: m.patientAddress || "-",
        doctorName: m.doctorName || "-",
        doctorSip: m.doctorSip || "-",
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
