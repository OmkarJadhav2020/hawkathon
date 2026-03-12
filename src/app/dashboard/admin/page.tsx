"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { format, formatDistanceToNow } from "date-fns";

type Stats = {
  totals: {
    patients: number;
    doctors: number;
    consultations: number;
    completed: number;
    pending: number;
    pharmacies: number;
    healthRecords: number;
    prescriptions: number;
  };
  triage: { category: string; count: number }[];
  villages: { village: string; count: number }[];
  recentConsultations: {
    id: string;
    createdAt: string;
    status: string;
    patient: { name: string; village: string | null };
    doctor: { name: string } | null;
  }[];
  doctors: {
    id: string;
    name: string;
    specialization: string;
    isAvailable: boolean;
    pendingQueue: number;
  }[];
  ashaWorkers: {
    id: string;
    name: string;
    villages: string[];
    totalCamps: number;
    isOnline: boolean;
    lastSync: string | null;
  }[];
};

const ACCENT_COLORS = ["bg-primary", "bg-blue-500", "bg-amber-500", "bg-green-500", "bg-purple-500"];

// ─── Add Doctor Modal ──────────────────────────────────────────────────────────
function AddDoctorModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: (msg: string) => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [specialization, setSpecialization] = useState("General Physician");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const specializations = [
    "General Physician", "Pediatrician", "Gynecologist", "Cardiologist",
    "Dermatologist", "Orthopedic", "ENT Specialist", "Ophthalmologist",
    "Psychiatrist", "Neurologist", "Surgeon", "Dentist",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) { setError("Name and phone are required."); return; }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "DOCTOR", name: name.trim(), phone: phone.trim(), specialization }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to add doctor."); return; }
      onSuccess(`✅ Dr. ${name} added successfully! Login phone: ${phone}`);
      onClose();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <span translate="no" className="material-symbols-outlined text-primary notranslate">stethoscope</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Add New Doctor</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <span translate="no" className="material-symbols-outlined text-slate-500 notranslate">close</span>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Full Name *</label>
            <input
              value={name} onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Dr. Ramesh Sharma"
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-primary/50"
              required
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Phone Number *</label>
            <input
              value={phone} onChange={(e) => setPhone(e.target.value)}
              placeholder="10-digit phone (e.g. 9876543210)"
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-primary/50"
              required
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Specialization *</label>
            <select
              value={specialization} onChange={(e) => setSpecialization(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-primary/50"
            >
              {specializations.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          {error && <p className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-3 bg-primary text-white rounded-xl text-sm font-bold hover:opacity-90 transition-all disabled:opacity-50">
              {saving ? "Adding..." : "Add Doctor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Add Patient Modal ─────────────────────────────────────────────────────────
function AddPatientModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: (msg: string) => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [village, setVillage] = useState("");
  const [gender, setGender] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [allergies, setAllergies] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) { setError("Name and phone are required."); return; }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "PATIENT", name: name.trim(), phone: phone.trim(), village: village.trim(), gender: gender || null, bloodGroup: bloodGroup || null, allergies }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to add patient."); return; }
      onSuccess(`✅ Patient ${name} registered! Login phone: ${phone}`);
      onClose();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <span translate="no" className="material-symbols-outlined text-blue-600 notranslate">person_add</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Register New Patient</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <span translate="no" className="material-symbols-outlined text-slate-500 notranslate">close</span>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Full Name *</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Anita Devi" className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-primary/50" required />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Phone Number *</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="10-digit phone" className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-primary/50" required />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Village</label>
              <input value={village} onChange={(e) => setVillage(e.target.value)} placeholder="Village name" className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Gender</label>
              <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-primary/50">
                <option value="">Select</option>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Blood Group</label>
              <select value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)} className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-primary/50">
                <option value="">Unknown</option>
                {["A+","A-","B+","B-","O+","O-","AB+","AB-"].map(bg => <option key={bg}>{bg}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Allergies</label>
              <input value={allergies} onChange={(e) => setAllergies(e.target.value)} placeholder="e.g. Penicillin" className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
          </div>
          {error && <p className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-3 bg-primary text-white rounded-xl text-sm font-bold hover:opacity-90 transition-all disabled:opacity-50">
              {saving ? "Registering..." : "Register Patient"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Admin Dashboard ───────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showAddDoctor, setShowAddDoctor] = useState(false);
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const notifsRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const fetchStats = () => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((data) => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchStats(); }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifsRef.current && !notifsRef.current.contains(e.target as Node)) setShowNotifs(false);
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) setShowAccountMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 5000); };

  const handleLogout = () => {
    localStorage.clear();
    router.push("/");
  };

  const totals = stats?.totals;
  const kpis = [
    { label: "Total Patients", value: totals?.patients?.toLocaleString() ?? "—", sub: null },
    { label: "Consultations", value: totals?.consultations?.toLocaleString() ?? "—", sub: `${totals?.pending ?? 0} pending` },
    { label: "Completed", value: totals?.completed?.toLocaleString() ?? "—", sub: "All time" },
    { label: "Doctors", value: totals?.doctors?.toLocaleString() ?? "—", sub: null },
    { label: "Health Records", value: totals?.healthRecords?.toLocaleString() ?? "—", sub: null },
  ];

  // Compute triage percentages
  const totalTriage = (stats?.triage?.reduce((a, b) => a + b.count, 0)) ?? 1;
  const triageCategories = [
    { label: "Home Care", key: "HOME_CARE", color: "bg-primary" },
    { label: "Teleconsult", key: "TELECONSULT", color: "bg-blue-500" },
    { label: "Emergency", key: "EMERGENCY", color: "bg-red-500" },
  ].map((tc) => ({
    ...tc,
    count: stats?.triage?.find((t) => t.category === tc.key)?.count ?? 0,
    pct: Math.round(((stats?.triage?.find((t) => t.category === tc.key)?.count ?? 0) / totalTriage) * 100),
  }));

  // Build notifications from recent consultations
  const notifications = (stats?.recentConsultations ?? []).slice(0, 5).map((c) => ({
    id: c.id,
    title: `${c.patient.name} — ${c.status}`,
    body: `${c.doctor?.name ?? "Unassigned"} • ${c.patient.village ?? "Unknown village"}`,
    time: format(new Date(c.createdAt), "dd MMM, hh:mm a"),
    isEmergency: c.status === "PENDING",
  }));

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-2xl max-w-sm text-center">
          {toast}
        </div>
      )}

      {/* Add Doctor Modal */}
      {showAddDoctor && (
        <AddDoctorModal
          onClose={() => setShowAddDoctor(false)}
          onSuccess={(msg) => { showToast(msg); fetchStats(); }}
        />
      )}

      {/* Add Patient Modal */}
      {showAddPatient && (
        <AddPatientModal
          onClose={() => setShowAddPatient(false)}
          onSuccess={(msg) => { showToast(msg); fetchStats(); }}
        />
      )}

      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Image src="/logo.png" alt="NearDoc Logo" width={32} height={32} className="rounded-lg object-contain" />
                <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">NearDoc</span>
              </div>
              <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-semibold text-slate-800 dark:text-slate-200">Admin</span>
            </div>
            <div className="flex items-center gap-3">
              {/* Add Doctor Button */}
              <button
                onClick={() => setShowAddDoctor(true)}
                className="hidden md:flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold hover:opacity-90 transition-all shadow-sm"
              >
                <span translate="no" className="material-symbols-outlined text-sm notranslate">stethoscope</span>
                Add Doctor
              </button>
              {/* Add Patient Button */}
              <button
                onClick={() => setShowAddPatient(true)}
                className="hidden md:flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl text-sm font-bold hover:border-primary hover:text-primary transition-all"
              >
                <span translate="no" className="material-symbols-outlined text-sm notranslate">person_add</span>
                Add Patient
              </button>

              {/* Notifications Bell */}
              <div className="relative" ref={notifsRef}>
                <button
                  onClick={() => { setShowNotifs((v) => !v); setShowAccountMenu(false); }}
                  className="relative p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-primary/10 hover:text-primary transition-all"
                >
                  <span translate="no" className="material-symbols-outlined notranslate">notifications</span>
                  {notifications.length > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                      {notifications.length}
                    </span>
                  )}
                </button>
                {showNotifs && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                      <p className="font-bold text-slate-900 dark:text-white text-sm">Recent Activity</p>
                      <span className="text-xs text-slate-400">{notifications.length} consultations</span>
                    </div>
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center">
                        <span translate="no" className="material-symbols-outlined text-3xl text-slate-300 block mb-2 notranslate">notifications_none</span>
                        <p className="text-sm text-slate-400">No recent activity</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-80 overflow-y-auto">
                        {notifications.map((n) => (
                          <div key={n.id} className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${n.isEmergency ? "bg-amber-100 text-amber-600" : "bg-primary/10 text-primary"}`}>
                              <span translate="no" className="material-symbols-outlined text-sm notranslate">{n.isEmergency ? "pending" : "check_circle"}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{n.title}</p>
                              <p className="text-xs text-slate-500 mt-0.5">{n.body}</p>
                            </div>
                            <span className="text-[10px] text-slate-400 shrink-0 mt-0.5">{n.time}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Admin Avatar & Logout */}
              <div className="relative" ref={accountRef}>
                <button
                  onClick={() => { setShowAccountMenu((v) => !v); setShowNotifs(false); }}
                  className="w-9 h-9 rounded-full bg-slate-900 dark:bg-slate-700 text-white flex items-center justify-center text-xs font-bold hover:opacity-80 transition-opacity"
                >
                  AD
                </button>
                {showAccountMenu && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden">
                    <div className="px-4 py-4 border-b border-slate-100 dark:border-slate-800">
                      <p className="font-bold text-slate-900 dark:text-white text-sm">Administrator</p>
                      <p className="text-xs text-slate-500 mt-0.5">Nabha Block District</p>
                      <span className="mt-2 inline-block text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded-full">Admin</span>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={() => { setShowAddDoctor(true); setShowAccountMenu(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-sm text-slate-700 dark:text-slate-300 transition-colors"
                      >
                        <span translate="no" className="material-symbols-outlined text-slate-400 text-lg notranslate">stethoscope</span>
                        Add Doctor
                      </button>
                      <button
                        onClick={() => { setShowAddPatient(true); setShowAccountMenu(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-sm text-slate-700 dark:text-slate-300 transition-colors"
                      >
                        <span translate="no" className="material-symbols-outlined text-slate-400 text-lg notranslate">person_add</span>
                        Add Patient
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-sm text-red-600 font-semibold transition-colors mt-1"
                      >
                        <span translate="no" className="material-symbols-outlined text-lg notranslate">logout</span>
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 py-3">
          <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
            <h1 className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              District Health Overview — <span className="text-slate-900 dark:text-white font-bold">Nabha Block</span>
            </h1>
            <div className="flex gap-2">
              {/* Mobile Add buttons */}
              <button onClick={() => setShowAddDoctor(true)} className="md:hidden bg-primary text-white px-3 py-1 rounded text-xs font-bold flex items-center gap-1">
                <span translate="no" className="material-symbols-outlined text-xs notranslate">stethoscope</span> Add Doctor
              </button>
              <button onClick={() => setShowAddPatient(true)} className="md:hidden border border-slate-200 dark:border-slate-700 px-3 py-1 rounded text-xs font-bold flex items-center gap-1 text-slate-700 dark:text-slate-300">
                <span translate="no" className="material-symbols-outlined text-xs notranslate">person_add</span> Add Patient
              </button>
              <button onClick={() => window.print()} className="bg-primary text-white px-3 py-1 rounded text-sm font-medium flex items-center gap-1 hover:opacity-90">
                <span translate="no" className="material-symbols-outlined text-sm notranslate">download</span> Export
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* KPI Row */}
            <section className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
              {kpis.map((kpi, idx) => (
                <div key={kpi.label} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 relative overflow-hidden">
                  <div className={`absolute top-0 left-0 right-0 h-1 ${ACCENT_COLORS[idx]}`} />
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{kpi.label}</p>
                  <div className="flex items-end justify-between mt-2">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{kpi.value}</h2>
                    {kpi.sub && <span className="text-xs font-medium text-slate-400">{kpi.sub}</span>}
                  </div>
                </div>
              ))}
            </section>

            {/* Analytics Row */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
              {/* Recent Consultations */}
              <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-4">Recent Consultations</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="text-[11px] text-slate-400 uppercase font-bold border-b border-slate-100 dark:border-slate-800">
                      <tr>
                        <th className="pb-3 pr-4">Patient</th>
                        <th className="pb-3 pr-4">Village</th>
                        <th className="pb-3 pr-4">Doctor</th>
                        <th className="pb-3 pr-4">Date</th>
                        <th className="pb-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                      {(stats?.recentConsultations ?? []).map((c) => (
                        <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="py-3 pr-4 font-medium text-slate-800 dark:text-slate-200">{c.patient.name}</td>
                          <td className="py-3 pr-4 text-slate-500">{c.patient.village ?? "—"}</td>
                          <td className="py-3 pr-4 text-slate-500">{c.doctor?.name ?? "Unassigned"}</td>
                          <td className="py-3 pr-4 text-slate-400">{format(new Date(c.createdAt), "dd MMM")}</td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${c.status === "COMPLETED" ? "bg-green-100 text-green-700" : c.status === "PENDING" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}>
                              {c.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Triage Distribution */}
              <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex flex-col">
                <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-6">Triage Distribution</h3>
                <div className="space-y-6 flex-1 flex flex-col justify-center">
                  {triageCategories.map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{item.label}</span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{item.pct}% ({item.count})</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                        <div className={`${item.color} h-2 rounded-full transition-all`} style={{ width: `${item.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Bottom Row */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Top Villages */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-slate-900 dark:text-white font-bold">Top Villages by Patients</h3>
                </div>
                <div className="divide-y divide-slate-50 dark:divide-slate-800 flex-1">
                  {(stats?.villages ?? []).length === 0 ? (
                    <p className="text-center py-8 text-slate-400 text-sm">No village data available.</p>
                  ) : (
                    (stats?.villages ?? []).map((v) => (
                      <div key={v.village} className="p-4 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <div>
                          <p className="font-medium text-slate-800 dark:text-slate-200">{v.village}</p>
                        </div>
                        <span className="text-sm font-bold text-primary">{v.count} patients</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Doctor Availability */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-slate-900 dark:text-white font-bold">Doctor Availability</h3>
                  <button
                    onClick={() => setShowAddDoctor(true)}
                    className="flex items-center gap-1 text-xs font-bold text-primary hover:bg-primary/10 px-2 py-1 rounded-lg transition-colors"
                  >
                    <span translate="no" className="material-symbols-outlined text-sm notranslate">add</span> Add
                  </button>
                </div>
                <div className="space-y-3 flex-1">
                  {(stats?.doctors ?? []).map((doc) => (
                    <div key={doc.id} className={`flex items-center gap-3 p-3 border border-slate-100 dark:border-slate-700 rounded-lg ${doc.isAvailable ? "bg-emerald-50/50 dark:bg-emerald-900/10" : "opacity-60 grayscale bg-slate-50 dark:bg-slate-800"}`}>
                      <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 font-bold text-sm">
                        {doc.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                      </div>
                      <div className="flex-grow">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{doc.name}</p>
                        <p className="text-xs text-slate-500">{doc.specialization}</p>
                        {doc.pendingQueue > 0 && <p className="text-[10px] text-amber-600 font-medium">{doc.pendingQueue} queued</p>}
                      </div>
                      <div className="flex flex-col items-end">
                        <span className={`inline-flex h-2 w-2 rounded-full mb-1 ${doc.isAvailable ? "bg-emerald-500" : "bg-slate-300"}`} />
                        <span className={`text-[10px] font-bold ${doc.isAvailable ? "text-emerald-600" : "text-slate-500"}`}>{doc.isAvailable ? "ONLINE" : "OFFLINE"}</span>
                      </div>
                    </div>
                  ))}
                  {(stats?.doctors ?? []).length === 0 && (
                    <div className="text-center py-6">
                      <span translate="no" className="material-symbols-outlined text-3xl text-slate-300 block mb-2 notranslate">stethoscope</span>
                      <p className="text-sm text-slate-400 mb-3">No doctors added yet</p>
                      <button onClick={() => setShowAddDoctor(true)} className="bg-primary text-white text-xs font-bold px-4 py-2 rounded-lg hover:opacity-90">Add First Doctor</button>
                    </div>
                  )}
                </div>
              </div>

              {/* ASHA Sync Status */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <h3 className="text-slate-900 dark:text-white font-bold">ASHA Worker Sync</h3>
                  <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded uppercase">{stats?.ashaWorkers?.length ?? 0} workers</span>
                </div>
                <div className="overflow-x-auto flex-1">
                  {(stats?.ashaWorkers ?? []).length === 0 ? (
                    <p className="text-center py-8 text-slate-400 text-sm">No ASHA workers found.</p>
                  ) : (
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 dark:bg-slate-800 text-[10px] uppercase font-bold text-slate-400">
                        <tr>
                          <th className="px-4 py-3">Worker</th>
                          <th className="px-4 py-3">Villages</th>
                          <th className="px-4 py-3">Last Sync</th>
                          <th className="px-4 py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm divide-y divide-slate-50 dark:divide-slate-800">
                        {(stats?.ashaWorkers ?? []).map((w) => (
                          <tr key={w.id}>
                            <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">{w.name}</td>
                            <td className="px-4 py-3 text-slate-500 text-xs">{w.villages.join(", ") || "—"}</td>
                            <td className="px-4 py-3 text-slate-400 text-xs">{w.lastSync ? formatDistanceToNow(new Date(w.lastSync), { addSuffix: true }) : "Never"}</td>
                            <td className="px-4 py-3">
                              <span translate="no" className={`material-symbols-outlined text-sm ${w.isOnline ? "text-green-500" : "text-slate-400"} notranslate`}>
                                {w.isOnline ? "check_circle" : "circle"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
