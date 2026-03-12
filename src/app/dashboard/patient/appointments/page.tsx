"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";

type Consultation = {
  id: string;
  status: string;
  scheduledAt: string;
  connectionMode: string | null;
  doctor: {
    id: string;
    name: string;
    doctorProfile: { specialty: string | null } | null;
  };
};

type Doctor = {
  id: string;
  name: string;
  doctorProfile: { specialty: string | null } | null;
};

function useActiveConsultation(userId: string | null) {
  const [activeConsult, setActiveConsult] = useState<Consultation | null>(null);
  useEffect(() => {
    if (!userId) return;
    const poll = async () => {
      try {
        const res = await fetch(`/api/appointments?userId=${userId}`);
        if (!res.ok) return;
        const data = await res.json();
        const active = data.upcoming?.find((c: Consultation) => c.status === "IN_PROGRESS") ?? null;
        setActiveConsult(active);
      } catch { /* ignore */ }
    };
    poll();
    const interval = setInterval(poll, 10000);
    return () => clearInterval(interval);
  }, [userId]);
  return activeConsult;
}

export default function AppointmentsPage() {
  const [tab, setTab] = useState<"upcoming" | "past" | "book">("upcoming");
  const [upcoming, setUpcoming] = useState<Consultation[]>([]);
  const [past, setPast] = useState<Consultation[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  // Modals
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const id = localStorage.getItem("userId");
      const r = localStorage.getItem("userRole");
      if (!id || r !== "PATIENT") router.push("/");
    }
  }, [router]);

  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
  const activeConsultCard = useActiveConsultation(userId);

  const fetchAppointments = useCallback(async () => {
    if (!userId) return;
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
  }, [userId]);

  useEffect(() => {
    if (userId) fetchAppointments();
  }, [userId, fetchAppointments]);

  const handleBook = async (doctorId: string) => {
    if (!userId) return;
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId: userId, doctorId }),
      });
      if (!res.ok) throw new Error("Booking failed");
      showToast("✅ Appointment booked successfully!");
      setTab("upcoming");
      fetchAppointments();
    } catch (error) {
      console.error(error);
      showToast("❌ Failed to book appointment.");
    }
  };

  const handleCancel = async () => {
    if (!cancelId) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/appointments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: cancelId, action: "cancel" }),
      });
      if (!res.ok) throw new Error("Cancel failed");
      showToast("✅ Appointment cancelled successfully.");
      setCancelId(null);
      fetchAppointments();
    } catch {
      showToast("❌ Failed to cancel appointment. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReschedule = async () => {
    if (!rescheduleId || !rescheduleDate) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/appointments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: rescheduleId, action: "reschedule", scheduledAt: new Date(rescheduleDate).toISOString() }),
      });
      if (!res.ok) throw new Error("Reschedule failed");
      showToast("✅ Appointment rescheduled successfully!");
      setRescheduleId(null);
      setRescheduleDate("");
      fetchAppointments();
    } catch {
      showToast("❌ Failed to reschedule. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  if (!userId) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div></div>;

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      {/* Toast */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl z-[100] animate-fade-in flex items-center gap-2">
          <span className="font-medium text-sm">{toast}</span>
        </div>
      )}

      {/* Cancel Confirm Modal */}
      {cancelId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-red-600">cancel</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Cancel Appointment?</h2>
            <p className="text-slate-500 text-sm mb-6">This action cannot be undone. The appointment will be permanently cancelled.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setCancelId(null)}
                className="flex-1 py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              >
                Keep Appointment
              </button>
              <button
                onClick={handleCancel}
                disabled={actionLoading}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50"
              >
                {actionLoading ? "Cancelling..." : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Reschedule Appointment</h2>
              <button onClick={() => setRescheduleId(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                <span className="material-symbols-outlined text-slate-500">close</span>
              </button>
            </div>
            <p className="text-slate-500 text-sm mb-4">Select a new date and time for your appointment.</p>
            <input
              type="datetime-local"
              value={rescheduleDate}
              onChange={(e) => setRescheduleDate(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
              className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-primary/30 mb-4"
            />
            <button
              onClick={handleReschedule}
              disabled={!rescheduleDate || actionLoading}
              className="w-full py-3 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-40"
            >
              {actionLoading ? "Rescheduling..." : "Confirm New Time"}
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/patient" className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
              <span className="material-symbols-outlined">arrow_back</span>
            </Link>
            <span className="material-symbols-outlined text-primary text-2xl">health_and_safety</span>
            <span className="text-xl font-bold tracking-tight">GraamSehat</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-primary/20 border-2 border-primary/30 flex items-center justify-center text-primary font-bold text-sm">
            PT
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

        {/* Incoming Call Banner */}
        {activeConsultCard && (
          <div className="mb-6 bg-gradient-to-r from-green-600 to-green-500 rounded-2xl p-6 shadow-xl text-white flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-4xl text-white">ring_volume</span>
                </div>
                <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 border-2 border-green-500 rounded-full animate-ping" />
                <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 border-2 border-green-500 rounded-full" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Doctor is Ready!</h3>
                <p className="text-green-100 text-sm">{activeConsultCard.doctor?.name} is waiting for you.</p>
              </div>
            </div>
            <Link
              href={`/dashboard/patient/consultation?id=${activeConsultCard.id}`}
              className="w-full sm:w-auto bg-white text-green-700 font-black px-8 py-3.5 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all text-center flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-xl">videocam</span> JOIN VIDEO CALL
            </Link>
          </div>
        )}

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
          <div className="py-20 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
        ) : (
          <>
            {/* Upcoming */}
            {tab === "upcoming" && (
              <div className="space-y-4">
                {upcoming.filter((a) => a.status !== "COMPLETED" && (!activeConsultCard || a.id !== activeConsultCard.id)).length === 0 ? (
                  <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="material-symbols-outlined text-4xl text-slate-300 mb-2 block">event_busy</span>
                    <p className="text-slate-500">No upcoming appointments</p>
                    <button onClick={() => setTab("book")} className="mt-4 text-primary font-bold text-sm hover:underline">Book one now</button>
                  </div>
                ) : (
                  upcoming
                    .filter((a) => a.status !== "COMPLETED" && (!activeConsultCard || a.id !== activeConsultCard.id))
                    .map((apt) => {
                    const d = new Date(apt.scheduledAt);
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
                              <p className="text-slate-500 text-sm">{apt.doctor.doctorProfile?.specialty || "General Physician"} • {format(d, "hh:mm a")}</p>
                              <p className="text-slate-400 text-xs mt-1 flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">monitor_heart</span> {apt.connectionMode} Consultation
                              </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase ${apt.status === "CONFIRMED" || apt.status === "PENDING" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-amber-100 text-amber-700"}`}>
                              {apt.status}
                            </span>
                          </div>
                          <div className="flex gap-3 mt-4 flex-wrap">
                            {apt.connectionMode === "VIDEO" && apt.status !== "COMPLETED" && (
                              <Link href={`/dashboard/patient/consultation?id=${apt.id}`} className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-bold rounded-lg text-sm hover:opacity-90 transition-all">
                                <span className="material-symbols-outlined text-sm">videocam</span> Join Call
                              </Link>
                            )}
                            <button
                              onClick={() => { setRescheduleId(apt.id); setRescheduleDate(""); }}
                              className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                            >
                              <span className="material-symbols-outlined text-sm">edit_calendar</span> Reschedule
                            </button>
                            <button
                              onClick={() => setCancelId(apt.id)}
                              className="flex items-center gap-2 px-4 py-2 border border-red-100 dark:border-red-900/30 text-red-500 font-bold rounded-lg text-sm hover:bg-red-50 dark:hover:bg-red-900/10 transition-all"
                            >
                              <span className="material-symbols-outlined text-sm">cancel</span> Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Past */}
            {tab === "past" && (
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                {past.length === 0 ? (
                  <div className="text-center py-12">
                    <span className="material-symbols-outlined text-4xl text-slate-300 mb-2 block">history</span>
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
                      {past.map((apt) => (
                        <tr key={apt.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="px-6 py-4 text-sm text-slate-500">{format(new Date(apt.scheduledAt), "dd MMM yyyy")}</td>
                          <td className="px-6 py-4 font-bold text-sm text-slate-900 dark:text-white">{apt.doctor.name}</td>
                          <td className="px-6 py-4 text-sm text-slate-500">{apt.connectionMode}</td>
                          <td className="px-6 py-4 text-right">
                            <Link href={`/dashboard/patient/records`} className="text-primary text-xs font-bold hover:underline">View Record</Link>
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
              <div className="grid gap-4">
                {doctors.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <span className="material-symbols-outlined text-4xl mb-2 block">person_off</span>
                    <p>No doctors available right now.</p>
                  </div>
                ) : (
                  doctors.map((doc) => (
                    <div key={doc.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex items-center gap-6">
                      <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center text-primary text-2xl font-black">
                        {doc.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-slate-900 dark:text-white">{doc.name}</p>
                        <p className="text-slate-500 text-sm">{doc.doctorProfile?.specialty || "General Physician"}</p>
                      </div>
                      <button
                        onClick={() => handleBook(doc.id)}
                        className="bg-primary text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:opacity-90 transition-all"
                      >
                        Book
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
