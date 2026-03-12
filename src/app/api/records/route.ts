import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/records?userId=... OR ?id=...
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const id = searchParams.get("id");

    // Single record lookup by id
    if (id) {
      const record = await prisma.healthRecord.findUnique({
        where: { id },
        include: {
          patient: {
            select: { id: true, name: true, village: true, bloodGroup: true, phone: true },
          },
        },
      });
      if (!record) return NextResponse.json({ error: "Record not found" }, { status: 404 });
      return NextResponse.json(record);
    }

    if (!userId) {
      return NextResponse.json({ error: "userId or id is required" }, { status: 400 });
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

// POST /api/records — Doctor adds a health record for a patient
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { patientId, type, title, description, doctorName } = body;

    if (!patientId || !title) {
      return NextResponse.json({ error: "patientId and title are required" }, { status: 400 });
    }

    // Validate patient exists
    const patient = await prisma.user.findUnique({ where: { id: patientId }, select: { id: true } });
    if (!patient) return NextResponse.json({ error: "Patient not found" }, { status: 404 });

    const record = await prisma.healthRecord.create({
      data: {
        patientId,
        type: type ?? "GENERAL",
        title,
        description: description ?? null,
        doctorName: doctorName ?? null,
        fileUrl: null,
        syncStatus: "SYNCED",
      },
    });

    return NextResponse.json({ success: true, record }, { status: 201 });
  } catch (error) {
    console.error("API Error - POST /api/records:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
