"use client";

import { useState, useEffect } from "react";

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

export default function AshaWorkerDashboard() {
  const [activeNav, setActiveNav] = useState("dashboard");
  const [profile, setProfile] = useState<AshaProfile | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [syncQueue, setSyncQueue] = useState<SyncItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  // In production: from session. This is the ASHA user ID from the seed.
  const ashaId = typeof window !== "undefined" ? localStorage.getItem("ashaId") ?? "cmmnpw2cg0004f770h6cnyckp" : "cmmnpw2cg0004f770h6cnyckp";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/asha?ashaId=${ashaId}`);
        if (!res.ok) throw new Error("API error");
        const data = await res.json();
        setProfile(data.profile);
        setPatients(data.patients ?? []);
        setSyncQueue(data.syncQueue ?? []);
      } catch {
        console.error("Failed to fetch ASHA data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [ashaId]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background-light dark:bg-background-dark">
      {toast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-5 py-2.5 rounded-full shadow-2xl z-50 flex items-center gap-2">
          <span className="material-symbols-outlined text-green-400">check_circle</span>
          <span className="font-medium text-sm">{toast}</span>
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
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${profile?.isOnline ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"}`}>
            <span className="material-symbols-outlined text-sm">{profile?.isOnline ? "cloud_done" : "cloud_off"}</span>
            <span className="text-xs font-bold uppercase tracking-wider">{profile?.isOnline ? "Online" : "Offline"}</span>
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

          <div className="mt-auto px-6 py-4">
            <div className="hidden md:block">
              <div className="flex justify-between items-end mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Sync Queue</span>
                <span className="text-xs font-black text-asha">{syncQueue.length} pending</span>
              </div>
              <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-asha transition-all" style={{ width: syncQueue.length === 0 ? "100%" : "60%" }} />
              </div>
              <p className="text-[10px] mt-2 text-slate-400">
                {profile?.lastSync ? `Last sync: ${profile.lastSync ? new Date(profile.lastSync).toLocaleDateString() : "Never"}` : "Never synced"}
              </p>
            </div>
          </div>
        </nav>

        {/* Main */}
        <main className="flex-1 overflow-y-auto p-6 bg-background-light dark:bg-background-dark">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-asha"></div>
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
                    <button onClick={() => showToast("Opening new patient registration form...")} className="flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-bold shadow-md active:scale-95 transition-transform">
                      <span className="material-symbols-outlined">add_circle</span> New Registration
                    </button>
                    <button onClick={() => showToast("Syncing to GraamSehat servers...")} className="flex items-center gap-2 px-6 py-3 bg-asha text-white rounded-xl font-bold shadow-lg shadow-asha/30 active:scale-95 transition-transform">
                      <span className="material-symbols-outlined">sync</span> Sync Now
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
                      { label: "Pending Sync", value: syncQueue.length.toString(), suffix: "Offline records", suffixColor: "text-amber-500" },
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
                            <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-400 text-sm">No patients registered in your villages yet.</td></tr>
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
                                  <button onClick={() => showToast(`Booking proxy appointment for ${p.name}...`)} className="px-4 py-2 bg-asha/10 hover:bg-asha text-asha hover:text-white rounded-lg text-xs font-bold transition-all">
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
                <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="font-bold text-slate-900 dark:text-white">Pending Offline Sync ({syncQueue.length} items)</h3>
                  </div>
                  {syncQueue.length === 0 ? (
                    <div className="py-12 text-center">
                      <span className="material-symbols-outlined text-4xl text-green-500 mb-3 block">cloud_done</span>
                      <p className="text-slate-500 text-sm">All records have been synced!</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-700">
                      {syncQueue.map((item) => (
                        <div key={item.id} className="p-4 flex items-center justify-between">
                          <div>
                            <p className="font-bold text-slate-800 dark:text-slate-200">{item.type}</p>
                            <p className="text-xs text-slate-400">{new Date(item.createdAt).toLocaleString()}</p>
                          </div>
                          <button onClick={() => showToast("Item synced to server!")} className="text-xs font-bold text-asha border border-asha/20 hover:bg-asha/5 px-3 py-1.5 rounded-lg transition-all">Sync Now</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Patients View */}
              {activeNav === "patients" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {patients.map((p) => (
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
                      <button onClick={() => showToast(`Booking proxy appointment for ${p.name}...`)} className="mt-4 w-full py-2 bg-asha/10 hover:bg-asha text-asha hover:text-white rounded-lg text-sm font-bold transition-all">
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
