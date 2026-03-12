"use client";

import { useState } from "react";
import Link from "next/link";

const patients = [
  { initials: "MD", color: "bg-primary/10 text-primary", name: "Meera Deshmukh", id: "#GS-9921", time: "10:05 AM", status: "In Session", bp: "138/92", hr: "82", spo2: "98", temp: "98.6", category: "ACTIVE", age: "64F", blood: "B+", allergies: ["Penicillin"], triage: "Persistent fatigue, history of Type 2 Diabetes. Stage 1 hypertension detected." },
  { initials: "RV", color: "bg-blue-100 text-blue-600", name: "Rahul Verma", id: "#GS-7845", time: "10:15 AM (Delayed 5m)", status: "Waiting", notes: "Hypertension", category: "ROUTINE" },
  { initials: "SG", color: "bg-orange-100 text-orange-600", name: "Sanjay Gupta", id: "#GS-3312", time: "URGENT • 10:30 AM", status: "Urgent", notes: "Chest Pain Follow-up", category: "URGENT" },
  { initials: "AR", color: "bg-purple-100 text-purple-600", name: "Anita Roy", id: "#GS-5501", time: "11:00 AM", status: "Waiting", notes: "New Patient • Consultation", category: "ROUTINE" },
];

const scheduleItems = [
  { time: "12:30", period: "PM", label: "Lunch Break", isHighlight: false, icon: "" },
  { time: "01:15", period: "PM", label: "Video Consult", isHighlight: true, icon: "video_chat" },
  { time: "01:45", period: "PM", label: "Siddharth N.", isHighlight: false, icon: "" },
];

export default function DoctorDashboard() {
  const [activePatient] = useState(patients[0]);
  const [activeTab, setActiveTab] = useState("notes");
  const [consultationNote, setConsultationNote] = useState("");

  return (
    <div className="relative flex min-h-screen flex-col bg-background-light dark:bg-background-dark">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-primary/20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 py-3">
        <div className="flex items-center justify-between max-w-[1600px] mx-auto">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 text-primary">
              <span className="material-symbols-outlined text-3xl">health_metrics</span>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">GraamSehat</h2>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <a className="text-sm font-semibold text-primary border-b-2 border-primary pb-1" href="#">Dashboard</a>
              <a className="text-sm font-medium text-slate-500 hover:text-primary transition-colors" href="#">Patient Records</a>
              <a className="text-sm font-medium text-slate-500 hover:text-primary transition-colors" href="#">Telemedicine</a>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
              <input className="pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-sm w-64 focus:ring-2 focus:ring-primary/50 outline-none" placeholder="Search patient ID..." type="text" />
            </div>
            <button className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 relative">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-800" />
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-700">
              <div className="text-right hidden lg:block">
                <p className="text-xs font-bold text-slate-900 dark:text-white">Dr. Ananya Sharma</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Senior Cardiologist</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center text-primary font-bold">AS</div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-[1600px] mx-auto w-full grid grid-cols-12 gap-6">
        {/* Patient Queue */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col h-full">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
              <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">group_work</span> Patient Queue
              </h3>
              <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">8 WAITING</span>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide">
              {/* Active Patient */}
              <div className="p-4 border-b border-primary/20 bg-primary/5">
                <p className="text-[10px] font-bold text-primary uppercase mb-2 flex items-center gap-1">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                  </span>
                  Currently In Session
                </p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${activePatient.color}`}>
                    {activePatient.initials}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{activePatient.name}</p>
                    <p className="text-xs text-slate-500">{activePatient.id}</p>
                  </div>
                </div>
              </div>

              {/* Queue */}
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {patients.slice(1).map((p) => (
                  <div key={p.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer group">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-semibold ${p.category === "URGENT" ? "text-orange-500 bg-orange-50 dark:bg-orange-900/20 px-1.5 rounded" : "text-slate-400"}`}>
                        {p.time}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${p.color}`}>{p.initials}</div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{p.name}</p>
                        <p className="text-xs text-slate-500">{p.notes}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
              <button className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all">
                <span className="material-symbols-outlined">play_circle</span> Start Consultation
              </button>
            </div>
          </div>
        </div>

        {/* Main Workstation */}
        <div className="col-span-12 lg:col-span-6 flex flex-col gap-6">
          {/* Patient header */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-primary/20 border-2 border-primary flex items-center justify-center text-primary text-2xl font-black">
                  {activePatient.initials}
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">{activePatient.name}</h1>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                    <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">calendar_today</span> {activePatient.age}
                    </span>
                    {activePatient.blood && (
                      <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">bloodtype</span> {activePatient.blood}
                      </span>
                    )}
                    {activePatient.allergies?.map((a) => (
                      <span key={a} className="text-xs font-medium text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">warning</span> {a} Allergy
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link href="/dashboard/patient/consultation" className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <span className="material-symbols-outlined">videocam</span>
                </Link>
                <button className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <span className="material-symbols-outlined">print</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold rounded-xl text-sm">
                  <span className="material-symbols-outlined text-sm">save</span> Save Record
                </button>
              </div>
            </div>

            {/* Vitals */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Blood Pressure", value: activePatient.bp, status: "High", statusColor: "text-red-500" },
                { label: "Heart Rate", value: `${activePatient.hr}`, unit: "bpm", statusColor: "text-slate-500" },
                { label: "SpO2", value: `${activePatient.spo2}`, unit: "%", statusColor: "text-emerald-500" },
                { label: "Temp", value: `${activePatient.temp}`, unit: "°F", statusColor: "text-slate-500" },
              ].map((v) => (
                <div key={v.label} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{v.label}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-bold text-slate-900 dark:text-white">{v.value}</span>
                    {v.unit && <span className={`text-[10px] font-bold ${v.statusColor}`}>{v.unit}</span>}
                    {v.status && <span className={`text-[10px] font-bold ${v.statusColor} flex items-center`}><span className="material-symbols-outlined text-xs">arrow_upward</span>{v.status}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes / Prescription Tabs */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex-1 overflow-hidden flex flex-col">
            <div className="flex border-b border-slate-100 dark:border-slate-800">
              {["notes", "prescription", "lab"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-3 text-sm font-bold capitalize transition-colors ${activeTab === tab ? "border-b-2 border-primary text-primary bg-primary/5" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
                >
                  {tab === "lab" ? "Lab Orders" : tab === "prescription" ? "Prescriptions" : "Consultation Notes"}
                </button>
              ))}
            </div>

            <div className="p-6 flex-1 space-y-6 overflow-y-auto">
              {activeTab === "notes" && (
                <>
                  <div className="relative">
                    <div className="absolute -top-3 left-3 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-primary/20 flex items-center gap-1">
                      <span className="material-symbols-outlined text-primary text-xs">auto_awesome</span>
                      <span className="text-[10px] font-bold text-primary tracking-wide">AI-GENERATED SUMMARY</span>
                    </div>
                    <div className="w-full p-5 pt-7 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 text-sm leading-relaxed italic text-slate-700 dark:text-slate-300">
                      {activePatient.triage || "No AI triage data available for this patient."}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center justify-between">
                      Clinical Observations
                      <span className="material-symbols-outlined text-primary text-sm cursor-pointer">mic</span>
                    </h4>
                    <textarea
                      value={consultationNote}
                      onChange={(e) => setConsultationNote(e.target.value)}
                      className="w-full h-48 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-primary/50 outline-none resize-none"
                      placeholder="Type your observations here..."
                    />
                  </div>
                </>
              )}
              {activeTab === "prescription" && (
                <div className="text-center text-slate-400 py-8">
                  <span className="material-symbols-outlined text-4xl">prescriptions</span>
                  <p className="mt-2 text-sm">Prescription module — add medicines and dosage here.</p>
                  <Link href="/dashboard/prescription/new" className="mt-4 inline-block px-6 py-3 bg-primary text-white font-bold rounded-xl text-sm">
                    Create Prescription
                  </Link>
                </div>
              )}
              {activeTab === "lab" && (
                <div className="text-center text-slate-400 py-8">
                  <span className="material-symbols-outlined text-4xl">lab_panel</span>
                  <p className="mt-2 text-sm">Lab order module — order diagnostic tests here.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-6">
          {/* History */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-5">
            <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">history</span> Recent History
            </h3>
            <div className="space-y-4">
              {[
                { date: "Oct 12, 2023", title: "Diabetic Review", note: "HbA1c: 6.8% - Stable" },
                { date: "Aug 05, 2023", title: "Acute Bronchitis", note: "Resolved with Azithromycin" },
                { date: "May 19, 2023", title: "Annual Physical", note: "No abnormal findings" },
              ].map((h, i) => (
                <div key={i} className="relative pl-6 border-l-2 border-slate-100 dark:border-slate-800 py-1">
                  <div className={`absolute left-[-5px] top-1.5 w-2 h-2 rounded-full ${i === 0 ? "bg-primary shadow-[0_0_0_3px_rgba(0,201,167,0.15)]" : "bg-slate-300 dark:bg-slate-700"}`} />
                  <p className="text-[10px] font-bold text-slate-400 uppercase">{h.date}</p>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{h.title}</p>
                  <p className="text-[10px] text-slate-500 italic mt-0.5">{h.note}</p>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-2 text-xs font-bold text-primary hover:bg-primary/10 rounded-lg transition-colors border border-primary/20">
              View Full Record
            </button>
          </div>

          {/* Schedule */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">calendar_month</span> Schedule
              </h3>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Today</span>
            </div>
            <div className="space-y-3">
              {scheduleItems.map((item, i) => (
                <div key={i} className={`flex items-center gap-3 p-2.5 rounded-lg border ${item.isHighlight ? "border-primary/20 bg-primary/5" : "border-slate-50 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50"}`}>
                  <div className="text-center min-w-[40px]">
                    <p className={`text-xs font-bold leading-none ${item.isHighlight ? "text-primary" : "text-slate-900 dark:text-white"}`}>{item.time}</p>
                    <p className={`text-[8px] font-bold uppercase ${item.isHighlight ? "text-primary/60" : "text-slate-400"}`}>{item.period}</p>
                  </div>
                  <div className={`flex-1 h-6 border-l ${item.isHighlight ? "border-primary/20" : "border-slate-200 dark:border-slate-700"} pl-3 flex items-center justify-between`}>
                    <p className={`text-xs ${item.isHighlight ? "font-bold text-slate-900 dark:text-white" : "font-medium text-slate-600 dark:text-slate-400"}`}>{item.label}</p>
                    {item.icon && <span className="material-symbols-outlined text-primary text-sm">{item.icon}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-primary/10 rounded-xl p-4 border border-primary/20">
              <p className="text-[10px] font-bold text-primary uppercase leading-tight">Efficiency</p>
              <p className="text-xl font-black text-slate-900 dark:text-white">92%</p>
              <div className="w-full bg-white/50 h-1 rounded-full mt-2">
                <div className="bg-primary h-1 rounded-full" style={{ width: "92%" }} />
              </div>
            </div>
            <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
              <p className="text-[10px] font-bold text-slate-400 uppercase leading-tight">Patient Sat.</p>
              <p className="text-xl font-black text-white">4.9</p>
              <div className="flex gap-0.5 mt-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <span key={s} className="material-symbols-outlined text-[10px] text-yellow-500">star</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Status Bar */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-6 py-2">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">System Online</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-slate-400">cloud_done</span>
              <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">Auto-save: 2 min ago</span>
            </div>
          </div>
          <p className="text-[10px] font-medium text-slate-400">GraamSehat v1.0 (Clinical)</p>
        </div>
      </footer>
    </div>
  );
}
