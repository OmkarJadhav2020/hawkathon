import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/orders?patientId=...  OR  /api/orders?pharmacyId=...
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get("patientId");
    const pharmacyId = searchParams.get("pharmacyId");

    if (patientId) {
      const orders = await prisma.medicineOrder.findMany({
        where: { patientId },
        include: {
          pharmacyStock: { include: { pharmacy: true } },
        },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ orders });
    }

    if (pharmacyId) {
      // Get all orders for medicines belonging to this pharmacy
      const orders = await prisma.medicineOrder.findMany({
        where: {
          pharmacyStock: { pharmacyId },
        },
        include: {
          patient: { select: { id: true, name: true, phone: true, village: true } },
          pharmacyStock: true,
        },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ orders });
    }

    return NextResponse.json({ error: "patientId or pharmacyId is required" }, { status: 400 });
  } catch (error) {
    console.error("GET /api/orders error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST /api/orders — Patient places a medicine order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { patientId, pharmacyStockId, quantity = 1, prescriptionId, consultationId, notes, deliveryAddress } = body;

    if (!patientId || !pharmacyStockId) {
      return NextResponse.json({ error: "patientId and pharmacyStockId are required" }, { status: 400 });
    }

    const stock = await prisma.pharmacyStock.findUnique({ where: { id: pharmacyStockId } });
    if (!stock) return NextResponse.json({ error: "Medicine not found" }, { status: 404 });
    if (!stock.inStock || stock.quantity < quantity) {
      return NextResponse.json({ error: "Insufficient stock" }, { status: 400 });
    }

    const order = await prisma.medicineOrder.create({
      data: {
        patientId,
        pharmacyStockId,
        medicineName: stock.medicineName,
        quantity,
        prescriptionId: prescriptionId ?? null,
        consultationId: consultationId ?? null,
        notes: notes ?? null,
        deliveryAddress: deliveryAddress ?? null, // << Added from Phase 8
        status: "PENDING",
      },
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error("POST /api/orders error:", error);
    return NextResponse.json({ error: "Failed to place order" }, { status: 500 });
  }
}

// PATCH /api/orders — Pharmacy updates order status
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "id and status are required" }, { status: 400 });
    }

    const order = await prisma.medicineOrder.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ order });
  } catch (error) {
    console.error("PATCH /api/orders error:", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
