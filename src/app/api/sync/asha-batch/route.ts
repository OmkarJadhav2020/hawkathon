import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/sync/asha-batch
// Registers patients from an ASHA camp or direct registration
// Body: { ashaWorkerId, campId, campDate, village, records: [{patientName, phone, gender, bloodGroup, dateOfBirth, vitals, symptoms, notes}] }
export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const { ashaWorkerId, campId, campDate, village, records } = payload;

    if (!ashaWorkerId || !records?.length) {
      return NextResponse.json({ error: "ashaWorkerId and records[] are required" }, { status: 400 });
    }

    const results = {
      accepted: 0,
      failed: 0,
      errors: [] as string[],
      patients: [] as { id: string; name: string; isNew: boolean }[],
    };

    for (const record of records) {
      try {
        if (!record.patientName?.trim()) {
          results.failed++;
          results.errors.push("Missing patient name");
          continue;
        }

        // Upsert the patient user — phone is optional for ASHA registrations
        let patientUser;
        const phone = record.phone?.replace(/\D/g, "");
        const normalizedPhone = phone ? (phone.startsWith("+91") ? phone : `+91${phone}`) : null;

        if (normalizedPhone) {
          // Try to find by phone first
          patientUser = await prisma.user.upsert({
            where: { phone: normalizedPhone },
            update: {
              // Update existing patient's info if they registered offline before
              village: record.village ?? village ?? undefined,
              gender: record.gender ?? undefined,
              bloodGroup: record.bloodGroup ?? undefined,
            },
            create: {
              phone: normalizedPhone,
              name: record.patientName.trim(),
              role: "PATIENT",
              village: record.village ?? village ?? null,
              gender: record.gender ?? null,
              bloodGroup: record.bloodGroup ?? null,
              dateOfBirth: record.dateOfBirth ? new Date(record.dateOfBirth) : null,
              allergies: record.allergies ?? [],
            },
          });
        } else {
          // No phone — create with a unique placeholder (ASHA can register without phone)
          patientUser = await prisma.user.create({
            data: {
              phone: `ASHA_${ashaWorkerId}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
              name: record.patientName.trim(),
              role: "PATIENT",
              village: record.village ?? village ?? null,
              gender: record.gender ?? null,
              bloodGroup: record.bloodGroup ?? null,
              dateOfBirth: record.dateOfBirth ? new Date(record.dateOfBirth) : null,
              allergies: record.allergies ?? [],
            },
          });
        }

        // Log to OfflineSyncQueue for audit trail
        await prisma.offlineSyncQueue.create({
          data: {
            type: "REGISTRATION",
            ashaWorkerId,
            syncStatus: "SYNCED", // Directly synced since we wrote to DB
            payload: {
              campId: campId ?? "DIRECT",
              campDate: campDate ?? new Date().toISOString(),
              village: village ?? null,
              patientId: patientUser.id,
              record,
            },
          },
        });

        results.accepted++;
        results.patients.push({ id: patientUser.id, name: patientUser.name, isNew: true });
      } catch (err) {
        console.error("Registration error for record:", record.patientName, err);
        results.failed++;
        results.errors.push(`Failed to register ${record.patientName}: ${err instanceof Error ? err.message : "unknown error"}`);
      }
    }

    // Update ASHA worker's last sync time
    await prisma.ashaWorkerProfile.updateMany({
      where: { userId: ashaWorkerId },
      data: { lastSyncAt: new Date(), isOnline: true },
    });

    return NextResponse.json({
      success: true,
      message: `Registered ${results.accepted} patient(s). ${results.failed > 0 ? `${results.failed} failed.` : ""}`,
      accepted: results.accepted,
      failed: results.failed,
      errors: results.errors,
      patients: results.patients,
    });
  } catch (error) {
    console.error("ASHA batch sync error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const count = await prisma.offlineSyncQueue.count({ where: { syncStatus: "PENDING" } });
    return NextResponse.json({ pendingRecords: count, lastChecked: new Date().toISOString() });
  } catch {
    return NextResponse.json({ pendingRecords: 0, lastChecked: new Date().toISOString() });
  }
}
