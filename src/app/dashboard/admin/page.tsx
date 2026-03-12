"use client";

import { useEffect, useState } from "react";
import { format, formatDistanceToNow } from "date-fns";

type Stats = {
  totals: {
    patients: number;
    doctors: number;
    consultations: number;
    completed: number;
    pending: number;
    pharmacies: number;
    healthRecords: number;
    prescriptions: number;
  };
  triage: { category: string; count: number }[];
  villages: { village: string; count: number }[];
  recentConsultations: {
    id: string;
    createdAt: string;
    status: string;
    patient: { name: string; village: string | null };
    doctor: { name: string } | null;
  }[];
  doctors: {
    id: string;
    name: string;
    specialization: string;
    isAvailable: boolean;
    pendingQueue: number;
  }[];
  ashaWorkers: {
    id: string;
    name: string;
    villages: string[];
    totalCamps: number;
    isOnline: boolean;
    lastSync: string | null;
  }[];
};

const ACCENT_COLORS = ["bg-primary", "bg-blue-500", "bg-amber-500", "bg-green-500", "bg-purple-500"];

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((data) => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const totals = stats?.totals;
  const kpis = [
    { label: "Total Patients", value: totals?.patients?.toLocaleString() ?? "—", sub: null },
    { label: "Consultations", value: totals?.consultations?.toLocaleString() ?? "—", sub: `${totals?.pending ?? 0} pending` },
    { label: "Completed", value: totals?.completed?.toLocaleString() ?? "—", sub: "All time" },
    { label: "Doctors", value: totals?.doctors?.toLocaleString() ?? "—", sub: null },
    { label: "Health Records", value: totals?.healthRecords?.toLocaleString() ?? "—", sub: null },
  ];

  // Compute triage percentages
  const totalTriage = (stats?.triage?.reduce((a, b) => a + b.count, 0)) ?? 1;
  const triageCategories = [
    { label: "Home Care", key: "HOME_CARE", color: "bg-primary" },
    { label: "Teleconsult", key: "TELECONSULT", color: "bg-blue-500" },
    { label: "Emergency", key: "EMERGENCY", color: "bg-red-500" },
  ].map((tc) => ({
    ...tc,
    count: stats?.triage?.find((t) => t.category === tc.key)?.count ?? 0,
    pct: Math.round(((stats?.triage?.find((t) => t.category === tc.key)?.count ?? 0) / totalTriage) * 100),
  }));

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
                  <span className="material-symbols-outlined text-xl">health_metrics</span>
                </div>
                <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">GraamSehat</span>
              </div>
              <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-semibold text-slate-800 dark:text-slate-200">Admin</span>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 text-slate-400"><span className="material-symbols-outlined">notifications</span></button>
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">AD</div>
            </div>
          </div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 py-3">
          <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
            <h1 className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              District Health Overview — <span className="text-slate-900 dark:text-white font-bold">Nabha Block</span>
            </h1>
            <div className="flex gap-2">
              <button onClick={() => window.print()} className="bg-primary text-white px-3 py-1 rounded text-sm font-medium flex items-center gap-1 hover:opacity-90">
                <span className="material-symbols-outlined text-sm">download</span> Export
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* KPI Row */}
            <section className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
              {kpis.map((kpi, idx) => (
                <div key={kpi.label} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 relative overflow-hidden">
                  <div className={`absolute top-0 left-0 right-0 h-1 ${ACCENT_COLORS[idx]}`} />
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{kpi.label}</p>
                  <div className="flex items-end justify-between mt-2">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{kpi.value}</h2>
                    {kpi.sub && <span className="text-xs font-medium text-slate-400">{kpi.sub}</span>}
                  </div>
                </div>
              ))}
            </section>

            {/* Analytics Row */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
              {/* Recent Consultations */}
              <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-4">Recent Consultations</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="text-[11px] text-slate-400 uppercase font-bold border-b border-slate-100 dark:border-slate-800">
                      <tr>
                        <th className="pb-3 pr-4">Patient</th>
                        <th className="pb-3 pr-4">Village</th>
                        <th className="pb-3 pr-4">Doctor</th>
                        <th className="pb-3 pr-4">Date</th>
                        <th className="pb-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                      {(stats?.recentConsultations ?? []).map((c) => (
                        <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="py-3 pr-4 font-medium text-slate-800 dark:text-slate-200">{c.patient.name}</td>
                          <td className="py-3 pr-4 text-slate-500">{c.patient.village ?? "—"}</td>
                          <td className="py-3 pr-4 text-slate-500">{c.doctor?.name ?? "Unassigned"}</td>
                          <td className="py-3 pr-4 text-slate-400">{format(new Date(c.createdAt), "dd MMM")}</td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${c.status === "COMPLETED" ? "bg-green-100 text-green-700" : c.status === "PENDING" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}>
                              {c.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Triage Distribution */}
              <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex flex-col">
                <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-6">Triage Distribution</h3>
                <div className="space-y-6 flex-1 flex flex-col justify-center">
                  {triageCategories.map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{item.label}</span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{item.pct}% ({item.count})</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                        <div className={`${item.color} h-2 rounded-full transition-all`} style={{ width: `${item.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Bottom Row */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Top Villages */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-slate-900 dark:text-white font-bold">Top Villages by Patients</h3>
                </div>
                <div className="divide-y divide-slate-50 dark:divide-slate-800 flex-1">
                  {(stats?.villages ?? []).length === 0 ? (
                    <p className="text-center py-8 text-slate-400 text-sm">No village data available.</p>
                  ) : (
                    (stats?.villages ?? []).map((v) => (
                      <div key={v.village} className="p-4 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <div>
                          <p className="font-medium text-slate-800 dark:text-slate-200">{v.village}</p>
                        </div>
                        <span className="text-sm font-bold text-primary">{v.count} patients</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Doctor Availability */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 flex flex-col">
                <h3 className="text-slate-900 dark:text-white font-bold mb-4">Doctor Availability</h3>
                <div className="space-y-3 flex-1">
                  {(stats?.doctors ?? []).map((doc) => (
                    <div key={doc.id} className={`flex items-center gap-3 p-3 border border-slate-100 dark:border-slate-700 rounded-lg ${doc.isAvailable ? "bg-emerald-50/50 dark:bg-emerald-900/10" : "opacity-60 grayscale bg-slate-50 dark:bg-slate-800"}`}>
                      <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 font-bold text-sm">
                        {doc.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                      </div>
                      <div className="flex-grow">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{doc.name}</p>
                        <p className="text-xs text-slate-500">{doc.specialization}</p>
                        {doc.pendingQueue > 0 && <p className="text-[10px] text-amber-600 font-medium">{doc.pendingQueue} queued</p>}
                      </div>
                      <div className="flex flex-col items-end">
                        <span className={`inline-flex h-2 w-2 rounded-full mb-1 ${doc.isAvailable ? "bg-emerald-500" : "bg-slate-300"}`} />
                        <span className={`text-[10px] font-bold ${doc.isAvailable ? "text-emerald-600" : "text-slate-500"}`}>{doc.isAvailable ? "ONLINE" : "OFFLINE"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ASHA Sync Status */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <h3 className="text-slate-900 dark:text-white font-bold">ASHA Worker Sync</h3>
                  <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded uppercase">{stats?.ashaWorkers?.length ?? 0} workers</span>
                </div>
                <div className="overflow-x-auto flex-1">
                  {(stats?.ashaWorkers ?? []).length === 0 ? (
                    <p className="text-center py-8 text-slate-400 text-sm">No ASHA workers found.</p>
                  ) : (
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 dark:bg-slate-800 text-[10px] uppercase font-bold text-slate-400">
                        <tr>
                          <th className="px-4 py-3">Worker</th>
                          <th className="px-4 py-3">Villages</th>
                          <th className="px-4 py-3">Last Sync</th>
                          <th className="px-4 py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm divide-y divide-slate-50 dark:divide-slate-800">
                        {(stats?.ashaWorkers ?? []).map((w) => (
                          <tr key={w.id}>
                            <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">{w.name}</td>
                            <td className="px-4 py-3 text-slate-500 text-xs">{w.villages.join(", ") || "—"}</td>
                            <td className="px-4 py-3 text-slate-400 text-xs">{w.lastSync ? formatDistanceToNow(new Date(w.lastSync), { addSuffix: true }) : "Never"}</td>
                            <td className="px-4 py-3">
                              <span className={`material-symbols-outlined text-sm ${w.isOnline ? "text-green-500" : "text-slate-400"}`}>
                                {w.isOnline ? "check_circle" : "circle"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
