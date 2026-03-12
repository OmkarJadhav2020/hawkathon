import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";
import { verifyOTP } from "@/lib/otp-store";
import prisma from "@/lib/prisma";

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET ?? "graamsehat-dev-secret-change-in-production"
);

const ROLE_MAP: Record<string, string> = {
  patient: "PATIENT",
  asha: "ASHA",
  doctor: "DOCTOR",
  pharmacy: "PHARMACY",
  admin: "ADMIN",
};

export async function POST(request: NextRequest) {
  try {
    const { phone, otp, role } = await request.json();

    // Validate inputs
    if (!phone || !/^\d{10}$/.test(phone)) {
      return NextResponse.json({ error: "Invalid phone number." }, { status: 400 });
    }
    if (!otp || otp.length !== 6) {
      return NextResponse.json({ error: "OTP must be 6 digits." }, { status: 400 });
    }
    const prismaRole = ROLE_MAP[role ?? "patient"];
    if (!prismaRole) {
      return NextResponse.json({ error: "Invalid role." }, { status: 400 });
    }

    // Verify OTP
    const result = verifyOTP(phone, otp);
    if (!result.success) {
      const messages: Record<string, string> = {
        not_found: "OTP not found. Please request a new one.",
        expired: "OTP has expired. Please request a new one.",
        invalid: "Invalid OTP. Please try again.",
        too_many_attempts: "Too many incorrect attempts. Please request a new OTP.",
      };
      return NextResponse.json(
        { error: messages[result.reason] ?? "Verification failed." },
        { status: 401 }
      );
    }

    // Find or create user in database
    const user = await prisma.user.upsert({
      where: { phone },
      create: {
        phone,
        name: `User ${phone.slice(-4)}`, // Default name; user can update later
        role: prismaRole as never,
      },
      update: {
        // Update role if user logs in under a different role
        role: prismaRole as never,
      },
      select: { id: true, name: true, role: true, phone: true },
    });

    // Create JWT session token (7 days)
    const token = await new SignJWT({
      userId: user.id,
      phone: user.phone,
      role: user.role,
      name: user.name,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(JWT_SECRET);

    // Set HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, role: user.role },
    });

    response.cookies.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("[verify-otp] Error:", error);
    return NextResponse.json({ error: "Authentication failed. Please try again." }, { status: 500 });
  }
}
