"use client";

import { useState } from "react";
import Link from "next/link";

const upcoming = [
  { id: "APT-001", date: "Dec 24", month: "DEC", day: "24", time: "10:30 AM", doctor: "Dr. Amit Verma", specialty: "General Physician", clinic: "Sewa Rural Clinic, Block B", type: "Teleconsult", status: "CONFIRMED" },
  { id: "APT-002", date: "Jan 5", month: "JAN", day: "05", time: "11:00 AM", doctor: "Dr. Priya Kaur", specialty: "Gynaecologist", clinic: "PHC Nabha", type: "In-Person", status: "PENDING" },
];

const past = [
  { date: "5 Mar 2026", doctor: "Dr. A. Sharma", reason: "Fever, body ache", type: "Teleconsult", status: "COMPLETED" },
  { date: "12 Feb 2026", doctor: "Dr. P. Kaur", reason: "Diabetes review", type: "In-Person", status: "COMPLETED" },
  { date: "3 Jan 2026", doctor: "Dr. S. Kumar", reason: "BP check", type: "Teleconsult", status: "COMPLETED" },
];

const doctors = [
  { name: "Dr. Amit Verma", spec: "General Physician", wait: "~5 min", available: true },
  { name: "Dr. Priya Kaur", spec: "Gynaecologist", wait: "~20 min", available: true },
  { name: "Dr. R. Sharma", spec: "Cardiologist", wait: "Busy", available: false },
];

export default function AppointmentsPage() {
  const [tab, setTab] = useState<"upcoming" | "past" | "book">("upcoming");

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/patient" className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
              <span className="material-symbols-outlined">arrow_back</span>
            </Link>
            <span className="material-symbols-outlined text-primary text-2xl">health_and_safety</span>
            <span className="text-xl font-bold tracking-tight">GraamSehat</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-primary/20 border-2 border-primary/30 flex items-center justify-center text-primary font-bold text-sm">RJ</div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Appointments</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Book, view, & manage your consultations</p>
          </div>
          <button
            onClick={() => setTab("book")}
            className="flex items-center gap-2 bg-primary text-white font-bold px-5 py-3 rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
          >
            <span className="material-symbols-outlined">add</span> Book Now
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6">
          {(["upcoming", "past", "book"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-3 text-sm font-bold capitalize transition-colors ${tab === t ? "border-b-2 border-primary text-primary" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
            >
              {t === "book" ? "Book New" : `${t.charAt(0).toUpperCase() + t.slice(1)} (${t === "upcoming" ? upcoming.length : past.length})`}
            </button>
          ))}
        </div>

        {/* Upcoming */}
        {tab === "upcoming" && (
          <div className="space-y-4">
            {upcoming.map((apt) => (
              <div key={apt.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex gap-6 items-start">
                <div className="bg-primary/10 text-primary flex flex-col items-center p-4 rounded-xl min-w-[72px]">
                  <span className="text-xs font-black uppercase">{apt.month}</span>
                  <span className="text-3xl font-black">{apt.day}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-lg">{apt.doctor}</h3>
                      <p className="text-slate-500 text-sm">{apt.specialty} • {apt.time}</p>
                      <p className="text-slate-400 text-xs mt-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">location_on</span> {apt.clinic}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase ${apt.status === "CONFIRMED" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-amber-100 text-amber-700"}`}>
                        {apt.status}
                      </span>
                      <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">{apt.type}</span>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    {apt.type === "Teleconsult" && (
                      <Link href="/dashboard/patient/consultation" className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-bold rounded-lg text-sm hover:opacity-90 transition-all">
                        <span className="material-symbols-outlined text-sm">videocam</span> Join Call
                      </Link>
                    )}
                    <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                      <span className="material-symbols-outlined text-sm">edit_calendar</span> Reschedule
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 border border-red-100 dark:border-red-900/30 text-red-500 font-bold rounded-lg text-sm hover:bg-red-50 dark:hover:bg-red-900/10 transition-all">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Past */}
        {tab === "past" && (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 text-[11px] uppercase font-bold text-slate-400">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Doctor</th>
                  <th className="px-6 py-4">Reason</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {past.map((p) => (
                  <tr key={p.date} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{p.date}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-800 dark:text-slate-200">{p.doctor}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{p.reason}</td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{p.type}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href="/dashboard/prescription" className="text-xs font-bold text-primary border border-primary/20 px-3 py-1.5 rounded-lg hover:bg-primary/5 transition-all">View Rx</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Book */}
        {tab === "book" && (
          <div className="space-y-6">
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">info</span>
              <p className="text-sm text-slate-700 dark:text-slate-300">Your ASHA worker can also book appointments on your behalf if you have no connectivity.</p>
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">Available Doctors Now</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {doctors.map((doc) => (
                <div key={doc.name} className={`bg-white dark:bg-slate-900 rounded-xl border p-5 shadow-sm flex items-center gap-4 ${doc.available ? "border-slate-200 dark:border-slate-800 hover:border-primary/30 transition-colors" : "border-slate-100 dark:border-slate-800 opacity-60"}`}>
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                    {doc.name.split(" ").slice(-1)[0][0]}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900 dark:text-white">{doc.name}</p>
                    <p className="text-xs text-slate-500">{doc.spec}</p>
                    <p className={`text-xs font-bold mt-1 ${doc.available ? "text-green-600" : "text-slate-400"}`}>
                      {doc.available ? `⏱ Wait: ${doc.wait}` : "Currently unavailable"}
                    </p>
                  </div>
                  {doc.available ? (
                    <Link href="/dashboard/patient/consultation" className="bg-primary text-white text-xs font-bold px-4 py-2 rounded-lg hover:opacity-90 transition-all">
                      Book
                    </Link>
                  ) : (
                    <button disabled className="bg-slate-100 dark:bg-slate-700 text-slate-400 text-xs font-bold px-4 py-2 rounded-lg cursor-not-allowed">Busy</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
