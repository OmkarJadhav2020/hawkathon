/**
 * In-memory OTP store with 5-minute TTL.
 * For production, replace with Redis (ioredis already in package.json).
 */

interface OTPEntry {
  otp: string;
  expiresAt: number; // Unix timestamp ms
  attempts: number;
}

// Using globalThis to survive Next.js hot-reload in dev
const globalStore = globalThis as unknown as { otpStore: Map<string, OTPEntry> };
if (!globalStore.otpStore) {
  globalStore.otpStore = new Map<string, OTPEntry>();
}

const store = globalStore.otpStore;

const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_ATTEMPTS = 5;

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function storeOTP(phone: string, otp: string): void {
  store.set(phone, {
    otp,
    expiresAt: Date.now() + OTP_TTL_MS,
    attempts: 0,
  });
}

export type VerifyResult =
  | { success: true }
  | { success: false; reason: "not_found" | "expired" | "invalid" | "too_many_attempts" };

export function verifyOTP(phone: string, inputOtp: string): VerifyResult {
  const entry = store.get(phone);

  if (!entry) return { success: false, reason: "not_found" };
  if (Date.now() > entry.expiresAt) {
    store.delete(phone);
    return { success: false, reason: "expired" };
  }
  if (entry.attempts >= MAX_ATTEMPTS) {
    store.delete(phone);
    return { success: false, reason: "too_many_attempts" };
  }

  entry.attempts++;

  if (entry.otp !== inputOtp) {
    return { success: false, reason: "invalid" };
  }

  // OTP is correct — delete it so it can't be reused
  store.delete(phone);
  return { success: true };
}

export function deleteOTP(phone: string): void {
  store.delete(phone);
}
