import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const CONSULT_INCLUDE = {
  patient: {
    select: {
      id: true,
      name: true,
      village: true,
      phone: true,
      bloodGroup: true,
      allergies: true,
      gender: true,
    },
  },
  doctor: {
    select: { id: true, name: true },
  },
  prescription: true,
};

// GET /api/consultations?doctorId=... or ?patientId=... or ?id=...
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get("doctorId");
    const patientId = searchParams.get("patientId");
    const id = searchParams.get("id");

    // Single consultation lookup
    if (id) {
      const consultation = await prisma.consultation.findUnique({
        where: { id },
        include: CONSULT_INCLUDE,
      });
      if (!consultation) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      return NextResponse.json(consultation);
    }

    if (!doctorId && !patientId) {
      return NextResponse.json({ error: "doctorId, patientId, or id is required" }, { status: 400 });
    }

    const where: Record<string, unknown> = doctorId ? { doctorId } : { patientId: patientId! };

    const consultations = await prisma.consultation.findMany({
      where,
      include: CONSULT_INCLUDE,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(consultations);
  } catch (error) {
    console.error("API Error - GET /api/consultations:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PATCH /api/consultations?id=... — Save notes, change status
export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const body = await request.json();
    const { notes, status, triageCategory, doctorId } = body;

    const updated = await prisma.consultation.update({
      where: { id },
      data: {
        ...(notes !== undefined && { notes }),
        ...(status !== undefined && { status }),
        ...(triageCategory !== undefined && { triageCategory }),
        ...(doctorId !== undefined && { doctorId }),
        ...(status === "COMPLETED" && { completedAt: new Date() }),
        ...(status === "IN_PROGRESS" && { startedAt: new Date() }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("API Error - PATCH /api/consultations:", error);
    return NextResponse.json({ error: "Failed to update consultation" }, { status: 500 });
  }
}
