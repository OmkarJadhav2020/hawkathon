"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────
type HealthRecord = { id: string; type: string; title: string; date: string; fileUrl: string | null };
type Appointment = { id: string; doctorName: string; specialty: string; scheduledAt: string; status: string; type: string; clinic: string };
type PatientUser = { id: string; name: string; phone: string; bloodGroup?: string; allergies?: string[]; village?: string; gender?: string };
type DashboardData = {
  user: PatientUser;
  healthRecords: HealthRecord[];
  upcomingAppointments: Appointment[];
  pastAppointments: { id: string; doctorName: string; reason: string; date: string; type: string; status: string }[];
};

// ─── Active Consultation Hook ─────────────────────────────────────────────────
function useActiveConsultation(userId: string) {
  const [activeConsult, setActiveConsult] = useState<Appointment | null>(null);

  useEffect(() => {
    if (!userId) return;

    const checkActive = async () => {
      try {
        const res = await fetch(`/api/appointments?userId=${userId}`);
        if (!res.ok) return;
        const data = await res.json();
        
        // Find any appointment that is exactly IN_PROGRESS right now
        const inProgress = (data.upcoming || []).find((a: any) => a.status === "IN_PROGRESS");
        setActiveConsult(inProgress || null);
      } catch {
        // silently ignore polling errors
      }
    };

    checkActive(); // check immediately
    const interval = setInterval(checkActive, 10000); // poll every 10s
    return () => clearInterval(interval);
  }, [userId]);

  return activeConsult;
}


// ─── Record type icon map ─────────────────────────────────────────────────────
const recordIconMap: Record<string, { icon: string; color: string }> = {
  LAB: { icon: "lab_panel", color: "blue" },
  PRESCRIPTION: { icon: "prescriptions", color: "green" },
  VACCINATION: { icon: "vaccines", color: "purple" },
  VITAL: { icon: "monitor_heart", color: "red" },
  DEFAULT: { icon: "description", color: "slate" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

// ─── Add Vital Modal ──────────────────────────────────────────────────────────
function AddVitalModal({ userId, onClose, onSaved }: { userId: string; onClose: () => void; onSaved: () => void }) {
  const [type, setType] = useState("Heart Rate");
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("bpm");
  const [saving, setSaving] = useState(false);

  const vitalOptions = [
    { label: "Heart Rate", unit: "bpm" },
    { label: "Blood Pressure", unit: "mmHg" },
    { label: "Temperature", unit: "°F" },
    { label: "Blood Sugar", unit: "mg/dL" },
    { label: "SpO2", unit: "%" },
    { label: "Weight", unit: "kg" },
  ];

  const handleSave = async () => {
    if (!value.trim()) return;
    setSaving(true);
    try {
      await fetch("/api/patient/dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, type, value, unit }),
      });
      onSaved();
      onClose();
    } catch {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Add Vital Reading</h3>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Vital Type</label>
            <select
              value={type}
              onChange={(e) => {
                const opt = vitalOptions.find((o) => o.label === e.target.value);
                setType(e.target.value);
                setUnit(opt?.unit ?? "");
              }}
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-primary/50"
            >
              {vitalOptions.map((o) => <option key={o.label}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Value ({unit})</label>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={`Enter ${type} value`}
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-600">Cancel</button>
          <button onClick={handleSave} disabled={saving || !value.trim()} className="flex-1 py-3 rounded-xl bg-primary text-white text-sm font-bold disabled:opacity-50">
            {saving ? "Saving..." : "Save Reading"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function PatientDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("home");
  const [showVitalModal, setShowVitalModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // In production: get userId from session cookie
  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") ?? "cmmnpw2c70000f7707prdd937" : "cmmnpw2c70000f7707prdd937";

  const activeConsultCard = useActiveConsultation(userId);


  const fetchDashboard = async () => {
    try {
      const res = await fetch(`/api/patient/dashboard?userId=${userId}`);
      const json = await res.json();
      setData(json);
    } catch {
      // keep null — skeleton shown
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboard(); }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleReschedule = (id: string) => showToast(`Reschedule flow for appointment ${id} — call your clinic or use the Appointments page.`);
  const handleCancel = (id: string) => showToast(`Cancellation request for ${id} noted. Feature coming soon — call 108 for urgent cancellations.`);
  const handleDownload = (rec: HealthRecord) => {
    if (rec.fileUrl) {
      window.open(rec.fileUrl, "_blank");
    } else {
      showToast("No file attached to this record. Ask your doctor to upload the document.");
    }
  };

  const user = data?.user;
  const initials = user?.name?.split(" ").map((n) => n[0]).join("").slice(0, 2) ?? "??";
  const records = data?.healthRecords ?? [];

  // Exclude COMPLETED items from the upcoming preview card, and also exclude the active one if we are already showing it in the banner
  const upcomingApt = data?.upcomingAppointments?.find(
    (a) => a.status !== "COMPLETED" && (!activeConsultCard || a.id !== activeConsultCard.id)
  );


  // Health tip cycles daily
  const tips = [
    "Drink at least 3 litres of water daily to stay hydrated.",
    "Walk for 30 minutes every morning to improve heart health.",
    "Eat one seasonal fruit daily — it boosts immunity naturally.",
    "Sleep 7-8 hours — poor sleep raises blood pressure.",
  ];
  const todayTip = tips[new Date().getDay() % tips.length];

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-2xl max-w-sm text-center animate-in fade-in slide-in-from-top-2">
          {toast}
        </div>
      )}

      {/* Add Vital Modal */}
      {showVitalModal && (
        <AddVitalModal
          userId={userId}
          onClose={() => setShowVitalModal(false)}
          onSaved={() => { fetchDashboard(); showToast("Vital reading saved! ✅"); }}
        />
      )}

      {/* Header */}
      <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-3 lg:px-20 sticky top-0 z-40">
        <div className="flex items-center gap-3 text-primary">
          <div className="size-8 flex items-center justify-center rounded-lg bg-primary/10">
            <span className="material-symbols-outlined text-primary text-xl">health_and_safety</span>
          </div>
          <h2 className="text-slate-900 dark:text-white text-xl font-bold leading-tight tracking-tight">GraamSehat</h2>
        </div>
        <div className="flex flex-1 justify-end gap-4 items-center">
          <nav className="hidden md:flex gap-6 mr-8">
            <a className="text-primary font-semibold flex items-center gap-1 text-sm" href="#">
              <span className="material-symbols-outlined text-sm">home</span> Home
            </a>
            <Link className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors text-sm" href="/dashboard/patient/appointments">Appointments</Link>
            <Link className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors text-sm" href="/dashboard/patient/records">Records</Link>
          </nav>
          <div className="flex gap-2">
            <button onClick={() => showToast("No new notifications.")} className="flex items-center justify-center rounded-xl h-10 w-10 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-primary/10 hover:text-primary transition-all">
              <span className="material-symbols-outlined">notifications</span>
            </button>
          </div>
          <div className="h-10 w-10 rounded-full bg-primary/20 border-2 border-primary/30 flex items-center justify-center text-primary font-bold text-sm">
            {loading ? "..." : initials}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-8">
        {/* Welcome */}
        <div className="flex flex-wrap justify-between items-end gap-4 mb-8">
          <div>
            <h1 className="text-slate-900 dark:text-white text-3xl font-bold tracking-tight">
              {loading ? "Loading..." : `Namaste, ${user?.name?.split(" ")[0] ?? "Patient"}! 🙏`}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-base mt-1">Your health is our priority today.</p>
          </div>
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex items-center gap-4 max-w-sm">
            <span className="material-symbols-outlined text-primary text-2xl">lightbulb</span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-primary">Health Tip</p>
              <p className="text-sm text-slate-700 dark:text-slate-300">{todayTip}</p>
            </div>
          </div>
        </div>

        {/* Incoming Call / Active Consultation Banner */}
        {activeConsultCard && (
          <div className="mb-6 bg-gradient-to-r from-green-600 to-green-500 rounded-2xl p-6 shadow-xl text-white flex flex-col sm:flex-row items-center justify-between gap-6 animate-in slide-in-from-top-4 fade-in duration-500">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="relative">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center -rotate-12">
                  <span className="material-symbols-outlined text-4xl text-white">ring_volume</span>
                </div>
                <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 border-2 border-green-500 rounded-full animate-ping" />
                <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 border-2 border-green-500 rounded-full" />
              </div>
              <div>
                <h3 className="text-xl font-bold tracking-tight">Doctor is Ready!</h3>
                <p className="text-green-100 text-sm">{activeConsultCard.doctorName} has started your {activeConsultCard.specialty} consultation.</p>
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

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* Quick Actions */}
            <section>
              <h3 className="text-slate-900 dark:text-white text-lg font-bold mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: "stethoscope", label: "Check Symptoms", href: "/dashboard/patient/symptoms" },
                  { icon: "event_available", label: "Book Appointment", href: "/dashboard/patient/appointments" },
                  { icon: "description", label: "My Records", href: "/dashboard/patient/records" },
                  { icon: "medication", label: "Find Medicine", href: "/dashboard/patient/pharmacy" },
                ].map((action) => (
                  <Link
                    key={action.label}
                    href={action.href}
                    className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-primary transition-all group shadow-sm hover:shadow-md"
                  >
                    <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3 group-hover:bg-primary group-hover:text-white transition-all">
                      <span className="material-symbols-outlined text-2xl">{action.icon}</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 text-center">{action.label}</span>
                  </Link>
                ))}
              </div>
            </section>

            {/* Health Records */}
            <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <h3 className="text-slate-900 dark:text-white font-bold">Recent Health Records</h3>
                <Link href="/dashboard/patient/records" className="text-primary text-sm font-semibold hover:underline">View All</Link>
              </div>
              {loading ? (
                <div className="p-8 text-center text-slate-400 text-sm">Loading records...</div>
              ) : records.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  <span className="material-symbols-outlined text-4xl block mb-2">folder_open</span>
                  <p className="text-sm">No health records yet. Visit a doctor to get started.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {records.map((rec) => {
                    const iconInfo = recordIconMap[rec.type] ?? recordIconMap.DEFAULT;
                    return (
                      <div key={rec.id} className="p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`size-10 rounded-lg bg-${iconInfo.color}-100 text-${iconInfo.color}-600 flex items-center justify-center`}>
                            <span className="material-symbols-outlined">{iconInfo.icon}</span>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-slate-200">{rec.title}</p>
                            <p className="text-xs text-slate-500">{formatDate(rec.date)}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDownload(rec)}
                          className="flex items-center gap-1 text-slate-400 hover:text-primary transition-colors"
                        >
                          <span className="material-symbols-outlined">{rec.fileUrl ? "download" : "info"}</span>
                          <span className="text-sm hidden sm:inline">{rec.fileUrl ? "Download" : "No file"}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          {/* Right */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Upcoming Appointment */}
            <section className="bg-primary text-white rounded-xl shadow-lg p-6 relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 opacity-10">
                <span className="material-symbols-outlined text-[120px]">calendar_month</span>
              </div>
              <div className="relative z-10">
                <h3 className="font-bold text-lg mb-4">Upcoming Appointment</h3>
                {loading ? (
                  <p className="text-white/70 text-sm">Loading...</p>
                ) : upcomingApt ? (
                  <>
                    <div className="flex items-start gap-4 mb-6">
                      <div className="bg-white/20 p-3 rounded-lg flex flex-col items-center min-w-[60px]">
                        <span className="text-xs font-bold uppercase">
                          {new Date(upcomingApt.scheduledAt).toLocaleString("en-IN", { month: "short" }).toUpperCase()}
                        </span>
                        <span className="text-2xl font-black">
                          {new Date(upcomingApt.scheduledAt).getDate()}
                        </span>
                      </div>
                      <div>
                        <p className="font-bold text-lg leading-tight">{upcomingApt.specialty} Consultation</p>
                        <p className="text-white/80 text-sm">{upcomingApt.doctorName} • {new Date(upcomingApt.scheduledAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</p>
                        <p className="text-white/70 text-xs mt-1">{upcomingApt.clinic}</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleReschedule(upcomingApt.id)}
                        className="flex-1 bg-white text-primary font-bold py-2 rounded-lg text-sm hover:bg-slate-100 transition-colors"
                      >
                        Reschedule
                      </button>
                      <button
                        onClick={() => handleCancel(upcomingApt.id)}
                        className="flex-1 bg-white/10 border border-white/30 text-white font-bold py-2 rounded-lg text-sm hover:bg-white/20 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-white/70 text-sm mb-3">No upcoming appointments.</p>
                    <Link href="/dashboard/patient/appointments" className="bg-white text-primary font-bold px-4 py-2 rounded-lg text-sm hover:bg-slate-100 transition-colors">
                      Book Now
                    </Link>
                  </div>
                )}
              </div>
            </section>

            {/* Vitals — patient info from DB */}
            <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
              <h3 className="text-slate-900 dark:text-white font-bold mb-4">Patient Info</h3>
              {loading ? (
                <p className="text-sm text-slate-400">Loading...</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {[
                    { icon: "bloodtype", color: "text-red-500", label: "Blood Group", value: user?.bloodGroup ?? "Unknown" },
                    { icon: "person", color: "text-blue-500", label: "Gender", value: user?.gender ?? "Unknown" },
                    { icon: "location_on", color: "text-green-500", label: "Village", value: user?.village ?? "Unknown" },
                    { icon: "phone", color: "text-primary", label: "Phone", value: user?.phone ?? "Unknown" },
                  ].map((v) => (
                    <div key={v.label} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                      <div className="flex items-center gap-3">
                        <span className={`material-symbols-outlined ${v.color}`}>{v.icon}</span>
                        <span className="text-sm font-medium">{v.label}</span>
                      </div>
                      <span className="font-bold text-sm">{v.value}</span>
                    </div>
                  ))}
                  {(user?.allergies?.length ?? 0) > 0 && (
                    <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30">
                      <p className="text-xs font-bold text-red-600 uppercase mb-1">⚠ Allergies</p>
                      <p className="text-sm text-red-700 dark:text-red-300">{user?.allergies?.join(", ")}</p>
                    </div>
                  )}
                </div>
              )}
              <button
                onClick={() => setShowVitalModal(true)}
                className="w-full mt-4 text-primary text-sm font-bold flex items-center justify-center gap-1 hover:bg-primary/5 py-2 rounded-lg transition-colors"
              >
                Add Vital Reading <span className="material-symbols-outlined text-sm">add</span>
              </button>
            </section>

            {/* Emergency */}
            <section className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="material-symbols-outlined text-red-600">emergency</span>
                <h3 className="text-red-900 dark:text-red-400 font-bold">Emergency Support</h3>
              </div>
              <p className="text-red-700 dark:text-red-300 text-sm mb-4">Instantly connect with an ambulance or on-duty medical staff.</p>
              {/* FIXED: was dead <button>, now real tel: link */}
              <a
                href="tel:108"
                className="w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition-colors shadow-md flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">call</span> Call Ambulance (108)
              </a>
            </section>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-around py-3 px-2 z-50">
        {[
          { icon: "home", label: "Home", tab: "home", href: "/dashboard/patient" },
          { icon: "event", label: "Book", tab: "book", href: "/dashboard/patient/appointments" },
          { icon: "article", label: "Records", tab: "records", href: "/dashboard/patient/records" },
          { icon: "medication", label: "Meds", tab: "meds", href: "/dashboard/patient/pharmacy" },
        ].map((item) => (
          <Link
            key={item.tab}
            href={item.href}
            onClick={() => setActiveTab(item.tab)}
            className={`flex flex-col items-center gap-1 ${activeTab === item.tab ? "text-primary" : "text-slate-400"}`}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="text-[10px] font-bold">{item.label}</span>
          </Link>
        ))}
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-8 px-6 lg:px-20 mb-16 md:mb-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-2xl">health_and_safety</span>
            <span className="font-bold text-slate-800 dark:text-white">GraamSehat Rural Health Portal</span>
          </div>
          <div className="flex gap-8 text-sm text-slate-500 dark:text-slate-400">
            <Link href="/offline" className="hover:text-primary">Privacy Policy</Link>
            <a href="tel:108" className="hover:text-primary">Emergency: 108</a>
            <Link href="/offline" className="hover:text-primary">Offline Mode</Link>
          </div>
          <div className="text-sm text-slate-400">© 2024 GraamSehat.</div>
        </div>
      </footer>
    </div>
  );
}
