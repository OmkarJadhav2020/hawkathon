import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/stats
export async function GET() {
  try {
    const [
      totalPatients,
      totalDoctors,
      totalConsultations,
      completedConsultations,
      pendingConsultations,
      totalPharmacies,
      totalHealthRecords,
      totalPrescriptions,
      recentConsultations,
      doctorsWithProfiles,
      ashaWorkers,
    ] = await Promise.all([
      prisma.user.count({ where: { role: "PATIENT" } }),
      prisma.user.count({ where: { role: "DOCTOR" } }),
      prisma.consultation.count(),
      prisma.consultation.count({ where: { status: "COMPLETED" } }),
      prisma.consultation.count({ where: { status: "PENDING" } }),
      prisma.user.count({ where: { role: "PHARMACY" } }),
      prisma.healthRecord.count(),
      prisma.prescription.count(),
      prisma.consultation.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          patient: { select: { name: true, village: true } },
          doctor: { select: { name: true } },
        },
      }),
      prisma.user.findMany({
        where: { role: "DOCTOR" },
        include: {
          doctorProfile: true,
          consultationsAsDoctor: { where: { status: "PENDING" } },
        },
      }),
      prisma.user.findMany({
        where: { role: "ASHA" },
        include: { ashaWorker: true },
      }),
    ]);

    // Triage distribution
    const triageCounts = await prisma.consultation.groupBy({
      by: ["triageCategory"],
      _count: { triageCategory: true },
    });

    // Village-wise patient distribution (top 5 villages)
    const villageData = await prisma.user.groupBy({
      by: ["village"],
      where: { role: "PATIENT", village: { not: null } },
      _count: { village: true },
      orderBy: { _count: { village: "desc" } },
      take: 5,
    });

    return NextResponse.json({
      totals: {
        patients: totalPatients,
        doctors: totalDoctors,
        consultations: totalConsultations,
        completed: completedConsultations,
        pending: pendingConsultations,
        pharmacies: totalPharmacies,
        healthRecords: totalHealthRecords,
        prescriptions: totalPrescriptions,
      },
      triage: triageCounts.map((t: { triageCategory: string | null; _count: { triageCategory: number } }) => ({
        category: t.triageCategory ?? "UNKNOWN",
        count: t._count.triageCategory,
      })),
      villages: villageData.map((v: { village: string | null; _count: { village: number } }) => ({
        village: v.village ?? "Unknown",
        count: v._count.village,
      })),
      recentConsultations,
      doctors: doctorsWithProfiles.map((d: (typeof doctorsWithProfiles)[0]) => ({
        id: d.id,
        name: d.name,
        specialization: d.doctorProfile?.specialization ?? "General",
        isAvailable: d.doctorProfile?.isAvailable ?? false,
        pendingQueue: d.consultationsAsDoctor.length,
      })),
      ashaWorkers: ashaWorkers.map((a: (typeof ashaWorkers)[0]) => ({
        id: a.id,
        name: a.name,
        villages: a.ashaWorker?.villagesAssigned ?? [],
        totalCamps: a.ashaWorker?.totalCamps ?? 0,
        isOnline: a.ashaWorker?.isOnline ?? false,
        lastSync: a.ashaWorker?.lastSyncAt ?? null,
      })),
    });
  } catch (error) {
    console.error("API Error - GET /api/admin/stats:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
