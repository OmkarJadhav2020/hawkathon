"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";

type PatientInfo = {
  id: string;
  name: string;
  village: string | null;
  phone: string | null;
  bloodGroup: string | null;
  allergies: string[];
};

type Consultation = {
  id: string;
  status: string;
  symptoms: string[];
  triageCategory: string | null;
  notes: string | null;
  connectionMode: string | null;
  createdAt: string;
  patient: PatientInfo;
  prescription: { id: string } | null;
};

// ─── Patient Records Modal ─────────────────────────────────────────────────────
function PatientRecordsModal({ patient, doctorName, onClose }: { patient: PatientInfo; doctorName: string; onClose: () => void }) {
  const [records, setRecords] = useState<any[]>([]);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingNote, setAddingNote] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newType, setNewType] = useState("VITAL");

  const fetchRecords = async () => {
    try {
      const res = await fetch(`/api/records?userId=${patient.id}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setRecords(data.healthRecords ?? []);
      setConsultations(data.consultations ?? []);
    } catch {
      console.error("Failed to fetch records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRecords(); }, [patient.id]);

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setAddingNote(true);
    try {
      const res = await fetch("/api/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId: patient.id, type: newType, title: newTitle, description: newDesc, doctorName }),
      });
      if (res.ok) {
        setNewTitle(""); setNewDesc("");
        fetchRecords();
      }
    } catch {
    } finally {
      setAddingNote(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
              {patient.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{patient.name}</h2>
              <p className="text-sm text-slate-500">ID: {patient.id.slice(-8).toUpperCase()} • Blood: {patient.bloodGroup ?? "Unknown"} • {patient.village ?? "—"}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
            <span className="material-symbols-outlined text-slate-500">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Existing Records */}
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">monitor_heart</span> Clinical & Lab Records
              </h3>
              {loading ? (
                <div className="animate-pulse flex flex-col gap-3">
                  <div className="h-16 bg-slate-100 dark:bg-slate-800 rounded-xl" />
                  <div className="h-16 bg-slate-100 dark:bg-slate-800 rounded-xl" />
                </div>
              ) : records.length === 0 ? (
                <p className="text-sm text-slate-500 py-4 text-center border border-dashed border-slate-200 dark:border-slate-700 rounded-xl">No records found.</p>
              ) : (
                <div className="space-y-3">
                  {records.map((r: any) => (
                    <div key={r.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-xl">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded uppercase">{r.type.replace("_", " ")}</span>
                        <span className="text-[10px] text-slate-400 font-medium">{format(new Date(r.createdAt), "dd MMM yyyy, p")}</span>
                      </div>
                      <p className="font-bold text-sm text-slate-800 dark:text-white my-1">{r.title}</p>
                      {r.description && <p className="text-xs text-slate-500 whitespace-pre-wrap">{r.description}</p>}
                      {r.doctorName && <p className="text-[10px] text-slate-400 mt-2 font-medium">Added by: {r.doctorName}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">history</span> Past Consultations
              </h3>
              {loading ? (
                <div className="animate-pulse h-24 bg-slate-100 dark:bg-slate-800 rounded-xl" />
              ) : consultations.length === 0 ? (
                <p className="text-sm text-slate-500 py-4 text-center border border-dashed border-slate-200 dark:border-slate-700 rounded-xl">No past consultations.</p>
              ) : (
                <div className="space-y-3">
                  {consultations.map((c: any) => (
                    <div key={c.id} className="p-3 border border-slate-100 dark:border-slate-700 rounded-xl flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{format(new Date(c.createdAt), "dd MMM yyyy")}</p>
                        <p className="text-xs text-slate-500">{c.doctor?.name ?? "Unknown Doctor"}</p>
                      </div>
                      <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md">COMPLETED</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Add New Record */}
          <div className="bg-slate-50 dark:bg-slate-800/30 p-5 rounded-2xl h-fit border border-primary/10">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">add_notes</span> Add Clinical Note / Vital
            </h3>
            <form onSubmit={handleAddRecord} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Record Type</label>
                <select value={newType} onChange={(e) => setNewType(e.target.value)} className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm outline-none">
                  <option value="VITAL">Vitals (BP, Sugar, Temp, etc.)</option>
                  <option value="LAB_RESULT">Lab Result Summary</option>
                  <option value="GENERAL">General Clinical Note</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Title *</label>
                <input
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Blood Sugar Fasting, Blood Pressure"
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Details / Value</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="e.g., 120 mg/dL, 140/90 mmHg, Patient seems stable..."
                  className="w-full h-24 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm outline-none resize-none"
                />
              </div>
              <button disabled={addingNote || !newTitle.trim()} type="submit" className="w-full py-3 bg-primary text-white rounded-xl text-sm font-bold hover:opacity-90 transition-all disabled:opacity-50 flex justify-center items-center gap-2">
                {addingNote ? "Saving..." : "Save Record to Patient History"} <span className="material-symbols-outlined text-sm">save</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DoctorDashboard() {
  const router = useRouter();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [activeConsult, setActiveConsult] = useState<Consultation | null>(null);
  const [activeTab, setActiveTab] = useState<"notes" | "prescription" | "labs">("notes");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [starting, setStarting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Consultation[]>([]);
  const [doctorName, setDoctorName] = useState("Dr. Physician");
  const [showRecordsModal, setShowRecordsModal] = useState(false);
  const searchRef = useRef<NodeJS.Timeout | null>(null);

  // Route Protection & User Data
  useEffect(() => {
    if (typeof window !== "undefined") {
      const id = localStorage.getItem("doctorId") ?? localStorage.getItem("userId");
      const role = localStorage.getItem("userRole");
      if (!id || role !== "DOCTOR") {
        router.push("/");
      } else {
        const name = localStorage.getItem("userName");
        if (name) setDoctorName(name);
      }
    }
  }, [router]);

  const doctorId = typeof window !== "undefined"
    ? (localStorage.getItem("doctorId") ?? localStorage.getItem("userId"))
    : null;

  const fetchConsultations = async () => {
    try {
      const res = await fetch(`/api/consultations?doctorId=${doctorId}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data: Consultation[] = await res.json();
      setConsultations(data);
      if (data.length > 0 && !activeConsult) {
        const active = data.find((c) => c.status === "IN_PROGRESS") ?? data[0];
        setActiveConsult(active);
        setNotes(active.notes ?? "");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (doctorId) {
      fetchConsultations();
      // Auto-refresh every 10 seconds
      const interval = setInterval(() => fetchConsultations(), 10000);
      return () => clearInterval(interval);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctorId]);

  // Patient search with debounce
  useEffect(() => {
    if (!search.trim()) { setSearchResults([]); return; }
    if (searchRef.current) clearTimeout(searchRef.current);
    searchRef.current = setTimeout(() => {
      const filtered = consultations.filter((c) =>
        c.patient.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.patient.phone ?? "").includes(search) ||
        (c.patient.village ?? "").toLowerCase().includes(search.toLowerCase())
      );
      setSearchResults(filtered);
    }, 300);
  }, [search, consultations]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleStartConsultation = async () => {
    if (!activeConsult || activeConsult.status !== "PENDING") return;
    setStarting(true);
    try {
      const res = await fetch(`/api/consultations?id=${activeConsult.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "IN_PROGRESS", doctorId }),
      });
      if (!res.ok) throw new Error("Failed");
      showToast(`Consultation started with ${activeConsult.patient.name}`);
      await fetchConsultations();
      // Update active consult with new status
      setActiveConsult((prev) => prev ? { ...prev, status: "IN_PROGRESS" } : null);
    } catch {
      showToast("Failed to start consultation.");
    } finally {
      setStarting(false);
    }
  };

  const handleSaveRecord = async () => {
    if (!activeConsult) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/consultations?id=${activeConsult.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes, status: activeConsult.status }),
      });
      if (!res.ok) throw new Error("Failed to save");
      showToast("Notes saved successfully!");
      fetchConsultations();
    } catch {
      showToast("Failed to save notes.");
    } finally {
      setSaving(false);
    }
  };

  const handleEndConsultation = async () => {
    if (!activeConsult) return;
    if (!confirm(`End consultation with ${activeConsult.patient.name}?`)) return;
    try {
      await fetch(`/api/consultations?id=${activeConsult.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "COMPLETED", notes }),
      });
      showToast("Consultation completed and saved!");
      setActiveConsult(null);
      setNotes("");
      fetchConsultations();
    } catch {
      showToast("Failed to end consultation.");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push("/");
  };

  const handleStartVideoCall = async () => {
    if (!activeConsult) { showToast("Select a patient first."); return; }
    try {
      // Signal patient that call is incoming
      await fetch(`/api/consultations?id=${activeConsult.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callStatus: "RINGING", status: "IN_PROGRESS", doctorId }),
      });
      router.push(`/dashboard/patient/consultation?id=${activeConsult.id}`);
    } catch {
      showToast("Could not start call. Try again.");
    }
  };

  const handlePrint = () => {
    if (!activeConsult) return;
    window.print();
  };

  const pending = consultations.filter((c) => c.status === "PENDING");
  const inProgress = consultations.find((c) => c.status === "IN_PROGRESS");
  const completed = consultations.filter((c) => c.status === "COMPLETED").slice(0, 5);

  // The main list should strictly be PENDING items if no search is active
  const displayList = search.trim() ? searchResults : pending;

  return (
    <div className="relative flex min-h-screen flex-col bg-background-light dark:bg-background-dark">
      {/* Toast */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl z-[100] flex items-center gap-2">
          <span className="material-symbols-outlined text-green-400">check_circle</span>
          <span className="font-medium text-sm">{toast}</span>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-primary/20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 py-3">
        <div className="flex items-center justify-between max-w-[1600px] mx-auto">
          <div className="flex items-center gap-8">
            <Link href="/dashboard/doctor" className="flex items-center gap-2 text-primary">
              <Image src="/logo.png" alt="GraamSehat Logo" width={32} height={32} className="rounded-lg object-contain" />
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">GraamSehat</h2>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <span className="text-sm font-semibold text-primary border-b-2 border-primary pb-1 cursor-default">Dashboard</span>
              <button 
                onClick={() => {
                  if (activeConsult) setShowRecordsModal(true);
                  else showToast("Select a patient from the queue to view their records.");
                }}
                className="text-sm font-medium text-slate-500 hover:text-primary transition-colors cursor-pointer"
              >
                Patient Records
              </button>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-700">
              <div className="text-right hidden lg:block">
                <p className="text-xs font-bold text-slate-900 dark:text-white">{doctorName}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">General Physician</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center text-primary font-bold">
                {doctorName.split(" ").map((n) => n[0]).slice(0, 2).join("")}
              </div>
              <button onClick={handleLogout} className="ml-1 text-slate-400 hover:text-red-500 transition-colors" title="Logout">
                <span className="material-symbols-outlined">logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Patient Records Modal */}
      {showRecordsModal && activeConsult && (
        <PatientRecordsModal 
          patient={activeConsult.patient} 
          doctorName={doctorName} 
          onClose={() => setShowRecordsModal(false)} 
        />
      )}

      {(!doctorId || loading) ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      ) : (
        <main className="flex-1 p-6 max-w-[1600px] mx-auto w-full grid grid-cols-12 gap-6">
          {/* Patient Queue */}
          <div className="col-span-12 lg:col-span-3 flex flex-col gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col" style={{ maxHeight: "calc(100vh - 100px)" }}>
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">group_work</span> Patient Queue
                </h3>
                <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">{pending.length} WAITING</span>
              </div>

              {/* Search */}
              <div className="p-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2 border border-slate-200 dark:border-slate-700">
                  <span className="material-symbols-outlined text-slate-400 text-sm">search</span>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search patients..."
                    className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white outline-none placeholder:text-slate-400"
                  />
                  {search && (
                    <button onClick={() => setSearch("")} className="text-slate-400 hover:text-slate-600">
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {/* In Progress */}
                {!search && inProgress && (
                  <div
                    className={`p-4 border-b border-primary/20 bg-primary/5 cursor-pointer ${activeConsult?.id === inProgress.id ? "border-l-2 border-l-primary" : ""}`}
                    onClick={() => { setActiveConsult(inProgress); setNotes(inProgress.notes ?? ""); }}
                  >
                    <p className="text-[10px] font-bold text-primary uppercase mb-2 flex items-center gap-1">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                      </span>
                      Currently In Session
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold bg-primary/10 text-primary">
                        {inProgress.patient.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{inProgress.patient.name}</p>
                        <p className="text-xs text-slate-500">{inProgress.patient.village ?? "—"}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Pending / Search Queue */}
                {displayList.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => { setActiveConsult(c); setNotes(c.notes ?? ""); setSearch(""); setSearchResults([]); }}
                    className={`p-4 border-b border-slate-100 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${activeConsult?.id === c.id ? "bg-slate-50 dark:bg-slate-800/50 border-l-2 border-l-primary" : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {c.patient.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{c.patient.name}</p>
                        <p className="text-xs text-slate-500">{c.symptoms?.slice(0, 2).join(", ") || "No symptoms noted"}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.status === "IN_PROGRESS" ? "bg-green-50 text-green-600" : c.status === "COMPLETED" ? "bg-slate-100 text-slate-500" : "bg-primary/10 text-primary"}`}>
                        {c.status === "PENDING" ? "WAITING" : c.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Completed section */}
                {!search && completed.length > 0 && (
                  <div className="pt-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase px-4 py-2 border-t border-slate-100 dark:border-slate-800">Recent Completed</p>
                    {completed.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => { setActiveConsult(c); setNotes(c.notes ?? ""); }}
                        className={`p-3 border-b border-slate-100 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors opacity-70 hover:opacity-100 ${activeConsult?.id === c.id ? "bg-slate-50 dark:bg-slate-800/50" : ""}`}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-500">
                            {c.patient.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-bold text-slate-600 dark:text-slate-400">{c.patient.name}</p>
                          </div>
                          <span className="text-[9px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">DONE</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {consultations.length === 0 && (
                  <div className="p-8 text-center">
                    <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">manage_accounts</span>
                    <p className="text-sm text-slate-400">No patients in queue.</p>
                    <p className="text-xs text-slate-400 mt-1">Patients will appear here when they book a consultation.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Active Patient Workstation */}
          {activeConsult ? (
            <div className="col-span-12 lg:col-span-6 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
              {/* Patient summary header */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-primary/5 to-transparent">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">{activeConsult.patient.name}</h2>
                    <p className="text-sm text-slate-500">
                      ID: {activeConsult.id.slice(-8).toUpperCase()} • Blood: {activeConsult.patient.bloodGroup ?? "Unknown"} • {activeConsult.patient.village ?? "—"}
                    </p>
                    {activeConsult.patient.allergies.length > 0 && (
                      <p className="text-xs font-bold text-red-600 mt-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">warning</span>
                        Allergies: {activeConsult.patient.allergies.join(", ")}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${activeConsult.status === "IN_PROGRESS" ? "bg-green-100 text-green-700" : activeConsult.status === "COMPLETED" ? "bg-slate-100 text-slate-500" : "bg-amber-100 text-amber-700"}`}>
                      {activeConsult.status.replace("_", " ")}
                    </span>
                    {/* Start Consultation button for PENDING */}
                    {activeConsult.status === "PENDING" && (
                      <button
                        onClick={handleStartConsultation}
                        disabled={starting}
                        className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full hover:bg-green-700 transition-all disabled:opacity-50"
                      >
                        <span className="material-symbols-outlined text-sm">{starting ? "progress_activity" : "play_arrow"}</span>
                        {starting ? "Starting..." : "Start"}
                      </button>
                    )}
                  </div>
                </div>

                {activeConsult.symptoms.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {activeConsult.symptoms.map((s) => (
                      <span key={s} className="px-2 py-1 text-xs font-medium bg-red-50 text-red-700 rounded-lg border border-red-100">{s}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Tabs */}
              <div className="flex border-b border-slate-200 dark:border-slate-800">
                {(["notes", "prescription", "labs"] as const).map((tab) => (
                  <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-3 text-sm font-bold capitalize transition-colors ${activeTab === tab ? "border-b-2 border-primary text-primary" : "text-slate-500 hover:text-slate-700"}`}>
                    {tab === "prescription" ? "E-Prescription" : tab === "labs" ? "Lab Orders" : "Notes"}
                  </button>
                ))}
              </div>

              <div className="flex-1 p-6 overflow-y-auto">
                {activeTab === "notes" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Chief Complaint</label>
                      <p className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                        {activeConsult.symptoms.join(", ") || "Patient reported general discomfort."}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Consultation Notes</label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full h-40 text-sm p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl resize-none outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="Enter clinical notes, diagnosis, and observations here..."
                        disabled={activeConsult.status === "COMPLETED"}
                      />
                    </div>
                    {activeConsult.status !== "COMPLETED" && (
                      <div className="flex gap-3">
                        <button onClick={handleSaveRecord} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-bold rounded-xl hover:opacity-90 transition-all text-sm shadow-sm disabled:opacity-50">
                          {saving ? "Saving..." : "Save Record"} <span className="material-symbols-outlined text-sm">save</span>
                        </button>
                        {activeConsult.status === "PENDING" && (
                          <button onClick={handleStartConsultation} disabled={starting} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:opacity-90 transition-all text-sm shadow-sm disabled:opacity-50">
                            {starting ? "Starting..." : "Start Consultation"} <span className="material-symbols-outlined text-sm">play_arrow</span>
                          </button>
                        )}
                        {activeConsult.status === "IN_PROGRESS" && (
                          <div className="flex gap-3">
                            <Link
                              href={`/dashboard/patient/consultation?id=${activeConsult.id}`}
                              className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 text-white font-bold rounded-xl hover:opacity-90 transition-all text-sm shadow-sm"
                            >
                              Join Video Call <span className="material-symbols-outlined text-sm">videocam</span>
                            </Link>
                            <button onClick={handleEndConsultation} className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white font-bold rounded-xl hover:opacity-90 transition-all text-sm shadow-sm">
                              End Consultation <span className="material-symbols-outlined text-sm">check_circle</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                    {activeConsult.status === "COMPLETED" && activeConsult.notes && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-xs text-green-700 flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">check_circle</span>
                        This consultation is completed.
                      </div>
                    )}
                  </div>
                )}
                {activeTab === "prescription" && (
                  <div className="space-y-4">
                    {activeConsult.prescription ? (
                      <div className="text-center py-8">
                        <span className="material-symbols-outlined text-5xl text-green-400 mb-4 block">check_circle</span>
                        <p className="text-slate-600 text-sm mb-4 font-bold">Prescription already issued for this consultation.</p>
                        <Link
                          href={`/dashboard/prescription?consultId=${activeConsult.id}`}
                          className="bg-primary text-white font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-all text-sm"
                        >
                          View Prescription
                        </Link>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <span className="material-symbols-outlined text-5xl text-slate-300 mb-4 block">medication</span>
                        <p className="text-slate-500 text-sm mb-4">Create a new digital prescription for this patient.</p>
                        <div className="flex flex-col gap-3 items-center">
                          <button
                            onClick={handleStartVideoCall}
                            className="bg-primary text-white font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-all text-sm flex items-center gap-2"
                          >
                            <span className="material-symbols-outlined text-sm">videocam</span>
                            Join Call to Prescribe
                          </button>
                          <Link
                            href={`/dashboard/prescription?consultId=${activeConsult.id}`}
                            className="text-primary text-sm font-bold hover:underline flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-sm">visibility</span>
                            View Existing (if any)
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {activeTab === "labs" && (
                  <div className="space-y-4">
                    <div className="text-center py-8">
                      <span className="material-symbols-outlined text-5xl text-slate-300 mb-4 block">biotech</span>
                      <p className="text-slate-500 text-sm mb-4">Lab order form. Common tests:</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        "Complete Blood Count (CBC)",
                        "Blood Glucose (Fasting)",
                        "Urine Routine",
                        "Liver Function Test",
                        "Thyroid Function (TSH)",
                        "Chest X-Ray",
                        "ECG",
                        "HbA1c",
                      ].map((test) => (
                        <button
                          key={test}
                          onClick={() => showToast(`Lab order for "${test}" noted in consultation.`)}
                          className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-left text-sm font-medium text-slate-700 dark:text-slate-300 hover:border-primary hover:bg-primary/5 transition-all"
                        >
                          <span className="material-symbols-outlined text-primary text-sm block mb-1">science</span>
                          {test}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="col-span-12 lg:col-span-6 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-center">
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-5xl text-slate-300 mb-4 block">face</span>
                <p className="text-slate-500 text-sm">Select a patient from the queue to begin.</p>
              </div>
            </div>
          )}

          {/* Right Panel */}
          <div className="col-span-12 lg:col-span-3 flex flex-col gap-4">
            {activeConsult && (
              <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4">
                <h4 className="font-bold text-sm text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-400">info</span> Patient Details
                </h4>
                <div className="space-y-2 text-sm">
                  {[
                    { label: "Phone", value: activeConsult.patient.phone ?? "—" },
                    { label: "Village", value: activeConsult.patient.village ?? "—" },
                    { label: "Blood Group", value: activeConsult.patient.bloodGroup ?? "Unknown" },
                    { label: "Mode", value: activeConsult.connectionMode ?? "VIDEO" },
                    { label: "Triage", value: activeConsult.triageCategory?.replace("_", " ") ?? "Not triaged" },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between">
                      <span className="text-slate-400">{item.label}</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">{item.value}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                  <button
                    onClick={handlePrint}
                    className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">print</span>Print
                  </button>
                  <button
                    onClick={() => setShowRecordsModal(true)}
                    className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">folder_open</span>Records
                  </button>
                </div>
              </div>
            )}

            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4">
              <h4 className="font-bold text-sm text-slate-800 dark:text-white mb-3">Quick Actions</h4>
              <div className="space-y-2">
                {[
                  { icon: "video_call", label: "Start Video Call", action: handleStartVideoCall },
                  { icon: "medication", label: "Write Prescription", action: () => { if (activeConsult) setActiveTab("prescription"); else showToast("Select a patient first."); } },
                  { icon: "phone", label: "Call Patient", action: () => activeConsult ? (window.location.href = `tel:${activeConsult.patient.phone}`) : showToast("Select a patient first.") },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={item.action}
                    className="w-full flex items-center gap-3 text-left p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <span className="material-symbols-outlined text-primary">{item.icon}</span>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Today's summary */}
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4">
              <h4 className="font-bold text-sm text-slate-800 dark:text-white mb-3">Today&apos;s Summary</h4>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-amber-50 rounded-lg">
                  <p className="text-xl font-black text-amber-600">{pending.length}</p>
                  <p className="text-[10px] text-amber-500 font-bold">Waiting</p>
                </div>
                <div className="p-2 bg-green-50 rounded-lg">
                  <p className="text-xl font-black text-green-600">{inProgress ? 1 : 0}</p>
                  <p className="text-[10px] text-green-500 font-bold">Active</p>
                </div>
                <div className="p-2 bg-slate-100 rounded-lg">
                  <p className="text-xl font-black text-slate-600">{completed.length}</p>
                  <p className="text-[10px] text-slate-500 font-bold">Done</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
