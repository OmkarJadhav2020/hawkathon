"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

type Medicine = {
  id: string;
  medicineName: string;
  genericName: string | null;
  quantity: number;
  unit: string;
  price: number | null;
  inStock: boolean;
  pharmacy: {
    name: string;
    address: string;
  };
};

const stockColor = (inStock: boolean, qty: number) =>
  inStock && qty > 10
    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
    : inStock && qty <= 10
    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
    : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400";

const stockLabel = (inStock: boolean, qty: number) =>
  inStock && qty > 10 ? "In Stock" : inStock && qty <= 10 ? "Low Stock" : "Out of Stock";

export default function PharmacyPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const fetchMedicines = useCallback(async (query = "") => {
    setLoading(true);
    try {
      const url = `/api/sync/pharmacy-stock${query ? `?medicine=${encodeURIComponent(query)}` : ""}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch medicines");
      const data = await res.json();
      setMedicines(data.stock ?? data ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMedicines();
  }, [fetchMedicines]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMedicines(search);
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl z-50 animate-fade-in flex items-center gap-2">
          <span className="material-symbols-outlined text-green-400">check_circle</span>
          <span className="font-medium text-sm">{toast}</span>
        </div>
      )}

      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link href="/dashboard/patient" className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <span className="material-symbols-outlined text-primary text-2xl">local_pharmacy</span>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Find Medicine</h1>
            <p className="text-xs text-slate-500">Check real-time availability at registered pharmacies</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Search */}
        <form onSubmit={handleSearch} className="relative mb-8">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
          <input
            className="w-full pl-12 pr-32 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary/40 outline-none shadow-sm"
            placeholder="Search medicine name, generic name..."
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition-all">
            Search
          </button>
        </form>

        {/* Medicine Table */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h2 className="font-bold text-slate-800 dark:text-white">Available Medicines — Registered Pharmacies</h2>
            <span className="text-xs text-slate-400 font-medium">{medicines.length} found</span>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-12 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : medicines.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <span className="material-symbols-outlined text-4xl mb-2">medication_liquid</span>
                <p className="text-sm">{search ? `No medicines found for "${search}"` : "No stock data available."}</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800 text-[11px] uppercase font-bold text-slate-400">
                  <tr>
                    <th className="px-6 py-4">Medicine</th>
                    <th className="px-6 py-4">Generic</th>
                    <th className="px-6 py-4">Availability</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Pharmacy</th>
                    <th className="px-6 py-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {medicines.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-slate-100 text-sm">{m.medicineName}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{m.genericName || "—"}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${stockColor(m.inStock, m.quantity)}`}>
                          {stockLabel(m.inStock, m.quantity)}
                        </span>
                        {m.inStock && <span className="ml-2 text-[10px] text-slate-400">({m.quantity} {m.unit})</span>}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200 text-sm">
                        {m.price != null ? `₹${m.price}` : "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">{m.pharmacy.name}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => showToast(`Order placed for ${m.medicineName} at ${m.pharmacy.name}. Contact: ${m.pharmacy.address}`)}
                          disabled={!m.inStock}
                          className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${m.inStock ? "text-primary border border-primary/20 hover:bg-primary/5" : "text-slate-300 border border-slate-100 cursor-not-allowed"}`}
                        >
                          {m.inStock ? "Order Now" : "Unavailable"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Home Delivery CTA */}
        <div className="mt-6 p-6 bg-slate-900 dark:bg-slate-800 text-white rounded-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-yellow-400 text-3xl">delivery_dining</span>
            <div>
              <h3 className="font-bold">Free Home Delivery</h3>
              <p className="text-sm text-slate-300">Upload your prescription and we will deliver to your door within 24 hours.</p>
            </div>
          </div>
          <button
            onClick={() => showToast("Home delivery request submitted! An ASHA worker will contact you shortly.")}
            className="bg-primary text-white font-bold px-5 py-3 rounded-xl hover:opacity-90 whitespace-nowrap text-sm"
          >
            Request Delivery
          </button>
        </div>
      </main>
    </div>
  );
}
