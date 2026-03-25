import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const count = await prisma.employee.count();
    const employees = await prisma.employee.findMany({
      select: {
        nik: true,
        username: true,
        name: true,
        role: true,
        isActive: true,
      },
      take: 10
    });

    return NextResponse.json({
      success: true,
      totalEmployees: count,
      sample: employees,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
