import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET ?? "graamsehat-dev-secret-change-in-production"
);

const ROLE_DASHBOARD: Record<string, string> = {
  PATIENT: "/dashboard/patient",
  ASHA: "/dashboard/asha",
  DOCTOR: "/dashboard/doctor",
  PHARMACY: "/dashboard/pharmacy",
  ADMIN: "/dashboard/admin",
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /dashboard/* routes
  if (!pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  const token = request.cookies.get("session")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const role = payload.role as string;
    const expectedBase = ROLE_DASHBOARD[role];

    // Role-based protection: prevent accessing another role's dashboard
    // Allow ADMIN to access any dashboard (for oversight)
    if (role !== "ADMIN" && expectedBase && !pathname.startsWith(expectedBase)) {
      return NextResponse.redirect(new URL(expectedBase, request.url));
    }

    return NextResponse.next();
  } catch {
    // Invalid or expired token — clear cookie and redirect to login
    const response = NextResponse.redirect(new URL("/", request.url));
    response.cookies.delete("session");
    return response;
  }
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
