"use client";

import Link from "next/link";

const consultationHistory = [
  { date: "5 Mar 2026", doctor: "Dr. A. Sharma", reason: "Fever, body ache", type: "TELECONSULT", hasRx: true },
  { date: "12 Feb 2026", doctor: "Dr. P. Kaur", reason: "Diabetes review", type: "HOME_CARE", hasRx: true },
  { date: "3 Jan 2026", doctor: "Dr. S. Kumar", reason: "BP check", type: "HOME_CARE", hasRx: false },
  { date: "14 Nov 2025", doctor: "Dr. A. Sharma", reason: "Cold, cough", type: "HOME_CARE", hasRx: true },
];

const badges = {
  TELECONSULT: "bg-amber-50 text-amber-700 border-amber-100",
  HOME_CARE: "bg-green-50 text-green-700 border-green-100",
  EMERGENCY: "bg-red-50 text-red-700 border-red-100",
};
const icons = { TELECONSULT: "sensors", HOME_CARE: "home", EMERGENCY: "emergency" };

export default function HealthRecordsPage() {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-1.5 rounded-lg"><span className="material-symbols-outlined text-white text-2xl">health_and_safety</span></div>
            <span className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">GraamSehat</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <Link className="text-sm font-medium text-slate-500 hover:text-primary transition-colors" href="/dashboard/patient">Home</Link>
            <Link className="text-sm font-medium text-slate-500 hover:text-primary transition-colors" href="/dashboard/patient/appointments">Appointments</Link>
            <a className="text-sm font-semibold text-primary border-b-2 border-primary py-5" href="#">Records</a>
          </nav>
          <div className="flex items-center gap-3">
            <button className="text-slate-400 hover:text-slate-600"><span className="material-symbols-outlined">notifications</span></button>
            <div className="w-8 h-8 rounded-full bg-primary/20 border-2 border-primary/30 flex items-center justify-center text-primary font-bold text-sm">GK</div>
          </div>
        </div>
      </header>

      {/* Page Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/patient" className="flex items-center justify-center w-10 h-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm">
              <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">arrow_back</span>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Health Records</h1>
              <p className="text-slate-500 text-sm">Gurpreet Kaur • <span className="font-mono">ID: GS-P001</span></p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">share</span> Share
            </button>
            <button onClick={() => window.print()} className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">picture_as_pdf</span> Export PDF
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* QR Health Card + Conditions */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
          {/* QR Card */}
          <section className="md:col-span-7 bg-gradient-to-br from-slate-50 to-emerald-50/40 dark:from-slate-900 dark:to-emerald-900/10 border border-primary/20 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-primary font-bold text-lg">GraamSehat Health Card</h2>
                <span className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 uppercase tracking-wider">
                  Offline accessible
                </span>
              </div>
              <span className="material-symbols-outlined text-primary/40 text-4xl">contactless</span>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-6 items-start">
              {/* QR Placeholder */}
              <div className="w-28 h-28 bg-white dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-600 rounded-xl flex flex-col items-center justify-center shrink-0 gap-1">
                <span className="material-symbols-outlined text-primary text-4xl">qr_code_2</span>
                <span className="text-[9px] text-slate-400 font-bold uppercase">Scan QR</span>
              </div>
              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 flex-1">
                {[
                  { label: "Patient Name", value: "Gurpreet Kaur" },
                  { label: "Age · Gender", value: "34 · Female" },
                  { label: "Blood Group", value: "B+" },
                  { label: "Known Allergies", value: "Sulfa drugs", alert: true },
                  { label: "Patient ID", value: "GS-PB-P001", mono: true },
                ].map((item) => (
                  <div key={item.label} className={item.label === "Patient ID" ? "col-span-2" : ""}>
                    <p className="text-[10px] uppercase text-slate-400 font-semibold">{item.label}</p>
                    <p className={`text-sm font-bold ${item.alert ? "text-red-600" : item.mono ? "text-xs font-mono text-slate-600 dark:text-slate-300" : "text-slate-700 dark:text-slate-200"}`}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-200/60 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button className="bg-primary hover:opacity-90 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">download</span> Save to Phone
                </button>
                <button className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 px-4 py-2 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 transition-colors shadow-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">print</span> Print
                </button>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-base">check_circle</span>
                <span className="text-xs text-slate-500 font-medium">Scan at any clinic without internet</span>
              </div>
            </div>
          </section>

          {/* Conditions */}
          <section className="md:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-slate-400">clinical_notes</span> Chronic Conditions
            </h2>
            <div className="space-y-3 mb-6">
              {[
                { condition: "Type 2 Diabetes", since: "Since 2019", status: "Controlled" },
                { condition: "Hypertension (mild)", since: "Since 2021", status: "Controlled" },
              ].map((c) => (
                <div key={c.condition} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                  <div>
                    <p className="font-semibold text-slate-700 dark:text-slate-200 text-sm">{c.condition}</p>
                    <p className="text-xs text-slate-500">{c.since}</p>
                  </div>
                  <span className="px-2 py-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-800 rounded text-[10px] font-bold uppercase">{c.status}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Allergies</h3>
              <div className="flex flex-wrap gap-2">
                {["Sulfa drugs", "Penicillin"].map((a) => (
                  <span key={a} className="flex items-center gap-1 px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900 rounded-full text-xs font-bold">
                    <span className="material-symbols-outlined text-sm">warning</span> {a}
                  </span>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Consultation History */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="font-bold text-slate-800 dark:text-white text-lg">Consultation History</h2>
            <div className="relative max-w-xs w-full">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
              <input className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-primary outline-none transition-all" placeholder="Search records..." type="text" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-700 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Doctor</th>
                  <th className="px-6 py-4">Reason</th>
                  <th className="px-6 py-4">Triage Type</th>
                  <th className="px-6 py-4 text-right">Prescription</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {consultationHistory.map((row) => (
                  <tr key={row.date + row.doctor} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-400">{row.date}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-800 dark:text-slate-200">{row.doctor}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{row.reason}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${badges[row.type as keyof typeof badges]}`}>
                        <span className="material-symbols-outlined text-sm">{icons[row.type as keyof typeof icons]}</span>
                        {row.type === "HOME_CARE" ? "Home Care" : row.type === "TELECONSULT" ? "Teleconsult" : "Emergency"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {row.hasRx ? (
                        <Link href="/dashboard/prescription" className="text-xs font-bold text-primary hover:text-primary-dark border border-primary/20 hover:bg-primary/5 px-3 py-1.5 rounded-lg transition-all">
                          View Rx
                        </Link>
                      ) : <span className="text-slate-300 text-xs">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-slate-50/30 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 text-center">
            <button className="text-xs font-bold text-slate-500 hover:text-primary transition-colors uppercase tracking-widest">Load More History</button>
          </div>
        </div>
      </main>
    </div>
  );
}
