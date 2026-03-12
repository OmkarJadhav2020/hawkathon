"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

type ConnectionMode = "video" | "audio" | "text";
type Message = { from: "doctor" | "patient"; text: string; time: string };

const initialMessages: Message[] = [
  { from: "doctor", text: "Hello, how is the fever now?", time: "10:12 AM" },
  { from: "patient", text: "Better than yesterday, but I feel very weak today.", time: "10:13 AM" },
  { from: "doctor", text: "Are you taking the medicine after food?", time: "10:14 AM" },
  { from: "patient", text: "Yes doctor, strictly following that.", time: "10:14 AM" },
  { from: "doctor", text: "Good. I'm adding one more tablet for the weakness.", time: "10:15 AM" },
];

const medicines = [
  { name: "Paracetamol 500mg", dosage: "1 tab × 3 days (SOS)" },
  { name: "Cetirizine 10mg", dosage: "1 tab × 5 days (Night)" },
];

export default function ConsultationRoom() {
  const [mode, setMode] = useState<ConnectionMode>("video");
  const [bandwidth, setBandwidth] = useState(1.2);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputText, setInputText] = useState("");
  const [seconds, setSeconds] = useState(504);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [medsList, setMedsList] = useState(medicines);
  const chatRef = useRef<HTMLDivElement>(null);

  // Timer
  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // Simulate bandwidth fluctuation and adaptive mode switching
  useEffect(() => {
    const t = setInterval(() => {
      const newBw = parseFloat((Math.random() * 2 + 0.2).toFixed(1));
      setBandwidth(newBw);
      if (newBw < 0.3) setMode("text");
      else if (newBw < 0.8) setMode("audio");
      else setMode("video");
    }, 5000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => { chatRef.current?.scrollTo(0, chatRef.current.scrollHeight); }, [messages]);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600).toString().padStart(2, "0");
    const m = Math.floor((s % 3600) / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${h}:${m}:${sec}`;
  };

  const sendMessage = () => {
    if (!inputText.trim()) return;
    setMessages((prev) => [...prev, { from: "patient", text: inputText, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
    setInputText("");
  };

  const modeConfig = {
    video: { label: "HD Video", icon: "videocam", color: "text-primary bg-primary/10" },
    audio: { label: "Audio Only", icon: "mic", color: "text-amber-600 bg-amber-50" },
    text: { label: "Text Fallback", icon: "chat", color: "text-slate-600 bg-slate-100" },
  };

  const bwBars = [
    { h: "h-2", active: bandwidth >= 0.2 },
    { h: "h-3", active: bandwidth >= 0.5 },
    { h: "h-4", active: bandwidth >= 0.8 },
    { h: "h-5", active: bandwidth >= 1.2 },
  ];

  return (
    <div className="flex flex-col h-screen bg-background-light dark:bg-background-dark overflow-hidden">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 pr-6 border-r border-slate-200 dark:border-slate-700">
              <span className="material-symbols-outlined text-primary text-2xl">health_and_safety</span>
              <span className="text-lg font-bold tracking-tight">GraamSehat</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-slate-900 dark:text-white">Consultation in Progress</h1>
                <span className="bg-primary/10 text-primary border border-primary/20 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase">Active</span>
              </div>
              <p className="text-slate-500 text-sm">Dr. Arvind Sharma • <span className="font-mono">{formatTime(seconds)}</span></p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${modeConfig[mode].color}`}>
              <span className="material-symbols-outlined text-sm">{modeConfig[mode].icon}</span>
              {modeConfig[mode].label}
            </div>
            <div className="flex items-center gap-2 bg-red-50 text-red-600 border border-red-100 rounded-full px-3 py-1 text-xs font-bold">
              <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
              LIVE
            </div>
            <Link href="/dashboard/doctor" className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-xl flex items-center gap-2 transition-colors text-sm">
              <span className="material-symbols-outlined text-lg">call_end</span> End Call
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden max-w-7xl mx-auto w-full px-6 py-6 grid grid-cols-12 gap-6">
        {/* Left: Video + Bandwidth */}
        <section className="col-span-12 lg:col-span-7 flex flex-col gap-4">
          {/* Video Box */}
          <div className="relative aspect-video bg-slate-900 rounded-2xl overflow-hidden shadow-xl border border-slate-800">
            {mode === "video" ? (
              <>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                  <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mb-4 ring-2 ring-primary/40">
                    <span className="material-symbols-outlined text-5xl text-primary">person</span>
                  </div>
                  <h2 className="text-xl font-semibold">Dr. Arvind Sharma</h2>
                  <p className="text-slate-400 text-xs mt-1">Video connected • High Definition</p>
                </div>
                {/* PiP */}
                <div className="absolute bottom-5 right-5 w-36 h-24 bg-slate-800 rounded-xl border-2 border-slate-700 shadow-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-slate-400 text-2xl">person</span>
                  <span className="absolute bottom-1 left-2 text-[10px] text-white bg-black/40 px-1.5 py-0.5 rounded">You</span>
                </div>
              </>
            ) : mode === "audio" ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <div className="w-24 h-24 rounded-full bg-amber-500/20 flex items-center justify-center mb-4 ring-2 ring-amber-500/40">
                  <span className="material-symbols-outlined text-5xl text-amber-400">mic</span>
                </div>
                <h2 className="text-xl font-semibold">Audio Only Mode</h2>
                <p className="text-slate-400 text-xs mt-1">Low bandwidth detected — video paused to save connection</p>
              </div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <span className="material-symbols-outlined text-5xl text-slate-400 mb-3">chat</span>
                <h2 className="text-lg font-semibold text-slate-300">Very Low Bandwidth</h2>
                <p className="text-slate-500 text-xs mt-1">Use the chat panel on the right to continue consultation</p>
              </div>
            )}
            {/* Controls */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/30 backdrop-blur-md px-4 py-2 rounded-2xl">
              <button onClick={() => setIsMicOn((v) => !v)} className={`w-11 h-11 rounded-full flex items-center justify-center transition-all shadow-lg ${isMicOn ? "bg-white text-slate-700" : "bg-red-600 text-white"}`}>
                <span className="material-symbols-outlined">{isMicOn ? "mic" : "mic_off"}</span>
              </button>
              <button onClick={() => setIsCamOn((v) => !v)} className={`w-11 h-11 rounded-full flex items-center justify-center transition-all shadow-lg ${isCamOn ? "bg-white text-slate-700" : "bg-red-600 text-white"}`}>
                <span className="material-symbols-outlined">{isCamOn ? "videocam" : "videocam_off"}</span>
              </button>
              <button className="w-11 h-11 rounded-full bg-white text-slate-700 flex items-center justify-center shadow-lg">
                <span className="material-symbols-outlined">present_to_all</span>
              </button>
              <button className="w-11 h-11 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg">
                <span className="material-symbols-outlined">call_end</span>
              </button>
            </div>
          </div>

          {/* Bandwidth Monitor */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5 flex items-center justify-between shadow-sm">
            <div>
              <p className="font-bold text-slate-900 dark:text-white">Connection Quality</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {bandwidth >= 1.2 ? "Video active — excellent quality" : bandwidth >= 0.8 ? "Good connection — video may buffer" : bandwidth >= 0.3 ? "Low bandwidth — switched to audio only" : "Very low — falling back to text chat"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex gap-1 items-end h-6">
                {bwBars.map((b, i) => (
                  <div key={i} className={`w-1.5 rounded-sm ${b.h} ${b.active ? "bg-primary" : "bg-slate-200 dark:bg-slate-700"} transition-all`} />
                ))}
              </div>
              <span className={`text-sm font-bold ${bandwidth >= 0.8 ? "text-primary" : bandwidth >= 0.3 ? "text-amber-600" : "text-red-500"}`}>
                {bandwidth >= 0.8 ? "Good" : bandwidth >= 0.3 ? "Poor" : "Very Low"} • {bandwidth} Mbps
              </span>
            </div>
          </div>
        </section>

        {/* Right: Chat + Patient + Prescription */}
        <section className="col-span-12 lg:col-span-5 flex flex-col gap-4 overflow-hidden">
          {/* Chat */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col flex-1 min-h-0">
            <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white">Consultation Chat</h3>
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${modeConfig[mode].color}`}>
                {mode === "video" ? "Video active" : mode === "audio" ? "Audio active" : "Text fallback"}
              </span>
            </div>
            <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
              {messages.map((msg, i) => (
                <div key={i} className={`flex flex-col max-w-[85%] ${msg.from === "patient" ? "ml-auto items-end" : "items-start"}`}>
                  <span className="text-[10px] text-slate-400 mb-1 mx-1">{msg.from === "doctor" ? "Dr. Sharma" : "You (Gurpreet)"} • {msg.time}</span>
                  <div className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm ${msg.from === "doctor" ? "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-tl-none text-slate-700 dark:text-slate-300" : "bg-primary text-white rounded-tr-none"}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-slate-100 dark:border-slate-700 flex gap-2">
              <input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
                placeholder="Type a message..."
              />
              <button onClick={sendMessage} className="bg-primary w-10 h-10 flex items-center justify-center rounded-xl">
                <span className="material-symbols-outlined text-white">send</span>
              </button>
            </div>
          </div>

          {/* Patient Summary */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-bold border border-primary/10">GK</div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">Gurpreet Kaur, 34F</h3>
                <p className="text-xs text-slate-500">Khaira Kalan • Blood Group B+</p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <span className="bg-amber-50 text-amber-600 border border-amber-100 rounded-full px-2 py-0.5 text-[11px] font-bold">⚠ Diabetic</span>
              <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full px-2 py-0.5 text-[11px] font-bold">HbA1c 6.8%</span>
            </div>
          </div>

          {/* Quick Prescription */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-4">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3 text-sm">
              <span className="material-symbols-outlined text-primary">description</span> Quick Prescription
            </h3>
            <div className="space-y-2 mb-3">
              {medsList.map((m, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{m.name}</p>
                    <p className="text-[11px] text-slate-500">{m.dosage}</p>
                  </div>
                  <button onClick={() => setMedsList((prev) => prev.filter((_, j) => j !== i))} className="text-slate-400 hover:text-red-500 transition-colors">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
              ))}
            </div>
            <button className="w-full mb-3 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-primary hover:text-primary rounded-xl py-2.5 text-sm font-semibold transition-all flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-sm">add</span> Add Medicine
            </button>
            <button className="w-full bg-primary hover:opacity-90 text-white font-bold py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm">
              <span className="material-symbols-outlined">verified</span> Issue Prescription + SMS
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
