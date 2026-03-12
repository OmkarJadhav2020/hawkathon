"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

type Medicine = {
  name: string;
  dosage: string;
  frequency?: string;
  days?: number;
  quantity?: string;
};

type Prescription = {
  id: string;
  doctorName: string;
  diagnosis: string;
  instructions: string;
  createdAt: string;
  medicines: Medicine[];
  smsDelivered: boolean;
  smsPhone: string | null;
  consultation?: {
    patient: {
      name: string;
      phone: string | null;
      village: string | null;
      bloodGroup: string | null;
    };
  } | null;
};

function PrescriptionContent() {
  const searchParams = useSearchParams();
  const consultId = searchParams.get("consultId");
  const prescriptionId = searchParams.get("id");

  const [rx, setRx] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [smsStatus, setSmsStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const fetchPrescription = useCallback(async () => {
    try {
      const param = prescriptionId ? `id=${prescriptionId}` : `consultId=${consultId}`;
      const res = await fetch(`/api/prescription?${param}`);
      if (!res.ok) { setNotFound(true); return; }
      const data: Prescription = await res.json();
      setRx(data);

      // Generate QR code from prescription data
      const QRCode = (await import("qrcode")).default;
      const qrPayload = JSON.stringify({
        rx: data.id,
        patient: data.consultation?.patient?.name ?? "Patient",
        doctor: data.doctorName,
        diagnosis: data.diagnosis,
        meds: data.medicines.map((m) => m.name).join(", "),
        issued: new Date(data.createdAt).toLocaleDateString("en-IN"),
      });
      const url = await QRCode.toDataURL(qrPayload, { width: 220, margin: 2 });
      setQrDataUrl(url);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [prescriptionId, consultId]);

  useEffect(() => { fetchPrescription(); }, [fetchPrescription]);

  const sendPrescriptionSMS = async () => {
    if (!rx) return;
    setSmsStatus("sending");
    try {
      const res = await fetch("/api/prescription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientPhone: rx.consultation?.patient?.phone ?? rx.smsPhone,
          patientName: rx.consultation?.patient?.name ?? "Patient",
          doctorName: rx.doctorName,
          prescriptionId: rx.id,
          medicines: rx.medicines,
          instructions: rx.instructions,
        }),
      });
      const data = await res.json();
      setSmsStatus(data.smsSent ? "sent" : "error");
      if (!data.smsSent) showToast("Twilio not configured — SMS logged to console.");
    } catch {
      setSmsStatus("error");
    }
  };

  const handleDownload = () => {
    if (qrDataUrl) {
      const a = document.createElement("a");
      a.href = qrDataUrl;
      a.download = `prescription-${rx?.id ?? "rx"}.png`;
      a.click();
    } else {
      window.print();
    }
  };

  const handleShare = async () => {
    const text = `GraamSehat Prescription — ${rx?.diagnosis ?? ""}\nMedicines: ${rx?.medicines?.map(m => m.name).join(", ") ?? ""}\nDoctor: ${rx?.doctorName ?? ""}`;
    if (navigator.share) {
      await navigator.share({ title: "GraamSehat Prescription", text });
    } else {
      await navigator.clipboard.writeText(text);
      showToast("Prescription details copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (notFound || !rx) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center p-8">
        <span className="material-symbols-outlined text-6xl text-slate-300">receipt_long</span>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Prescription Not Found</h1>
        <p className="text-slate-500">This prescription may not exist or has been removed.</p>
        <Link href="/dashboard/patient" className="bg-primary text-white px-6 py-2 rounded-xl font-bold hover:opacity-90">
          Go to Dashboard
        </Link>
      </div>
    );
  }

  const patient = rx.consultation?.patient;

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark">
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl z-[100] flex items-center gap-2">
          <span className="material-symbols-outlined text-green-400">check_circle</span>
          <span className="font-medium text-sm">{toast}</span>
        </div>
      )}

      {/* Header */}
      <header className="w-full border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link href="/dashboard/patient" className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
                <span className="material-symbols-outlined">arrow_back</span>
              </Link>
              <div className="bg-primary p-1.5 rounded-lg text-white">
                <span className="material-symbols-outlined text-2xl">medical_services</span>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">GraamSehat</h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                className="flex items-center justify-center rounded-xl h-10 w-10 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors"
                onClick={() => window.print()}
                title="Print"
              >
                <span className="material-symbols-outlined">print</span>
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center justify-center rounded-xl h-10 w-10 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors"
                title="Download"
              >
                <span className="material-symbols-outlined">download</span>
              </button>
              <button
                onClick={handleShare}
                className="flex items-center justify-center rounded-xl h-10 w-10 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors"
                title="Share"
              >
                <span className="material-symbols-outlined">share</span>
              </button>
              <button
                onClick={sendPrescriptionSMS}
                disabled={smsStatus === "sending" || smsStatus === "sent"}
                className={`flex items-center gap-2 rounded-xl h-10 px-4 text-sm font-bold transition-all disabled:opacity-70 ${
                  smsStatus === "sent" ? "bg-green-600 text-white" :
                  smsStatus === "error" ? "bg-red-500 text-white" :
                  "bg-primary text-white hover:opacity-90"
                }`}
              >
                <span className="material-symbols-outlined text-lg">
                  {smsStatus === "sending" ? "progress_activity" : smsStatus === "sent" ? "check_circle" : smsStatus === "error" ? "error" : "sms"}
                </span>
                <span>{smsStatus === "sending" ? "Sending..." : smsStatus === "sent" ? "SMS Sent!" : smsStatus === "error" ? "Failed – Retry" : "Send SMS"}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Prescription Header */}
        <div className="flex flex-col md:flex-row justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-bold px-3 py-1 uppercase tracking-wider">e-Prescription</span>
              <span className="text-xs text-slate-400 font-medium">ID: {rx.id.slice(-10).toUpperCase()}</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{rx.diagnosis}</h2>
            <p className="text-slate-500 mt-1">Prescribed by <strong>{rx.doctorName}</strong> · {new Date(rx.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
          </div>
          {qrDataUrl ? (
            <div className="flex flex-col items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrDataUrl} alt="Prescription QR Code" className="w-28 h-28 rounded-xl border-2 border-primary/20 shadow-sm" />
              <p className="text-[10px] text-slate-400 mt-1">Scan for offline access</p>
            </div>
          ) : null}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Medicines */}
          <div className="lg:col-span-2 space-y-6">
            {/* Patient Info */}
            {patient && (
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
                <h3 className="font-bold text-slate-700 dark:text-slate-300 text-xs uppercase tracking-widest mb-3">Patient</h3>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                    {patient.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{patient.name}</p>
                    <p className="text-sm text-slate-500">{patient.village ?? "—"} · Blood Group: <strong>{patient.bloodGroup ?? "Unknown"}</strong></p>
                    {patient.phone && <p className="text-sm text-slate-400">{patient.phone}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Medicines */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
              <h3 className="font-bold text-slate-700 dark:text-slate-300 text-xs uppercase tracking-widest mb-4">Prescribed Medicines</h3>
              <div className="space-y-4">
                {(Array.isArray(rx.medicines) ? rx.medicines : []).map((med, i) => (
                  <div key={i} className="flex gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                    <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined">pill</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <p className="font-bold text-slate-900 dark:text-white">{med.name}</p>
                        {med.quantity && (
                          <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">{med.quantity}</span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{med.dosage}</p>
                      {med.frequency && (
                        <div className="flex gap-2 mt-2">
                          {["Morning", "Afternoon", "Night"].map((t) => (
                            <span key={t} className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                              med.frequency === "TDS" || med.frequency === "BD"
                                ? "bg-primary/10 text-primary border-primary/20"
                                : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-transparent"
                            }`}>{t}</span>
                          ))}
                        </div>
                      )}
                      {med.days && (
                        <p className="text-[11px] text-slate-400 mt-1">Duration: {med.days} days</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Instructions */}
            {rx.instructions && (
              <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-amber-500 mt-0.5">info</span>
                  <div>
                    <h4 className="font-bold text-amber-800 dark:text-amber-300 text-sm mb-1">Doctor's Instructions</h4>
                    <p className="text-amber-700 dark:text-amber-400 text-sm leading-relaxed">{rx.instructions}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Pharmacy + QR */}
          <div className="space-y-4">
            {/* SMS status */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
              <h3 className="font-bold text-slate-700 dark:text-slate-300 text-xs uppercase tracking-widest mb-3">SMS Delivery</h3>
              <div className={`flex items-center gap-3 p-3 rounded-xl ${rx.smsDelivered ? "bg-green-50 border border-green-100" : "bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700"}`}>
                <span className={`material-symbols-outlined ${rx.smsDelivered ? "text-green-500" : "text-slate-400"}`}>
                  {rx.smsDelivered ? "check_circle" : "sms"}
                </span>
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {rx.smsDelivered ? "SMS Delivered" : "SMS Not Yet Sent"}
                  </p>
                  <p className="text-xs text-slate-500">{patient?.phone ?? rx.smsPhone ?? "No phone on file"}</p>
                </div>
              </div>
              <button
                onClick={sendPrescriptionSMS}
                disabled={smsStatus === "sending" || smsStatus === "sent"}
                className="mt-3 w-full bg-primary text-white font-bold py-2.5 rounded-xl text-sm hover:opacity-90 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">sms</span>
                {smsStatus === "sent" ? "SMS Sent!" : "Resend SMS"}
              </button>
            </div>

            {/* Nearby Pharmacy */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-slate-700 dark:text-slate-300 text-xs uppercase tracking-widest">Nearby Pharmacy</h3>
              </div>
              {/* OpenStreetMap embed — no API key */}
              <div className="relative h-36 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <iframe
                  title="Pharmacy Map"
                  src="https://www.openstreetmap.org/export/embed.html?bbox=76.1336%2C30.3569%2C76.1736%2C30.3969&layer=mapnik&marker=30.3769%2C76.1536"
                  className="w-full h-full border-0"
                  loading="lazy"
                />
              </div>
              <div className="p-4 space-y-3">
                {[
                  { name: "City Life Medicos", distance: "1.2 km", open: true, phone: "+911765501234" },
                  { name: "Jana Aushadhi Store", distance: "2.1 km", open: true, phone: "+919876000088" },
                ].map((pharmacy) => (
                  <div key={pharmacy.name} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{pharmacy.name}</p>
                      <p className="text-xs text-slate-400">{pharmacy.distance} · {pharmacy.open ? "Open now" : "Closed"}</p>
                    </div>
                    <div className="flex gap-2">
                      <a href={`tel:${pharmacy.phone}`} className="px-3 py-1.5 text-xs font-bold bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-all flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">call</span>
                        Call
                      </a>
                    </div>
                  </div>
                ))}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => showToast("Order placed! Pharmacy will prepare your medicines.")}
                    className="bg-primary text-white text-xs font-bold py-2 rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">shopping_bag</span>
                    Order Pickup
                  </button>
                  <button
                    onClick={() => showToast("Home delivery request sent! You'll receive a confirmation call.")}
                    className="border border-primary text-primary text-xs font-bold py-2 rounded-xl hover:bg-primary/5 transition-all flex items-center justify-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">local_shipping</span>
                    Home Delivery
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function EPrescriptionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    }>
      <PrescriptionContent />
    </Suspense>
  );
}
