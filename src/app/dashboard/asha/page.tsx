"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";


type AshaProfile = {
  id: string;
  name: string;
  villages: string[];
  totalCamps: number;
  isOnline: boolean;
  lastSync: string | null;
  district: string;
};

type Patient = {
  id: string;
  name: string;
  village: string | null;
  bloodGroup: string | null;
  allergies: string[];
  phone: string | null;
  gender: string | null;
  consultationsAsPatient: { status: string; createdAt: string; symptoms: string[] }[];
};

type SyncItem = {
  id: string;
  type: string;
  syncStatus: string;
  createdAt: string;
};

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"];

export default function AshaWorkerDashboard() {
  const [activeNav, setActiveNav] = useState("dashboard");
  const [profile, setProfile] = useState<AshaProfile | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [syncQueue, setSyncQueue] = useState<SyncItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  // Registration modal state
  const [showRegModal, setShowRegModal] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [regForm, setRegForm] = useState({
    name: "", phone: "", village: "", gender: "", bloodGroup: "", dateOfBirth: "",
  });
  const [regError, setRegError] = useState("");

  const router = useRouter();

  // Route Protection & Auth
  useEffect(() => {
    if (typeof window !== "undefined") {
      const id = localStorage.getItem("userId");
      const r = localStorage.getItem("userRole");
      if (!id || r !== "ASHA") {
        router.push("/");
      }
    }
  }, [router]);

  const ashaId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  const handleLogout = () => {
    localStorage.clear();
    router.push("/");
  };


  const fetchData = useCallback(async () => {
    if (!ashaId) { setLoading(false); return; }
    try {
      const res = await fetch(`/api/asha?ashaId=${ashaId}`);
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      setProfile(data.profile);
      setPatients(data.patients ?? []);
      // Load offline sync queue from localStorage, combine with server syncQueue
      const localSyncQueueStr = localStorage.getItem("asha_sync_queue");
      const localSyncQueue = localSyncQueueStr ? JSON.parse(localSyncQueueStr) : [];
      setSyncQueue([...localSyncQueue.map((item: any) => ({
        id: item._localId,
        type: "OFFLINE_REGISTRATION",
        syncStatus: "PENDING",
        createdAt: new Date().toISOString()
      })), ...(data.syncQueue ?? [])]);

      // Cache the patients for offline use
      localStorage.setItem("asha_patients_cache", JSON.stringify(data.patients ?? []));
      localStorage.setItem("asha_profile_cache", JSON.stringify(data.profile));
    } catch {
      console.error("Failed to fetch ASHA data, attempting to load from cache...");
      const cachedPatients = localStorage.getItem("asha_patients_cache");
      const cachedProfile = localStorage.getItem("asha_profile_cache");
      if (cachedPatients) setPatients(JSON.parse(cachedPatients));
      if (cachedProfile) setProfile(JSON.parse(cachedProfile));
      
      const localSyncQueueStr = localStorage.getItem("asha_sync_queue");
      const localSyncQueue = localSyncQueueStr ? JSON.parse(localSyncQueueStr) : [];
      setSyncQueue(localSyncQueue.map((item: any) => ({
        id: item._localId,
        type: "OFFLINE_REGISTRATION",
        syncStatus: "PENDING",
        createdAt: new Date().toISOString()
      })));
    } finally {
      setLoading(false);
    }
  }, [ashaId]);

  useEffect(() => { 
    fetchData(); 
    
    // Setup online/offline listeners
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    setIsOnline(navigator.onLine);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [fetchData]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // ─── Registration ────────────────────────────────────────────────
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");
    if (!regForm.name.trim()) { setRegError("Patient name is required."); return; }

    setRegLoading(true);
    try {
      const newRecord = {
        patientName: regForm.name.trim(),
        phone: regForm.phone.trim() || undefined,
        gender: regForm.gender || undefined,
        bloodGroup: regForm.bloodGroup || undefined,
        dateOfBirth: regForm.dateOfBirth || undefined,
      };

      if (!isOnline) {
        // Queue offline
        const localSyncQueueStr = localStorage.getItem("asha_sync_queue");
        const localSyncQueue = localSyncQueueStr ? JSON.parse(localSyncQueueStr) : [];
        const _localId = "loc_" + Date.now() + Math.random().toString(36).slice(2, 6);
        localSyncQueue.push({ ...newRecord, _localId, village: regForm.village || profile?.villages[0] || "" });
        localStorage.setItem("asha_sync_queue", JSON.stringify(localSyncQueue));
        
        // Optimistically add to UI patients list
        setPatients(prev => [{
          id: _localId,
          name: newRecord.patientName,
          village: regForm.village || profile?.villages[0] || "",
          bloodGroup: newRecord.bloodGroup || "Unknown",
          allergies: [],
          phone: newRecord.phone || null,
          gender: newRecord.gender || null,
          consultationsAsPatient: []
        }, ...prev]);
        
        setShowRegModal(false);
        setRegForm({ name: "", phone: "", village: "", gender: "", bloodGroup: "", dateOfBirth: "" });
        showToast(`📴 Saved offline. Will sync when internet is restored.`);
        fetchData(); // to update syncQueue length UI
        return;
      }

      // Online logic
      const res = await fetch("/api/sync/asha-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ashaWorkerId: ashaId,
          campId: "DIRECT",
          campDate: new Date().toISOString(),
          village: regForm.village || profile?.villages[0] || "",
          records: [newRecord],
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error ?? "Registration failed");

      setShowRegModal(false);
      setRegForm({ name: "", phone: "", village: "", gender: "", bloodGroup: "", dateOfBirth: "" });
      showToast(`✅ ${data.patients?.[0]?.name ?? regForm.name} registered successfully!`);
      await fetchData(); // Refresh patient list
    } catch (err) {
      setRegError(err instanceof Error ? err.message : "Registration failed. Try again.");
    } finally {
      setRegLoading(false);
    }
  };

  // ─── Sync Now ────────────────────────────────────────────────────
  const handleSync = async () => {
    if (!ashaId || !isOnline) {
      showToast("Cannot sync while offline.");
      return;
    }
    setSyncing(true);
    try {
      // 1. Send all local queued registrations first
      let localSuccess = true;
      const localSyncQueueStr = localStorage.getItem("asha_sync_queue");
      const localSyncQueue = localSyncQueueStr ? JSON.parse(localSyncQueueStr) : [];
      if (localSyncQueue.length > 0) {
        showToast("Syncing offline records...");
        const res = await fetch("/api/sync/asha-batch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ashaWorkerId: ashaId,
            campId: "OFFLINE_SYNC",
            campDate: new Date().toISOString(),
            // Remove the internal _localId and village from the standard records block
            records: localSyncQueue.map((item: any) => {
              const { _localId, village, ...rest } = item;
              return { ...rest, village }; // Grouping allowed fields
            }),
          }),
        });
        const batchData = await res.json();
        if (batchData.success) {
          localStorage.removeItem("asha_sync_queue");
        } else {
          localSuccess = false;
        }
      }

      // 2. Trigger normal backend sync if needed
      const res = await fetch(`/api/asha/sync?ashaId=${ashaId}`, { method: "POST" });
      const data = await res.json();
      
      if (data.success && localSuccess) {
        showToast(`☁️ All records synced successfully!`);
        await fetchData();
      } else {
        showToast("Sync partially failed. Check logs.");
      }
    } catch {
      showToast("Network error during sync.");
    } finally {
      setSyncing(false);
    }
  };

  const handleProxyBook = async (patientId: string, patientName: string) => {
    try {
      showToast(`Booking proxy appointment for ${patientName}...`);
      // Use the known doctor ID for test environment
      const doctorId = "cmmnpw2cd0002f770mhrgdj2k";
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId, doctorId }),
      });
      if (!res.ok) throw new Error("Booking failed");
      showToast(`✅ Successfully booked teleconsultation for ${patientName}!`);
    } catch {
      showToast("❌ Failed to book appointment. Please try again.");
    }
  };

  if (!ashaId || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background-light dark:bg-background-dark">
      {/* Toast */}
      {toast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-5 py-2.5 rounded-full shadow-2xl z-[100] flex items-center gap-2 max-w-sm text-center text-sm font-medium">
          {toast}
        </div>
      )}

      {/* Registration Modal */}
      {showRegModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Register New Patient</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isOnline ? "Data saved directly to GraamSehat DB" : "Offline mode: Data will be queued locally"}
                </p>
              </div>
              <button onClick={() => { setShowRegModal(false); setRegError(""); }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                <span className="material-symbols-outlined text-slate-500">close</span>
              </button>
            </div>

            <form onSubmit={handleRegister} className="p-6 space-y-4">
              {regError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                  {regError}
                </div>
              )}

              {/* Patient Name */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Patient Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={regForm.name}
                  onChange={(e) => setRegForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Full name"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-asha/20 focus:border-asha"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Phone */}
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Phone</label>
                  <input
                    type="tel"
                    value={regForm.phone}
                    onChange={(e) => setRegForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, "") }))}
                    placeholder="10 digits"
                    maxLength={10}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-asha/20 focus:border-asha"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Gender</label>
                  <select
                    value={regForm.gender}
                    onChange={(e) => setRegForm((f) => ({ ...f, gender: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none"
                  >
                    <option value="">—</option>
                    <option>Female</option>
                    <option>Male</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Village */}
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Village</label>
                  <select
                    value={regForm.village}
                    onChange={(e) => setRegForm((f) => ({ ...f, village: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none"
                  >
                    <option value="">Select village</option>
                    {(profile?.villages ?? []).map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>

                {/* Blood Group */}
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Blood Group</label>
                  <select
                    value={regForm.bloodGroup}
                    onChange={(e) => setRegForm((f) => ({ ...f, bloodGroup: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none"
                  >
                    <option value="">Unknown</option>
                    {BLOOD_GROUPS.filter((g) => g !== "Unknown").map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date of Birth */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Date of Birth</label>
                <input
                  type="date"
                  value={regForm.dateOfBirth}
                  onChange={(e) => setRegForm((f) => ({ ...f, dateOfBirth: e.target.value }))}
                  max={new Date().toISOString().split("T")[0]}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowRegModal(false); setRegError(""); }}
                  className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={regLoading || !regForm.name.trim()}
                  className="flex-1 py-3 rounded-xl bg-asha hover:opacity-90 text-white font-bold text-sm shadow-lg shadow-asha/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {regLoading
                    ? <><span className="material-symbols-outlined text-sm animate-spin">progress_activity</span> Saving...</>
                    : <><span className="material-symbols-outlined text-sm">person_add</span> Register Patient</>
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark px-6 py-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 text-asha">
            <span className="material-symbols-outlined text-3xl font-bold">health_and_safety</span>
            <h2 className="text-xl font-black leading-tight tracking-tight uppercase">GraamSehat ASHA</h2>
          </div>
          <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-2 w-80">
            <span className="material-symbols-outlined text-slate-500">search</span>
            <input className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-500 ml-2" placeholder="Search Patient ID or Name..." type="text" />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${isOnline ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"}`}>
            <span className="material-symbols-outlined text-sm">{isOnline ? "wifi" : "wifi_off"}</span>
            <span className="text-xs font-bold uppercase tracking-wider">{isOnline ? "Online" : "Offline"}</span>
          </div>
          <div className="size-10 rounded-full border-2 border-asha bg-asha/10 flex items-center justify-center text-asha font-bold">
            {profile?.name?.slice(0, 2).toUpperCase() ?? "AS"}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <nav className="w-24 md:w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark flex flex-col py-6">
          <div className="flex flex-col gap-2 px-3">
            {[
              { id: "dashboard", icon: "dashboard", label: "Dashboard" },
              { id: "patients", icon: "person_search", label: "Patients" },
              { id: "sync", icon: "sync", label: "Sync Queue" },
              { id: "resources", icon: "menu_book", label: "Resources" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className={`flex flex-col md:flex-row items-center gap-3 px-4 py-4 rounded-xl transition-all ${activeNav === item.id ? "bg-asha text-white shadow-lg shadow-asha/20" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <span className="text-xs md:text-sm font-bold">{item.label}</span>
              </button>
            ))}
          </div>

          <div className="mt-auto px-4 pb-4 space-y-3">
            <div className="hidden md:block px-2">
              <div className="flex justify-between items-end mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Sync Queue</span>
                <span className="text-xs font-black text-asha">{syncQueue.length} pending</span>
              </div>
              <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-asha transition-all" style={{ width: syncQueue.length === 0 ? "100%" : "40%" }} />
              </div>
              <p className="text-[10px] mt-2 text-slate-400">
                {profile?.lastSync ? `Last sync: ${new Date(profile.lastSync).toLocaleDateString("en-IN")}` : "Never synced"}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm font-bold"
            >
              <span className="material-symbols-outlined text-lg">logout</span>
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>

        </nav>

        {/* Main */}
        <main className="flex-1 overflow-y-auto p-6 bg-background-light dark:bg-background-dark">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-asha" />
            </div>
          ) : (
            <>
              {/* Page Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                  <h1 className="text-3xl font-black text-slate-900 dark:text-white">
                    {activeNav === "dashboard" ? "Village Dashboard" : activeNav === "patients" ? "Patient List" : activeNav === "sync" ? "Sync Queue" : "Education Resources"}
                  </h1>
                  <p className="text-slate-500 dark:text-slate-400">
                    {profile ? `${profile.name} · ${profile.villages.join(", ")} · ${profile.district}` : "Loading..."}
                  </p>
                </div>
                {activeNav === "dashboard" && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowRegModal(true)}
                      className="flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-bold shadow-md active:scale-95 transition-transform"
                    >
                      <span className="material-symbols-outlined">add_circle</span> New Registration
                    </button>
                    <button
                      onClick={handleSync}
                      disabled={syncing}
                      className="flex items-center gap-2 px-6 py-3 bg-asha text-white rounded-xl font-bold shadow-lg shadow-asha/30 active:scale-95 transition-transform disabled:opacity-70"
                    >
                      <span className={`material-symbols-outlined ${syncing ? "animate-spin" : ""}`}>sync</span>
                      {syncing ? "Syncing..." : "Sync Now"}
                    </button>
                  </div>
                )}
              </div>

              {/* Dashboard View */}
              {activeNav === "dashboard" && (
                <>
                  {/* Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {[
                      { label: "Registered Patients", value: patients.length.toString(), suffix: "In your villages" },
                      { label: "Pending Sync", value: syncQueue.length.toString(), suffix: "Offline records", suffixColor: syncQueue.length > 0 ? "text-amber-500" : "text-green-500" },
                      { label: "Total Camps", value: profile?.totalCamps?.toString() ?? "0", suffix: "Organized" },
                    ].map((stat) => (
                      <div key={stat.label} className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                        <p className="text-sm font-bold text-slate-500 uppercase mb-1">{stat.label}</p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl font-black text-asha">{stat.value}</span>
                          <span className={`text-sm font-medium ${stat.suffixColor ?? "text-slate-400"}`}>{stat.suffix}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Patients Table */}
                  <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden mb-8">
                    <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800">
                      <h3 className="font-bold text-slate-900 dark:text-white">Registered Villagers</h3>
                      <span className="text-xs text-slate-400">{patients.length} patients</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="text-slate-400 text-xs font-bold uppercase tracking-widest border-b border-slate-100 dark:border-slate-700">
                            <th className="px-6 py-4">Patient</th>
                            <th className="px-6 py-4">Village</th>
                            <th className="px-6 py-4">Blood Group</th>
                            <th className="px-6 py-4">Allergies</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                          {patients.length === 0 ? (
                            <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-400 text-sm">
                              No patients registered in your villages yet. Click &quot;New Registration&quot; to add one.
                            </td></tr>
                          ) : (
                            patients.map((p) => (
                              <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-full flex items-center justify-center font-bold bg-asha/10 text-asha">
                                      {p.name.slice(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                      <p className="font-bold text-slate-900 dark:text-white">{p.name}</p>
                                      <p className="text-xs text-slate-500">{p.gender ?? "—"} · {p.phone ?? "No phone"}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-500">{p.village ?? "—"}</td>
                                <td className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">{p.bloodGroup ?? "Unknown"}</td>
                                <td className="px-6 py-4">
                                  {p.allergies.length > 0 ? (
                                    <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">{p.allergies.join(", ")}</span>
                                  ) : <span className="text-xs text-slate-400">None</span>}
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <button
                                    onClick={() => handleProxyBook(p.id, p.name)}
                                    className="px-4 py-2 bg-asha/10 hover:bg-asha text-asha hover:text-white rounded-lg text-xs font-bold transition-all"
                                  >
                                    Proxy Book
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}

              {/* Sync Queue View */}
              {activeNav === "sync" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-slate-500 text-sm">{syncQueue.length === 0 ? "All records synced!" : `${syncQueue.length} item(s) pending sync`}</p>
                    <button
                      onClick={handleSync}
                      disabled={syncing || syncQueue.length === 0}
                      className="flex items-center gap-2 px-5 py-2.5 bg-asha text-white rounded-xl font-bold text-sm shadow disabled:opacity-50 transition-all"
                    >
                      <span className={`material-symbols-outlined text-sm ${syncing ? "animate-spin" : ""}`}>sync</span>
                      {syncing ? "Syncing..." : "Sync All"}
                    </button>
                  </div>
                  <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    {syncQueue.length === 0 ? (
                      <div className="py-12 text-center">
                        <span className="material-symbols-outlined text-4xl text-green-500 mb-3 block">cloud_done</span>
                        <p className="text-slate-500 text-sm">All records have been synced to GraamSehat!</p>
                        <p className="text-xs text-slate-400 mt-1">
                          {profile?.lastSync ? `Last sync: ${new Date(profile.lastSync).toLocaleString("en-IN")}` : ""}
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100 dark:divide-slate-700">
                        {syncQueue.map((item) => (
                          <div key={item.id} className="p-4 flex items-center justify-between">
                            <div>
                              <p className="font-bold text-slate-800 dark:text-slate-200">{item.type}</p>
                              <p className="text-xs text-slate-400">{new Date(item.createdAt).toLocaleString("en-IN")}</p>
                            </div>
                            <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-lg">PENDING</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Patients View */}
              {activeNav === "patients" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {patients.length === 0 ? (
                    <div className="col-span-3 py-20 text-center text-slate-400">
                      <span className="material-symbols-outlined text-5xl mb-3 block">person_search</span>
                      <p>No patients in your villages yet.</p>
                      <button onClick={() => { setActiveNav("dashboard"); setShowRegModal(true); }} className="mt-4 px-5 py-2 bg-asha text-white rounded-xl text-sm font-bold">Register first patient</button>
                    </div>
                  ) : patients.map((p) => (
                    <div key={p.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="size-12 rounded-full bg-asha/10 text-asha flex items-center justify-center font-bold text-lg">{p.name.slice(0, 2).toUpperCase()}</div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{p.name}</p>
                          <p className="text-xs text-slate-400">{p.village ?? "—"} · {p.gender ?? "—"}</p>
                        </div>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between"><span className="text-slate-400">Blood Group</span><span className="font-bold">{p.bloodGroup ?? "Unknown"}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Phone</span><span className="font-medium">{p.phone ?? "—"}</span></div>
                        {p.allergies.length > 0 && (
                          <div className="flex justify-between items-start">
                            <span className="text-slate-400">Allergies</span>
                            <span className="text-red-600 font-bold text-xs text-right">{p.allergies.join(", ")}</span>
                          </div>
                        )}
                      </div>
                      <button onClick={() => handleProxyBook(p.id, p.name)} className="mt-4 w-full py-2 bg-asha/10 hover:bg-asha text-asha hover:text-white rounded-lg text-sm font-bold transition-all">
                        Proxy Book Appointment
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Resources View */}
              {activeNav === "resources" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: "Hygiene Basics", sub: "6 modules · Hindi/English", bg: "from-blue-500/20 to-blue-600/40" },
                    { label: "Maternal Nutrition", sub: "Video guide · 12 mins", bg: "from-green-500/20 to-green-600/40" },
                    { label: "Immunization Tracker", sub: "Interactive Tool", bg: "from-purple-500/20 to-purple-600/40" },
                    { label: "Download Offline", sub: "Available offline", bg: "from-slate-300/50 to-slate-400/30", isDashed: true },
                  ].map((card) => (
                    <button key={card.label} onClick={() => showToast(`Opening "${card.label}"...`)} className={`group relative overflow-hidden rounded-2xl aspect-[4/3] bg-gradient-to-br ${card.bg} border border-white/20 ${card.isDashed ? "border-dashed border-2 border-slate-300 dark:border-slate-600" : ""} cursor-pointer`}>
                      {card.isDashed ? (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-2">
                          <span className="material-symbols-outlined text-3xl">download</span>
                          <span className="font-bold text-xs">{card.label}</span>
                        </div>
                      ) : (
                        <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black/60 to-transparent group-hover:from-black/80 transition-all">
                          <h4 className="text-white font-bold text-sm">{card.label}</h4>
                          <p className="text-white/70 text-[10px]">{card.sub}</p>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
