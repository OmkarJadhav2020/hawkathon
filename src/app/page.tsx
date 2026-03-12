"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const TEST_CREDENTIALS = [
  { role: "patient" as const, phone: "7767827080", name: "Rajesh Kumar", emoji: "🏥" },
  { role: "doctor" as const, phone: "9876000001", name: "Dr. Ananya Sharma", emoji: "👨‍⚕️" },
  { role: "asha" as const, phone: "9876000002", name: "Sunita Devi", emoji: "🏘️" },
  { role: "pharmacy" as const, phone: "9876000003", name: "City Life Medicos", emoji: "💊" },
  { role: "admin" as const, phone: "9876000099", name: "District Health Officer", emoji: "📊" },
];

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"patient" | "asha" | "doctor" | "pharmacy" | "admin">("patient");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fillCredential = (cred: typeof TEST_CREDENTIALS[0]) => {
    setPhone(cred.phone);
    setRole(cred.role);
    setError("");
  };

  const handleLogin = async () => {
    if (phone.length < 10) {
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

      const user = await res.json();

      if (!res.ok) {
        setError(user.error ?? "Login failed.");
        setLoading(false);
        return;
      }

      // Store all user data in localStorage
      localStorage.setItem("userId", user.id);
      localStorage.setItem("userName", user.name);
      localStorage.setItem("userRole", user.role);
      localStorage.setItem("userPhone", user.phone);
      if (user.village) localStorage.setItem("userVillage", user.village);

      // Role-specific IDs
      if (user.role === "DOCTOR")   localStorage.setItem("doctorId", user.id);
      if (user.role === "PATIENT")  localStorage.setItem("patientId", user.id);
      if (user.role === "ASHA")     localStorage.setItem("ashaId", user.id);
      if (user.ashaProfileId)       localStorage.setItem("ashaProfileId", user.ashaProfileId);
      if (user.pharmacyProfileId)   localStorage.setItem("pharmacyId", user.pharmacyProfileId);
      if (user.doctorProfileId)     localStorage.setItem("doctorProfileId", user.doctorProfileId);

      // Navigate to role dashboard
      const routes: Record<string, string> = {
        doctor: "/dashboard/doctor",
        asha: "/dashboard/asha",
        pharmacy: "/dashboard/pharmacy",
        admin: "/dashboard/admin",
        patient: "/dashboard/patient",
      };
      router.push(routes[role] ?? "/dashboard/patient");
    } catch {
      setError("Network error. Check your connection.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-teal-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Branding */}
        {/* Branding */}
        <div className="text-center mb-8">
          <Image src="/logo.png" alt="NearDoc Logo" width={112} height={112} className="mx-auto rounded-3xl shadow-xl shadow-primary/20 mb-5" />
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">NearDoc</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Rural Health. Digitally Connected.</p>
        </div>

        {/* Test Credentials Panel */}
        <div className="mb-5 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-800 p-4">
          <p className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <span translate="no" className="material-symbols-outlined text-sm notranslate">lab_profile</span>
            Test Credentials — Click to auto-fill
          </p>
          <div className="grid grid-cols-1 gap-2">
            {TEST_CREDENTIALS.map((cred) => (
              <button
                key={cred.role}
                onClick={() => fillCredential(cred)}
                className={`flex items-center gap-3 p-2.5 rounded-xl text-left transition-all border ${
                  role === cred.role && phone === cred.phone
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-primary/30 hover:bg-primary/5"
                }`}
              >
                <span className="text-xl leading-none">{cred.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">{cred.name}</p>
                  <p className="text-[10px] text-slate-500 capitalize">{cred.role} · 📞 {cred.phone}</p>
                </div>
                <span translate="no" className="material-symbols-outlined text-slate-400 text-sm notranslate">arrow_forward</span>
              </button>
            ))}
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 p-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Sign In</h2>

          {/* Role selector */}
          <div className="flex gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-5">
            {(["patient", "asha", "doctor", "pharmacy", "admin"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`flex-1 py-2 rounded-lg text-[10px] font-bold capitalize transition-all ${
                  role === r ? "bg-white dark:bg-slate-700 text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {r === "asha" ? "ASHA" : r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>

          {/* Phone input */}
          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Mobile Number</label>
            <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
              <span className="text-slate-500 font-semibold text-sm">+91</span>
              <div className="w-px h-5 bg-slate-200 dark:bg-slate-600" />
              <input
                type="tel"
                maxLength={10}
                value={phone}
                onChange={(e) => { setPhone(e.target.value.replace(/\D/g, "")); setError(""); }}
                placeholder="10-digit number"
                className="flex-1 bg-transparent text-slate-900 dark:text-white outline-none font-semibold placeholder:font-normal placeholder:text-slate-400 tracking-wider"
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-start gap-2">
              <span translate="no" className="material-symbols-outlined text-sm mt-0.5 notranslate">error</span>
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={phone.length < 10 || loading}
            className="w-full bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2"
          >
            {loading
              ? <><span translate="no" className="material-symbols-outlined text-sm animate-spin notranslate">progress_activity</span> Signing in...</>
              : <><span translate="no" className="material-symbols-outlined text-sm notranslate">login</span> Continue to Dashboard</>
            }
          </button>
        </div>

        <p className="text-center text-[11px] text-slate-400 mt-5">
          © 2024 NearDoc · Nabha Civil Hospital Trust · v1.0 Beta
        </p>
      </div>
    </div>
  );
}
