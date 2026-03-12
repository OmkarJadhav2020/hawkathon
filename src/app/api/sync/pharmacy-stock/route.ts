import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Fetch all pharmacy stock (or filter by ?medicine=...)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const medicine = searchParams.get("medicine");
    const pharmacyId = searchParams.get("pharmacyId");

    const where: Record<string, unknown> = {};
    if (medicine) {
      where.OR = [
        { medicineName: { contains: medicine, mode: "insensitive" } },
        { genericName: { contains: medicine, mode: "insensitive" } },
      ];
    }
    if (pharmacyId) {
      where.pharmacyId = pharmacyId;
    }

    const stock = await prisma.pharmacyStock.findMany({
      where,
      include: {
        pharmacy: {
          select: { name: true, address: true, phone: true },
        },
      },
      orderBy: { medicineName: "asc" },
    });

    return NextResponse.json({ stock, total: stock.length });
  } catch (error) {
    console.error("Pharmacy stock GET error:", error);
    return NextResponse.json({ error: "Failed to fetch stock" }, { status: 500 });
  }
}

// POST: Pharmacy updates their stock
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pharmacyId, items } = body;

    if (!pharmacyId || !items?.length) {
      return NextResponse.json({ error: "Missing pharmacyId or items" }, { status: 400 });
    }

    // Verify the pharmacy exists
    const pharmacy = await prisma.pharmacyProfile.findUnique({ where: { id: pharmacyId } });
    if (!pharmacy) {
      return NextResponse.json({ error: "Pharmacy not found" }, { status: 404 });
    }

    const upserted: unknown[] = [];
    for (const item of items) {
      if (!item.medicineName || item.quantity == null) continue;
      const result = await prisma.pharmacyStock.upsert({
        where: {
          // Use a unique constraint — add this manually if needed
          // For now, find by pharmacyId + medicineName
          id: item.id || "non-existent-id",
        },
        update: {
          quantity: item.quantity,
          inStock: item.quantity > 0,
          price: item.price ?? null,
          genericName: item.genericName ?? null,
          expiryDate: item.expiryDate ? new Date(item.expiryDate) : null,
        },
        create: {
          pharmacyId,
          medicineName: item.medicineName,
          genericName: item.genericName ?? null,
          quantity: item.quantity,
          unit: item.unit ?? "tablets",
          price: item.price ?? null,
          inStock: item.quantity > 0,
          expiryDate: item.expiryDate ? new Date(item.expiryDate) : null,
        },
      });
      upserted.push(result);
    }

    return NextResponse.json({ success: true, itemsUpdated: upserted.length });
  } catch (error) {
    console.error("Pharmacy stock POST error:", error);
    return NextResponse.json({ error: "Failed to update stock" }, { status: 500 });
  }
}
