import { NextRequest, NextResponse } from "next/server";

// In-memory store as placeholder until PostgreSQL is connected
const stockCache: Record<string, { medicineName: string; quantity: number; updatedAt: string }[]> = {};

interface PharmacyStockItem {
  medicineName: string;
  genericName?: string;
  quantity: number;
  expiryDate?: string;
  price?: number;
}

interface StockUpdatePayload {
  pharmacyId: string;
  pharmacyName?: string;
  items: PharmacyStockItem[];
}

// POST: pharmacy pushes stock update
export async function POST(request: NextRequest) {
  try {
    const payload: StockUpdatePayload = await request.json();

    if (!payload.pharmacyId || !payload.items?.length) {
      return NextResponse.json({ error: "Missing pharmacyId or items" }, { status: 400 });
    }

    // Validate items
    const validItems = payload.items.filter((item) => item.medicineName && item.quantity >= 0);
    if (validItems.length === 0) {
      return NextResponse.json({ error: "No valid items in payload" }, { status: 400 });
    }

    // Cache stock
    stockCache[payload.pharmacyId] = validItems.map((item) => ({
      medicineName: item.medicineName,
      quantity: item.quantity,
      updatedAt: new Date().toISOString(),
    }));

    // In production:
    // await prisma.pharmacyStock.upsert({ where: { pharmacyId_medicineName: ... }, update: {...}, create: {...} })

    console.log(`[PharmacySync] Updated ${validItems.length} items for pharmacy ${payload.pharmacyId}`);

    return NextResponse.json({
      success: true,
      pharmacyId: payload.pharmacyId,
      itemsUpdated: validItems.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Pharmacy sync error:", error);
    return NextResponse.json({ error: "Failed to sync stock" }, { status: 500 });
  }
}

// GET: check availability of a medicine across pharmacies
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const medicine = searchParams.get("medicine");
  const pharmacyId = searchParams.get("pharmacyId");

  if (pharmacyId) {
    // Return specific pharmacy stock
    const stock = stockCache[pharmacyId];
    if (!stock) {
      return NextResponse.json({ pharmacyId, items: [], message: "No stock data found. Use POST to sync stock." });
    }

    const filtered = medicine
      ? stock.filter((s) => s.medicineName.toLowerCase().includes(medicine.toLowerCase()))
      : stock;

    return NextResponse.json({ pharmacyId, items: filtered, lastUpdated: filtered[0]?.updatedAt });
  }

  if (medicine) {
    // Cross-pharmacy search
    const results: { pharmacyId: string; inStock: boolean; quantity: number }[] = [];
    for (const [pId, items] of Object.entries(stockCache)) {
      const match = items.find((i) => i.medicineName.toLowerCase().includes(medicine.toLowerCase()));
      if (match) {
        results.push({ pharmacyId: pId, inStock: match.quantity > 0, quantity: match.quantity });
      }
    }
    return NextResponse.json({ medicine, pharmacies: results, total: results.length });
  }

  // Return all pharmacies with stock summary
  const summary = Object.entries(stockCache).map(([id, items]) => ({
    pharmacyId: id,
    totalItems: items.length,
    lastUpdated: items[0]?.updatedAt,
  }));

  return NextResponse.json({ pharmacies: summary });
}
