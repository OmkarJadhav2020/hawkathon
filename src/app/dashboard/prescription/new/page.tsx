"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

function CreatePrescriptionContent() {

  const router = useRouter();
  const searchParams = useSearchParams();
  const consultId = searchParams.get("consultId");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [doctorName, setDoctorName] = useState("Dr. Doctor");
  const [patient, setPatient] = useState<{ id: string; name: string; age?: number; gender?: string; phone?: string } | null>(null);
  const [diagnosis, setDiagnosis] = useState("");
  const [instructions, setInstructions] = useState("Complete full course. Drink warm fluids. Rest for 48 hrs.");
  const [medicines, setMedicines] = useState([{ name: "", dosage: "", frequency: "TDS", days: "3" }]);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    // Read doctor name from localStorage
    if (typeof window !== "undefined") {
      const name = localStorage.getItem("userName");
      if (name) setDoctorName(name);
    }
  }, []);

  useEffect(() => {
    if (!consultId) { setLoading(false); return; }
    // Fetch consultation to get patient details
    fetch(`/api/consultations?id=${consultId}`)
      .then(res => res.json())
      .then(data => {
        if (data.patient) {
          setPatient({
            id: data.patient.id,
            name: data.patient.name,
            phone: data.patient.phone,
            gender: data.patient.gender,
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [consultId]);

  const addMedicine = () => setMedicines([...medicines, { name: "", dosage: "", frequency: "TDS", days: "3" }]);
  const updateMedicine = (index: number, field: keyof typeof medicines[0], value: string) => {
    const updated = [...medicines];
    updated[index][field] = value;
    setMedicines(updated);
  };
  const removeMedicine = (index: number) => setMedicines(medicines.filter((_, i) => i !== index));

  const issuePrescription = async () => {
    if (!consultId || !diagnosis.trim() || !medicines[0].name.trim()) {
      setToast("Diagnosis and at least one medicine required.");
      setTimeout(() => setToast(null), 3000);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/prescription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientPhone: patient?.phone ?? "",
          patientName: patient?.name ?? "Patient",
          doctorName,
          consultationId: consultId,
          diagnosis,
          medicines,
          instructions,
        }),
      });

      if (!res.ok) throw new Error("Failed");
      
      router.push(`/dashboard/prescription?consultId=${consultId}`);
    } catch {
      setToast("Failed to issue prescription. Try again.");
      setTimeout(() => setToast(null), 3000);
      setSaving(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark pb-20">
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl z-50 flex items-center gap-2">
          <span translate="no" className="material-symbols-outlined text-amber-400 notranslate">warning</span>
          <span className="font-medium text-sm">{toast}</span>
        </div>
      )}

      {/* Header */}
      <header className="w-full border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link href="/dashboard/doctor" className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
                <span translate="no" className="material-symbols-outlined notranslate">close</span>
              </Link>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">New Prescription</h1>
            </div>
            <button
              onClick={issuePrescription}
              disabled={saving}
              className="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {saving ? <span translate="no" className="material-symbols-outlined animate-spin notranslate">refresh</span> : <span translate="no" className="material-symbols-outlined notranslate">send</span>}
              {saving ? "Saving..." : "Issue & Send SMS"}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 mt-8 space-y-6">
        {/* Patient Block */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-lg">
            {patient?.name?.[0] ?? "P"}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{patient?.name ?? "Unknown Patient"}</h2>
            <p className="text-slate-500 text-sm">Consultation ID: {consultId ?? "None"}</p>
          </div>
        </div>

        {/* Diagnosis */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="font-bold text-slate-700 dark:text-slate-300 text-sm uppercase tracking-widest mb-4">Diagnosis</h2>
          <input
            type="text"
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            placeholder="e.g. Viral Pharyngitis"
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Medicines */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between flex-wrap gap-4 mb-4">
            <h2 className="font-bold text-slate-700 dark:text-slate-300 text-sm uppercase tracking-widest">Medicines (Rx)</h2>
            <Link href="/dashboard/pharmacy" target="_blank" className="text-primary text-sm font-bold flex items-center gap-1 hover:underline">
              <span translate="no" className="material-symbols-outlined text-sm notranslate">inventory</span> Check Local Stock
            </Link>
          </div>
          
          <div className="space-y-4">
            {medicines.map((med, i) => (
              <div key={i} className="flex flex-col md:flex-row gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 relative group">
                {medicines.length > 1 && (
                  <button onClick={() => removeMedicine(i)} className="absolute -top-2 -right-2 w-6 h-6 bg-red-100 text-red-500 rounded-full flex items-center justify-center md:opacity-0 group-hover:opacity-100 transition-opacity">
                    <span translate="no" className="material-symbols-outlined text-[14px] notranslate">close</span>
                  </button>
                )}
                <div className="flex-1 space-y-3">
                  <input
                    value={med.name}
                    onChange={(e) => updateMedicine(i, "name", e.target.value)}
                    placeholder="Medicine Name (e.g. Paracetamol 500mg)"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  />
                  <div className="flex gap-3">
                    <input
                      value={med.dosage}
                      onChange={(e) => updateMedicine(i, "dosage", e.target.value)}
                      placeholder="Dosage (e.g. 1 Tablet)"
                      className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                    />
                    <select
                      value={med.frequency}
                      onChange={(e) => updateMedicine(i, "frequency", e.target.value)}
                      className="w-24 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-2 text-sm focus:outline-none focus:border-primary"
                    >
                      <option value="OD">OD (1)</option>
                      <option value="BD">BD (2)</option>
                      <option value="TDS">TDS (3)</option>
                      <option value="SOS">SOS</option>
                    </select>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={med.days}
                        onChange={(e) => updateMedicine(i, "days", e.target.value)}
                        className="w-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-2 text-sm focus:outline-none focus:border-primary"
                      />
                      <span className="text-xs text-slate-500">Days</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button onClick={addMedicine} className="mt-4 w-full border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-500 font-bold py-3 rounded-xl hover:border-primary hover:text-primary transition-colors flex justify-center items-center gap-2">
            <span translate="no" className="material-symbols-outlined notranslate">add</span> Add Another Medicine
          </button>
        </div>

        {/* Instructions */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="font-bold text-slate-700 dark:text-slate-300 text-sm uppercase tracking-widest mb-4">Patient Instructions</h2>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            rows={3}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
          ></textarea>
        </div>

      </main>
    </div>
  );
}

export default function CreatePrescription() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    }>
      <CreatePrescriptionContent />
    </Suspense>
  );
}
