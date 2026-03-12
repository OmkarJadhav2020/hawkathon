"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

type ConnectionMode = "video" | "audio" | "text";
type Message = { from: "doctor" | "patient"; text: string; time: string };

type ConsultationData = {
  id: string;
  doctor: { name: string };
  patient: { id: string; name: string; age?: number; gender?: string; village?: string; bloodGroup?: string };
  symptoms: string[];
};

export default function ConsultationRoom() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const consultId = searchParams.get("id");

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ConsultationData | null>(null);
  
  const [mode, setMode] = useState<ConnectionMode>("video");
  const [bandwidth, setBandwidth] = useState(1.2);
  const [messages, setMessages] = useState<Message[]>([
    { from: "doctor", text: "Hello, how are you feeling today?", time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
  ]);
  const [inputText, setInputText] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [endingCall, setEndingCall] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!consultId) { setLoading(false); return; }
    fetch(`/api/consultations?id=${consultId}`)
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [consultId]);

  // Timer
  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // Simulate bandwidth fluctuation
  useEffect(() => {
    const t = setInterval(() => {
      const newBw = parseFloat((Math.random() * 2 + 0.2).toFixed(1));
      setBandwidth(newBw);
      if (newBw < 0.3) setMode("text");
      else if (newBw < 0.8) setMode("audio");
      else setMode("video");
    }, 8000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => { chatRef.current?.scrollTo(0, chatRef.current.scrollHeight); }, [messages]);

  const formatTime = (s: number) => {
    const m = Math.floor((s % 3600) / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const sendMessage = () => {
    if (!inputText.trim()) return;
    setMessages((prev) => [...prev, { from: "patient", text: inputText, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
    setInputText("");
    
    // Simulate doctor reply if starting with "doctor"
    setTimeout(() => {
      setMessages((prev) => [...prev, { from: "doctor", text: "I see. Let me write a prescription for that.", time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
    }, 2000);
  };

  const endCall = async () => {
    if (!consultId) return;
    setEndingCall(true);
    try {
      await fetch("/api/consultations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: consultId, status: "COMPLETED", notes: "Consultation ended via video room." }),
      });
      router.push("/dashboard/patient");
    } catch {
      setEndingCall(false);
    }
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background-light dark:bg-background-dark overflow-hidden">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 pr-6 border-r border-slate-200 dark:border-slate-700">
              <span className="material-symbols-outlined text-primary text-2xl">health_and_safety</span>
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">GraamSehat</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-slate-900 dark:text-white">Consultation in Progress</h1>
                <span className="bg-primary/10 text-primary border border-primary/20 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">Active</span>
              </div>
              <p className="text-slate-500 text-sm">
                {data?.doctor?.name ?? "Dr. Doctor"} • <span className="font-mono">{formatTime(seconds)}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${modeConfig[mode].color} transition-colors`}>
              <span className="material-symbols-outlined text-sm">{modeConfig[mode].icon}</span>
              {modeConfig[mode].label}
            </div>
            <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 rounded-full px-3 py-1 text-xs font-bold">
              <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
              LIVE
            </div>
            <button onClick={endCall} disabled={endingCall} className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-xl flex items-center gap-2 transition-colors text-sm disabled:opacity-50">
              <span className="material-symbols-outlined text-lg">{endingCall ? "hourglass_empty" : "call_end"}</span> {endingCall ? "Ending..." : "End Call"}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden max-w-7xl mx-auto w-full px-6 py-6 grid grid-cols-12 gap-6">
        {/* Left: Video + Bandwidth */}
        <section className="col-span-12 lg:col-span-8 flex flex-col gap-4">
          {/* Video Box */}
          <div className="relative aspect-video bg-slate-900 rounded-2xl overflow-hidden shadow-xl border border-slate-800 transition-all">
            {mode === "video" ? (
              <>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                  <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mb-4 ring-2 ring-primary/40 overflow-hidden">
                    <span className="material-symbols-outlined text-5xl text-primary">person</span>
                  </div>
                  <h2 className="text-xl font-semibold">{data?.doctor?.name ?? "Doctor"}</h2>
                  <p className="text-slate-400 text-xs mt-1">Video connected • High Definition</p>
                </div>
                {/* PiP */}
                <div className="absolute bottom-5 right-5 w-36 h-28 bg-slate-800 rounded-xl border-2 border-slate-600 shadow-xl flex items-center justify-center overflow-hidden">
                  <span className="material-symbols-outlined text-slate-400 text-3xl">person</span>
                  <span className="absolute bottom-1.5 left-2 text-[10px] font-bold text-white bg-black/60 px-1.5 py-0.5 rounded uppercase">{data?.patient?.name?.split(" ")[0] ?? "You"} (Local)</span>
                </div>
              </>
            ) : mode === "audio" ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <div className="w-24 h-24 rounded-full bg-amber-500/20 flex items-center justify-center mb-4 ring-2 ring-amber-500/40">
                  <span className="material-symbols-outlined text-5xl text-amber-400 hover:scale-110 transition-transform">mic</span>
                </div>
                <h2 className="text-xl font-semibold">Audio Only Mode</h2>
                <p className="text-slate-400 text-xs mt-1 text-center px-6">Low bandwidth detected ({bandwidth} Mbps) — video paused to ensure uninterrupted audio</p>
              </div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <span className="material-symbols-outlined text-5xl text-slate-500 mb-3">mms</span>
                <h2 className="text-lg font-semibold text-slate-300">Very Low Bandwidth</h2>
                <p className="text-slate-500 text-xs mt-1 text-center px-6">Speed critical ({bandwidth} Mbps). Falling back to secure text chat to maintain connection.</p>
              </div>
            )}
            
            {/* Controls */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/40 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/10">
              <button onClick={() => setIsMicOn((v) => !v)} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg ${isMicOn ? "bg-white/10 text-white hover:bg-white/20" : "bg-red-600 text-white hover:bg-red-700"}`} title={isMicOn ? "Mute Microphone" : "Unmute Microphone"}>
                <span className="material-symbols-outlined">{isMicOn ? "mic_none" : "mic_off"}</span>
              </button>
              <button onClick={() => setIsCamOn((v) => !v)} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg ${isCamOn ? "bg-white/10 text-white hover:bg-white/20" : "bg-red-600 text-white hover:bg-red-700"}`} title={isCamOn ? "Turn off Camera" : "Turn on Camera"}>
                <span className="material-symbols-outlined">{isCamOn ? "videocam" : "videocam_off"}</span>
              </button>
              <div className="w-px h-8 bg-white/20 mx-1"></div>
              <button onClick={endCall} className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg hover:bg-red-700 transition-colors" title="End Call">
                <span className="material-symbols-outlined">call_end</span>
              </button>
            </div>
          </div>

          {/* Bandwidth Monitor */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 flex items-center justify-between shadow-sm">
            <div>
              <p className="font-bold text-slate-900 dark:text-white">Connection Quality Tracking</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {bandwidth >= 1.2 ? "Video active — excellent quality" : bandwidth >= 0.8 ? "Good connection — video may buffer slightly" : bandwidth >= 0.3 ? "Low bandwidth — auto-switched to audio only" : "Critical — auto-switched to text chat"}
              </p>
            </div>
            <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-700">
              <div className="flex gap-1 items-end h-6">
                {bwBars.map((b, i) => (
                  <div key={i} className={`w-1.5 rounded-sm ${b.h} ${b.active ? "bg-primary" : "bg-slate-200 dark:bg-slate-700"} transition-all duration-300`} />
                ))}
              </div>
              <span className={`text-sm font-bold tracking-tight w-20 text-right ${bandwidth >= 0.8 ? "text-primary dark:text-primary" : bandwidth >= 0.3 ? "text-amber-600 dark:text-amber-500" : "text-red-500"}`}>
                {bandwidth} Mbps
              </span>
            </div>
          </div>
        </section>

        {/* Right: Chat + Patient Context */}
        <section className="col-span-12 lg:col-span-4 flex flex-col gap-4 overflow-hidden">
          
          {/* Patient Context */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Consultation Profile</h3>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-bold">
                {data?.patient?.name?.[0] ?? "P"}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">{data?.patient?.name ?? "Patient"} {data?.patient?.gender === "Female" ? "• F" : data?.patient?.gender === "Male" ? "• M" : ""}</h3>
                <p className="text-xs text-slate-500">{data?.patient?.village ?? "Unknown Village"}</p>
              </div>
            </div>
            {data?.symptoms && data.symptoms.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {data.symptoms.map(s => (
                  <span key={s} className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                    {s}
                  </span>
                ))}
              </div>
            )}
            
            {/* Quick Actions (Doctor only visually, but patient shouldn't see it so we wrap it generically) */}
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
              <Link href={`/dashboard/prescription/new?consultId=${consultId}`} className="flex-1 bg-primary hover:bg-primary/90 text-white text-xs font-bold py-2 rounded-lg text-center transition-all flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-[16px]">prescriptions</span>
                Write Rx
              </Link>
            </div>
          </div>

          {/* Secure Chat */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col flex-1 min-h-[300px]">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-slate-400">lock</span> Secure Chat
              </h3>
            </div>
            <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 bg-slate-50/50 dark:bg-background-dark/50">
              {messages.map((msg, i) => (
                <div key={i} className={`flex flex-col max-w-[85%] ${msg.from === "patient" ? "ml-auto items-end" : "items-start"}`}>
                  <span className="text-[10px] text-slate-400 mb-1 mx-1">{msg.from === "doctor" ? (data?.doctor?.name ?? "Doctor") : (data?.patient?.name?.split(" ")[0] ?? "You")} • {msg.time}</span>
                  <div className={`px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed shadow-sm ${msg.from === "doctor" ? "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-tl-sm text-slate-800 dark:text-slate-200" : "bg-primary text-white rounded-tr-sm"}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex gap-2 bg-white dark:bg-slate-900 rounded-b-xl">
              <input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                className="flex-1 bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40 transition-shadow text-slate-900 dark:text-white"
                placeholder="Type message..."
              />
              <button onClick={sendMessage} disabled={!inputText.trim()} className="bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:hover:bg-primary w-11 h-11 flex items-center justify-center rounded-xl transition-all">
                <span className="material-symbols-outlined text-white">send</span>
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
