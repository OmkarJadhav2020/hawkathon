"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { format } from "date-fns";

type StockItem = {
  id: string;
  medicineName: string;
  genericName: string | null;
  quantity: number;
  unit: string;
  price: number | null;
  inStock: boolean;
  expiryDate: string | null;
  updatedAt: string;
  pharmacy: { name: string; address: string };
};

const statusLabel = (qty: number) =>
  qty === 0 ? "Out of Stock" : qty <= 10 ? "Low Stock" : qty <= 20 ? "Critical Low" : "In Stock";

const statusStyle = (qty: number) => {
  const s = statusLabel(qty);
  if (s === "In Stock") return "bg-primary/10 text-primary border-primary/20";
  if (s === "Low Stock") return "bg-amber-50 text-amber-600 border-amber-100";
  if (s === "Critical Low") return "bg-red-100 text-red-700 border-red-200";
  return "bg-red-50 text-red-600 border-red-100";
};

const qtyColor = (qty: number) => {
  const s = statusLabel(qty);
  if (s === "In Stock") return "text-slate-900 dark:text-slate-100";
  if (s === "Low Stock" || s === "Critical Low") return "text-amber-600";
  return "text-red-600";
};

export default function PharmacyDashboard() {
  const [stock, setStock] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [medicine, setMedicine] = useState("");
  const [qty, setQty] = useState("");
  const [unit, setUnit] = useState("tablets");
  const [expiryDate, setExpiryDate] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  // In production: get pharmacyId from session
  // This must be the real PharmacyProfile ID from the DB
  const pharmacyId = typeof window !== "undefined" ? localStorage.getItem("pharmacyId") ?? "" : "";

  const fetchStock = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/sync/pharmacy-stock");
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setStock(data.stock ?? []);
    } catch {
      console.error("Failed to fetch stock");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStock(); }, [fetchStock]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pharmacyId) {
      showToast("Pharmacy ID not set. Please log in as a pharmacist.");
      return;
    }
    try {
      const res = await fetch("/api/sync/pharmacy-stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pharmacyId,
          items: [{ medicineName: medicine, quantity: parseInt(qty), unit, expiryDate: expiryDate || undefined }],
        }),
      });
      if (!res.ok) throw new Error("Failed");
      showToast(`Stock for "${medicine}" updated successfully! Syncing to GraamSehat network...`);
      setMedicine(""); setQty(""); setExpiryDate("");
      fetchStock();
    } catch {
      showToast("Failed to update stock. Please try again.");
    }
  };

  const filtered = stock.filter((m) =>
    m.medicineName.toLowerCase().includes(search.toLowerCase()) ||
    (m.genericName ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const lowCount = stock.filter((m) => m.quantity <= 20).length;

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl z-50 flex items-center gap-2">
          <span className="material-symbols-outlined text-green-400">check_circle</span>
          <span className="font-medium text-sm">{toast}</span>
        </div>
      )}

      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-3xl">health_and_safety</span>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">GraamSehat</span>
          </div>
          <div className="hidden md:block">
            <span className="text-lg font-bold text-slate-800 dark:text-slate-200">
              {stock[0]?.pharmacy?.name ?? "Pharmacy Manager"}
            </span>
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
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Real-time stock from Neon DB · {stock.length} items in inventory</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => window.print()} className="flex items-center gap-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-primary hover:text-primary rounded-xl px-4 py-2.5 font-semibold transition-colors bg-white dark:bg-slate-900 shadow-sm text-sm">
              <span className="material-symbols-outlined text-lg">download</span> Export Report
            </button>
          </div>
        </div>

        {/* Low Stock Alert */}
        {lowCount > 0 && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-red-600">error</span>
              <p className="text-red-700 font-medium">{lowCount} medicines running low — notify district supplier?</p>
            </div>
            <button onClick={() => showToast("Alert sent to district medical officer!")} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors">Send Alert</button>
          </div>
        )}

        {/* Update Methods Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          {/* Quick Web Update */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Quick Web Update</h2>
            <p className="text-slate-500 text-sm mb-5">Update stock directly — saves to the database</p>
            <form className="space-y-4" onSubmit={handleUpdate}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-1 block mb-1">Medicine Name</label>
                  <input value={medicine} onChange={(e) => setMedicine(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="e.g. Paracetamol 500mg" required />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-1 block mb-1">Quantity</label>
                  <input value={qty} onChange={(e) => setQty(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="Amount" type="number" min="0" required />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-1 block mb-1">Unit</label>
                  <select value={unit} onChange={(e) => setUnit(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none">
                    <option>tablets</option><option>strips</option><option>vials</option><option>sachets</option><option>boxes</option><option>capsules</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-1 block mb-1">Expiry Date</label>
                  <input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                </div>
              </div>
              <button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl shadow-sm transition-all mt-2 flex items-center justify-center gap-2">
                <span className="material-symbols-outlined">inventory</span> Update Stock
              </button>
            </form>
          </div>

          {/* SMS Update Info */}
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
                <code className="block text-sm font-mono text-amber-900 dark:text-amber-200 bg-amber-100/50 dark:bg-amber-900/20 p-3 rounded-lg">STOCK [medicine_name] [quantity]</code>
                <div className="mt-4 space-y-2">
                  <p className="text-xs text-amber-800/80 dark:text-amber-300/80">Examples:</p>
                  <div className="bg-amber-200/30 border border-amber-200 border-dashed rounded-lg p-3 space-y-1">
                    <p className="text-xs font-mono font-medium text-amber-900 dark:text-amber-200">STOCK paracetamol 50</p>
                    <p className="text-xs font-mono font-medium text-amber-900 dark:text-amber-200">STOCK metformin 30</p>
                  </div>
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
              <input value={search} onChange={(e) => setSearch(e.target.value)} className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full pl-9 pr-4 py-1.5 text-xs outline-none w-52" placeholder="Search inventory..." />
            </div>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-12 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800 text-slate-500 text-[11px] uppercase tracking-widest font-bold">
                    <th className="px-6 py-4">Medicine Name</th>
                    <th className="px-6 py-4">Generic</th>
                    <th className="px-6 py-4 text-center">Stock</th>
                    <th className="px-6 py-4">Unit</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Expiry</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filtered.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-sm text-slate-900 dark:text-slate-100">{m.medicineName}</td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-sm">{m.genericName || "—"}</td>
                      <td className={`px-6 py-4 text-center font-bold text-sm ${qtyColor(m.quantity)}`}>{m.quantity}</td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs uppercase">{m.unit}</td>
                      <td className="px-6 py-4">
                        <span className={`border rounded-full text-[10px] font-bold px-2 py-0.5 uppercase ${statusStyle(m.quantity)}`}>{statusLabel(m.quantity)}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-xs">{m.expiryDate ? format(new Date(m.expiryDate), "dd MMM yyyy") : "—"}</td>
                      <td className="px-6 py-4 text-right">
                        {m.quantity === 0 ? (
                          <button onClick={() => showToast(`Reorder request sent for ${m.medicineName}!`)} className="text-red-500 hover:underline font-semibold text-xs">Reorder</button>
                        ) : (
                          <button onClick={() => { setMedicine(m.medicineName); setUnit(m.unit); }} className="text-slate-400 hover:text-primary transition-colors">
                            <span className="material-symbols-outlined text-lg">edit</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={7} className="px-6 py-10 text-center text-slate-400 text-sm">No medicines found in database.</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

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
