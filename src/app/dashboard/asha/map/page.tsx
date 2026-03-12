"use client";

import { useState } from "react";
import Link from "next/link";

const OUTREACH = [
  { name: "Sita Devi", task: "Prenatal Check — High Risk", priority: "high", icon: "warning", color: "bg-primary", ring: "border-l-primary" },
  { name: "Aman Kumar (Child)", task: "Measles Vaccination Pending", priority: "medium", icon: "vaccines", color: "bg-orange-500", ring: "border-l-orange-500" },
  { name: "Rajesh Singh", task: "TB DOTS Follow-up", priority: "normal", icon: "medication", color: "bg-slate-400", ring: "border-l-slate-400" },
  { name: "Kamla Bai", task: "BP Checkup — Monthly", priority: "normal", icon: "monitor_heart", color: "bg-slate-400", ring: "border-l-slate-400" },
];

const VILLAGES = [
  { name: "Khaira Kalan", x: "42%", y: "30%", type: "high", label: "H#402 – High Risk Patient" },
  { name: "Bambiha", x: "61%", y: "50%", type: "medium", label: "H#217 – Vaccination Due" },
  { name: "Miani", x: "25%", y: "22%", type: "visited", label: "H#88 – Visited" },
  { name: "Rajpura", x: "72%", y: "65%", type: "visited", label: "H#103 – Visited" },
];

export default function AshaMapPage() {
  const [selectedVillage, setSelectedVillage] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const remaining = OUTREACH.filter((o) => o.priority !== "done").length;

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-background-light dark:bg-background-dark">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 md:px-8 py-3 z-20 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-xl bg-primary/20 text-primary">
            <span className="material-symbols-outlined text-2xl">health_and_safety</span>
          </div>
          <div>
            <h2 className="text-lg font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white">GraamSehat</h2>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Nabha Health Cluster</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end">
            <p className="text-sm font-bold text-slate-900 dark:text-white">Field Worker ID: 4829</p>
            <p className="text-[10px] uppercase tracking-wider text-slate-500">ASHA Accredited · Sunita Devi</p>
          </div>
          <div className="size-10 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center font-bold text-primary text-sm">SD</div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <nav className="hidden lg:flex w-64 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 gap-2 flex-shrink-0">
          <Link href="/dashboard/asha/map" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary text-white font-semibold">
            <span className="material-symbols-outlined">map</span><span>Village Map</span>
          </Link>
          <Link href="/dashboard/asha" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300">
            <span className="material-symbols-outlined">assignment</span><span>Outreach List</span>
          </Link>
          <Link href="/dashboard/patient/consultation" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300">
            <span className="material-symbols-outlined">medical_services</span><span>Tele-Consults</span>
          </Link>
          <Link href="/dashboard/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300">
            <span className="material-symbols-outlined">analytics</span><span>Statistics</span>
          </Link>

          {/* Sync Card */}
          <div className="mt-auto border-t border-slate-200 dark:border-slate-800 pt-4">
            <div className="flex flex-col gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">Sync Status</span>
                <span className="flex size-2 rounded-full bg-orange-500 animate-pulse"></span>
              </div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">8 Records Pending</p>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div className="bg-primary h-full rounded-full" style={{ width: "60%" }}></div>
              </div>
              <button
                onClick={() => { setSyncing(true); setTimeout(() => setSyncing(false), 2000); }}
                className="w-full py-2 bg-primary text-white text-xs font-bold rounded-lg shadow-lg shadow-primary/20 flex items-center justify-center gap-1"
              >
                <span className={`material-symbols-outlined text-sm ${syncing ? "animate-spin" : ""}`}>sync</span>
                {syncing ? "Syncing..." : "SYNC NOW"}
              </button>
              <p className="text-[10px] text-slate-400 text-center">Last synced: Today 09:42 AM</p>
            </div>
          </div>
        </nav>

        {/* Main Map Area */}
        <main className="flex-1 flex flex-col relative overflow-hidden">
          {/* Map background */}
          <div className="flex-1 relative overflow-hidden">
            {/* Map tiles placeholder — in production integrate Leaflet/MapLibre */}
            <div className="absolute inset-0 z-0 overflow-hidden">
              {/* Grid lines to simulate map tiles */}
              <div className="absolute inset-0" style={{
                backgroundImage: `
                  linear-gradient(rgba(200,220,210,0.3) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(200,220,210,0.3) 1px, transparent 1px)
                `,
                backgroundSize: "48px 48px",
                backgroundColor: "#e8f0ec"
              }} />
              {/* Road lines */}
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-white/60" style={{ top: "45%" }}></div>
              <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/40" style={{ left: "38%" }}></div>
              <div className="absolute left-1/4 top-1/4 w-48 h-0.5 bg-white/40 rotate-12"></div>
              {/* Area zones */}
              <div className="absolute rounded-full opacity-20 bg-primary border-2 border-primary" style={{ width: 120, height: 80, top: "25%", left: "36%", transform: "rotate(-15deg)" }}></div>
              <div className="absolute rounded-full opacity-10 bg-orange-400 border-2 border-orange-400" style={{ width: 90, height: 60, top: "45%", left: "55%", transform: "rotate(10deg)" }}></div>
            </div>

            {/* Map overlay: search + controls */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none z-10">
              <div className="pointer-events-auto">
                <div className="bg-white dark:bg-slate-900 p-2 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 w-64">
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                    <input className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-lg pl-10 text-sm focus:ring-primary py-2 outline-none" placeholder="Find household..." type="text" />
                  </div>
                </div>
                {/* Legend */}
                <div className="mt-3 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 p-3 text-xs space-y-1.5">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-primary animate-ping opacity-70"></div><span className="text-slate-600 dark:text-slate-400">High Risk</span></div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-500"></div><span className="text-slate-600 dark:text-slate-400">Pending Visit</span></div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-400"></div><span className="text-slate-600 dark:text-slate-400">Visited</span></div>
                </div>
              </div>
              {/* Zoom controls */}
              <div className="flex flex-col gap-2 pointer-events-auto">
                <button className="size-12 bg-white dark:bg-slate-900 rounded-xl shadow-xl flex items-center justify-center hover:bg-slate-50 border border-slate-200 dark:border-slate-800">
                  <span className="material-symbols-outlined">my_location</span>
                </button>
                <div className="flex flex-col bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                  <button className="size-12 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 border-b border-slate-200 dark:border-slate-800"><span className="material-symbols-outlined">add</span></button>
                  <button className="size-12 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800"><span className="material-symbols-outlined">remove</span></button>
                </div>
              </div>
            </div>

            {/* Map Markers */}
            {VILLAGES.map((v) => (
              <div key={v.name}
                className="absolute pointer-events-auto group z-10"
                style={{ left: v.x, top: v.y }}
                onClick={() => setSelectedVillage(v.name === selectedVillage ? null : v.name)}
              >
                <div className="relative flex items-center justify-center cursor-pointer">
                  {v.type === "high" && <div className="absolute size-8 rounded-full bg-primary/40 animate-ping"></div>}
                  <div className={`${v.type === "high" ? "size-6 bg-primary" : v.type === "medium" ? "size-6 bg-orange-500" : "size-4 bg-slate-400"} rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-900`}>
                    {v.type !== "visited" && <span className="material-symbols-outlined text-white text-[12px]">{v.type === "high" ? "warning" : "priority_high"}</span>}
                  </div>
                  {/* Tooltip */}
                  <div className={`absolute bottom-full mb-2 ${selectedVillage === v.name ? "opacity-100" : "opacity-0"} group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] p-2 rounded shadow-xl whitespace-nowrap pointer-events-none`}>
                    {v.label}
                    <div className="text-primary text-[10px] font-bold mt-0.5">{v.name}</div>
                  </div>
                </div>
              </div>
            ))}

            {/* Outreach Drawer */}
            <div className="absolute bottom-0 right-0 w-full md:w-[400px] max-h-[55%] md:max-h-[85%] overflow-y-auto bg-white dark:bg-slate-900 rounded-t-3xl md:rounded-tr-none md:rounded-l-3xl shadow-2xl border-l border-slate-200 dark:border-slate-800 p-6 z-20">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Today's Outreach</h3>
                <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-black">{remaining} LEFT</span>
              </div>
              <div className="space-y-3">
                {OUTREACH.map((item) => (
                  <div key={item.name} className={`flex items-center gap-4 p-4 rounded-2xl border-l-4 ${item.priority === "high" ? "bg-primary/5 border-l-primary" : item.priority === "medium" ? "bg-orange-500/5 border-l-orange-500" : "bg-slate-100 dark:bg-slate-800/40 border-l-slate-400"}`}>
                    <div className={`size-11 rounded-xl ${item.color} flex items-center justify-center shrink-0`}>
                      <span className="material-symbols-outlined text-white text-lg">{item.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{item.name}</p>
                      <p className="text-xs text-slate-500 font-medium">{item.task}</p>
                    </div>
                    <button className={`size-9 rounded-full ${item.priority === "high" ? "bg-primary/10 text-primary" : item.priority === "medium" ? "bg-orange-500/10 text-orange-500" : "bg-slate-200 dark:bg-slate-700 text-slate-500"} flex items-center justify-center flex-shrink-0`}>
                      <span className="material-symbols-outlined text-sm">chevron_right</span>
                    </button>
                  </div>
                ))}
              </div>
              <button className="w-full mt-5 py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/30 flex items-center justify-center gap-2 hover:bg-primary/90 transition-all">
                <span className="material-symbols-outlined">add_circle</span>
                START NEW VISIT
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile PWA Bottom Nav */}
      <div className="md:hidden flex items-center justify-around bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-3 px-2 z-30 flex-shrink-0">
        <Link href="/dashboard/asha/map" className="flex flex-col items-center gap-1 text-primary">
          <span className="material-symbols-outlined">map</span>
          <span className="text-[10px] font-bold">MAP</span>
        </Link>
        <Link href="/dashboard/asha" className="flex flex-col items-center gap-1 text-slate-400">
          <span className="material-symbols-outlined">assignment</span>
          <span className="text-[10px] font-bold">LIST</span>
        </Link>
        <div className="-mt-8 size-14 rounded-full bg-primary text-white flex items-center justify-center shadow-xl border-4 border-white dark:border-slate-900">
          <span className="material-symbols-outlined text-3xl">add</span>
        </div>
        <button
          onClick={() => setSyncing(true)}
          className="flex flex-col items-center gap-1 text-slate-400 relative"
        >
          <span className={`material-symbols-outlined ${syncing ? "animate-spin text-primary" : ""}`}>sync</span>
          <span className="text-[10px] font-bold">SYNC</span>
          <span className="absolute -top-1 right-0 size-4 bg-orange-500 text-white text-[8px] flex items-center justify-center rounded-full font-bold">8</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-400">
          <span className="material-symbols-outlined">settings</span>
          <span className="text-[10px] font-bold">SETTINGS</span>
        </button>
      </div>
    </div>
  );
}
