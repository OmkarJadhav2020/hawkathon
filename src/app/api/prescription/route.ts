import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE = process.env.TWILIO_PHONE_NUMBER;

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const {
      patientPhone,
      patientName,
      doctorName,
      medicines,
      instructions,
      consultationId,
      diagnosis,
    } = payload;

    if (!consultationId) {
      return NextResponse.json({ error: "consultationId is required" }, { status: 400 });
    }

    // Get the consultation to find patientId
    const consultation = await prisma.consultation.findUnique({
      where: { id: consultationId },
      select: { patientId: true, doctorId: true },
    });

    if (!consultation) {
      return NextResponse.json({ error: "Consultation not found" }, { status: 404 });
    }

    // Check if a prescription already exists for this consultation
    const existing = await prisma.prescription.findUnique({
      where: { consultationId },
    });

    let prescription;
    if (existing) {
      // Update existing
      prescription = await prisma.prescription.update({
        where: { consultationId },
        data: {
          doctorName: doctorName ?? "Doctor",
          diagnosis: diagnosis ?? "General",
          instructions: instructions ?? "",
          medicines: medicines ?? [],
          smsPhone: patientPhone,
        },
      });
    } else {
      // Create new prescription
      prescription = await prisma.prescription.create({
        data: {
          consultationId,
          patientId: consultation.patientId,
          doctorName: doctorName ?? "Doctor",
          diagnosis: diagnosis ?? "General",
          instructions: instructions ?? "",
          medicines: medicines ?? [],
          smsPhone: patientPhone,
          smsDelivered: false,
        },
      });
    }

    // Try to send SMS if Twilio is configured
    let smsSent = false;
    if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_PHONE && patientPhone) {
      const medsList = (medicines ?? []).map((m: { name: string }) => m.name).join(", ");
      const smsBody = `GraamSehat Rx\nPatient: ${patientName}\nDiagnosis: ${diagnosis}\nMeds: ${medsList}\nDoctor: ${doctorName}`;
      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
      try {
        const twilioResponse = await fetch(twilioUrl, {
          method: "POST",
          headers: {
            Authorization: `Basic ${Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64")}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({ To: patientPhone, From: TWILIO_PHONE, Body: smsBody }).toString(),
        });
        if (twilioResponse.ok) {
          smsSent = true;
          await prisma.prescription.update({
            where: { id: prescription.id },
            data: { smsDelivered: true },
          });
        }
      } catch (e) {
        console.error("Twilio SMS error:", e);
      }
    }

    return NextResponse.json({
      success: true,
      prescriptionId: prescription.id,
      smsSent,
      smsError: smsSent ? undefined : "Twilio not configured or failed. Prescription saved to DB.",
    });
  } catch (error) {
    console.error("POST /api/prescription error:", error);
    return NextResponse.json({ error: "Failed to save prescription" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const consultId = searchParams.get("consultId");

    if (!id && !consultId) {
      return NextResponse.json({ error: "Missing id or consultId" }, { status: 400 });
    }

    const prescription = await prisma.prescription.findFirst({
      where: id ? { id } : { consultationId: consultId! },
      include: {
        consultation: {
          select: {
            patient: { select: { name: true, phone: true, village: true, bloodGroup: true } },
          },
        },
      },
    });

    if (!prescription) {
      return NextResponse.json({ error: "Prescription not found" }, { status: 404 });
    }

    return NextResponse.json(prescription);
  } catch (error) {
    console.error("GET /api/prescription error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
