"use client";

import { useState } from "react";
import Link from "next/link";

// ─── Prescription data (will come from DB later) ─────────────────────────────
const PATIENT_PHONE = "+917767827080"; // ← put your verified Indian number here e.g. +919876543210
const medicines = [
  { icon: "pill", name: "Amoxicillin 500mg", quantity: "15 Capsules", dosage: "Take one capsule thrice a day after meals.", schedule: ["MORNING", "AFTERNOON", "NIGHT"], scheduleType: "fixed" },
  { icon: "vaccines", name: "Cough Relief Syrup", quantity: "1 Bottle (100ml)", dosage: "10ml only when coughing persists. Maximum 4 times daily.", schedule: ["SOS / As Needed"], scheduleType: "sos" },
];

const pharmacies = [
  { name: "City Life Medicos", distance: "1.2 km", hours: "Open 24/7", transport: "directions_walk", stock: "100% IN STOCK", stockColor: "bg-green-100 text-green-700" },
  { name: "Apollo Pharmacy", distance: "2.8 km", hours: "Closes 10:00 PM", transport: "directions_car", stock: "1 OUT OF STOCK", stockColor: "bg-yellow-100 text-yellow-700" },
];

export default function EPrescriptionPage() {
  const [smsStatus, setSmsStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const sendPrescriptionSMS = async () => {
    setSmsStatus("sending");
    try {
      const res = await fetch("/api/prescription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientPhone: PATIENT_PHONE,
          patientName: "Rajesh Kumar",
          doctorName: "Dr. Anjali Mehta",
          prescriptionId: "GS-88291-TX",
          medicines: medicines.map((m) => ({ name: m.name, dosage: m.dosage })),
          instructions: "Complete full antibiotic course. Drink warm fluids. Rest for 48 hrs.",
        }),
      });
      const data = await res.json();
      setSmsStatus(data.smsSent ? "sent" : "error");
    } catch {
      setSmsStatus("error");
    }
  };


  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark">
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
              <button className="flex items-center justify-center rounded-xl h-10 w-10 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors" onClick={() => window.print()}>
                <span className="material-symbols-outlined">print</span>
              </button>
              <button
                onClick={sendPrescriptionSMS}
                disabled={smsStatus === "sending" || smsStatus === "sent"}
                className={`flex items-center gap-2 rounded-xl h-10 px-4 text-sm font-bold transition-all disabled:opacity-70 ${smsStatus === "sent" ? "bg-green-600 text-white" :
                  smsStatus === "error" ? "bg-red-500 text-white" :
                    "bg-primary text-white hover:opacity-90"
                  }`}
              >
                <span className="material-symbols-outlined text-lg">
                  {smsStatus === "sending" ? "progress_activity" : smsStatus === "sent" ? "check_circle" : smsStatus === "error" ? "error" : "sms"}
                </span>
                <span>
                  {smsStatus === "sending" ? "Sending..." : smsStatus === "sent" ? "SMS Sent!" : smsStatus === "error" ? "Failed – Retry" : "Send SMS"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 mb-6 text-sm font-medium text-slate-500 dark:text-slate-400">
          <Link className="hover:text-primary" href="/dashboard/patient">Home</Link>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <a className="hover:text-primary" href="#">Consultations</a>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <span className="text-slate-900 dark:text-white">e-Prescription</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Prescription Document */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
              {/* Prescription Header */}
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start bg-slate-50/50 dark:bg-slate-800/30">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold uppercase tracking-widest text-primary">Official Medical Document</span>
                    <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">Verified</span>
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-1">Digital Prescription</h2>
                  <p className="text-slate-500 dark:text-slate-400 font-mono text-sm">Ref: GS-88291-TX | Date: Dec 24, 2024</p>
                </div>
                {/* QR placeholder */}
                <div className="w-24 h-24 bg-white p-1 border border-slate-200 rounded-lg shrink-0 flex items-center justify-center text-slate-300">
                  <span className="material-symbols-outlined text-4xl">qr_code</span>
                </div>
              </div>

              {/* Patient & Doctor */}
              <div className="p-8 grid grid-cols-2 gap-8 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h4 className="text-xs font-bold uppercase text-slate-400 mb-2">Patient Details</h4>
                  <p className="font-bold text-slate-900 dark:text-white">Rajesh Kumar</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Age: 34 | Gender: Male</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">ID: PAT-00912</p>
                </div>
                <div className="text-right">
                  <h4 className="text-xs font-bold uppercase text-slate-400 mb-2">Prescribing Doctor</h4>
                  <p className="font-bold text-slate-900 dark:text-white">Dr. Anjali Mehta</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">General Physician</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Reg No: 12345/ABC</p>
                </div>
              </div>

              {/* Diagnosis */}
              <div className="p-8 border-b border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold uppercase text-slate-400 mb-3">Diagnosis / Chief Complaints</h4>
                <p className="text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border-l-4 border-slate-300 dark:border-slate-600 italic text-sm">
                  "Patient presenting with persistent dry cough, seasonal allergies, and mild fatigue for 5 days."
                </p>
              </div>

              {/* Medicines */}
              <div className="p-8">
                <div className="flex items-center gap-2 mb-6">
                  <span className="material-symbols-outlined text-primary">medication</span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Prescribed Medication</h3>
                </div>
                <div className="space-y-6">
                  {medicines.map((med, i) => (
                    <div key={i}>
                      {i > 0 && <hr className="border-slate-100 dark:border-slate-800 mb-6" />}
                      <div className="flex gap-4">
                        <div className="bg-primary/10 text-primary w-10 h-10 rounded-full flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined">{med.icon}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <h4 className="font-bold text-slate-900 dark:text-white">{med.name}</h4>
                            <span className="text-slate-500 text-sm">{med.quantity}</span>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{med.dosage}</p>
                          <div className="flex gap-2 mt-2">
                            {med.schedule.map((s) => (
                              <span key={s} className={`px-2 py-1 rounded text-[10px] font-bold ${med.scheduleType === "sos" ? "bg-yellow-100 text-yellow-800 dark:text-yellow-400" : "bg-slate-100 dark:bg-slate-800"}`}>
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Instructions */}
                <div className="mt-10 p-4 bg-primary/5 rounded-xl border border-primary/10">
                  <h4 className="text-xs font-bold uppercase text-primary mb-2 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">info</span> Special Instructions
                  </h4>
                  <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1 list-disc ml-4">
                    <li>Drink plenty of warm fluids throughout the day.</li>
                    <li>Complete the full course of antibiotics even if symptoms improve.</li>
                    <li>Rest for at least 48 hours.</li>
                  </ul>
                </div>
              </div>

              {/* Signature */}
              <div className="p-8 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-end border-t border-slate-100 dark:border-slate-800">
                <div className="text-[10px] text-slate-400 max-w-xs">
                  This is a digitally signed document. No physical signature required. QR code can be scanned for verification.
                </div>
                <div className="text-center">
                  <div className="h-12 w-32 border-b border-slate-300 dark:border-slate-600 flex items-center justify-center italic text-primary font-medium">
                    Dr. Anjali Mehta
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-tighter">Digital Signature Hash: 7F2A...B901</p>
                </div>
              </div>
            </div>

            {/* SMS Status */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${smsStatus === "sent" ? "bg-green-100 text-green-600" : smsStatus === "error" ? "bg-red-100 text-red-500" : "bg-blue-100 dark:bg-blue-900/30 text-blue-600"}`}>
                  <span className="material-symbols-outlined">sms</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {smsStatus === "sent" ? `Prescription SMS sent to ${PATIENT_PHONE}` :
                      smsStatus === "sending" ? "Sending prescription SMS..." :
                        smsStatus === "error" ? "SMS delivery failed" :
                          "SMS not sent yet — click \"Send SMS\" above"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {smsStatus === "sent" ? `Sent at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : "Twilio powered delivery"}
                  </p>
                </div>
              </div>
              {smsStatus === "sent" && (
                <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">check_circle</span> Delivered
                </span>
              )}
              {smsStatus === "idle" && (
                <button onClick={sendPrescriptionSMS} className="text-xs font-bold text-primary hover:underline">Send Now</button>
              )}
            </div>
          </div>

          {/* Pharmacy View */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-yellow-50/50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800/30 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="material-symbols-outlined text-3xl text-yellow-600 dark:text-yellow-400">local_pharmacy</span>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Pharmacy Locator</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Find medicines at nearby stores</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-medium">All Meds Available</span>
                <span className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs px-3 py-1 rounded-full font-medium">Within 5km</span>
                <span className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs px-3 py-1 rounded-full font-medium">Home Delivery</span>
              </div>

              {/* Map placeholder */}
              <div className="relative w-full h-48 bg-slate-200 dark:bg-slate-800 rounded-lg overflow-hidden mb-6 border border-slate-300 dark:border-slate-700 flex items-center justify-center">
                <span className="material-symbols-outlined text-6xl text-slate-400">map</span>
                <div className="absolute bottom-3 right-3 bg-white dark:bg-slate-700 rounded-lg px-3 py-1.5 text-xs font-bold text-primary">
                  View on Map
                </div>
              </div>

              {/* Pharmacy List */}
              <div className="space-y-4">
                {pharmacies.map((ph) => (
                  <div key={ph.name} className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 hover:border-primary/30 transition-colors cursor-pointer group">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{ph.name}</h4>
                      <span className={`${ph.stockColor} text-[10px] px-2 py-0.5 rounded font-bold`}>{ph.stock}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-3">
                      <span className="material-symbols-outlined text-sm">{ph.transport}</span> {ph.distance} away • {ph.hours}
                    </p>
                    <div className="flex gap-2">
                      <button className="flex-1 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold py-2 rounded-lg">
                        {ph.stock.includes("OUT") ? "Check Alternatives" : "Order Pickup"}
                      </button>
                      <button className="w-10 bg-slate-100 dark:bg-slate-800 flex items-center justify-center rounded-lg">
                        <span className="material-symbols-outlined text-lg">call</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Home Delivery CTA */}
            <div className="p-6 bg-slate-900 dark:bg-primary/20 text-white rounded-xl shadow-lg">
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-yellow-400">delivery_dining</span> Free Home Delivery
              </h3>
              <p className="text-sm text-slate-300 mb-4">
                GraamSehat partners with local pharmacies for 2-hour delivery. Use code{" "}
                <span className="text-yellow-400 font-bold">HEALTH20</span> for 20% off.
              </p>
              <button className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary-dark transition-all shadow-md">
                Request Home Delivery
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
