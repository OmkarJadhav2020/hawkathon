"use client";

const kpis = [
  { label: "Total Patients", value: "2,847", change: "+12%", changeColor: "text-primary", accent: "bg-primary" },
  { label: "Consultations Today", value: "47", sub: "8 pending", subColor: "text-blue-600", accent: "bg-blue-500" },
  { label: "AI Triages", value: "134", icon: "psychology", accent: "bg-amber-500" },
  { label: "Doctor Utilization", value: "78%", sub: "Optimal", subColor: "text-green-600", accent: "bg-green-500" },
  { label: "Villages Covered", value: "173", icon: "map", accent: "bg-purple-500" },
];

const bars = [
  { month: "May", count: 420, h: "60%" },
  { month: "Jun", count: 510, h: "75%" },
  { month: "Jul", count: 620, h: "85%" },
  { month: "Aug", count: 380, h: "55%" },
  { month: "Sep", count: 740, h: "95%" },
  { month: "Oct", count: 310, h: "45%" },
];

const villages = [
  { name: "Kakrala", pop: "1,240", cases: 342 },
  { name: "Bhadson", pop: "2,100", cases: 289 },
  { name: "Dittupur", pop: "850", cases: 156 },
  { name: "Rohti", pop: "1,020", cases: 124 },
];

const doctors = [
  { name: "Dr. Amrit Kaur", spec: "General Physician", online: true },
  { name: "Dr. Rajesh Singh", spec: "Pediatrician", online: true },
  { name: "Dr. Simran V.", spec: "Gynaecologist", online: false },
];

const ashaWorkers = [
  { name: "Preeti Devi", village: "Kakrala", lastSync: "10m ago", ok: true },
  { name: "Sunita Rani", village: "Bhadson", lastSync: "2h ago", ok: true },
  { name: "Jaspreet Kaur", village: "Khaspur", lastSync: "28h ago", ok: false },
  { name: "Kiran Pal", village: "Dittupur", lastSync: "1h ago", ok: true },
];

export default function AdminDashboard() {
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
            <nav className="hidden md:flex gap-6 text-sm">
              <a className="text-primary font-semibold border-b-2 border-primary pb-1" href="#">Dashboard</a>
              <a className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors" href="#">Villages</a>
              <a className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors" href="#">Doctors</a>
              <a className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors" href="#">Reports</a>
            </nav>
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
              <button className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 px-3 py-1 rounded text-sm font-medium flex items-center gap-1 hover:bg-slate-50">
                <span className="material-symbols-outlined text-sm">calendar_today</span> Mar 2026
              </button>
              <button className="bg-primary text-white px-3 py-1 rounded text-sm font-medium flex items-center gap-1 hover:opacity-90">
                <span className="material-symbols-outlined text-sm">download</span> Export
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* KPI Row */}
        <section className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 relative overflow-hidden">
              <div className={`absolute top-0 left-0 right-0 h-1 ${kpi.accent}`} />
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{kpi.label}</p>
              <div className="flex items-end justify-between mt-2">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{kpi.value}</h2>
                {kpi.change && <span className={`text-xs font-bold flex items-center ${kpi.changeColor}`}>{kpi.change} <span className="material-symbols-outlined text-xs">trending_up</span></span>}
                {kpi.sub && <span className={`text-xs font-medium ${kpi.subColor}`}>{kpi.sub}</span>}
                {kpi.icon && <span className={`material-symbols-outlined ${kpi.subColor || "text-slate-400"}`}>{kpi.icon}</span>}
              </div>
            </div>
          ))}
        </section>

        {/* Analytics Row */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          {/* Bar Chart */}
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-slate-900 dark:text-white font-bold text-lg">Monthly Consultations</h3>
              <select className="text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg px-2 py-1 outline-none">
                <option>Last 6 Months</option>
                <option>Year 2025</option>
              </select>
            </div>
            <div className="w-full h-56 flex items-end justify-between px-2">
              {bars.map((bar) => (
                <div key={bar.month} className="flex flex-col items-center flex-1">
                  <div className="w-12 bg-slate-100 dark:bg-slate-800 rounded-t-md relative group" style={{ height: bar.h }}>
                    <div className="absolute inset-x-0 bottom-0 bg-primary opacity-50 group-hover:opacity-100 transition-all rounded-t-md h-full" />
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-600 dark:text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">{bar.count}</span>
                  </div>
                  <span className="text-xs mt-2 text-slate-500">{bar.month}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Triage Distribution */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex flex-col">
            <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-6">Triage Distribution</h3>
            <div className="space-y-6 flex-1 flex flex-col justify-center">
              {[
                { label: "Home Care", val: 58, color: "bg-primary" },
                { label: "Teleconsult", val: 34, color: "bg-blue-500" },
                { label: "Emergency", val: 8, color: "bg-red-500" },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{item.label}</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{item.val}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                    <div className={`${item.color} h-2 rounded-full transition-all`} style={{ width: `${item.val}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
              <p className="text-xs text-slate-500"><span className="font-bold text-slate-700 dark:text-slate-300">Insight:</span> Most patients managed through local home care protocols.</p>
            </div>
          </div>
        </section>

        {/* Bottom Row */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Villages */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-slate-900 dark:text-white font-bold">Top Villages by Consultations</h3>
            </div>
            <div className="divide-y divide-slate-50 dark:divide-slate-800 flex-1">
              {villages.map((v) => (
                <div key={v.name} className="p-4 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div>
                    <p className="font-medium text-slate-800 dark:text-slate-200">{v.name}</p>
                    <p className="text-xs text-slate-500">Pop: {v.pop}</p>
                  </div>
                  <span className="text-sm font-bold text-primary">{v.cases} cases</span>
                </div>
              ))}
            </div>
            <div className="p-4">
              <button className="w-full py-2 text-sm text-slate-500 hover:text-primary font-medium border border-slate-200 dark:border-slate-700 rounded-lg hover:border-primary transition-all">View All 173 Villages</button>
            </div>
          </div>

          {/* Doctor Availability */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 flex flex-col">
            <h3 className="text-slate-900 dark:text-white font-bold mb-4">Doctor Availability</h3>
            <div className="space-y-3 flex-1">
              {doctors.map((doc) => (
                <div key={doc.name} className={`flex items-center gap-3 p-3 border border-slate-100 dark:border-slate-700 rounded-lg ${doc.online ? "bg-emerald-50/50 dark:bg-emerald-900/10" : "opacity-60 grayscale bg-slate-50 dark:bg-slate-800"}`}>
                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 font-bold text-sm">
                    {doc.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                  </div>
                  <div className="flex-grow">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{doc.name}</p>
                    <p className="text-xs text-slate-500">{doc.spec}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`inline-flex h-2 w-2 rounded-full mb-1 ${doc.online ? "bg-emerald-500" : "bg-slate-300"}`} />
                    <span className={`text-[10px] font-bold ${doc.online ? "text-emerald-600" : "text-slate-500"}`}>{doc.online ? "ONLINE" : "OFFLINE"}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between text-xs p-2 bg-slate-50 dark:bg-slate-800 rounded">
              <span className="text-slate-500">On-call backup:</span>
              <span className="font-bold text-slate-700 dark:text-slate-300">3 Available</span>
            </div>
          </div>

          {/* ASHA Sync Status */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-slate-900 dark:text-white font-bold">ASHA Worker Sync</h3>
              <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase">1 Warning</span>
            </div>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800 text-[10px] uppercase font-bold text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Worker</th>
                    <th className="px-4 py-3">Village</th>
                    <th className="px-4 py-3">Last Sync</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-slate-50 dark:divide-slate-800">
                  {ashaWorkers.map((w) => (
                    <tr key={w.name} className={w.ok ? "" : "bg-red-50/30 dark:bg-red-900/10"}>
                      <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">{w.name}</td>
                      <td className="px-4 py-3 text-slate-500">{w.village}</td>
                      <td className="px-4 py-3 text-slate-500">{w.lastSync}</td>
                      <td className="px-4 py-3">
                        <span className={`material-symbols-outlined text-sm ${w.ok ? "text-green-500" : "text-red-500"}`}>
                          {w.ok ? "check_circle" : "warning"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
