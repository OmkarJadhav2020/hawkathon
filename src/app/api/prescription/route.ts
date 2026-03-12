import { NextRequest, NextResponse } from "next/server";

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE = process.env.TWILIO_PHONE_NUMBER;

interface PrescriptionPayload {
  patientPhone: string;
  patientName: string;
  doctorName: string;
  medicines: { name: string; dosage: string }[];
  instructions?: string;
  prescriptionId: string;
}

export async function POST(request: NextRequest) {
  try {
    const payload: PrescriptionPayload = await request.json();

    if (!payload.patientPhone || !payload.medicines?.length) {
      return NextResponse.json({ error: "Missing patient phone or medicines" }, { status: 400 });
    }

    // Format the SMS message (concise for trial limits)
    const medsList = payload.medicines.map((m) => m.name).join(", ");
    const smsBody = `GS Rx ${payload.prescriptionId}\n${payload.patientName}: ${medsList}\nView: https://graamsehat.in/rx/${payload.prescriptionId}`;

    // If Twilio is configured, send actual SMS
    if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_PHONE) {
      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
      const formData = new URLSearchParams({
        To: payload.patientPhone,
        From: TWILIO_PHONE,
        Body: smsBody,
      });

      const twilioResponse = await fetch(twilioUrl, {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      if (!twilioResponse.ok) {
        const err = await twilioResponse.json();
        console.error("Twilio error:", err);
        // Still return success — prescription exists even if SMS fails
        return NextResponse.json({
          success: true,
          smsSent: false,
          smsError: err.message || "Twilio error",
          prescriptionId: payload.prescriptionId,
          preview: smsBody,
        });
      }

      const twilioData = await twilioResponse.json();
      return NextResponse.json({
        success: true,
        smsSent: true,
        sid: twilioData.sid,
        prescriptionId: payload.prescriptionId,
      });
    }

    // Twilio not configured — log and return preview
    console.log("📱 SMS Preview (Twilio not configured):\n", smsBody);
    return NextResponse.json({
      success: true,
      smsSent: false,
      smsError: "Twilio credentials not configured in .env",
      prescriptionId: payload.prescriptionId,
      preview: smsBody,
    });
  } catch (error) {
    console.error("Prescription SMS error:", error);
    return NextResponse.json({ error: "Failed to process prescription" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing prescription id" }, { status: 400 });

  // In production: fetch from DB via Prisma
  // SELECT * FROM Prescription WHERE id = id
  return NextResponse.json({
    id,
    status: "ISSUED",
    message: "Prescription found. Connect to PostgreSQL to retrieve full data.",
  });
}
