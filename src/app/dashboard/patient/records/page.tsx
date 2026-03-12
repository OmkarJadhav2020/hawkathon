"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import QRCode from "qrcode";

type Patient = {
  id: string;
  name: string;
  bloodGroup: string | null;
  allergies: string[];
  gender: string | null;
  dateOfBirth: string | null;
  village: string | null;
  phone: string | null;
};

type HealthRecord = {
  id: string;
  type: string;
  title: string;
  description: string | null;
  fileUrl: string | null;
  doctorName: string | null;
  createdAt: string;
  syncStatus: string;
};

type Consultation = {
  id: string;
  createdAt: string;
  symptoms: string[];
  connectionMode: string | null;
  doctor: { name: string } | null;
  prescription: { id: string } | null;
};

const TYPE_COLORS: Record<string, string> = {
  LAB_RESULT: "bg-blue-50 text-blue-700 border-blue-100",
  PRESCRIPTION: "bg-purple-50 text-purple-700 border-purple-100",
  VACCINATION: "bg-green-50 text-green-700 border-green-100",
  VITAL: "bg-amber-50 text-amber-700 border-amber-100",
  GENERAL: "bg-slate-50 text-slate-700 border-slate-100",
};

const TYPE_ICONS: Record<string, string> = {
  LAB_RESULT: "biotech",
  PRESCRIPTION: "medication",
  VACCINATION: "vaccines",
  VITAL: "monitor_heart",
  GENERAL: "description",
};

export default function HealthRecordsPage() {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") ?? "cmmnpw2c70000f7707prdd937" : "cmmnpw2c70000f7707prdd937";

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const res = await fetch(`/api/records?userId=${userId}`);
        if (!res.ok) throw new Error("Failed to fetch records");
        const data = await res.json();
        setPatient(data.patient);
        setHealthRecords(data.healthRecords || []);
        setConsultations(data.consultations || []);

        // Generate QR code from patient data (offline-accessible summary)
        if (data.patient) {
          const qrPayload = JSON.stringify({
            id: data.patient.id,
            name: data.patient.name,
            bloodGroup: data.patient.bloodGroup,
            allergies: data.patient.allergies,
            village: data.patient.village,
            phone: data.patient.phone,
          });
          const url = await QRCode.toDataURL(qrPayload, { width: 160, margin: 1 });
          setQrDataUrl(url);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, [userId]);

  const filteredConsultations = consultations.filter((c) =>
    c.doctor?.name.toLowerCase().includes(search.toLowerCase()) ||
    c.symptoms.some((s) => s.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-1.5 rounded-lg"><span className="material-symbols-outlined text-white text-2xl">health_and_safety</span></div>
            <span className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">GraamSehat</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <Link className="text-sm font-medium text-slate-500 hover:text-primary transition-colors" href="/dashboard/patient">Home</Link>
            <Link className="text-sm font-medium text-slate-500 hover:text-primary transition-colors" href="/dashboard/patient/appointments">Appointments</Link>
            <a className="text-sm font-semibold text-primary border-b-2 border-primary py-5" href="#">Records</a>
          </nav>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 border-2 border-primary/30 flex items-center justify-center text-primary font-bold text-sm">
              {patient?.name?.slice(0, 2).toUpperCase() ?? "PT"}
            </div>
          </div>
        </div>
      </header>

      {/* Page Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/patient" className="flex items-center justify-center w-10 h-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm">
              <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">arrow_back</span>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Health Records</h1>
              <p className="text-slate-500 text-sm">{patient?.name} • <span className="font-mono">ID: {patient?.id?.slice(-8).toUpperCase()}</span></p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => window.print()} className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">picture_as_pdf</span> Export PDF
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* QR Health Card + Conditions */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
          {/* QR Card */}
          <section className="md:col-span-7 bg-gradient-to-br from-slate-50 to-emerald-50/40 dark:from-slate-900 dark:to-emerald-900/10 border border-primary/20 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-primary font-bold text-lg">GraamSehat Health Card</h2>
                <span className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 uppercase tracking-wider">
                  Offline accessible
                </span>
              </div>
              <span className="material-symbols-outlined text-primary/40 text-4xl">contactless</span>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-6 items-start">
              {/* Real QR Code */}
              <div className="w-28 h-28 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 rounded-xl flex items-center justify-center shrink-0">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="Patient QR Code" className="w-24 h-24" />
                ) : (
                  <span className="material-symbols-outlined text-primary text-4xl">qr_code_2</span>
                )}
              </div>
              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 flex-1">
                {[
                  { label: "Patient Name", value: patient?.name ?? "—" },
                  { label: "Gender", value: patient?.gender ?? "—" },
                  { label: "Blood Group", value: patient?.bloodGroup ?? "—" },
                  { label: "Known Allergies", value: patient?.allergies?.join(", ") || "None", alert: true },
                  { label: "Patient ID", value: patient?.id?.slice(-12).toUpperCase() ?? "—", mono: true },
                ].map((item) => (
                  <div key={item.label} className={item.label === "Patient ID" ? "col-span-2" : ""}>
                    <p className="text-[10px] uppercase text-slate-400 font-semibold">{item.label}</p>
                    <p className={`text-sm font-bold ${item.alert && patient?.allergies?.length ? "text-red-600" : item.mono ? "text-xs font-mono text-slate-600 dark:text-slate-300" : "text-slate-700 dark:text-slate-200"}`}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-200/60 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button onClick={() => {
                  if (qrDataUrl) {
                    const link = document.createElement("a");
                    link.href = qrDataUrl;
                    link.download = `graamsehat-card-${patient?.id}.png`;
                    link.click();
                  }
                }} className="bg-primary hover:opacity-90 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">download</span> Save to Phone
                </button>
                <button onClick={() => window.print()} className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 px-4 py-2 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 transition-colors shadow-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">print</span> Print
                </button>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-base">check_circle</span>
                <span className="text-xs text-slate-500 font-medium">Scan at any clinic without internet</span>
              </div>
            </div>
          </section>

          {/* Allergies & Info */}
          <section className="md:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-slate-400">clinical_notes</span> Patient Info
            </h2>
            <div className="space-y-3 mb-6">
              {[
                { label: "Village", value: patient?.village || "—" },
                { label: "Blood Group", value: patient?.bloodGroup || "—" },
                { label: "Phone", value: patient?.phone || "—" },
                { label: "Gender", value: patient?.gender || "—" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                  <p className="text-xs text-slate-500 font-medium">{item.label}</p>
                  <p className="font-semibold text-slate-700 dark:text-slate-200 text-sm">{item.value}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Allergies</h3>
              <div className="flex flex-wrap gap-2">
                {patient?.allergies?.length ? patient.allergies.map((a) => (
                  <span key={a} className="flex items-center gap-1 px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900 rounded-full text-xs font-bold">
                    <span className="material-symbols-outlined text-sm">warning</span> {a}
                  </span>
                )) : (
                  <span className="text-sm text-slate-400">No known allergies</span>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* Health Records */}
        {healthRecords.length > 0 && (
          <div className="mb-8">
            <h2 className="font-bold text-slate-800 dark:text-white text-lg mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-slate-400">folder_open</span> Documents & Lab Reports
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {healthRecords.map((rec) => (
                <Link
                  key={rec.id}
                  href={`/dashboard/patient/records/${rec.id}`}
                  className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 flex gap-4 items-start hover:border-primary/40 hover:shadow-md transition-all group cursor-pointer"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${TYPE_COLORS[rec.type] ?? TYPE_COLORS.GENERAL}`}>
                    <span className="material-symbols-outlined text-lg">{TYPE_ICONS[rec.type] ?? "description"}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 dark:text-white text-sm truncate group-hover:text-primary transition-colors">{rec.title}</p>
                    {rec.description && <p className="text-xs text-slate-500 mt-0.5 truncate">{rec.description}</p>}
                    {rec.doctorName && <p className="text-xs text-slate-400 mt-1">By {rec.doctorName}</p>}
                    <p className="text-[10px] text-slate-400 mt-1">{format(new Date(rec.createdAt), "dd MMM yyyy")}</p>
                  </div>
                  <span className="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors text-lg shrink-0">chevron_right</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Consultation History */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="font-bold text-slate-800 dark:text-white text-lg">Consultation History</h2>
            <div className="relative max-w-xs w-full">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
              <input
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-primary outline-none transition-all"
                placeholder="Search records..."
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            {filteredConsultations.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm">
                {search ? "No records match your search." : "No past consultations found."}
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-700 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Doctor</th>
                    <th className="px-6 py-4">Symptoms</th>
                    <th className="px-6 py-4">Mode</th>
                    <th className="px-6 py-4 text-right">Prescription</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredConsultations.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-400">{format(new Date(row.createdAt), "dd MMM yyyy")}</td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-800 dark:text-slate-200">{row.doctor?.name ?? "—"}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{row.symptoms?.slice(0, 2).join(", ") || "—"}</td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{row.connectionMode ?? "N/A"}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {row.prescription ? (
                          <Link href={`/dashboard/prescription?consultId=${row.id}`} className="text-xs font-bold text-primary hover:text-primary-dark border border-primary/20 hover:bg-primary/5 px-3 py-1.5 rounded-lg transition-all">
                            View Rx
                          </Link>
                        ) : <span className="text-slate-300 text-xs">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
