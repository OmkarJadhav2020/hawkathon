import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/auth/login
// Body: { phone: string, role: "patient"|"asha"|"doctor"|"pharmacy"|"admin" }
// Returns: { id, name, role, phone, ...profile specific fields }
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, role } = body;

    if (!phone || !role) {
      return NextResponse.json({ error: "phone and role are required" }, { status: 400 });
    }

    // Normalize phone: ensure it has +91 prefix
    const normalizedPhone = phone.startsWith("+91") ? phone : `+91${phone}`;
    const roleEnum = role.toUpperCase() as "PATIENT" | "ASHA" | "DOCTOR" | "PHARMACY" | "ADMIN";

    // Find existing user — must match BOTH phone AND role exactly
    const user = await prisma.user.findFirst({
      where: { phone: normalizedPhone, role: roleEnum },
      select: {
        id: true,
        name: true,
        role: true,
        phone: true,
        village: true,
        doctorProfile: { select: { id: true, specialization: true, isAvailable: true } },
        ashaWorker: { select: { id: true, villagesAssigned: true, district: true } },
        pharmacy: { select: { id: true, name: true } },
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          error: "No account found. Please use a registered phone number for your role.",
          hint: "Test credentials: Patient 7767827080 | Doctor 9876000001 | ASHA 9876000002 | Pharmacy 9876000003 | Admin 9876000099",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      role: user.role,
      phone: user.phone,
      village: user.village,
      // Role-specific profile IDs
      doctorProfileId: user.doctorProfile?.id ?? null,
      ashaProfileId: user.ashaWorker?.id ?? null,
      pharmacyProfileId: user.pharmacy?.id ?? null,
      specialization: user.doctorProfile?.specialization ?? null,
      villagesAssigned: user.ashaWorker?.villagesAssigned ?? [],
      pharmacyName: user.pharmacy?.name ?? null,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Login failed. Please try again." }, { status: 500 });
  }
}
