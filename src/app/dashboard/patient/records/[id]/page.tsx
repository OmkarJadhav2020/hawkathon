"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type HealthRecord = {
  id: string;
  type: string;
  title: string;
  description: string | null;
  fileUrl: string | null;
  doctorName: string | null;
  createdAt: string;
  patient: {
    id: string;
    name: string;
    village: string | null;
    bloodGroup: string | null;
    phone: string | null;
  };
};

const TYPE_META: Record<string, { label: string; icon: string; color: string }> = {
  LAB:          { label: "Lab Result",     icon: "biotech",         color: "bg-blue-100 text-blue-700 border-blue-200" },
  LAB_RESULT:   { label: "Lab Result",     icon: "biotech",         color: "bg-blue-100 text-blue-700 border-blue-200" },
  PRESCRIPTION: { label: "Prescription",   icon: "medication",      color: "bg-primary/10 text-primary border-primary/20" },
  VACCINATION:  { label: "Vaccination",    icon: "vaccines",        color: "bg-green-100 text-green-700 border-green-200" },
  GENERAL:      { label: "General",        icon: "description",     color: "bg-slate-100 text-slate-700 border-slate-200" },
};

export default function HealthRecordDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [record, setRecord] = useState<HealthRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");

  useEffect(() => {
    if (!id) { setNotFound(true); setLoading(false); return; }

    fetch(`/api/records?id=${id}`)
      .then(async (res) => {
        if (!res.ok) { setNotFound(true); return; }
        const data: HealthRecord = await res.json();
        setRecord(data);

        // Generate QR code with record summary
        const QRCode = (await import("qrcode")).default;
        const qrPayload = JSON.stringify({
          id: data.id.slice(-8).toUpperCase(),
          type: data.type,
          title: data.title,
          patient: data.patient.name,
          doctor: data.doctorName ?? "—",
          date: new Date(data.createdAt).toLocaleDateString("en-IN"),
        });
        const url = await QRCode.toDataURL(qrPayload, { width: 200, margin: 1 });
        setQrDataUrl(url);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  if (notFound || !record) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center p-8">
        <span translate="no" className="material-symbols-outlined text-6xl text-slate-300 notranslate">folder_off</span>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Record Not Found</h1>
        <p className="text-slate-500">This health record does not exist or may have been removed.</p>
        <Link href="/dashboard/patient/records" className="bg-primary text-white px-6 py-2 rounded-xl font-bold hover:opacity-90">
          Back to Records
        </Link>
      </div>
    );
  }

  const meta = TYPE_META[record.type] ?? TYPE_META.GENERAL;

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/patient/records" className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
              <span translate="no" className="material-symbols-outlined notranslate">arrow_back</span>
            </Link>
            <div className="bg-primary p-1.5 rounded-lg text-white">
              <span translate="no" className="material-symbols-outlined text-xl notranslate">folder_open</span>
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 dark:text-white leading-tight">Health Record</h1>
              <p className="text-[11px] text-slate-400">ID: {record.id.slice(-10).toUpperCase()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {record.fileUrl && (
              <a
                href={record.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-3 py-2 text-sm font-bold text-primary bg-primary/10 hover:bg-primary/20 rounded-xl transition-colors"
              >
                <span translate="no" className="material-symbols-outlined text-sm notranslate">download</span> Download
              </a>
            )}
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1 px-3 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              <span translate="no" className="material-symbols-outlined text-sm notranslate">print</span> Print
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Record Header */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl border ${meta.color}`}>
                  <span translate="no" className="material-symbols-outlined text-2xl notranslate">{meta.icon}</span>
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${meta.color}`}>
                      {meta.label}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(record.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">{record.title}</h2>
                  {record.doctorName && (
                    <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                      <span translate="no" className="material-symbols-outlined text-sm notranslate">stethoscope</span>
                      {record.doctorName}
                    </p>
                  )}
                </div>
              </div>

              {record.description && (
                <div className="mt-5 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Findings / Details</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {record.description}
                  </p>
                </div>
              )}
            </div>

            {/* Patient Info */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Patient</h3>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                  {record.patient.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{record.patient.name}</p>
                  <div className="flex flex-wrap gap-3 mt-1 text-sm text-slate-500">
                    {record.patient.village && <span>{record.patient.village}</span>}
                    {record.patient.bloodGroup && (
                      <span className="font-bold text-red-600">Blood: {record.patient.bloodGroup}</span>
                    )}
                    {record.patient.phone && (
                      <a href={`tel:${record.patient.phone}`} className="text-primary hover:underline">
                        {record.patient.phone}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="space-y-5">
            {/* QR Code */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 text-center">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Offline QR Card</h3>
              {qrDataUrl ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrDataUrl} alt="Record QR Code" className="w-40 h-40 mx-auto rounded-xl border-2 border-primary/20" />
                  <p className="text-[10px] text-slate-400 mt-2">Scan for offline access</p>
                  <a
                    href={qrDataUrl}
                    download={`record-${record.id.slice(-8)}.png`}
                    className="mt-2 inline-flex items-center gap-1 text-xs text-primary font-bold hover:underline"
                  >
                    <span translate="no" className="material-symbols-outlined text-sm notranslate">download</span> Save QR
                  </a>
                </>
              ) : (
                <div className="w-40 h-40 mx-auto rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 space-y-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Actions</h3>
              <Link
                href="/dashboard/patient/records"
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                <span translate="no" className="material-symbols-outlined text-primary notranslate">folder</span>
                All Records
              </Link>
              <Link
                href="/dashboard/patient"
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                <span translate="no" className="material-symbols-outlined text-primary notranslate">home</span>
                My Dashboard
              </Link>
              <Link
                href="/dashboard/patient/appointments"
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                <span translate="no" className="material-symbols-outlined text-primary notranslate">calendar_month</span>
                Book Appointment
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
