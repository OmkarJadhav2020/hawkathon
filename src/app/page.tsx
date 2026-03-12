"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"patient" | "asha" | "doctor" | "pharmacy" | "admin">("patient");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (phone.length !== 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, role }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Login failed. Please try again.");
        setLoading(false);
        return;
      }

      const user = await res.json();

      // Store user in localStorage for all dashboards to read
      localStorage.setItem("userId", user.id);
      localStorage.setItem("userName", user.name);
      localStorage.setItem("userRole", user.role);
      localStorage.setItem("userPhone", user.phone);
      if (user.village) localStorage.setItem("userVillage", user.village);

      // Role-specific ID keys (for easier access)
      if (user.role === "DOCTOR") localStorage.setItem("doctorId", user.id);
      if (user.role === "PATIENT") localStorage.setItem("patientId", user.id);
      if (user.role === "ASHA") localStorage.setItem("ashaId", user.id);

      // Navigate to the right dashboard
      if (role === "doctor") router.push("/dashboard/doctor");
      else if (role === "asha") router.push("/dashboard/asha");
      else if (role === "pharmacy") router.push("/dashboard/pharmacy");
      else if (role === "admin") router.push("/dashboard/admin");
      else router.push("/dashboard/patient");
    } catch {
      setError("Network error. Please check your connection.");
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

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 p-8">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Welcome back</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Select your role and enter your mobile number to continue</p>

          {/* Role selector */}
          <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-6">
            {(["patient", "asha", "doctor", "pharmacy", "admin"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`flex-1 py-2 px-3 rounded-lg text-[10px] font-bold capitalize transition-all ${
                  role === r ? "bg-white dark:bg-slate-700 text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {r === "asha" ? "ASHA" : r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>

          {/* Phone input */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Mobile Number</label>
            <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
              <span className="text-slate-500 font-semibold text-sm">+91</span>
              <div className="w-px h-5 bg-slate-200 dark:bg-slate-600" />
              <input
                type="tel"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                placeholder="98765 43210"
                className="flex-1 bg-transparent text-slate-900 dark:text-white outline-none font-semibold placeholder:font-normal placeholder:text-slate-400 tracking-wider"
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
              <span className="material-symbols-outlined text-slate-400">phone</span>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-sm text-red-600">
              <span className="material-symbols-outlined text-sm">error</span>
              {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={phone.length !== 10 || loading}
            className="w-full bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span> : <span className="material-symbols-outlined text-sm">login</span>}
            {loading ? "Signing in..." : "Continue to Dashboard"}
          </button>

          <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800 flex items-start gap-3">
            <span className="material-symbols-outlined text-amber-500 text-sm mt-0.5">info</span>
            <p className="text-xs text-amber-700 dark:text-amber-400">
              Works on 2G networks. First-time login creates your account automatically. No OTP required for testing.
            </p>
          </div>
        </div>

        <p className="text-center text-[11px] text-slate-400 mt-6">
          © 2024 GraamSehat. Powered by Nabha Civil Hospital Trust.
        </p>
      </div>
    </div>
  );
}
