"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const WORKS_OFFLINE = [
  { icon: "description", title: "View Health Records", sub: "Cached locally. All your records available." },
  { icon: "psychology", title: "AI Symptom Checker", sub: "Offline rule-based model active." },
  { icon: "edit_note", title: "Register Patients", sub: "ASHA queue saves locally." },
  { icon: "qr_code_2", title: "Scan QR Health Card", sub: "Works fully without internet." },
];

const NOT_OFFLINE = [
  "Video / Audio Consultation",
  "Live Medicine Stock",
  "New Prescriptions",
  "Real-time AI triage",
];

export default function OfflinePage() {
  const [countdown, setCountdown] = useState(14);
  const [isOnline, setIsOnline] = useState(false);
  const [checkingNow, setCheckingNow] = useState(false);
  const lastSync = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  // Auto-detect when connectivity is restored
  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      // Redirect back to patient dashboard when connectivity restored
      setTimeout(() => {
        window.location.href = "/dashboard/patient";
      }, 1500);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Countdown auto-retry
  useEffect(() => {
    const t = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          // Actually check connectivity when countdown reaches 0
          handleTryAgain();
          return 14;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const handleTryAgain = async () => {
    setCheckingNow(true);
    try {
      // Actually attempt a network request to verify connectivity
      await fetch("/api/health-check", { method: "HEAD", cache: "no-store" });
      setIsOnline(true);
      setTimeout(() => { window.location.href = "/dashboard/patient"; }, 800);
    } catch {
      setIsOnline(false);
    } finally {
      setCheckingNow(false);
      setCountdown(14);
    }
  };

  const progress = ((14 - countdown) / 14) * 125.6;

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      {/* Restored banner */}
      {isOnline && (
        <div className="fixed top-0 inset-x-0 z-50 bg-green-500 text-white py-3 text-center font-bold flex items-center justify-center gap-2 text-sm shadow-lg">
          <span className="material-symbols-outlined">wifi</span>
          Connection restored! Redirecting you back...
        </div>
      )}

      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40">
        <nav className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-3xl">health_and_safety</span>
            <span className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">Graam<span className="text-primary">Sehat</span></span>
          </div>
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${isOnline ? "bg-green-50 border-green-200" : "bg-red-50 border-red-100"}`}>
              <span className={`h-2 w-2 rounded-full ${isOnline ? "bg-green-500" : "bg-red-500 animate-pulse"}`}></span>
              <span className={`text-xs font-bold uppercase tracking-wider ${isOnline ? "text-green-600" : "text-red-600"}`}>
                {isOnline ? "Online" : "Offline"}
              </span>
            </div>
            <Link href="/dashboard/patient" className="text-slate-500 hover:text-primary transition-colors">
              <span className="material-symbols-outlined">home</span>
            </Link>
          </div>
        </nav>
      </header>

      <main className="max-w-3xl mx-auto px-6 lg:px-8 pb-20">
        {/* Hero */}
        <section className="py-14 flex flex-col items-center text-center">
          <div className="relative flex items-center justify-center w-24 h-24 mb-8">
            <div className={`w-24 h-24 rounded-full border-4 ${isOnline ? "border-green-200" : "border-red-200"} animate-ping absolute opacity-60`}></div>
            <div className={`relative w-24 h-24 rounded-full ${isOnline ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"} border-2 flex items-center justify-center`}>
              <span className={`material-symbols-outlined text-5xl ${isOnline ? "text-green-500" : "text-red-500"}`}>
                {isOnline ? "wifi" : "wifi_off"}
              </span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            {isOnline ? "You're Back Online!" : "You're Offline"}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
            {isOnline ? "Connection restored — redirecting you now..." : "Don't worry — GraamSehat works offline too"}
          </p>
          <p className="text-slate-400 text-xs mt-1 uppercase tracking-wide">Last synced: {lastSync}</p>
        </section>

        {/* What works offline */}
        <section className="mb-8">
          <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-4">✅ Available Offline</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {WORKS_OFFLINE.map((item) => (
              <div key={item.title} className="bg-green-50/50 border-2 border-green-200 dark:border-green-900/40 dark:bg-green-900/10 rounded-xl p-5 flex gap-4 items-start hover:border-primary transition-colors">
                <div className="w-11 h-11 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                  <span className="material-symbols-outlined text-primary">{item.icon}</span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{item.title}</h3>
                  <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Not available */}
        <section className="bg-slate-100 dark:bg-slate-800 rounded-xl p-5 mb-8">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-400 text-lg">info</span>
            Not available offline:
          </h3>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {NOT_OFFLINE.map((item) => (
              <div key={item} className="flex items-center gap-1.5 text-slate-400 text-sm">
                <span className="material-symbols-outlined text-base text-red-400">cancel</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Auto Retry */}
        <section className="space-y-4">
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="material-symbols-outlined text-primary text-3xl animate-spin" style={{ animationDuration: "3s" }}>refresh</span>
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200 leading-none">
                  {checkingNow ? "Checking connectivity..." : "Retrying connection..."}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {checkingNow ? "Testing network..." : countdown > 0 ? `Next attempt in ${countdown} seconds` : "Attempting now..."}
                </p>
              </div>
            </div>
            {/* Circular countdown */}
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 48 48">
                <circle cx="24" cy="24" r="20" fill="transparent" stroke="#e2e8f0" strokeWidth="3" />
                <circle
                  cx="24" cy="24" r="20"
                  fill="transparent"
                  stroke="#00C9A7"
                  strokeWidth="3"
                  strokeDasharray="125.6"
                  strokeDashoffset={125.6 - progress}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-xs font-bold text-slate-700 dark:text-slate-300">{countdown}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleTryAgain}
              disabled={checkingNow}
              className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold py-3 px-8 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <span className="material-symbols-outlined">sync</span>
              {checkingNow ? "Checking..." : "Try Again Now"}
            </button>
            <Link
              href="/dashboard/patient"
              className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-primary hover:text-primary rounded-xl px-5 py-3 text-sm font-medium transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">home</span>
              Dashboard
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
