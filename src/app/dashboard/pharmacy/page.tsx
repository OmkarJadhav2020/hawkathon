"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import Image from "next/image";

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

type Order = {
  id: string;
  medicineName: string;
  quantity: number;
  status: "PENDING" | "CONFIRMED" | "DISPENSED" | "CANCELLED";
  notes: string | null;
  deliveryAddress: string | null;
  createdAt: string;
  patient: {
    id: string;
    name: string;
    phone: string;
    village: string | null;
  };
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

const orderStatusConfig = {
  PENDING: { label: "New Order", color: "bg-amber-100 text-amber-800", icon: "fiber_new" },
  CONFIRMED: { label: "Processing", color: "bg-blue-100 text-blue-800", icon: "hourglass_empty" },
  DISPENSED: { label: "Dispensed", color: "bg-green-100 text-green-800", icon: "check_circle" },
  CANCELLED: { label: "Cancelled", color: "bg-red-100 text-red-800", icon: "cancel" },
};

export default function PharmacyDashboard() {
  const [tab, setTab] = useState<"inventory" | "orders">("orders");
  const [stock, setStock] = useState<StockItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Inventory form states
  const [search, setSearch] = useState("");
  const [medicine, setMedicine] = useState("");
  const [qty, setQty] = useState("");
  const [unit, setUnit] = useState("tablets");
  const [expiryDate, setExpiryDate] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [reordering, setReordering] = useState<string[]>([]);
  
  const router = useRouter();

  // Route Protection & Auth
  useEffect(() => {
    if (typeof window !== "undefined") {
      const id = localStorage.getItem("userId");
      const r = localStorage.getItem("userRole");
      if (!id || r !== "PHARMACY") {
        router.push("/");
      }
    }
  }, [router]);

  const pharmacyId = typeof window !== "undefined" ? localStorage.getItem("pharmacyId") : null;

  const fetchData = useCallback(async () => {
    if (!pharmacyId) return;
    setLoading(true);
    try {
      const [resStock, resOrders] = await Promise.all([
        fetch("/api/sync/pharmacy-stock"),
        fetch(`/api/orders?pharmacyId=${pharmacyId}`)
      ]);
      
      if (resStock.ok) {
        const data = await resStock.json();
        setStock(data.stock ?? []);
      }
      
      if (resOrders.ok) {
        const data = await resOrders.json();
        setOrders(data.orders ?? []);
      }
    } catch {
      console.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, [pharmacyId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleUpdateStock = async (e: React.FormEvent) => {
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
      showToast(`Stock for "${medicine}" updated successfully! Syncing to NearDoc network...`);
      setMedicine(""); setQty(""); setExpiryDate("");
      fetchData(); // refresh stock
    } catch {
      showToast("Failed to update stock. Please try again.");
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, status: newStatus })
      });
      if (!res.ok) throw new Error("Update failed");
      showToast(`Order marked as ${newStatus}`);
      fetchData(); // refresh orders
    } catch {
      showToast("Failed to update order status.");
    }
  };

  const filteredStock = stock.filter((m) =>
    m.medicineName.toLowerCase().includes(search.toLowerCase()) ||
    (m.genericName ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const lowCount = stock.filter((m) => m.quantity <= 20).length;
  const pendingOrdersCount = orders.filter(o => o.status === "PENDING" || o.status === "CONFIRMED").length;

  if (!pharmacyId || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark pb-20">
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl z-[100] flex items-center gap-2">
          <span translate="no" className="material-symbols-outlined text-green-400 notranslate">check_circle</span>
          <span className="font-medium text-sm">{toast}</span>
        </div>
      )}

      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/dashboard/pharmacy" className="flex items-center gap-3">
            <Image src="/logo.png" alt="NearDoc Logo" width={56} height={56} className="rounded-xl object-contain shadow-sm" />
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">NearDoc</span>
          </Link>
          <div className="hidden md:block">
            <span className="text-lg font-bold text-slate-800 dark:text-slate-200">
              {stock[0]?.pharmacy?.name ?? "NearDoc Partner Pharmacy"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-bold px-3 py-1 uppercase tracking-wider">Pharmacist</span>
            <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center cursor-pointer" onClick={() => { localStorage.clear(); router.push("/"); }}>
              <span translate="no" className="material-symbols-outlined text-slate-500 dark:text-slate-400 notranslate">logout</span>
            </div>
          </div>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Pharmacy Dashboard</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage stock and fulfill online patient orders</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => window.print()} className="flex items-center gap-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-primary hover:text-primary rounded-xl px-4 py-2.5 font-semibold transition-colors bg-white dark:bg-slate-900 shadow-sm text-sm">
              <span translate="no" className="material-symbols-outlined text-lg notranslate">download</span> Export Report
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 mb-8">
          <button
            onClick={() => setTab("orders")}
            className={`px-6 py-3 text-sm font-bold flex items-center gap-2 transition-colors relative ${tab === "orders" ? "border-b-2 border-primary text-primary" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"}`}
          >
            <span translate="no" className="material-symbols-outlined text-lg notranslate">shopping_cart</span>
            Incoming Orders
            {pendingOrdersCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full ml-1 animate-pulse">
                {pendingOrdersCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab("inventory")}
            className={`px-6 py-3 text-sm font-bold flex items-center gap-2 transition-colors ${tab === "inventory" ? "border-b-2 border-primary text-primary" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"}`}
          >
            <span translate="no" className="material-symbols-outlined text-lg notranslate">inventory_2</span>
            Inventory Management
          </button>
        </div>

        {/* ORDERS TAB */}
        {tab === "orders" && (
          <div className="space-y-6">
            {orders.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span translate="no" className="material-symbols-outlined text-5xl text-slate-300 mb-2 notranslate">shopping_basket</span>
                <p className="text-slate-500">No online orders received yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {orders.map((order) => {
                  const conf = orderStatusConfig[order.status];
                  return (
                    <div key={order.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm relative overflow-hidden">
                      {order.status === "PENDING" && <div className="absolute top-0 left-0 w-1 h-full bg-amber-400" />}
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase mb-3 ${conf.color}`}>
                            <span translate="no" className="material-symbols-outlined text-[12px] notranslate">{conf.icon}</span>
                            {conf.label}
                          </span>
                          <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight">
                            {order.medicineName} <span className="text-sm font-normal text-slate-500">x{order.quantity}</span>
                          </h3>
                          <p className="text-xs text-slate-500 mt-1">{format(new Date(order.createdAt), "dd MMM yyyy, hh:mm a")}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Order ID</p>
                          <p className="text-xs font-mono text-slate-600 dark:text-slate-400">{order.id.slice(-6).toUpperCase()}</p>
                        </div>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span translate="no" className="material-symbols-outlined text-slate-400 text-sm notranslate">person</span>
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{order.patient.name}</span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <span translate="no" className="material-symbols-outlined text-slate-400 text-sm notranslate">call</span>
                          <span className="text-sm text-slate-600 dark:text-slate-400">{order.patient.phone}</span>
                        </div>
                        {order.deliveryAddress ? (
                          <div className="flex items-start gap-2">
                            <span translate="no" className="material-symbols-outlined text-slate-400 text-sm mt-0.5 notranslate">local_shipping</span>
                            <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{order.deliveryAddress}</span>
                          </div>
                        ) : order.patient.village && (
                          <div className="flex items-center gap-2">
                            <span translate="no" className="material-symbols-outlined text-slate-400 text-sm notranslate">location_on</span>
                            <span className="text-sm text-slate-600 dark:text-slate-400">{order.patient.village} (Default)</span>
                          </div>
                        )}
                        {order.notes && (
                          <div className="mt-3 text-xs italic text-slate-500 border-t border-slate-200 dark:border-slate-700 pt-2 flex gap-1 items-start">
                            <span translate="no" className="material-symbols-outlined text-[14px] notranslate">info</span>
                            "{order.notes}"
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        {order.status === "PENDING" && (
                          <button onClick={() => updateOrderStatus(order.id, "CONFIRMED")} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg text-sm transition-colors">
                            Accept & Confirm
                          </button>
                        )}
                        {order.status === "CONFIRMED" && (
                          <button onClick={() => updateOrderStatus(order.id, "DISPENSED")} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg text-sm transition-colors">
                            Mark Dispensed (Delivered)
                          </button>
                        )}
                        {(order.status === "PENDING" || order.status === "CONFIRMED") && (
                          <button onClick={() => updateOrderStatus(order.id, "CANCELLED")} className="px-4 border border-red-200 text-red-600 hover:bg-red-50 font-bold py-2 rounded-lg text-sm transition-colors">
                            Cancel
                          </button>
                        )}
                        {order.status === "DISPENSED" && (
                          <div className="w-full text-center text-sm font-bold text-green-600 py-2 bg-green-50 rounded-lg">
                            Ready for Next Order
                          </div>
                        )}
                        {order.status === "CANCELLED" && (
                          <div className="w-full text-center text-sm font-bold text-red-600 py-2 bg-red-50 rounded-lg">
                            Cancelled
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* INVENTORY TAB */}
        {tab === "inventory" && (
          <div>
            {/* Low Stock Alert */}
            {lowCount > 0 && (
              <div className="mb-8 bg-red-50 border border-red-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span translate="no" className="material-symbols-outlined text-red-600 notranslate">error</span>
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
                <form className="space-y-4" onSubmit={handleUpdateStock}>
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
                    <span translate="no" className="material-symbols-outlined notranslate">inventory</span> Update Stock
                  </button>
                </form>
              </div>

              {/* SMS Update Info */}
              <div className="bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-900/30 shadow-sm p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span translate="no" className="material-symbols-outlined text-amber-600 notranslate">chat</span>
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
                  <span translate="no" className="material-symbols-outlined text-sm notranslate">bolt</span>
                  Supported 24/7 · Auto-syncs in 5 mins
                </div>
              </div>
            </div>

            {/* Medicine Table */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mb-10">
              <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 flex-wrap">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Current Medicine Stock</h2>
                <div className="relative">
                  <span translate="no" className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm notranslate">search</span>
                  <input value={search} onChange={(e) => setSearch(e.target.value)} className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full pl-9 pr-4 py-1.5 text-xs outline-none w-52" placeholder="Search inventory..." />
                </div>
              </div>
              <div className="overflow-x-auto">
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
                    {filteredStock.map((m) => (
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
                            <button
                              onClick={() => {
                                showToast(`Reorder request sent for ${m.medicineName}!`);
                                setReordering((prev) => [...prev, m.id]);
                              }}
                              disabled={reordering.includes(m.id)}
                              className={`font-semibold text-xs transition-colors ${reordering.includes(m.id) ? "text-green-500 cursor-default" : "text-red-500 hover:underline"}`}
                            >
                              {reordering.includes(m.id) ? "Reordered ✅" : "Reorder"}
                            </button>
                          ) : (
                            <button onClick={() => { setMedicine(m.medicineName); setUnit(m.unit); }} className="text-slate-400 hover:text-primary transition-colors">
                              <span translate="no" className="material-symbols-outlined text-lg notranslate">edit</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {filteredStock.length === 0 && (
                      <tr><td colSpan={7} className="px-6 py-10 text-center text-slate-400 text-sm">No medicines found in database.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
