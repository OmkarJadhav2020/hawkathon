import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/asha?ashaId=...
// Returns ASHA worker profile, assigned village patients, and recent offline tasks
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ashaId = searchParams.get("ashaId");

    if (!ashaId) {
      return NextResponse.json({ error: "ashaId is required" }, { status: 400 });
    }

    const asha = await prisma.user.findUnique({
      where: { id: ashaId },
      include: { ashaWorker: true },
    });

    if (!asha) {
      return NextResponse.json({ error: "ASHA worker not found" }, { status: 404 });
    }

    const assignedVillages = asha.ashaWorker?.villagesAssigned ?? [];

    // Patients in the assigned villages
    const patients = await prisma.user.findMany({
      where: {
        role: "PATIENT",
        village: assignedVillages.length > 0 ? { in: assignedVillages } : undefined,
      },
      select: {
        id: true,
        name: true,
        village: true,
        bloodGroup: true,
        allergies: true,
        phone: true,
        gender: true,
        dateOfBirth: true,
        consultationsAsPatient: {
          take: 1,
          orderBy: { createdAt: "desc" },
          select: { status: true, createdAt: true, symptoms: true },
        },
      },
      take: 20,
      orderBy: { createdAt: "desc" },
    });

    // Pending sync items
    const syncQueue = await prisma.offlineSyncQueue.findMany({
      where: { ashaWorkerId: ashaId, syncStatus: "PENDING" },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    // Available doctors
    const doctors = await prisma.user.findMany({
      where: {
        role: "DOCTOR",
        doctorProfile: { isAvailable: true },
      },
      select: {
        id: true,
        name: true,
        doctorProfile: {
          select: { specialization: true },
        },
      },
    });

    return NextResponse.json({
      profile: {
        id: asha.id,
        name: asha.name,
        villages: assignedVillages,
        totalCamps: asha.ashaWorker?.totalCamps ?? 0,
        isOnline: asha.ashaWorker?.isOnline ?? false,
        lastSync: asha.ashaWorker?.lastSyncAt ?? null,
        district: asha.ashaWorker?.district ?? "",
      },
      patients,
      syncQueue,
      doctors,
    });
  } catch (error) {
    console.error("ASHA API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
