"use client";

import { useState } from "react";
import Link from "next/link";

const STOCK = [
  { name: "Paracetamol 500mg", category: "Analgesic", qty: 450, unit: "Strips", status: "In Stock", updated: "Today, 10:45 AM" },
  { name: "Metformin 500mg", category: "Anti-diabetic", qty: 12, unit: "Boxes", status: "Low Stock", updated: "2 days ago" },
  { name: "Cetirizine 10mg", category: "Anti-histamine", qty: 0, unit: "Strips", status: "Out of Stock", updated: "3 days ago" },
  { name: "Amoxicillin 250mg", category: "Antibiotic", qty: 85, unit: "Vials", status: "In Stock", updated: "Yesterday" },
  { name: "Omeprazole 20mg", category: "Gastrointestinal", qty: 18, unit: "Strips", status: "Critical Low", updated: "2 days ago" },
  { name: "Amlodipine 5mg", category: "Hypertension", qty: 8, unit: "Boxes", status: "Low Stock", updated: "Today, 08:20 AM" },
  { name: "Atorvastatin 10mg", category: "Cholesterol", qty: 240, unit: "Strips", status: "In Stock", updated: "4 days ago" },
  { name: "Azithromycin 500mg", category: "Antibiotic", qty: 5, unit: "Strips", status: "Low Stock", updated: "Today, 09:15 AM" },
  { name: "ORS Sachet", category: "Electrolyte", qty: 300, unit: "Sachets", status: "In Stock", updated: "Today" },
  { name: "Vitamin D3 1000IU", category: "Supplement", qty: 55, unit: "Tablets", status: "Low Stock", updated: "Yesterday" },
];

const LOG = [
  { method: "SMS Update", detail: "Paracetamol +50 Strips", via: "+91 98XXX XXX45", time: "12 mins ago", ok: true },
  { method: "WhatsApp Update", detail: "Metformin -5 Boxes", via: "+91 91XXX XXX88", time: "45 mins ago", ok: true },
  { method: "Web Form", detail: "Amoxicillin Inventory Audit", via: "Admin Panel", time: "2 hours ago", ok: true },
];

const statusStyle = (s: string) => {
  if (s === "In Stock") return "bg-primary/10 text-primary border-primary/20";
  if (s === "Low Stock") return "bg-amber-50 text-amber-600 border-amber-100";
  if (s === "Critical Low") return "bg-red-100 text-red-700 border-red-200";
  return "bg-red-50 text-red-600 border-red-100";
};

const qtyColor = (s: string) => {
  if (s === "In Stock") return "text-slate-900 dark:text-slate-100";
  if (s === "Low Stock" || s === "Critical Low") return "text-amber-600";
  return "text-red-600";
};

export default function PharmacyDashboard() {
  const [search, setSearch] = useState("");
  const [medicine, setMedicine] = useState("");
  const [qty, setQty] = useState("");
  const [updated, setUpdated] = useState(false);

  const filtered = STOCK.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) || m.category.toLowerCase().includes(search.toLowerCase())
  );

  const lowStockCount = STOCK.filter((s) => s.status !== "In Stock").length;

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setUpdated(true);
    setTimeout(() => setUpdated(false), 3000);
    setMedicine(""); setQty("");
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-3xl">health_and_safety</span>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">GraamSehat</span>
          </div>
          <div className="hidden md:block">
            <span className="text-lg font-bold text-slate-800 dark:text-slate-200">Singh Medical Store</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-bold px-3 py-1 uppercase tracking-wider">Pharmacist</span>
            <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-slate-500 dark:text-slate-400">account_circle</span>
            </div>
          </div>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Medicine Stock Manager</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Last updated 2 hours ago · {STOCK.length} items in inventory</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-primary hover:text-primary rounded-xl px-4 py-2.5 font-semibold transition-colors bg-white dark:bg-slate-900 shadow-sm text-sm">
              <span className="material-symbols-outlined text-lg">download</span> Export Report
            </button>
            <button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold px-5 py-2.5 rounded-xl shadow-sm transition-all text-sm">
              <span className="material-symbols-outlined text-lg">add</span> Add Medicine
            </button>
          </div>
        </div>

        {/* Low Stock Alert */}
        {lowStockCount > 0 && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-red-600">error</span>
              <p className="text-red-700 font-medium">{lowStockCount} medicines running low — notify district supplier?</p>
            </div>
            <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors">Send Alert</button>
          </div>
        )}

        {/* Success banner */}
        {updated && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
            <span className="material-symbols-outlined text-green-600">check_circle</span>
            <p className="text-green-700 font-medium text-sm">Stock updated successfully! Syncing to GraamSehat network...</p>
          </div>
        )}

        {/* Update Methods Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          {/* Quick Web Update */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Quick Web Update</h2>
            <p className="text-slate-500 text-sm mb-5">Update stock directly from the dashboard</p>
            <form className="space-y-4" onSubmit={handleUpdate}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-1 block mb-1">Medicine Name</label>
                  <input
                    value={medicine} onChange={(e) => setMedicine(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder="e.g. Paracetamol 500mg" type="text" required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-1 block mb-1">Quantity Change</label>
                  <input
                    value={qty} onChange={(e) => setQty(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder="+ / - Amount" type="number" required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-1 block mb-1">Unit</label>
                  <select className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
                    <option>Tablets</option><option>Strips</option><option>Vials</option><option>Sachets</option><option>Boxes</option><option>Capsules</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-1 block mb-1">Expiry Date</label>
                  <input type="date" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
                </div>
              </div>
              <button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl shadow-sm transition-all mt-2 flex items-center justify-center gap-2">
                <span className="material-symbols-outlined">inventory</span> Update Stock
              </button>
              <p className="text-center text-xs text-slate-400">Last web update: Today 07:30 AM</p>
            </form>
          </div>

          {/* WhatsApp/SMS Update */}
          <div className="bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-900/30 shadow-sm p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-600">chat</span>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">WhatsApp / SMS Update</h2>
                </div>
                <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-tighter">Instant Sync</span>
              </div>
              <p className="text-amber-800/70 dark:text-amber-300/70 text-sm mb-4">Update stock while on the move via simple SMS codes</p>
              <div className="bg-white/60 dark:bg-slate-900/40 border border-amber-200 dark:border-amber-900/30 rounded-xl p-4">
                <p className="text-xs font-bold text-amber-900 dark:text-amber-300 mb-2">Message Format:</p>
                <code className="block text-sm font-mono text-amber-900 dark:text-amber-200 bg-amber-100/50 dark:bg-amber-900/20 p-3 rounded-lg">
                  STOCK [medicine_name] [quantity]
                </code>
                <div className="mt-4 space-y-2">
                  <p className="text-xs text-amber-800/80 dark:text-amber-300/80">Examples:</p>
                  <div className="bg-amber-200/30 border border-amber-200 border-dashed rounded-lg p-3 space-y-1">
                    <p className="text-xs font-mono font-medium text-amber-900 dark:text-amber-200">STOCK paracetamol 50</p>
                    <p className="text-xs font-mono font-medium text-amber-900 dark:text-amber-200">STOCK metformin 30</p>
                  </div>
                  <p className="text-xs text-amber-700">Send to: <strong>+91 98765 00000</strong></p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-green-600">
              <span className="material-symbols-outlined text-sm">bolt</span>
              Supported 24/7 · Auto-syncs in 5 mins
            </div>
          </div>
        </div>

        {/* Medicine Table */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mb-10">
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 flex-wrap">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Current Medicine Stock</h2>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
              <input
                value={search} onChange={(e) => setSearch(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full pl-9 pr-4 py-1.5 text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none w-52"
                placeholder="Search inventory..."
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800 text-slate-500 text-[11px] uppercase tracking-widest font-bold">
                  <th className="px-6 py-4">Medicine Name</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4 text-center">Stock</th>
                  <th className="px-6 py-4">Unit</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Last Updated</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((m) => (
                  <tr key={m.name} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-sm text-slate-900 dark:text-slate-100">{m.name}</td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-sm">{m.category}</td>
                    <td className={`px-6 py-4 text-center font-bold text-sm ${qtyColor(m.status)}`}>{m.qty}</td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs uppercase">{m.unit}</td>
                    <td className="px-6 py-4">
                      <span className={`border rounded-full text-[10px] font-bold px-2 py-0.5 uppercase ${statusStyle(m.status)}`}>{m.status}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-xs">{m.updated}</td>
                    <td className="px-6 py-4 text-right">
                      {m.status === "Out of Stock" || m.status === "Critical Low" ? (
                        <button className="text-red-500 hover:underline font-semibold text-xs">Reorder</button>
                      ) : (
                        <button className="text-slate-400 hover:text-primary transition-colors">
                          <span className="material-symbols-outlined text-lg">edit</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="px-6 py-10 text-center text-slate-400 text-sm">No medicines found</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 text-center">
            <button className="text-primary font-bold text-sm hover:underline">View Entire Inventory ({STOCK.length} items)</button>
          </div>
        </div>

        {/* Update Log */}
        <section>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Recent Update Log</h2>
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm divide-y divide-slate-100 dark:divide-slate-800">
            {LOG.map((l) => (
              <div key={l.detail} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-green-500">check_circle</span>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{l.method}: <span className="font-normal text-slate-600 dark:text-slate-400">{l.detail}</span></p>
                    <p className="text-[11px] text-slate-400">Via {l.via} · {l.time}</p>
                  </div>
                </div>
                <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded">Success</span>
              </div>
            ))}
          </div>
        </section>

        {/* Navigation links */}
        <div className="mt-8 flex gap-4 flex-wrap">
          <Link href="/dashboard/patient/pharmacy" className="text-primary font-bold text-sm hover:underline flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">open_in_new</span> Patient-facing Pharmacy View
          </Link>
          <Link href="/dashboard/admin" className="text-primary font-bold text-sm hover:underline flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">analytics</span> Admin Analytics
          </Link>
        </div>
      </main>
    </div>
  );
}
