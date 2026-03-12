"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Role = "patient" | "asha" | "doctor" | "pharmacy" | "admin";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [role, setRole] = useState<Role>("patient");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  // Handle resend timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleSendOTP = async () => {
    if (phone.length !== 10) return;
    setLoading(true);
    setError("");
    
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();

      if (res.ok) {
        setStep("otp");
        setResendCooldown(30);
        if (data.devOtp) {
          setDevOtp(data.devOtp);
        }
      } else {
        setError(data.error || "Failed to send OTP. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    
    // Auto-focus next input
    if (value && index < 5) {
      const next = document.getElementById(`otp-${index + 1}`);
      next?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otpString = otp.join("");
    if (otpString.length !== 6) return;
    
    setLoading(true);
    setError("");
    
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp: otpString, role }),
      });

      const data = await res.json();

      if (res.ok) {
        // Redirect based on role returned from server
        const dashboardMap: Record<string, string> = {
          PATIENT: "/dashboard/patient",
          ASHA: "/dashboard/asha",
          DOCTOR: "/dashboard/doctor",
          PHARMACY: "/dashboard/pharmacy",
          ADMIN: "/dashboard/admin",
        };
        router.push(dashboardMap[data.user.role] || "/dashboard/patient");
      } else {
        setError(data.error || "Invalid OTP. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-teal-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-white mb-4 shadow-xl shadow-primary/30">
            <span className="material-symbols-outlined text-3xl">health_and_safety</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            GraamSehat
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Rural Health. Digitally Connected.
          </p>
        </div>

        {devOtp && step === "otp" && (
          <div className="mb-4 p-4 bg-amber-100 border border-amber-200 rounded-xl text-amber-800 text-sm flex items-center gap-2 animate-pulse">
            <span className="material-symbols-outlined">developer_mode</span>
            <span><strong>Dev Mode:</strong> Use OTP <strong>{devOtp}</strong> (SMS not sent)</span>
          </div>
        )}

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 p-8">
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg text-xs font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">error</span>
              {error}
            </div>
          )}

          {step === "phone" ? (
            <>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Welcome back</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Enter your registered mobile number</p>

              <div className="flex flex-wrap gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-6">
                {(["patient", "asha", "doctor", "pharmacy", "admin"] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRole(r)}
                    className={`flex-1 min-w-[70px] py-2 px-1 rounded-lg text-[10px] font-bold capitalize transition-all ${
                      role === r ? "bg-white dark:bg-slate-700 text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {r === "asha" ? "ASHA" : r.charAt(0).toUpperCase() + r.slice(1)}
                  </button>
                ))}
              </div>

              <div className="mb-6">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Mobile Number</label>
                <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                  <span className="text-slate-500 font-semibold text-sm">+91</span>
                  <div className="w-px h-5 bg-slate-200 dark:bg-slate-600" />
                  <input
                    type="tel"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => {
                      setError("");
                      setPhone(e.target.value.replace(/\D/g, ""));
                    }}
                    placeholder="98765 43210"
                    className="flex-1 bg-transparent text-slate-900 dark:text-white outline-none font-semibold placeholder:font-normal placeholder:text-slate-400 tracking-wider"
                  />
                  <span className="material-symbols-outlined text-slate-400">phone</span>
                </div>
              </div>

              <button
                onClick={handleSendOTP}
                disabled={phone.length !== 10 || loading}
                className="w-full bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2"
              >
                {loading ? <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span> : <span className="material-symbols-outlined text-sm">sms</span>}
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>

              <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800 flex items-start gap-3">
                <span className="material-symbols-outlined text-amber-500 text-sm mt-0.5">info</span>
                <p className="text-xs text-amber-700 dark:text-amber-400">Works on 2G networks. No internet? Visit your nearest ASHA worker.</p>
              </div>
            </>
          ) : (
            <>
              <button 
                onClick={() => {
                  setStep("phone");
                  setDevOtp("");
                  setError("");
                }} 
                className="flex items-center gap-1 text-slate-500 hover:text-primary text-sm mb-6 transition-colors"
                disabled={loading}
              >
                <span className="material-symbols-outlined text-sm">arrow_back</span> Back
              </button>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Verify your number</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                Enter the 6-digit OTP sent to <span className="font-bold text-slate-700 dark:text-slate-300">+91 {phone}</span>
              </p>

              <div className="flex gap-2 sm:gap-3 justify-center mb-6">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-slate-900 dark:text-white"
                  />
                ))}
              </div>

              <button
                onClick={handleVerifyOTP}
                disabled={otp.join("").length !== 6 || loading}
                className="w-full bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2"
              >
                {loading ? <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span> : <span className="material-symbols-outlined text-sm">verified</span>}
                {loading ? "Verifying..." : "Verify & Login"}
              </button>

              <p className="text-center text-sm text-slate-500 mt-6">
                Didn&apos;t receive OTP?{" "}
                <button 
                  onClick={handleSendOTP}
                  disabled={loading || resendCooldown > 0}
                  className="text-primary font-bold hover:underline disabled:text-slate-400 disabled:no-underline"
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Now"}
                </button>
              </p>
            </>
          )}
        </div>

        <p className="text-center text-[11px] text-slate-400 mt-6">
          © 2024 GraamSehat. Powered by Nabha Civil Hospital Trust.
        </p>
      </div>
    </div>
  );
}
