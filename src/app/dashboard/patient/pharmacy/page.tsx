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
  pharmacy: { name: string; address: string };
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
  const [ordering, setOrdering] = useState<string[]>([]);
  const [ordered, setOrdered] = useState<string[]>([]);
  const [addressModal, setAddressModal] = useState<Medicine | null>(null);
  const [deliveryAddress, setDeliveryAddress] = useState("");

  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;

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

  useEffect(() => { fetchMedicines(); }, [fetchMedicines]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMedicines(search);
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const handleOrderClick = (medicine: Medicine) => {
    if (!userId) {
      showToast("Please log in to place an order.");
      return;
    }
    if (ordering.includes(medicine.id) || ordered.includes(medicine.id)) return;
    setAddressModal(medicine);
  };

  const confirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !addressModal) return;
    if (!deliveryAddress.trim()) {
      showToast("Please enter a valid delivery address.");
      return;
    }

    const medicine = addressModal;
    setAddressModal(null);

    setOrdering((prev) => [...prev, medicine.id]);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: userId,
          pharmacyStockId: medicine.id,
          quantity: 1,
          deliveryAddress: deliveryAddress.trim()
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Order failed");
      }
      setOrdered((prev) => [...prev, medicine.id]);
      showToast(`✅ Order placed for ${medicine.medicineName} at ${medicine.pharmacy.name}!`);
    } catch (err) {
      showToast(`❌ ${err instanceof Error ? err.message : "Failed to place order. Try again."}`);
    } finally {
      setOrdering((prev) => prev.filter((id) => id !== medicine.id));
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl z-[100] animate-fade-in flex items-center gap-2">
          <span className="font-medium text-sm">{toast}</span>
        </div>
      )}

      {/* Address Modal */}
      {addressModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Confirm Delivery Address</h3>
              <button onClick={() => setAddressModal(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <span translate="no" className="material-symbols-outlined notranslate">close</span>
              </button>
            </div>
            <form onSubmit={confirmOrder} className="p-6">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Ordering: <span className="text-primary font-bold">{addressModal.medicineName}</span></p>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">Deliver To:</label>
              <textarea
                required
                className="w-full h-24 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary/40 outline-none resize-none"
                placeholder="Enter full home address or village..."
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
              ></textarea>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setAddressModal(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-primary text-white font-bold hover:opacity-90 transition-opacity">Confirm Order</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link href="/dashboard/patient" className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
            <span translate="no" className="material-symbols-outlined notranslate">arrow_back</span>
          </Link>
          <span translate="no" className="material-symbols-outlined text-primary text-2xl notranslate">local_pharmacy</span>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Find Medicine</h1>
            <p className="text-xs text-slate-500">Check real-time availability & order from registered pharmacies</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Search */}
        <form onSubmit={handleSearch} className="relative mb-8">
          <span translate="no" className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 notranslate">search</span>
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
                <span translate="no" className="material-symbols-outlined text-4xl mb-2 block notranslate">medication_liquid</span>
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
                        {ordered.includes(m.id) ? (
                          <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                            <span translate="no" className="material-symbols-outlined text-sm notranslate">check_circle</span> Ordered
                          </span>
                        ) : (
                          <button
                            onClick={() => handleOrderClick(m)}
                            disabled={!m.inStock || ordering.includes(m.id)}
                            className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                              m.inStock
                                ? ordering.includes(m.id)
                                  ? "bg-primary/20 text-primary cursor-wait"
                                  : "text-primary border border-primary/20 hover:bg-primary hover:text-white"
                                : "text-slate-300 border border-slate-100 cursor-not-allowed"
                            }`}
                          >
                            {ordering.includes(m.id) ? "Ordering..." : m.inStock ? "Order Now" : "Unavailable"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* My Orders Link */}
        <div className="mt-4 flex justify-end">
          <Link href="/dashboard/patient/orders" className="text-primary text-sm font-bold hover:underline flex items-center gap-1">
            <span translate="no" className="material-symbols-outlined text-sm notranslate">receipt_long</span> View My Orders
          </Link>
        </div>

        {/* Home Delivery CTA */}
        <div className="mt-6 p-6 bg-slate-900 dark:bg-slate-800 text-white rounded-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span translate="no" className="material-symbols-outlined text-yellow-400 text-3xl notranslate">delivery_dining</span>
            <div>
              <h3 className="font-bold">Home Delivery Available</h3>
              <p className="text-sm text-slate-300">Order above and our pharmacy partner will deliver to your village within 24 hours.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
