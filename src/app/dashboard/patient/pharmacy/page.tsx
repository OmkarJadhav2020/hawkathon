"use client";

import Link from "next/link";

const medicines = [
  { name: "Paracetamol 500mg", brand: "Calpol / Crocin", stock: "In Stock", price: "₹12", pharmacy: "City Life Medicos" },
  { name: "Amoxicillin 500mg", brand: "Novamox / Mox", stock: "In Stock", price: "₹85", pharmacy: "Apollo Pharmacy" },
  { name: "Omeprazole 20mg", brand: "Omez / Ocid", stock: "Low Stock", price: "₹22", pharmacy: "City Life Medicos" },
  { name: "Metformin 500mg", brand: "Glycomet / Glucophage", stock: "In Stock", price: "₹35", pharmacy: "Jan Aushadhi Store" },
  { name: "Amlodipine 5mg", brand: "Amlong / Stamlo", stock: "Out of Stock", price: "₹28", pharmacy: "—" },
  { name: "Cetirizine 10mg", brand: "Cetzine / Alerid", stock: "In Stock", price: "₹15", pharmacy: "Jan Aushadhi Store" },
];

const stockColor = (s: string) =>
  s === "In Stock" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
  : s === "Low Stock" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
  : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400";

export default function PharmacyPage() {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link href="/dashboard/patient" className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <span className="material-symbols-outlined text-primary text-2xl">local_pharmacy</span>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Find Medicine</h1>
            <p className="text-xs text-slate-500">Check availability at nearby pharmacies</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Search */}
        <div className="relative mb-8">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
          <input
            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary/40 outline-none shadow-sm"
            placeholder="Search medicine name, brand..."
            type="text"
          />
          <button className="absolute right-3 top-1/2 -translate-y-1/2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold">Search</button>
        </div>

        {/* Jan Aushadhi Banner */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-5 flex items-center gap-4 mb-8">
          <span className="material-symbols-outlined text-primary text-3xl">medication</span>
          <div className="flex-1">
            <h3 className="font-bold text-slate-900 dark:text-white">Jan Aushadhi Store — 0.8 km away</h3>
            <p className="text-sm text-slate-500">Government-subsidized generic medicines. Up to 90% cheaper.</p>
          </div>
          <Link href="/dashboard/prescription" className="bg-primary text-white font-bold px-4 py-2 rounded-xl text-sm hover:opacity-90 whitespace-nowrap">
            View Rx
          </Link>
        </div>

        {/* Medicine Table */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h2 className="font-bold text-slate-800 dark:text-white">Common Medicines — Nabha Area</h2>
            <span className="text-xs text-slate-400 font-medium">Updated: 10 min ago</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 text-[11px] uppercase font-bold text-slate-400">
                <tr>
                  <th className="px-6 py-4">Medicine</th>
                  <th className="px-6 py-4">Brand Names</th>
                  <th className="px-6 py-4">Availability</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Nearest Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {medicines.map((m) => (
                  <tr key={m.name} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-slate-100 text-sm">{m.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{m.brand}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${stockColor(m.stock)}`}>{m.stock}</span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200 text-sm">{m.price}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{m.pharmacy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Home Delivery CTA */}
        <div className="mt-6 p-6 bg-slate-900 dark:bg-slate-800 text-white rounded-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-yellow-400 text-3xl">delivery_dining</span>
            <div>
              <h3 className="font-bold">Free Home Delivery</h3>
              <p className="text-sm text-slate-300">Use code <span className="text-yellow-400 font-black">HEALTH20</span> for 20% off your first medicine delivery</p>
            </div>
          </div>
          <Link href="/dashboard/prescription" className="bg-primary text-white font-bold px-5 py-3 rounded-xl hover:opacity-90 whitespace-nowrap text-sm">
            Request Delivery
          </Link>
        </div>
      </main>
    </div>
  );
}
