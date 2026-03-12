"use client";

import { useState } from "react";
import Link from "next/link";

const upcomingAppointment = {
  month: "DEC",
  day: "24",
  title: "General Consultation",
  doctor: "Dr. Amit Verma",
  time: "10:30 AM",
  clinic: "Sewa Rural Clinic, Block B",
};

const recentRecords = [
  { icon: "lab_panel", color: "blue", title: "Blood Test Results", subtitle: "General Checkup • 12 Oct 2023" },
  { icon: "prescriptions", color: "green", title: "Prescription: Fever", subtitle: "Dr. Sharma • 05 Oct 2023" },
  { icon: "vaccines", color: "purple", title: "COVID-19 Vaccination", subtitle: "Dose 3 Certificate • 20 Sep 2023" },
];

const vitals = [
  { icon: "favorite", color: "text-red-500", label: "Heart Rate", value: "72", unit: "bpm" },
  { icon: "blood_pressure", color: "text-blue-500", label: "Blood Pressure", value: "120/80", unit: "mmHg" },
  { icon: "device_thermostat", color: "text-orange-500", label: "Temperature", value: "98.6", unit: "°F" },
];

export default function PatientDashboard() {
  const [activeTab, setActiveTab] = useState("home");

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark">
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
            <button className="flex items-center justify-center rounded-xl h-10 w-10 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-primary/10 hover:text-primary transition-all">
              <span className="material-symbols-outlined">notifications</span>
            </button>
          </div>
          <div className="h-10 w-10 rounded-full bg-primary/20 border-2 border-primary/30 flex items-center justify-center text-primary font-bold text-sm">RJ</div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-8">
        {/* Welcome */}
        <div className="flex flex-wrap justify-between items-end gap-4 mb-8">
          <div>
            <h1 className="text-slate-900 dark:text-white text-3xl font-bold tracking-tight">Namaste, Rajesh! 🙏</h1>
            <p className="text-slate-500 dark:text-slate-400 text-base mt-1">Your health is our priority today.</p>
          </div>
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex items-center gap-4 max-w-sm">
            <span className="material-symbols-outlined text-primary text-2xl">lightbulb</span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-primary">Health Tip</p>
              <p className="text-sm text-slate-700 dark:text-slate-300">Drink at least 3 liters of water today to stay hydrated.</p>
            </div>
          </div>
        </div>

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
                <button className="text-primary text-sm font-semibold hover:underline">View All</button>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentRecords.map((rec) => (
                  <div key={rec.title} className="p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`size-10 rounded-lg bg-${rec.color}-100 text-${rec.color}-600 flex items-center justify-center`}>
                        <span className="material-symbols-outlined">{rec.icon}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{rec.title}</p>
                        <p className="text-xs text-slate-500">{rec.subtitle}</p>
                      </div>
                    </div>
                    <button className="flex items-center gap-1 text-slate-400 hover:text-primary transition-colors">
                      <span className="material-symbols-outlined">download</span>
                      <span className="text-sm hidden sm:inline">Download</span>
                    </button>
                  </div>
                ))}
              </div>
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
                <div className="flex items-start gap-4 mb-6">
                  <div className="bg-white/20 p-3 rounded-lg flex flex-col items-center min-w-[60px]">
                    <span className="text-xs font-bold uppercase">{upcomingAppointment.month}</span>
                    <span className="text-2xl font-black">{upcomingAppointment.day}</span>
                  </div>
                  <div>
                    <p className="font-bold text-lg leading-tight">{upcomingAppointment.title}</p>
                    <p className="text-white/80 text-sm">{upcomingAppointment.doctor} • {upcomingAppointment.time}</p>
                    <p className="text-white/70 text-xs mt-1">{upcomingAppointment.clinic}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button className="flex-1 bg-white text-primary font-bold py-2 rounded-lg text-sm hover:bg-slate-100 transition-colors">Reschedule</button>
                  <button className="flex-1 bg-white/10 border border-white/30 text-white font-bold py-2 rounded-lg text-sm hover:bg-white/20 transition-colors">Cancel</button>
                </div>
              </div>
            </section>

            {/* Vitals */}
            <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
              <h3 className="text-slate-900 dark:text-white font-bold mb-4">Your Recent Vitals</h3>
              <div className="flex flex-col gap-4">
                {vitals.map((v) => (
                  <div key={v.label} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex items-center gap-3">
                      <span className={`material-symbols-outlined ${v.color}`}>{v.icon}</span>
                      <span className="text-sm font-medium">{v.label}</span>
                    </div>
                    <span className="font-bold">{v.value} <span className="text-xs font-normal text-slate-500">{v.unit}</span></span>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 text-primary text-sm font-bold flex items-center justify-center gap-1 hover:bg-primary/5 py-2 rounded-lg transition-colors">
                Add New Reading <span className="material-symbols-outlined text-sm">add</span>
              </button>
            </section>

            {/* Emergency */}
            <section className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="material-symbols-outlined text-red-600">emergency</span>
                <h3 className="text-red-900 dark:text-red-400 font-bold">Emergency Support</h3>
              </div>
              <p className="text-red-700 dark:text-red-300 text-sm mb-4">Instantly connect with an ambulance or on-duty medical staff.</p>
              <button className="w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition-colors shadow-md flex items-center justify-center gap-2">
                <span className="material-symbols-outlined">call</span> Call Ambulance (108)
              </button>
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
            <a className="hover:text-primary" href="#">Privacy Policy</a>
            <a className="hover:text-primary" href="#">Help Center</a>
          </div>
          <div className="text-sm text-slate-400">© 2024 GraamSehat.</div>
        </div>
      </footer>
    </div>
  );
}
