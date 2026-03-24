import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "../../../lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await headers();
    const employees = await prisma.employee.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(employees);
  } catch (error) {
    console.error("GET /api/employees error:", error);
    return NextResponse.json({ error: "Failed to fetch employee list" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nik, name, role, phone, address, salary, serkom, strap, sipa } = body;

    if (!nik || !name) {
      return NextResponse.json({ error: "NIK and Name are required" }, { status: 400 });
    }

    const employee = await prisma.employee.create({
      data: {
        nik,
        name,
        role: role || "Karyawan",
        phone,
        address,
        salary: salary ? parseFloat(salary) : null,
        serkom,
        strap,
        sipa,
      },
    });

    return NextResponse.json(employee);
  } catch (error: any) {
    console.error("POST /api/employees error:", error);
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Employee with this NIK already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create employee" }, { status: 500 });
  }
}
