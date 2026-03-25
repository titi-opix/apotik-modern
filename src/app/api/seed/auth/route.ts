import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const hashedPassword = await bcrypt.hash("admin123", 12);
    
    const admin = await prisma.employee.upsert({
      // @ts-ignore
      where: { username: "admin" },
      update: {
        // @ts-ignore
        password: hashedPassword,
        role: "ADMIN",
        isActive: true,
      },
      create: {
        nik: "1234567890",
        // @ts-ignore
        username: "admin",
        name: "Administrator",
        password: hashedPassword,
        role: "ADMIN",
        isActive: true,
      },
    });

    return NextResponse.json({ 
      message: "Admin user seeded successfully", 
      // @ts-ignore
      username: admin.username 
    });
  } catch (error: any) {
    console.error("Seed failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
