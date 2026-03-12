"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { format } from "date-fns";

type Order = {
  id: string;
  medicineName: string;
  quantity: number;
  status: "PENDING" | "CONFIRMED" | "DISPENSED" | "CANCELLED";
  notes: string | null;
  createdAt: string;
  pharmacyStock: {
    pharmacy: {
      name: string;
      address: string;
    };
  };
};

const statusConfig = {
  PENDING: { label: "Processing", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", icon: "hourglass_empty" },
  CONFIRMED: { label: "Confirmed", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", icon: "thumb_up" },
  DISPENSED: { label: "Dispensed", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", icon: "check_circle" },
  CANCELLED: { label: "Cancelled", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", icon: "cancel" },
};

export default function PatientOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
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
  }, [fetchOrders]);

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark pb-20">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/patient/pharmacy" className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
              <span className="material-symbols-outlined">arrow_back</span>
            </Link>
            <span className="material-symbols-outlined text-primary text-2xl">receipt_long</span>
            <span className="text-xl font-bold tracking-tight">My Orders</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-primary/20 border-2 border-primary/30 flex items-center justify-center text-primary font-bold text-sm">
            PT
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Medicine Orders</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Track your online and live consultation prescriptions</p>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-3xl text-slate-400">shopping_bag</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No orders found</h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto mb-6">You haven't placed any medicine orders yet. You can order from the Find Medicine section or during a live teleconsultation.</p>
            <Link href="/dashboard/patient/pharmacy" className="inline-block bg-primary text-white font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity text-sm">
              Find Medicine
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const conf = statusConfig[order.status];
              return (
                <div key={order.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white">{order.medicineName} <span className="text-sm font-normal text-slate-500 ml-1">x{order.quantity}</span></h3>
                      <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase flex items-center gap-1 shrink-0 ${conf.color}`}>
                        <span className="material-symbols-outlined text-[14px]">{conf.icon}</span>
                        {conf.label}
                      </span>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Pharmacy</p>
                        <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">{order.pharmacyStock.pharmacy.name}</p>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{order.pharmacyStock.pharmacy.address}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Order Date</p>
                        <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                          {format(new Date(order.createdAt), "dd MMM yyyy")}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {format(new Date(order.createdAt), "hh:mm a")}
                        </p>
                      </div>
                    </div>
                    
                    {order.notes && (
                      <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
                        <p className="text-xs italic text-slate-600 dark:text-slate-400">"{order.notes}"</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
