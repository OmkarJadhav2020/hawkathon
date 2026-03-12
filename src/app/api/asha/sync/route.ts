import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/asha/sync?ashaId=...
// Syncs all pending OfflineSyncQueue items for an ASHA worker
// Updates lastSyncAt and isOnline on their AshaWorkerProfile
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ashaId = searchParams.get("ashaId");

    if (!ashaId) {
      return NextResponse.json({ error: "ashaId is required" }, { status: 400 });
    }

    // Count pending items before sync
    const pendingItems = await prisma.offlineSyncQueue.findMany({
      where: { ashaWorkerId: ashaId, syncStatus: "PENDING" },
      select: { id: true, type: true },
    });

    // Mark all pending items as SYNCED
    const { count: synced } = await prisma.offlineSyncQueue.updateMany({
      where: { ashaWorkerId: ashaId, syncStatus: "PENDING" },
      data: { syncStatus: "SYNCED", syncedAt: new Date() },
    });

    // Update ASHA worker profile
    await prisma.ashaWorkerProfile.updateMany({
      where: { userId: ashaId },
      data: {
        lastSyncAt: new Date(),
        isOnline: true,
      },
    });

    return NextResponse.json({
      success: true,
      synced,
      types: pendingItems.reduce((acc, item) => {
        acc[item.type] = (acc[item.type] ?? 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      timestamp: new Date().toISOString(),
      message: synced > 0
        ? `Successfully synced ${synced} record(s) to GraamSehat servers.`
        : "All records already synced. Database is up to date.",
    });
  } catch (error) {
    console.error("ASHA Sync error:", error);
    return NextResponse.json({ error: "Sync failed. Please try again." }, { status: 500 });
  }
}
