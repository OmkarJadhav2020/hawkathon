import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/records?userId=...
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    // Get patient profile
    const patient = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        bloodGroup: true,
        allergies: true,
        gender: true,
        dateOfBirth: true,
        village: true,
        phone: true,
      },
    });

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    // Get health records
    const healthRecords = await prisma.healthRecord.findMany({
      where: { patientId: userId },
      orderBy: { createdAt: "desc" },
    });

    // Get consultation history (completed)
    const consultations = await prisma.consultation.findMany({
      where: {
        patientId: userId,
        status: "COMPLETED",
      },
      include: {
        doctor: { select: { name: true } },
        prescription: { select: { id: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ patient, healthRecords, consultations });
  } catch (error) {
    console.error("API Error - GET /api/records:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
