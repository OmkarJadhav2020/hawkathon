import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/auth/login
// Body: { phone: string, role: "patient"|"asha"|"doctor"|"pharmacy"|"admin" }
// Returns: { id, name, role, phone }
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, role } = body;

    if (!phone || !role) {
      return NextResponse.json({ error: "phone and role are required" }, { status: 400 });
    }

    const roleEnum = role.toUpperCase() as "PATIENT" | "ASHA" | "DOCTOR" | "PHARMACY" | "ADMIN";

    // Try to find existing user
    let user = await prisma.user.findFirst({
      where: { phone, role: roleEnum },
      select: { id: true, name: true, role: true, phone: true, village: true },
    });

    // If not found, create a demo user so the system works without seed data
    if (!user) {
      const defaultNames: Record<string, string> = {
        PATIENT: "Rajesh Kumar",
        ASHA: "Sunita Devi",
        DOCTOR: "Dr. Ananya Sharma",
        PHARMACY: "City Medicos",
        ADMIN: "Admin User",
      };

      user = await prisma.user.create({
        data: {
          phone,
          name: defaultNames[roleEnum] ?? "User",
          role: roleEnum,
          village: roleEnum === "PATIENT" ? "Rampur Village" : undefined,
        },
        select: { id: true, name: true, role: true, phone: true, village: true },
      });

      // Create profile for doctor if needed
      if (roleEnum === "DOCTOR") {
        await prisma.doctorProfile.upsert({
          where: { userId: user.id },
          create: {
            userId: user.id,
            specialization: "General Physician",
            registrationNo: `REG-${Date.now()}`,
            isAvailable: true,
          },
          update: {},
        });
      }
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      role: user.role,
      phone: user.phone,
      village: user.village,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
