"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

type Message = { role: "ai" | "user"; content: string; pills?: string[]; timestamp: string };
type TriageResult = { category: "HOME_CARE" | "TELECONSULT" | "EMERGENCY"; probability: number; condition: string; description: string } | null;

const initialMessages: Message[] = [
  {
    role: "ai",
    content: "Hello! I'm Sehat AI Assistant. I'm here to help you understand your symptoms. What are you experiencing today?",
    pills: ["Fever", "Cough", "Headache", "Stomach Pain", "Body Ache"],
    timestamp: "Now",
  },
];

export default function SymptomChecker() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [collectedSymptoms, setCollectedSymptoms] = useState<string[]>([]);
  const [triageResult, setTriageResult] = useState<TriageResult>(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    // Handle action pills that should navigate
    if (text === "Book Teleconsult") {
      window.location.href = "/dashboard/patient/appointments";
      return;
    }
    if (text === "Find Pharmacy") {
      window.location.href = "/dashboard/patient/pharmacy";
      return;
    }

    const userMsg: Message = { role: "user", content: text, timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
    setMessages((prev) => [...prev, userMsg]);
    const updatedSymptoms = collectedSymptoms.includes(text) ? collectedSymptoms : [...collectedSymptoms, text];
    if (!collectedSymptoms.includes(text)) setCollectedSymptoms(updatedSymptoms);
    setInput("");
    setLoading(true);
    setStep((s) => Math.min(s + 1, 5));

    try {
      // Call the real Gemini AI triage API
      const res = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms: updatedSymptoms, message: text, step }),
      });

      let aiResponse: Message;
      let result: TriageResult = triageResult;

      if (res.ok) {
        const data = await res.json();

        // If the API returns a triage result, set it
        if (data.triage) {
          result = data.triage as TriageResult;
          setTriageResult(result);
        }

        aiResponse = {
          role: "ai",
          content: data.message || "Thank you. Is there anything else you'd like to share about your condition?",
          pills: data.pills || (data.triage ? ["Book Teleconsult", "Find Pharmacy", "Home Care Tips"] : undefined),
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
      } else {
        // Graceful fallback if API fails
        aiResponse = {
          role: "ai",
          content: step >= 3
            ? "Based on what you've described, this may need a doctor's attention. Please book a teleconsultation."
            : step === 2
            ? "I see. Have you also experienced any breathing difficulty, chest pain, or fever above 102°F?"
            : "How long have you been feeling this way?",
          pills: step >= 3
            ? ["Book Teleconsult", "Find Pharmacy"]
            : step === 2
            ? ["Yes, breathing difficulty", "Yes, high fever", "No, none of these"]
            : ["Since today", "1–2 days", "More than a week"],
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };

        // Set a fallback triage after step 3 even if API fails
        if (step >= 3 && !triageResult) {
          setTriageResult({
            category: "TELECONSULT",
            probability: 70,
            condition: "Unspecified — Doctor Advised",
            description: "Our AI could not complete a full assessment. Please consult a doctor.",
          });
        }
      }

      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error("Triage API error:", error);
      const fallbackMsg: Message = {
        role: "ai",
        content: "I'm having trouble connecting to the AI service. Please try again or book an appointment directly.",
        pills: ["Book Teleconsult"],
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };


  const categoryColors = {
    HOME_CARE: { bg: "bg-green-50 dark:bg-green-900/20", text: "text-green-600", icon: "home_health", label: "Home Care" },
    TELECONSULT: { bg: "bg-amber-50 dark:bg-amber-900/20", text: "text-amber-600", icon: "video_call", label: "Teleconsult" },
    EMERGENCY: { bg: "bg-red-50 dark:bg-red-900/20", text: "text-red-600", icon: "emergency", label: "Emergency" },
  };

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-background-light dark:bg-background-dark">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-4 lg:px-20 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/patient" className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div className="flex items-center justify-center size-10 rounded-xl bg-primary text-white">
            <span className="material-symbols-outlined">health_and_safety</span>
          </div>
          <div>
            <h2 className="text-lg font-bold leading-tight tracking-tight">GraamSehat AI</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Smart Health Triage</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
          <span className="material-symbols-outlined text-sm">wifi</span>
          <span className="text-xs font-bold">Online</span>
        </div>
      </header>

      <main className="flex-1 overflow-hidden flex flex-col lg:flex-row max-w-[1440px] mx-auto w-full">
        {/* Chat */}
        <div className="flex-1 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
          {/* Progress */}
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-primary">Symptom Assessment</span>
              <span className="text-xs font-bold text-slate-500">Step {Math.min(step, 5)} of 5</span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${Math.min(step, 5) * 20}%` }} />
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((msg, i) => (
              <div key={i} className={`flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${msg.role === "ai" ? "bg-primary/10 text-primary" : "bg-primary text-white"}`}>
                  <span className="material-symbols-outlined text-sm">{msg.role === "ai" ? "smart_toy" : "person"}</span>
                </div>
                <div className={`flex flex-col gap-2 max-w-[80%] ${msg.role === "user" ? "items-end" : ""}`}>
                  <div className={`p-4 rounded-2xl ${msg.role === "ai" ? "bg-slate-100 dark:bg-slate-800 rounded-tl-none" : "bg-primary text-white rounded-tr-none"}`}>
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                  </div>
                  {msg.pills && (
                    <div className="flex flex-wrap gap-2">
                      {msg.pills.map((pill) => (
                        <button
                          key={pill}
                          onClick={() => sendMessage(pill)}
                          className="px-4 py-2 rounded-full border border-primary text-primary text-xs font-semibold hover:bg-primary hover:text-white transition-all"
                        >
                          {pill}
                        </button>
                      ))}
                    </div>
                  )}
                  <span className={`text-[10px] text-slate-400 font-medium ${msg.role === "user" ? "mr-1" : "ml-1"}`}>
                    {msg.role === "ai" ? "Sehat AI" : "You"} • {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-start gap-3">
                <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-sm">smart_toy</span>
                </div>
                <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-tl-none p-4 flex gap-1.5">
                  {[0, 1, 2].map((d) => (
                    <div key={d} className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: `${d * 0.15}s` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl py-4 pl-4 pr-12 text-sm focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-slate-100 outline-none"
                placeholder="Type your symptoms here..."
              />
              <button onClick={() => sendMessage(input)} className="absolute right-2 p-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
                <span className="material-symbols-outlined">send</span>
              </button>
            </div>
            <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400">
              <span className="material-symbols-outlined text-sm">info</span>
              <p>This AI tool is for informational purposes only, not a medical diagnosis.</p>
            </div>
          </div>
        </div>

        {/* Right: Triage Panel */}
        <div className="w-full lg:w-[400px] p-6 space-y-6 overflow-y-auto bg-slate-50 dark:bg-slate-900/20">
          <h3 className="text-lg font-bold">Preliminary Triage Result</h3>

          {triageResult ? (
            <>
              <div className={`p-6 rounded-2xl border ${categoryColors[triageResult.category].bg}`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-lg ${categoryColors[triageResult.category].bg}`}>
                    <span className={`material-symbols-outlined ${categoryColors[triageResult.category].text}`}>
                      {categoryColors[triageResult.category].icon}
                    </span>
                  </div>
                  <span className={`font-bold ${categoryColors[triageResult.category].text}`}>
                    {categoryColors[triageResult.category].label}
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{triageResult.description}</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Probability</span>
                    <span className="font-bold">{triageResult.probability}% {triageResult.condition}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${triageResult.probability}%` }} />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400">Recommended Actions</h4>
                <Link href="/dashboard/patient/appointments" className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-primary/30 transition-colors">
                  <span className="material-symbols-outlined text-primary">video_chat</span>
                  <div>
                    <p className="text-sm font-bold">Speak with a GP</p>
                    <p className="text-xs text-slate-400">Available in 15 mins</p>
                  </div>
                  <span className="ml-auto text-primary text-xs font-bold">Book</span>
                </Link>
                <Link href="/dashboard/patient/pharmacy" className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-primary/30 transition-colors">
                  <span className="material-symbols-outlined text-primary">local_pharmacy</span>
                  <div>
                    <p className="text-sm font-bold">Find Nearby Pharmacy</p>
                    <p className="text-xs text-slate-400">Open until 9:00 PM</p>
                  </div>
                  <span className="ml-auto text-primary text-xs font-bold">Map</span>
                </Link>
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-slate-400">
              <span className="material-symbols-outlined text-5xl mb-3 block">symptoms</span>
              <p className="text-sm">Your triage result will appear here as you describe your symptoms...</p>
            </div>
          )}

          {/* Collected Symptoms */}
          {collectedSymptoms.length > 0 && (
            <div className="p-5 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
              <p className="text-xs font-bold text-slate-400 uppercase mb-3">Collected Symptoms</p>
              <div className="flex flex-wrap gap-2">
                {collectedSymptoms.map((s) => (
                  <span key={s} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[11px] font-medium flex items-center gap-1">
                    {s} <span className="material-symbols-outlined text-[12px] text-primary">check_circle</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
