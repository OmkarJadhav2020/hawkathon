import { NextRequest, NextResponse } from "next/server";

// Redis client - configured in lib/redis.ts
// For now using in-memory queue as placeholder until Redis is configured
const inMemoryQueue: Record<string, unknown>[] = [];

interface BatchRecord {
  patientName: string;
  phone?: string;
  age?: number;
  gender?: string;
  village?: string;
  vitals?: {
    bp?: string;
    sugar?: number;
    temperature?: number;
    weight?: number;
  };
  symptoms?: string[];
  notes?: string;
}

interface BatchPayload {
  ashaWorkerId: string;
  campId: string;
  campDate: string;
  village: string;
  records: BatchRecord[];
}

export async function POST(request: NextRequest) {
  try {
    const payload: BatchPayload = await request.json();

    if (!payload.ashaWorkerId || !payload.records?.length) {
      return NextResponse.json({ error: "Invalid batch payload" }, { status: 400 });
    }

    const results = {
      accepted: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Process each record in the batch
    for (const record of payload.records) {
      try {
        if (!record.patientName) {
          results.failed++;
          results.errors.push(`Missing patient name in record`);
          continue;
        }

        // Queue the record for database write
        const queueItem = {
          id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: "ASHA_BATCH_REGISTRATION",
          ashaWorkerId: payload.ashaWorkerId,
          campId: payload.campId,
          campDate: payload.campDate,
          village: payload.village,
          record,
          queuedAt: new Date().toISOString(),
          status: "PENDING",
        };

        // In production: await redis.lpush('asha_sync_queue', JSON.stringify(queueItem));
        inMemoryQueue.push(queueItem);
        results.accepted++;
      } catch {
        results.failed++;
        results.errors.push(`Failed to queue record for ${record.patientName}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Queued ${results.accepted} records for sync. ${results.failed} failed.`,
      ...results,
      queueSize: inMemoryQueue.length,
    });
  } catch (error) {
    console.error("ASHA batch sync error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  // Return queue status
  return NextResponse.json({
    queueSize: inMemoryQueue.length,
    pendingRecords: inMemoryQueue.filter((r) => r.status === "PENDING").length,
    lastChecked: new Date().toISOString(),
  });
}
