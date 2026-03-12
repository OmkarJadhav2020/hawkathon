"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

type Message = { from: "doctor" | "patient" | "system"; text: string; time: string };
type CallMode = "video" | "audio" | "chat" | "connecting" | "waiting";

type ConsultationData = {
  id: string;
  doctor: { name: string } | null;
  patient: { id: string; name: string; gender?: string; village?: string; bloodGroup?: string } | null;
  symptoms: string[];
};

// Derive stable, short peer IDs from consultId
function getPeerIds(consultId: string) {
  const short = consultId.replace(/[^a-z0-9]/gi, "").slice(-12).toLowerCase();
  return {
    doctorPeerId: `gsd${short}`,
    patientPeerId: `gsp${short}`,
  };
}

function ConsultationRoomContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const consultId = searchParams.get("id") ?? "";

  // ── User role ─────────────────────────────────────────────────────
  const [role, setRole] = useState<"doctor" | "patient">("patient");
  const [myName, setMyName] = useState("You");

  // ── Consultation data ─────────────────────────────────────────────
  const [consultData, setConsultData] = useState<ConsultationData | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  // ── WebRTC / PeerJS state ─────────────────────────────────────────
  const [callMode, setCallMode] = useState<CallMode>("connecting");
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [seconds, setSeconds] = useState(0);
  const [bitrate, setBitrate] = useState<number | null>(null); // kbps
  const [connQuality, setConnQuality] = useState<"excellent" | "good" | "poor" | "critical">("excellent");
  const [endingCall, setEndingCall] = useState(false);
  const [permError, setPermError] = useState("");

  // ── Chat ─────────────────────────────────────────────────────────
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const chatRef = useRef<HTMLDivElement>(null);

  // ── DOM Refs ──────────────────────────────────────────────────────
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  // ── PeerJS refs (avoid re-renders) ───────────────────────────────
  const peerRef = useRef<InstanceType<typeof import("peerjs").default> | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const activeCallRef = useRef<ReturnType<NonNullable<typeof peerRef.current>["call"]> | null>(null);
  const dataConnRef = useRef<ReturnType<NonNullable<typeof peerRef.current>["connect"]> | null>(null);
  const statsIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevBytesRef = useRef<number>(0);
  const prevTimestampRef = useRef<number>(Date.now());

  // ── Load consultation data ────────────────────────────────────────
  useEffect(() => {
    if (typeof window !== "undefined") {
      const r = localStorage.getItem("userRole")?.toLowerCase();
      if (r === "doctor") setRole("doctor");
      const name = localStorage.getItem("userName");
      if (name) setMyName(name);
    }
    if (!consultId) { setLoadingData(false); return; }
    fetch(`/api/consultations?id=${consultId}`)
      .then((r) => r.json())
      .then((d) => { setConsultData(d); setLoadingData(false); })
      .catch(() => setLoadingData(false));
  }, [consultId]);

  // ── Timer ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (callMode === "video" || callMode === "audio" || callMode === "chat") {
      const t = setInterval(() => setSeconds((s) => s + 1), 1000);
      return () => clearInterval(t);
    }
  }, [callMode]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  // ── Quality monitoring ────────────────────────────────────────────
  const startStatsMonitor = useCallback((peerConnection: RTCPeerConnection) => {
    if (statsIntervalRef.current) clearInterval(statsIntervalRef.current);

    statsIntervalRef.current = setInterval(async () => {
      try {
        const stats = await peerConnection.getStats();
        stats.forEach((report) => {
          if (report.type === "outbound-rtp" && report.kind === "video") {
            const now = Date.now();
            const elapsed = (now - prevTimestampRef.current) / 1000;
            const bytesDiff = (report.bytesSent as number) - prevBytesRef.current;
            const kbps = Math.round((bytesDiff * 8) / 1000 / elapsed);

            prevBytesRef.current = report.bytesSent as number;
            prevTimestampRef.current = now;
            setBitrate(kbps);

            // Adaptive quality switching
            if (kbps > 300) {
              setConnQuality("excellent");
              setCallMode((prev) => (prev === "audio" ? "video" : prev));
            } else if (kbps > 100) {
              setConnQuality("good");
            } else if (kbps > 20) {
              setConnQuality("poor");
              setCallMode("audio");
              // Disable video track to save bandwidth
              localStreamRef.current?.getVideoTracks().forEach((t) => { t.enabled = false; });
            } else if (kbps > 0) {
              setConnQuality("critical");
              setCallMode("chat");
              localStreamRef.current?.getVideoTracks().forEach((t) => { t.enabled = false; });
              localStreamRef.current?.getAudioTracks().forEach((t) => { t.enabled = false; });
            }
          }
        });
      } catch {
        // Connection closed
      }
    }, 3000);
  }, []);

  // ── Get local media stream ────────────────────────────────────────
  const getLocalStream = useCallback(async (): Promise<MediaStream | null> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.muted = true; // Don't echo your own audio
      }
      return stream;
    } catch {
      // Try audio only
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
        localStreamRef.current = stream;
        setCallMode("audio");
        return stream;
      } catch {
        setPermError("Camera/microphone access denied. You can still use text chat.");
        setCallMode("chat");
        return null;
      }
    }
  }, []);

  // ── Handle incoming remote stream ─────────────────────────────────
  const attachRemoteStream = useCallback((stream: MediaStream) => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = stream;
      remoteVideoRef.current.play().catch(() => {});
    }
    setCallMode("video");

    // Check if remote has video tracks
    const hasVideo = stream.getVideoTracks().length > 0 && stream.getVideoTracks()[0].enabled;
    setCallMode(hasVideo ? "video" : "audio");
  }, []);

  // ── Send chat message ─────────────────────────────────────────────
  const addSystemMessage = useCallback((text: string) => {
    setMessages((prev) => [...prev, {
      from: "system",
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }]);
  }, []);

  // ── Init PeerJS ───────────────────────────────────────────────────
  useEffect(() => {
    if (!consultId || loadingData) return;

    let destroyed = false;

    const init = async () => {
      const { doctorPeerId, patientPeerId } = getPeerIds(consultId);
      const myPeerId = role === "doctor" ? doctorPeerId : patientPeerId;
      const remotePeerId = role === "doctor" ? patientPeerId : doctorPeerId;

      // Dynamic import — PeerJS is browser-only
      const { default: Peer } = await import("peerjs");

      const peer = new Peer(myPeerId, {
        // Use secure PeerJS cloud by default (no server needed)
        host: "0.peerjs.com",
        port: 443,
        path: "/",
        secure: true,
        debug: 0,
        config: {
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" },
          ],
        },
      });

      peerRef.current = peer;

      peer.on("error", (err) => {
        if (destroyed) return;
        if (err.type === "unavailable-id") {
          // ID already taken — someone else with our shortId, use fallback
          addSystemMessage("Reconnecting with alternate ID...");
        } else {
          addSystemMessage(`Connection error: ${err.message}`);
          setCallMode("chat");
        }
      });

      peer.on("open", async (id) => {
        if (destroyed) return;
        console.log("PeerJS connected, my ID:", id);
        addSystemMessage(role === "doctor" ? "Waiting for patient to connect..." : "Connecting to doctor...");
        setCallMode("waiting");

        const localStream = await getLocalStream();

        // ── DATA channel for chat ────────────────────────────────────
        const setupDataConn = (conn: typeof dataConnRef.current) => {
          if (!conn) return;
          dataConnRef.current = conn;
          conn.on("data", (data) => {
            if (destroyed) return;
            setMessages((prev) => [...prev, {
              from: role === "doctor" ? "patient" : "doctor",
              text: data as string,
              time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            }]);
          });
          conn.on("open", () => {
            addSystemMessage("Secure chat channel established.");
          });
          conn.on("close", () => addSystemMessage("Chat connection closed."));
        };

        // ── Handle incoming call ─────────────────────────────────────
        peer.on("call", (call) => {
          if (destroyed) return;
          activeCallRef.current = call;
          if (localStream) call.answer(localStream);
          else call.answer();
          call.on("stream", attachRemoteStream);
          call.on("error", () => addSystemMessage("Call stream error."));
          call.on("close", () => addSystemMessage("Remote peer disconnected."));
          const pc = (call as unknown as { peerConnection: RTCPeerConnection }).peerConnection;
          if (pc) startStatsMonitor(pc);
        });

        // ── Handle incoming data connection ──────────────────────────
        peer.on("connection", (conn) => setupDataConn(conn));

        // ── Patient initiates the call ───────────────────────────────
        if (role === "patient") {
          // Give doctor time to set up
          const attemptCall = () => {
            if (destroyed || !peerRef.current) return;
            const dataConn = peerRef.current.connect(remotePeerId);
            setupDataConn(dataConn);

            if (localStream) {
              const call = peerRef.current.call(remotePeerId, localStream);
              if (!call) {
                addSystemMessage("Doctor not ready yet. Retrying in 5s...");
                setTimeout(attemptCall, 5000);
                return;
              }
              activeCallRef.current = call;
              call.on("stream", attachRemoteStream);
              call.on("error", () => {
                addSystemMessage("Retrying connection...");
                setTimeout(attemptCall, 5000);
              });
              const pc = (call as unknown as { peerConnection: RTCPeerConnection }).peerConnection;
              if (pc) startStatsMonitor(pc);
            }
          };

          setTimeout(attemptCall, 1500);
        }
      });
    };

    init().catch((err) => {
      console.error("PeerJS init error:", err);
      addSystemMessage("Failed to initialize video. Using text chat.");
      setCallMode("chat");
    });

    return () => {
      destroyed = true;
      if (statsIntervalRef.current) clearInterval(statsIntervalRef.current);
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      activeCallRef.current?.close();
      dataConnRef.current?.close();
      peerRef.current?.destroy();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [consultId, role, loadingData]);

  // ── Scroll chat ───────────────────────────────────────────────────
  useEffect(() => { chatRef.current?.scrollTo(0, chatRef.current.scrollHeight); }, [messages]);

  // ── Send chat ─────────────────────────────────────────────────────
  const sendMessage = () => {
    if (!inputText.trim()) return;
    const msg: Message = {
      from: role,
      text: inputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, msg]);

    // Send via data channel if available
    if (dataConnRef.current?.open) {
      dataConnRef.current.send(inputText.trim());
    }
    setInputText("");
  };

  // ── Mic / Cam toggles ─────────────────────────────────────────────
  const toggleMic = () => {
    const tracks = localStreamRef.current?.getAudioTracks();
    tracks?.forEach((t) => { t.enabled = !t.enabled; });
    setIsMicOn((v) => !v);
  };

  const toggleCam = () => {
    const tracks = localStreamRef.current?.getVideoTracks();
    tracks?.forEach((t) => { t.enabled = !t.enabled; });
    setIsCamOn((v) => !v);
  };

  // ── End call ─────────────────────────────────────────────────────
  const endCall = async () => {
    if (!consultId) return;
    setEndingCall(true);
    try {
      await fetch("/api/consultations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: consultId, status: "COMPLETED", notes: "Consultation ended." }),
      });
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      peerRef.current?.destroy();
      router.push(role === "doctor" ? "/dashboard/doctor" : "/dashboard/patient");
    } catch {
      setEndingCall(false);
    }
  };

  // ── Quality UI helpers ────────────────────────────────────────────
  const qualityConfig = {
    excellent: { label: "HD Video", icon: "videocam", badge: "text-emerald-700 bg-emerald-100 border-emerald-200" },
    good:      { label: "Video",    icon: "videocam", badge: "text-blue-700 bg-blue-100 border-blue-200" },
    poor:      { label: "Audio Only", icon: "mic",   badge: "text-amber-700 bg-amber-100 border-amber-200" },
    critical:  { label: "Text Chat", icon: "chat",   badge: "text-slate-700 bg-slate-100 border-slate-200" },
  };
  const qc = qualityConfig[connQuality];

  const remoteName = role === "doctor"
    ? (consultData?.patient?.name ?? "Patient")
    : (consultData?.doctor?.name ?? "Doctor");

  if (loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-950 overflow-hidden">
      {/* ── Header ──────────────────────────────────────────────── */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 md:px-6 h-14 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">health_and_safety</span>
            <span className="text-white font-bold tracking-tight hidden sm:inline">GraamSehat</span>
          </div>
          <div className="h-4 w-px bg-slate-700 hidden sm:block" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-sm">
                {callMode === "connecting" ? "Connecting..." : callMode === "waiting" ? "Waiting for " + remoteName + "..." : "Consultation with " + remoteName}
              </span>
              {(callMode === "video" || callMode === "audio" || callMode === "chat") && (
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              )}
            </div>
            {(callMode === "video" || callMode === "audio") && (
              <p className="text-slate-400 text-xs font-mono">{formatTime(seconds)}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Connection quality badge */}
          {bitrate !== null && (
            <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${qc.badge} flex items-center gap-1`}>
              <span className="material-symbols-outlined text-xs">{qc.icon}</span>
              {qc.label} · {bitrate}kbps
            </span>
          )}
          {callMode === "connecting" || callMode === "waiting" ? (
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
              {callMode === "waiting" ? "Waiting..." : "Connecting..."}
            </div>
          ) : null}
          <button
            onClick={endCall}
            disabled={endingCall}
            className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors text-sm disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-lg">{endingCall ? "hourglass_empty" : "call_end"}</span>
            <span className="hidden sm:inline">{endingCall ? "Ending..." : "End Call"}</span>
          </button>
        </div>
      </header>

      {/* ── Main ────────────────────────────────────────────────── */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-0 overflow-hidden">
        {/* Left: Video */}
        <div className="lg:col-span-2 flex flex-col bg-slate-900 relative">
          {/* Remote video (full) */}
          <div className="flex-1 relative bg-slate-950">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className={`w-full h-full object-cover ${callMode !== "video" ? "hidden" : ""}`}
            />

            {/* Overlay when no video */}
            {callMode !== "video" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 ring-4 ${
                  callMode === "audio" ? "bg-amber-500/20 ring-amber-500/30" :
                  callMode === "connecting" || callMode === "waiting" ? "bg-primary/20 ring-primary/30 animate-pulse" :
                  "bg-slate-700 ring-slate-600"
                }`}>
                  <span className={`material-symbols-outlined text-5xl ${
                    callMode === "audio" ? "text-amber-400" :
                    callMode === "connecting" || callMode === "waiting" ? "text-primary" :
                    "text-slate-400"
                  }`}>
                    {callMode === "audio" ? "mic" : callMode === "connecting" || callMode === "waiting" ? "person" : "chat"}
                  </span>
                </div>
                <h2 className="text-xl font-semibold">{remoteName}</h2>
                <p className="text-slate-400 text-sm mt-1">
                  {callMode === "audio" ? "Audio only — low bandwidth detected" :
                   callMode === "chat" ? "Very low bandwidth — text chat only" :
                   callMode === "waiting" ? `Waiting for ${remoteName} to join...` :
                   "Establishing connection..."}
                </p>
                {permError && (
                  <div className="mt-4 px-4 py-2 bg-red-900/40 border border-red-900/60 rounded-xl text-red-300 text-xs text-center max-w-xs">
                    {permError}
                  </div>
                )}
              </div>
            )}

            {/* PiP: local video */}
            <div className="absolute bottom-4 right-4 w-32 h-24 bg-slate-800 rounded-xl border border-slate-700 shadow-2xl overflow-hidden">
              <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              {!isCamOn && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                  <span className="material-symbols-outlined text-slate-500">videocam_off</span>
                </div>
              )}
              <span className="absolute bottom-1 left-1.5 text-[9px] font-bold text-white bg-black/50 px-1 py-0.5 rounded">
                {myName.split(" ")[0]} (You)
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
            <div className="flex items-center gap-3 bg-slate-900/80 backdrop-blur-md border border-slate-700 px-5 py-3 rounded-full shadow-2xl">
              <button
                onClick={toggleMic}
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${isMicOn ? "bg-slate-700 hover:bg-slate-600 text-white" : "bg-red-600 text-white"}`}
                title={isMicOn ? "Mute" : "Unmute"}
              >
                <span className="material-symbols-outlined text-lg">{isMicOn ? "mic" : "mic_off"}</span>
              </button>
              <button
                onClick={toggleCam}
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${isCamOn ? "bg-slate-700 hover:bg-slate-600 text-white" : "bg-red-600 text-white"}`}
                title={isCamOn ? "Camera off" : "Camera on"}
              >
                <span className="material-symbols-outlined text-lg">{isCamOn ? "videocam" : "videocam_off"}</span>
              </button>
              <div className="w-px h-8 bg-slate-600" />
              <button
                onClick={endCall}
                className="w-11 h-11 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition-colors"
                title="End call"
              >
                <span className="material-symbols-outlined text-lg">call_end</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Chat + Info */}
        <div className="flex flex-col border-l border-slate-800 bg-slate-900 overflow-hidden">
          {/* Patient / Doctor info */}
          <div className="p-4 border-b border-slate-800 shrink-0">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              {role === "doctor" ? "Patient Profile" : "Consultation Info"}
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                {remoteName?.[0] ?? "?"}
              </div>
              <div>
                <p className="font-bold text-white text-sm">{remoteName}</p>
                {consultData?.patient?.village && (
                  <p className="text-slate-400 text-xs">{consultData.patient.village}</p>
                )}
              </div>
            </div>
            {consultData?.symptoms?.length ? (
              <div className="flex flex-wrap gap-1 mt-3">
                {consultData.symptoms.map((s) => (
                  <span key={s} className="bg-red-900/30 text-red-400 border border-red-900/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {s}
                  </span>
                ))}
              </div>
            ) : null}
            {role === "doctor" && (
              <Link
                href={`/dashboard/prescription/new?consultId=${consultId}`}
                className="mt-3 w-full flex items-center justify-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold py-2 rounded-xl transition-colors"
              >
                <span className="material-symbols-outlined text-sm">prescriptions</span> Write Prescription
              </Link>
            )}
          </div>

          {/* Chat */}
          <div className="flex flex-col flex-1 min-h-0">
            <div className="px-4 py-2.5 border-b border-slate-800 flex items-center gap-2 shrink-0">
              <span className="material-symbols-outlined text-slate-400 text-sm">lock</span>
              <span className="text-xs font-bold text-slate-400">Secure Chat</span>
              {callMode === "chat" && (
                <span className="ml-auto text-[10px] font-bold text-amber-400 bg-amber-900/30 px-2 py-0.5 rounded-full border border-amber-900/40">
                  Fallback Mode
                </span>
              )}
            </div>
            <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950/50">
              {messages.length === 0 && (
                <p className="text-slate-600 text-xs text-center pt-4">Messages will appear here once connected.</p>
              )}
              {messages.map((msg, i) => (
                msg.from === "system" ? (
                  <div key={i} className="text-center">
                    <span className="text-[10px] text-slate-500 bg-slate-800 px-3 py-1 rounded-full">{msg.text}</span>
                  </div>
                ) : (
                  <div key={i} className={`flex flex-col max-w-[85%] ${msg.from === role ? "ml-auto items-end" : "items-start"}`}>
                    <span className="text-[10px] text-slate-500 mb-1">{msg.from === role ? "You" : remoteName} · {msg.time}</span>
                    <div className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                      msg.from === role
                        ? "bg-primary text-white rounded-tr-none"
                        : "bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700"
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                )
              ))}
            </div>
            <div className="p-3 border-t border-slate-800 flex gap-2 shrink-0">
              <input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                className="flex-1 bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-slate-500"
                placeholder="Message..."
              />
              <button
                onClick={sendMessage}
                disabled={!inputText.trim()}
                className="bg-primary hover:bg-primary/90 disabled:opacity-40 text-white w-10 h-10 flex items-center justify-center rounded-xl transition-all"
              >
                <span className="material-symbols-outlined text-lg">send</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ConsultationRoom() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    }>
      <ConsultationRoomContent />
    </Suspense>
  );
}
