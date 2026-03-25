import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "../../../../lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await headers();
    const { id } = await params;
    const employee = await prisma.employee.findUnique({
      where: { id },
    });

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    return NextResponse.json(employee);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch employee" }, { status: 500 });
  }
}

import bcrypt from "bcryptjs";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { nik, username, password, name, role, phone, address, salary, isActive, serkom, strap, sipa } = body;

    const data: any = {};
    if (nik !== undefined) data.nik = nik;
    // @ts-ignore
    if (username !== undefined) data.username = username;
    if (name !== undefined) data.name = name;
    if (role !== undefined) data.role = role;
    if (phone !== undefined) data.phone = phone;
    if (address !== undefined) data.address = address;
    if (isActive !== undefined) data.isActive = isActive;
    if (serkom !== undefined) data.serkom = serkom;
    if (strap !== undefined) data.strap = strap;
    if (sipa !== undefined) data.sipa = sipa;
    if (salary !== undefined) data.salary = salary ? parseFloat(salary) : null;

    if (password) {
      // @ts-ignore
      data.password = await bcrypt.hash(password, 12);
    }

    const employee = await prisma.employee.update({
      where: { id },
      data,
    });

    return NextResponse.json(employee);
  } catch (error: any) {
    console.error("PATCH /api/employees/[id] error:", error);
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Employee with this NIK already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update employee" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    await prisma.employee.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Employee deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete employee" }, { status: 500 });
  }
}
