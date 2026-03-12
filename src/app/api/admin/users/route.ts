import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/admin/users
// Body: { role: "DOCTOR"|"PATIENT", name, phone, ...roleFields }
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { role, name, phone, specialization, village, gender, bloodGroup, allergies } = body;

    if (!role || !name || !phone) {
      return NextResponse.json({ error: "role, name, and phone are required" }, { status: 400 });
    }

    // Normalize phone
    const normalizedPhone = phone.startsWith("+91") ? phone : `+91${phone}`;

    // Check if phone already exists
    const existing = await prisma.user.findFirst({ where: { phone: normalizedPhone } });
    if (existing) {
      return NextResponse.json({ error: "A user with this phone number already exists." }, { status: 409 });
    }

    if (role === "DOCTOR") {
      if (!specialization) {
        return NextResponse.json({ error: "specialization is required for doctors" }, { status: 400 });
      }
      // Auto-generate a registration number
      const regNo = `MCI${Date.now().toString().slice(-8)}`;

      const user = await prisma.user.create({
        data: {
          phone: normalizedPhone,
          name,
          role: "DOCTOR",
          doctorProfile: {
            create: {
              specialization,
              registrationNo: regNo,
              isAvailable: true,
            },
          },
        },
        include: { doctorProfile: true },
      });

      return NextResponse.json({
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        doctorProfileId: user.doctorProfile?.id,
        registrationNo: regNo,
      });
    }

    if (role === "PATIENT") {
      const user = await prisma.user.create({
        data: {
          phone: normalizedPhone,
          name,
          role: "PATIENT",
          village: village || null,
          gender: gender || null,
          bloodGroup: bloodGroup || null,
          allergies: allergies ? (typeof allergies === "string" ? allergies.split(",").map((a: string) => a.trim()).filter(Boolean) : allergies) : [],
        },
      });

      return NextResponse.json({
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
      });
    }

    return NextResponse.json({ error: "role must be DOCTOR or PATIENT" }, { status: 400 });
  } catch (error) {
    console.error("Admin create user error:", error);
    return NextResponse.json({ error: "Failed to create user. Please try again." }, { status: 500 });
  }
}
