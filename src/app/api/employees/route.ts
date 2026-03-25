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

import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      nik, username, password, name, role, phone, address, salary, 
      serkom, stra, sipa, strttk, sipttk 
    } = body;

    if (!nik || !name || !username || !password) {
      return NextResponse.json({ error: "NIK, Name, Username, and Password are required" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const employee = await prisma.employee.create({
      data: {
        nik,
        // @ts-ignore
        username,
        // @ts-ignore
        password: hashedPassword,
        name,
        role: role || "STAFF",
        phone,
        address,
        salary: salary ? parseFloat(salary) : null,
        serkom,
        // @ts-ignore
        stra,
        sipa,
        // @ts-ignore
        strttk,
        // @ts-ignore
        sipttk,
      },
    });

    return NextResponse.json(employee);
  } catch (error: any) {
    console.error("POST /api/employees error:", error);
    if (error.code === "P2002") {
      return NextResponse.json({ error: `Data duplikat: ${error.meta?.target || "NIK atau Username sudah ada"}` }, { status: 400 });
    }
    return NextResponse.json({ error: `Gagal create: ${error.message}` }, { status: 500 });
  }
}
