import { NextRequest, NextResponse } from "next/server";
import { generateOTP, storeOTP } from "@/lib/otp-store";

const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE = process.env.TWILIO_PHONE_NUMBER;

async function sendSMS(to: string, body: string): Promise<boolean> {
  if (!TWILIO_SID || !TWILIO_TOKEN || !TWILIO_PHONE) {
    return false;
  }
  try {
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: "Basic " + Buffer.from(`${TWILIO_SID}:${TWILIO_TOKEN}`).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          To: `+91${to}`,
          From: TWILIO_PHONE,
          Body: body,
        }),
      }
    );
    return res.ok;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();

    if (!phone || !/^\d{10}$/.test(phone)) {
      return NextResponse.json(
        { error: "Invalid phone number. Must be 10 digits." },
        { status: 400 }
      );
    }

    const otp = generateOTP();
    storeOTP(phone, otp);

    const message = `GraamSehat: Your login OTP is ${otp}. Valid for 5 minutes. Do not share this with anyone.`;
    const smsSent = await sendSMS(phone, message);

    if (smsSent) {
      console.log(`[OTP] Sent to +91${phone} via Twilio`);
      return NextResponse.json({ success: true, smsSent: true });
    }

    // Dev fallback: return OTP in response (only when Twilio not configured)
    console.log(`[OTP DEV] Phone: ${phone}, OTP: ${otp} (Twilio not configured)`);
    return NextResponse.json({
      success: true,
      smsSent: false,
      devOtp: process.env.NODE_ENV !== "production" ? otp : undefined,
    });
  } catch (error) {
    console.error("[send-otp] Error:", error);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
