import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// GET /api/appointments?userId=...
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    // 1. Fetch upcoming appointments
    const upcoming = await prisma.consultation.findMany({
      where: {
        patientId: userId,
        status: {
          in: ["PENDING", "IN_PROGRESS"],
        },
      },
      include: {
        doctor: {
          include: {
            doctorProfile: true,
          },
        },
      },
      orderBy: {
        scheduledAt: "asc",
      },
    });

    // 2. Fetch past appointments
    const past = await prisma.consultation.findMany({
      where: {
        patientId: userId,
        status: "COMPLETED",
      },
      include: {
        doctor: {
          include: {
            doctorProfile: true, // we might need doctor name
          },
        },
      },
      orderBy: {
        scheduledAt: "desc",
      },
    });

    // 3. Fetch available doctors
    const doctors = await prisma.user.findMany({
      where: {
        role: "DOCTOR",
      },
      include: {
        doctorProfile: true,
      },
    });

    return NextResponse.json({
      upcoming,
      past,
      doctors,
    });
  } catch (error) {
    console.error("API Error - GET /api/appointments:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST /api/appointments - Book a new appointment
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { patientId, doctorId, connectionMode = "VIDEO", scheduledFor } = body;

    if (!patientId || !doctorId) {
      return NextResponse.json({ error: "patientId and doctorId are required" }, { status: 400 });
    }

    const consultation = await prisma.consultation.create({
      data: {
        patientId,
        doctorId,
        status: "PENDING",
        connectionMode,
        scheduledAt: scheduledFor ? new Date(scheduledFor) : new Date(), // If no specific time, it's a queue booking now
      },
    });

    return NextResponse.json(consultation, { status: 201 });
  } catch (error) {
    console.error("API Error - POST /api/appointments:", error);
    return NextResponse.json({ error: "Failed to book appointment" }, { status: 500 });
  }
}
// PATCH /api/appointments - Cancel or Reschedule an appointment
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, action, scheduledAt } = body;

    if (!id || !action) {
      return NextResponse.json({ error: "id and action are required" }, { status: 400 });
    }

    if (action === "cancel") {
      await prisma.consultation.update({
        where: { id },
        data: { status: "COMPLETED", notes: "Cancelled by patient" },
      });
      return NextResponse.json({ success: true, message: "Appointment cancelled successfully" });
    }

    if (action === "reschedule") {
      if (!scheduledAt) {
        return NextResponse.json({ error: "scheduledAt is required for reschedule" }, { status: 400 });
      }
      await prisma.consultation.update({
        where: { id },
        data: { scheduledAt: new Date(scheduledAt) },
      });
      return NextResponse.json({ success: true, message: "Appointment rescheduled successfully" });
    }

    return NextResponse.json({ error: "Invalid action. Use cancel or reschedule" }, { status: 400 });
  } catch (error) {
    console.error("API Error - PATCH /api/appointments:", error);
    return NextResponse.json({ error: "Failed to update appointment" }, { status: 500 });
  }
}
