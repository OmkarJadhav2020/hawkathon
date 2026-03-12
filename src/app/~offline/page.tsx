"use client";

import Link from "next/link";

export default function OfflineFallback() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
        <span translate="no" className="material-symbols-outlined text-4xl text-primary notranslate">wifi_off</span>
      </div>
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">You are currently offline</h1>
      <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-8">
        It looks like you've lost your internet connection. Some parts of NearDoc require a connection to work.
      </p>
      <div className="space-y-4">
        <button onClick={() => window.location.reload()} className="bg-primary text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-primary/30 hover:shadow-xl transition-all">
          Try Again
        </button>
        <p className="text-sm font-medium text-slate-500">
          Or <Link href="/dashboard/patient/records" className="text-primary hover:underline">view your offline health records</Link>
        </p>
      </div>
    </div>
  );
}
