"use client";

import { useState } from "react";
import Link from "next/link";

const patients = [
  { initials: "RK", color: "bg-primary/10 text-primary", name: "Ramesh Kumar", info: "45 / M • ID: 8829-X", status: "Completed", bp: "120/80", sugar: "140", statusColor: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  { initials: "SD", color: "bg-amber-100 text-amber-600", name: "Sita Devi", info: "32 / F • ID: 1104-A", status: "Pending Sync", immunization: "Immuno V1", statusColor: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  { initials: "AS", color: "bg-blue-100 text-blue-600", name: "Amit Singh", info: "12 / M • ID: 4492-C", status: "Waiting", statusColor: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400" },
];

export default function AshaWorkerDashboard() {
  const [activeNav, setActiveNav] = useState("dashboard");
  const [syncProgress] = useState(85);
  const [isOnline] = useState(true);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background-light dark:bg-background-dark">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark px-6 py-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 text-asha">
            <span className="material-symbols-outlined text-3xl font-bold">health_and_safety</span>
            <h2 className="text-xl font-black leading-tight tracking-tight uppercase">GraamSehat ASHA</h2>
          </div>
          <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-2 w-80">
            <span className="material-symbols-outlined text-slate-500">search</span>
            <input className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-500 ml-2" placeholder="Search Patient ID or Name..." type="text" />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${isOnline ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"}`}>
            <span className="material-symbols-outlined text-sm">{isOnline ? "cloud_done" : "cloud_off"}</span>
            <span className="text-xs font-bold uppercase tracking-wider">{isOnline ? "Online" : "Offline"}</span>
          </div>
          <div className="size-10 rounded-full border-2 border-asha bg-asha/10 flex items-center justify-center text-asha font-bold">PD</div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <nav className="w-24 md:w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark flex flex-col py-6">
          <div className="flex flex-col gap-2 px-3">
            {[
              { id: "dashboard", icon: "dashboard", label: "Dashboard" },
              { id: "camps", icon: "groups", label: "Village Camps" },
              { id: "patients", icon: "person_search", label: "Patients" },
              { id: "resources", icon: "menu_book", label: "Resources" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className={`flex flex-col md:flex-row items-center gap-3 px-4 py-4 rounded-xl transition-all ${
                  activeNav === item.id
                    ? "bg-asha text-white shadow-lg shadow-asha/20"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <span className="text-xs md:text-sm font-bold">{item.label}</span>
              </button>
            ))}
          </div>

          <div className="mt-auto px-6 py-4">
            <div className="hidden md:block">
              <div className="flex justify-between items-end mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Sync Progress</span>
                <span className="text-xs font-black text-asha">{syncProgress}%</span>
              </div>
              <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-asha transition-all" style={{ width: `${syncProgress}%` }} />
              </div>
              <p className="text-[10px] mt-2 text-slate-400">Last sync: 14m ago</p>
            </div>
          </div>
        </nav>

        {/* Main */}
        <main className="flex-1 overflow-y-auto p-6 bg-background-light dark:bg-background-dark">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white">Village Camp Registration</h1>
              <p className="text-slate-500 dark:text-slate-400">Batch entry for Kalyanpur Health Drive - Dec 24, 2024</p>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-bold shadow-md active:scale-95 transition-transform">
                <span className="material-symbols-outlined">add_circle</span> New Registration
              </button>
              <button className="flex items-center gap-2 px-6 py-3 bg-asha text-white rounded-xl font-bold shadow-lg shadow-asha/30 active:scale-95 transition-transform">
                <span className="material-symbols-outlined">sync</span> Sync Now
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[
              { label: "Registered Today", value: "42", change: "+12%", changeColor: "text-green-500" },
              { label: "Pending Sync", value: "08", suffix: "Offline records", suffixColor: "text-amber-500" },
              { label: "Next Follow-up", value: "15", suffix: "Villagers", suffixColor: "text-slate-400" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                <p className="text-sm font-bold text-slate-500 uppercase mb-1">{stat.label}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-asha">{stat.value}</span>
                  {stat.change && <span className={`text-sm font-bold ${stat.changeColor}`}>{stat.change}</span>}
                  {stat.suffix && <span className={`text-sm font-medium ${stat.suffixColor}`}>{stat.suffix}</span>}
                </div>
              </div>
            ))}
          </div>

          {/* Patients Table */}
          <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white">Recent Attendees</h3>
              <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-400">
                <span className="material-symbols-outlined">filter_list</span>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-slate-400 text-xs font-bold uppercase tracking-widest border-b border-slate-100 dark:border-slate-700">
                    <th className="px-6 py-4">Patient Details</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Health Check</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {patients.map((p) => (
                    <tr key={p.name} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`size-10 rounded-full flex items-center justify-center font-bold ${p.color}`}>{p.initials}</div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">{p.name}</p>
                            <p className="text-xs text-slate-500">{p.info}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${p.statusColor} border-current/20`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {p.bp && <div className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-700 text-[10px] font-bold">BP: {p.bp}</div>}
                          {p.sugar && <div className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-700 text-[10px] font-bold">Sugar: {p.sugar}</div>}
                          {p.immunization && <div className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-700 text-[10px] font-bold">{p.immunization}</div>}
                          {!p.bp && !p.sugar && !p.immunization && <span className="text-xs italic text-slate-400">Not measured</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {p.status === "Completed" && (
                          <button className="px-4 py-2 bg-asha/10 hover:bg-asha text-asha hover:text-white rounded-lg text-xs font-bold transition-all">Proxy Book</button>
                        )}
                        {p.status === "Pending Sync" && (
                          <button className="px-4 py-2 bg-asha text-white rounded-lg text-xs font-bold shadow-lg shadow-asha/20">Complete</button>
                        )}
                        {p.status === "Waiting" && (
                          <button className="px-4 py-2 bg-asha/10 hover:bg-asha text-asha hover:text-white rounded-lg text-xs font-bold transition-all">Start Check</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Education Resources */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-black text-slate-900 dark:text-white">Education Resources</h3>
              <a className="text-asha font-bold text-sm" href="#">View All Library</a>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Hygiene Basics", sub: "6 modules • Hindi/English", bg: "from-blue-500/20 to-blue-600/40" },
                { label: "Maternal Nutrition", sub: "Video guide • 12 mins", bg: "from-green-500/20 to-green-600/40" },
                { label: "Immunization Tracker", sub: "Interactive Tool", bg: "from-purple-500/20 to-purple-600/40" },
                { label: "Download Offline", sub: "Available offline", bg: "from-slate-300/50 to-slate-400/30", isDashed: true },
              ].map((card) => (
                <div key={card.label} className={`group relative overflow-hidden rounded-2xl aspect-[4/3] bg-gradient-to-br ${card.bg} border border-white/20 ${card.isDashed ? "border-dashed border-2 border-slate-300 dark:border-slate-600" : ""} cursor-pointer`}>
                  {card.isDashed ? (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-2">
                      <span className="material-symbols-outlined text-3xl">download</span>
                      <span className="font-bold text-xs">{card.label}</span>
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black/60 to-transparent group-hover:from-black/80 transition-all">
                      <h4 className="text-white font-bold text-sm">{card.label}</h4>
                      <p className="text-white/70 text-[10px]">{card.sub}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Bar */}
      <div className="h-20 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-around md:hidden">
        {[
          { icon: "home", label: "Home" },
          { icon: "person_add", label: "Add" },
          { icon: "qr_code_scanner", label: "Scan", fab: true },
          { icon: "notifications", label: "Alerts" },
          { icon: "settings", label: "Tools" },
        ].map((item) => (
          <button
            key={item.label}
            className={`flex flex-col items-center gap-1 ${item.fab ? "relative bg-asha text-white size-12 rounded-full -mt-10 shadow-xl border-4 border-background-light dark:border-background-dark" : "text-slate-400"}`}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            {!item.fab && <span className="text-[10px] font-bold">{item.label}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
