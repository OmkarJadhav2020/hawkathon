"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import LanguageSelector from "@/components/LanguageSelector";

type Order = {
  id: string;
  medicineName: string;
  quantity: number;
  status: "PENDING" | "CONFIRMED" | "DISPENSED" | "CANCELLED";
  notes: string | null;
  deliveryAddress: string | null;
  createdAt: string;
  pharmacyStock: {
    pharmacy: {
      name: string;
      address: string;
    };
  } | null;
};

const statusConfig = {
  PENDING:   { label: "Processing",  color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",  icon: "hourglass_empty", barColor: "bg-amber-400" },
  CONFIRMED: { label: "Confirmed",   color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",     icon: "thumb_up",        barColor: "bg-blue-500" },
  DISPENSED: { label: "Dispatched",  color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", icon: "local_shipping",  barColor: "bg-green-500" },
  CANCELLED: { label: "Cancelled",   color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",         icon: "cancel",          barColor: "bg-red-400" },
};

const orderProgress = { PENDING: 1, CONFIRMED: 2, DISPENSED: 3, CANCELLED: 0 };

export default function PatientOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "CONFIRMED" | "DISPENSED" | "CANCELLED">("ALL");
  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  const fetchOrders = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch(`/api/orders?patientId=${userId}`);
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchOrders();
    // Live poll every 15s
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const filteredOrders = filter === "ALL" ? orders : orders.filter((o) => o.status === filter);
  const pendingCount = orders.filter((o) => o.status === "PENDING").length;
  const confirmedCount = orders.filter((o) => o.status === "CONFIRMED").length;
  const dispensedCount = orders.filter((o) => o.status === "DISPENSED").length;

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark pb-20">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-3 lg:px-20 sticky top-0 z-40">
        <Link href="/dashboard/patient" className="flex items-center gap-3 text-primary">
          <Image src="/logo.png" alt="NearDoc Logo" width={56} height={56} className="rounded-xl object-contain shadow-sm" />
          <h2 className="text-slate-900 dark:text-white text-2xl font-black leading-tight tracking-tight">NearDoc</h2>
        </Link>
        <div className="flex flex-1 justify-end gap-3 items-center">
          <nav className="hidden md:flex gap-6 mr-6">
            <Link className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors text-sm" href="/dashboard/patient">Home</Link>
            <Link className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors text-sm" href="/dashboard/patient/appointments">Appointments</Link>
            <Link className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors text-sm" href="/dashboard/patient/records">Records</Link>
            <Link className="text-primary font-semibold flex items-center gap-1 text-sm" href="#">
              <span translate="no" className="material-symbols-outlined text-sm notranslate">inventory_2</span> My Orders
            </Link>
          </nav>
          <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 px-3 py-1 rounded-full font-semibold">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse inline-block"></span>
            Live updates
          </div>
          <button onClick={fetchOrders} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors" title="Refresh">
            <span translate="no" className="material-symbols-outlined text-lg notranslate">refresh</span>
          </button>
          <button
            onClick={() => { localStorage.clear(); window.location.href = "/"; }}
            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-colors"
            title="Sign Out"
          >
            <span translate="no" className="material-symbols-outlined text-lg notranslate">logout</span>
          </button>
          <LanguageSelector />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Medicine Orders</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Track your medicine orders in real time</p>
        </div>

        {/* Summary Cards */}
        {!loading && orders.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: "Processing", count: pendingCount, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20" },
              { label: "Confirmed", count: confirmedCount, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
              { label: "Dispatched", count: dispensedCount, color: "text-green-600", bg: "bg-green-50 dark:bg-green-900/20" },
            ].map((s) => (
              <div key={s.label} className={`${s.bg} rounded-xl p-4 text-center`}>
                <p className={`text-2xl font-black ${s.color}`}>{s.count}</p>
                <p className={`text-xs font-bold ${s.color} opacity-80`}>{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filter tabs */}
        {!loading && orders.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-6">
            {(["ALL", "PENDING", "CONFIRMED", "DISPENSED", "CANCELLED"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  filter === f
                    ? "bg-primary text-white shadow-sm"
                    : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500 hover:border-primary hover:text-primary"
                }`}
              >
                {f === "ALL" ? `All (${orders.length})` : f === "PENDING" ? `Processing (${pendingCount})` : f === "CONFIRMED" ? `Confirmed (${confirmedCount})` : f === "DISPENSED" ? `Dispatched (${dispensedCount})` : "Cancelled"}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <span translate="no" className="material-symbols-outlined text-3xl text-slate-400 notranslate">shopping_bag</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              {filter !== "ALL" ? `No ${filter.toLowerCase()} orders` : "No orders yet"}
            </h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto mb-6">
              {filter !== "ALL"
                ? "No orders with this status found."
                : "You haven't placed any medicine orders yet. You can order from Find Medicine or during a live teleconsultation."}
            </p>
            <Link href="/dashboard/patient/pharmacy" className="inline-block bg-primary text-white font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity text-sm">
              Find Medicine
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const conf = statusConfig[order.status];
              const progress = orderProgress[order.status];
              return (
                <div key={order.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                  {/* Status stripe */}
                  <div className={`h-1 w-full ${conf.barColor}`} style={{ width: progress > 0 ? `${(progress / 3) * 100}%` : "100%", transition: "width 0.5s ease" }} />

                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4 gap-4">
                      <div>
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight">
                          {order.medicineName}
                          <span className="text-sm font-normal text-slate-500 ml-2">× {order.quantity}</span>
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">Order #{order.id.slice(-6).toUpperCase()}</p>
                      </div>
                      <span className={`shrink-0 px-3 py-1 rounded-full text-[11px] font-black uppercase flex items-center gap-1 ${conf.color}`}>
                        <span translate="no" className="material-symbols-outlined text-[14px] notranslate">{conf.icon}</span>
                        {conf.label}
                      </span>
                    </div>

                    {/* Progress tracker (for non-cancelled) */}
                    {order.status !== "CANCELLED" && (
                      <div className="flex items-center gap-0 mb-5">
                        {["Order Placed", "Confirmed", "Dispatched"].map((stage, i) => {
                          const done = progress > i;
                          const active = progress === i + 1;
                          return (
                            <div key={stage} className="flex items-center flex-1">
                              <div className={`flex flex-col items-center flex-1 ${i > 0 ? "relative" : ""}`}>
                                {i > 0 && <div className={`absolute left-0 right-1/2 top-3 h-0.5 ${done || active ? "bg-primary" : "bg-slate-200 dark:bg-slate-700"}`} />}
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center z-10 relative text-[10px] font-black transition-all ${done ? "bg-primary text-white" : active ? "bg-primary/20 text-primary border-2 border-primary" : "bg-slate-100 dark:bg-slate-800 text-slate-400"}`}>
                                  {done ? <span translate="no" className="material-symbols-outlined text-xs notranslate">check</span> : i + 1}
                                </div>
                                <p className={`text-[9px] font-bold mt-1 text-center ${done || active ? "text-primary" : "text-slate-400"}`}>{stage}</p>
                              </div>
                              {i < 2 && <div className={`h-0.5 flex-1 ${progress > i + 1 ? "bg-primary" : "bg-slate-200 dark:bg-slate-700"}`} />}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Pharmacy</p>
                        {order.pharmacyStock ? (
                          <>
                            <p className="text-sm text-slate-700 dark:text-slate-300 font-semibold">{order.pharmacyStock.pharmacy.name}</p>
                            <p className="text-xs text-slate-500 truncate mt-0.5">{order.pharmacyStock.pharmacy.address}</p>
                          </>
                        ) : (
                          <p className="text-sm text-slate-500">NearDoc Partner Pharmacy</p>
                        )}
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Order Date</p>
                        <p className="text-sm text-slate-700 dark:text-slate-300 font-semibold">{format(new Date(order.createdAt), "dd MMM yyyy")}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{format(new Date(order.createdAt), "hh:mm a")}</p>
                      </div>
                    </div>

                    {order.deliveryAddress && (
                      <div className="mt-4 flex items-start gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
                        <span translate="no" className="material-symbols-outlined text-primary text-sm mt-0.5 notranslate">local_shipping</span>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Delivery Address</p>
                          <p className="text-sm text-slate-700 dark:text-slate-300">{order.deliveryAddress}</p>
                        </div>
                      </div>
                    )}

                    {order.notes && (
                      <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
                        <p className="text-xs italic text-slate-500">💬 "{order.notes}"</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-8">
          <Link href="/dashboard/patient/pharmacy" className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 hover:border-primary hover:text-primary transition-colors text-sm font-semibold">
            <span translate="no" className="material-symbols-outlined notranslate">add_shopping_cart</span>
            Order More Medicines
          </Link>
        </div>
      </main>
    </div>
  );
}
