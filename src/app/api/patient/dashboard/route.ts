import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/patient/dashboard?userId=xxx
// Returns all data the patient dashboard needs in one call — straight from DB
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        healthRecords: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        consultationsAsPatient: {
          orderBy: { scheduledAt: "desc" },
          take: 10,
          include: {
            doctor: {
              select: {
                name: true,
                doctorProfile: { select: { specialization: true } },
              },
            },
          },
        },
        prescriptions: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const now = new Date();
    const upcoming = user.consultationsAsPatient.filter(
      (c: typeof user.consultationsAsPatient[0]) => c.scheduledAt && new Date(c.scheduledAt) > now && c.status !== "CANCELLED"
    );
    const past = user.consultationsAsPatient.filter(
      (c: typeof user.consultationsAsPatient[0]) => c.status === "COMPLETED" || (c.scheduledAt && new Date(c.scheduledAt) <= now)
    );

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        bloodGroup: user.bloodGroup,
        allergies: user.allergies,
        village: user.village,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
      },
      healthRecords: user.healthRecords.map((r: typeof user.healthRecords[0]) => ({
        id: r.id,
        type: r.type,
        title: r.title,
        date: r.createdAt,
        fileUrl: r.fileUrl,
        doctorName: r.doctorName,
      })),
      upcomingAppointments: upcoming.map((c: typeof user.consultationsAsPatient[0]) => ({
        id: c.id,
        doctorName: c.doctor?.name ?? null,
        specialty: c.doctor?.doctorProfile?.specialization ?? "General Physician",
        scheduledAt: c.scheduledAt,
        status: c.status,
        mode: c.connectionMode,
      })),
      pastAppointments: past.slice(0, 5).map((c: typeof user.consultationsAsPatient[0]) => ({
        id: c.id,
        doctorName: c.doctor?.name ?? null,
        date: c.scheduledAt,
        mode: c.connectionMode,
        status: c.status,
        notes: c.notes,
      })),
      prescriptions: user.prescriptions.map((p: typeof user.prescriptions[0]) => ({
        id: p.id,
        date: p.createdAt,
        diagnosis: p.diagnosis,
        medicines: p.medicines,
      })),
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}

// POST /api/patient/dashboard — add a vital reading as a health record
export async function POST(request: NextRequest) {
  try {
    const { userId, type, value, unit } = await request.json();

    if (!userId || !type || !value) {
      return NextResponse.json({ error: "userId, type, and value are required" }, { status: 400 });
    }

    const record = await prisma.healthRecord.create({
      data: {
        patientId: userId,
        title: `${type} Reading`,
        type: "VITAL",
        description: `${type}: ${value}${unit ? " " + unit : ""}`,
        fileUrl: null,
      },
    });

    return NextResponse.json({ success: true, record });
  } catch (error) {
    console.error("Save vital error:", error);
    return NextResponse.json({ error: "Failed to save vital" }, { status: 500 });
  }
}
