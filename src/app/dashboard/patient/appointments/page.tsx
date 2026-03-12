"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";

type Doctor = {
  id: string;
  name: string;
  actorProfile: {
    specialty: string | null;
  } | null;
};

type Consultation = {
  id: string;
  startTime: string;
  status: string;
  connectionMode: string;
  notes: string | null;
  doctor: Doctor;
};

export default function AppointmentsPage() {
  const [tab, setTab] = useState<"upcoming" | "past" | "book">("upcoming");
  const [upcoming, setUpcoming] = useState<Consultation[]>([]);
  const [past, setPast] = useState<Consultation[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  // In production: get userId from session cookie
  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") ?? "cmmnpw2c70000f7707prdd937" : "cmmnpw2c70000f7707prdd937";

  const fetchAppointments = async () => {
    try {
      const res = await fetch(`/api/appointments?userId=${userId}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setUpcoming(data.upcoming || []);
      setPast(data.past || []);
      setDoctors(data.doctors || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [userId]);

  const handleBook = async (doctorId: string) => {
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId: userId, doctorId }),
      });
      if (!res.ok) throw new Error("Booking failed");
      
      setToast("Appointment booked successfully!");
      setTimeout(() => setToast(null), 3000);
      setTab("upcoming");
      fetchAppointments();
    } catch (error) {
      console.error(error);
      alert("Failed to book appointment.");
    }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl z-50 animate-fade-in flex items-center gap-2">
          <span className="material-symbols-outlined text-green-400">check_circle</span>
          <span className="font-medium text-sm">{toast}</span>
        </div>
      )}

      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/patient" className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
              <span className="material-symbols-outlined">arrow_back</span>
            </Link>
            <span className="material-symbols-outlined text-primary text-2xl">health_and_safety</span>
            <span className="text-xl font-bold tracking-tight">GraamSehat</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-primary/20 border-2 border-primary/30 flex items-center justify-center text-primary font-bold text-sm">
            {userId === "demo" ? "DEMO" : "PT"}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Appointments</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Book, view, & manage your consultations</p>
          </div>
          <button
            onClick={() => setTab("book")}
            className="flex items-center gap-2 bg-primary text-white font-bold px-5 py-3 rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
          >
            <span className="material-symbols-outlined">add</span> Book Now
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6">
          {(["upcoming", "past", "book"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-3 text-sm font-bold capitalize transition-colors ${tab === t ? "border-b-2 border-primary text-primary" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
            >
              {t === "book" ? "Book New" : `${t.charAt(0).toUpperCase() + t.slice(1)} (${t === "upcoming" ? upcoming.length : past.length})`}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* Upcoming */}
            {tab === "upcoming" && (
              <div className="space-y-4">
                {upcoming.length === 0 ? (
                   <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">event_busy</span>
                    <p className="text-slate-500">No upcoming appointments</p>
                    <button onClick={() => setTab("book")} className="mt-4 text-primary font-bold text-sm hover:underline">Book one now</button>
                  </div>
                ) : (
                  upcoming.map((apt) => {
                    const d = new Date(apt.startTime);
                    return (
                    <div key={apt.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex gap-6 items-start">
                      <div className="bg-primary/10 text-primary flex flex-col items-center p-4 rounded-xl min-w-[72px]">
                        <span className="text-xs font-black uppercase">{format(d, "MMM")}</span>
                        <span className="text-3xl font-black">{format(d, "dd")}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-lg">{apt.doctor.name}</h3>
                            <p className="text-slate-500 text-sm">{apt.doctor.actorProfile?.specialty || "General Physician"} • {format(d, "hh:mm a")}</p>
                            <p className="text-slate-400 text-xs mt-1 flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">monitor_heart</span> {apt.connectionMode} Consultation
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase ${apt.status === "CONFIRMED" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-amber-100 text-amber-700"}`}>
                              {apt.status}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-3 mt-4">
                          {apt.connectionMode === "VIDEO" && apt.status !== "COMPLETED" && (
                            <Link href={`/dashboard/patient/consultation?id=${apt.id}`} className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-bold rounded-lg text-sm hover:opacity-90 transition-all">
                              <span className="material-symbols-outlined text-sm">videocam</span> Join Call
                            </Link>
                          )}
                          <button onClick={() => showToast("Rescheduling flow will open in a modal.")} className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                            <span className="material-symbols-outlined text-sm">edit_calendar</span> Reschedule
                          </button>
                          <button onClick={() => showToast("Cancellation requires 24hr notice. Contacting clinic...")} className="flex items-center gap-2 px-4 py-2 border border-red-100 dark:border-red-900/30 text-red-500 font-bold rounded-lg text-sm hover:bg-red-50 dark:hover:bg-red-900/10 transition-all">
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )})
                )}
              </div>
            )}

            {/* Past */}
            {tab === "past" && (
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                {past.length === 0 ? (
                  <div className="text-center py-12">
                     <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">history</span>
                     <p className="text-slate-500">No past consultations found.</p>
                  </div>
                ) : (
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-[11px] uppercase font-bold text-slate-400">
                    <tr>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Doctor</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {past.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{format(new Date(p.startTime), "dd MMM yyyy")}</td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-800 dark:text-slate-200">{p.doctor.name}</td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{p.connectionMode}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link href={`/dashboard/prescription?consultId=${p.id}`} className="text-xs font-bold text-primary border border-primary/20 px-3 py-1.5 rounded-lg hover:bg-primary/5 transition-all">View Rx</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                )}
              </div>
            )}

            {/* Book */}
            {tab === "book" && (
              <div className="space-y-6">
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">info</span>
                  <p className="text-sm text-slate-700 dark:text-slate-300">Select an available doctor to join their live teleconsultation queue.</p>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-lg">Available Doctors Now</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {doctors.length === 0 ? (
                    <p className="text-slate-500 text-sm">No doctors currently online in the system.</p>
                  ) : (
                  doctors.map((doc) => {
                    const isAvailable = true; // In full prod, we'd check their online/schedule status
                    return (
                    <div key={doc.id} className={`bg-white dark:bg-slate-900 rounded-xl border p-5 shadow-sm flex items-center gap-4 ${isAvailable ? "border-slate-200 dark:border-slate-800 hover:border-primary/30 transition-colors" : "border-slate-100 dark:border-slate-800 opacity-60"}`}>
                      <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                        {doc.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-slate-900 dark:text-white">{doc.name}</p>
                        <p className="text-xs text-slate-500">{doc.actorProfile?.specialty || "General Physician"}</p>
                        <p className={`text-xs font-bold mt-1 ${isAvailable ? "text-green-600" : "text-slate-400"}`}>
                          {isAvailable ? `⏱ Wait: ~5 min` : "Currently unavailable"}
                        </p>
                      </div>
                      {isAvailable ? (
                        <button onClick={() => handleBook(doc.id)} className="bg-primary text-white text-xs font-bold px-4 py-2 rounded-lg hover:opacity-90 transition-all">
                          Book Visit
                        </button>
                      ) : (
                        <button disabled className="bg-slate-100 dark:bg-slate-700 text-slate-400 text-xs font-bold px-4 py-2 rounded-lg cursor-not-allowed">Busy</button>
                      )}
                    </div>
                  )}))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
