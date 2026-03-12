"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

// Dynamically import map components because window is not defined on server
const MapContainer = dynamic(() => import("react-leaflet").then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(m => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(m => m.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then(m => m.Popup), { ssr: false });

const OUTREACH = [
  { name: "Sita Devi", task: "Prenatal Check — High Risk", priority: "high", icon: "warning", color: "bg-primary", ring: "border-l-primary" },
  { name: "Aman Kumar (Child)", task: "Measles Vaccination Pending", priority: "medium", icon: "vaccines", color: "bg-orange-500", ring: "border-l-orange-500" },
  { name: "Rajesh Singh", task: "TB DOTS Follow-up", priority: "normal", icon: "medication", color: "bg-slate-400", ring: "border-l-slate-400" },
  { name: "Kamla Bai", task: "BP Checkup — Monthly", priority: "normal", icon: "monitor_heart", color: "bg-slate-400", ring: "border-l-slate-400" },
];

const VILLAGES = [
  { name: "Khaira Kalan", lat: 30.3700, lng: 76.1500, type: "high", label: "H#402 – High Risk Patient" },
  { name: "Bambiha", lat: 30.3600, lng: 76.1700, type: "medium", label: "H#217 – Vaccination Due" },
  { name: "Miani", lat: 30.3800, lng: 76.1400, type: "visited", label: "H#88 – Visited" },
  { name: "Rajpura", lat: 30.3550, lng: 76.1800, type: "visited", label: "H#103 – Visited" },
];

// Helper to use navigator geolocation safely on client only
function ClientLocationMarker({ onLocationFound }: { onLocationFound: (loc: [number, number]) => void }) {
  // Safe to require here as this only renders when isClient is true
  const { useMap } = require("react-leaflet");
  const map = useMap();
  useEffect(() => {
    map.locate().on("locationfound", function (e: any) {
      onLocationFound([e.latlng.lat, e.latlng.lng]);
    });
  }, [map, onLocationFound]);

  return null;
}

export default function AshaMapPage() {
  const [isClient, setIsClient] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [myLoc, setMyLoc] = useState<[number, number] | null>(null);
  
  useEffect(() => { setIsClient(true); }, []);

  // Fix Leaflet marker icons dynamically
  useEffect(() => {
    if (typeof window !== "undefined") {
      const L = require("leaflet");
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
    }
  }, []);

  const remaining = OUTREACH.filter((o) => o.priority !== "done").length;

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-background-light dark:bg-background-dark">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 md:px-8 py-3 z-30 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-xl bg-primary/20 text-primary">
            <span translate="no" className="material-symbols-outlined text-2xl notranslate">health_and_safety</span>
          </div>
          <div>
            <h2 className="text-lg font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white">NearDoc</h2>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Nabha Health Cluster</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end">
            <p className="text-sm font-bold text-slate-900 dark:text-white">Field Worker ID: 4829</p>
            <p className="text-[10px] uppercase tracking-wider text-slate-500">ASHA Accredited · Sunita Devi</p>
          </div>
          <div className="size-10 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center font-bold text-primary text-sm">SD</div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative z-0">
        {/* Sidebar */}
        <nav className="hidden lg:flex w-64 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 gap-2 flex-shrink-0 z-20 shadow-lg">
          <Link href="/dashboard/asha/map" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary text-white font-semibold">
            <span translate="no" className="material-symbols-outlined notranslate">map</span><span>Village Map</span>
          </Link>
          <Link href="/dashboard/asha" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300">
            <span translate="no" className="material-symbols-outlined notranslate">assignment</span><span>Outreach List</span>
          </Link>
          <Link href="/dashboard/patient/consultation" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300">
            <span translate="no" className="material-symbols-outlined notranslate">medical_services</span><span>Tele-Consults</span>
          </Link>
          <Link href="/dashboard/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300">
            <span translate="no" className="material-symbols-outlined notranslate">analytics</span><span>Statistics</span>
          </Link>

          {/* Sync Card */}
          <div className="mt-auto border-t border-slate-200 dark:border-slate-800 pt-4">
            <div className="flex flex-col gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">Sync Status</span>
                <span className="flex size-2 rounded-full bg-orange-500 animate-pulse"></span>
              </div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">8 Records Pending</p>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div className="bg-primary h-full rounded-full" style={{ width: "60%" }}></div>
              </div>
              <button
                onClick={() => { setSyncing(true); setTimeout(() => setSyncing(false), 2000); }}
                className="w-full py-2 bg-primary hover:bg-primary/90 transition-all text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1"
              >
                <span translate="no" className={`material-symbols-outlined text-sm ${syncing ? "animate-spin" : ""} notranslate`}>sync</span>
                {syncing ? "Syncing..." : "SYNC NOW"}
              </button>
              <p className="text-[10px] text-slate-400 text-center">Last synced: Today 09:42 AM</p>
            </div>
          </div>
        </nav>

        {/* Main Map Area */}
        <main className="flex-1 flex flex-col relative overflow-hidden bg-slate-100">
          
          {/* Map Overlay Top Left - Search & Legend */}
          <div className="absolute top-4 left-4 z-[400] pointer-events-auto">
            <div className="bg-white dark:bg-slate-900 p-2 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 w-64 md:w-80">
              <div className="relative">
                <span translate="no" className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 notranslate">search</span>
                <input className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-lg pl-10 text-sm focus:ring-primary focus:ring-2 py-2.5 outline-none transition-all dark:text-white" placeholder="Find household or village..." type="text" />
              </div>
            </div>
            {/* Legend */}
            <div className="mt-3 bg-white/90 backdrop-blur-sm dark:bg-slate-900/90 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 p-3 text-xs space-y-2">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500 shadow-sm shadow-red-500/50"></div><span className="text-slate-700 dark:text-slate-300 font-bold">High Risk</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50"></div><span className="text-slate-700 dark:text-slate-300 font-bold">Pending Visit</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500 shadow-sm shadow-green-500/50"></div><span className="text-slate-700 dark:text-slate-300 font-bold">Visited (Done)</span></div>
              {myLoc && <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow-sm shadow-blue-500/50"></div><span className="text-slate-700 dark:text-slate-300 font-bold">Your Location</span></div>}
            </div>
          </div>

          {/* Leaflet Real Map integration */}
          <div className="absolute inset-0 z-0">
            {isClient && (
              <MapContainer 
                center={[30.3650, 76.1600]} 
                zoom={14} 
                style={{ height: '100%', width: '100%' }}
                zoomControl={false} // Customized zoom control instead
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  className="map-tiles"
                />
                
                <ClientLocationMarker onLocationFound={setMyLoc} />

                {/* Village Markers */}
                {VILLAGES.map((v) => {
                  const L = require("leaflet");
                  
                  // Custom HTML icon using standard Tailwind sizing matching our legend
                  const iconHtml = `
                    <div style="background-color: ${v.type === 'high' ? '#ef4444' : v.type === 'medium' ? '#f59e0b' : '#22c55e'}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); ${v.type === 'high' ? 'animation: pulse 2s infinite;' : ''}"></div>
                  `;
                  
                  const customIcon = L.divIcon({
                    html: iconHtml,
                    className: 'custom-leaflet-marker',
                    iconSize: [14, 14],
                    iconAnchor: [7, 7]
                  });

                  return (
                    <Marker key={v.name} position={[v.lat, v.lng]} icon={customIcon}>
                      <Popup className="custom-popup">
                        <div className="font-bold text-slate-800">{v.name}</div>
                        <div className="text-xs mt-1 text-slate-500">{v.label}</div>
                        <button className="mt-2 text-[10px] bg-primary/10 text-primary w-full py-1 rounded font-bold">LOG VISIT</button>
                      </Popup>
                    </Marker>
                  );
                })}

                {/* User Location Marker */}
                {myLoc && (
                  <Marker position={myLoc}>
                    <Popup>You are here</Popup>
                  </Marker>
                )}
              </MapContainer>
            )}
            
            {!isClient && (
              <div className="w-full h-full flex items-center justify-center bg-slate-100">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
              </div>
            )}
          </div>

          {/* Outreach Drawer Overlay */}
          <div className="absolute bottom-0 right-0 w-full md:w-[420px] max-h-[55%] md:max-h-[85%] overflow-y-auto bg-white/95 backdrop-blur-md dark:bg-slate-900/95 rounded-t-3xl md:rounded-tr-none md:rounded-l-3xl shadow-2xl border-l border-t md:border-t-0 border-slate-200 dark:border-slate-800 p-6 z-[400] transition-transform duration-300">
            <div className="flex items-center justify-between mb-5 sticky top-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur pb-2 z-10">
              <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Household Tasks</h3>
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-black">{remaining} LEFT TODAY</span>
            </div>
            
            <div className="space-y-3">
              {OUTREACH.map((item) => (
                <div key={item.name} className={`flex items-center gap-4 p-4 rounded-2xl border-l-4 ${item.priority === "high" ? "bg-red-50 dark:bg-red-900/10 border-l-red-500" : item.priority === "medium" ? "bg-amber-50 dark:bg-amber-900/10 border-l-amber-500" : "bg-slate-50 dark:bg-slate-800 border-l-green-500"} cursor-pointer hover:shadow-md transition-all group`}>
                  <div className={`size-11 rounded-xl ${item.priority === "high" ? "bg-red-500" : item.priority === "medium" ? "bg-amber-500" : "bg-green-500"} flex items-center justify-center shrink-0 shadow-sm`}>
                    <span translate="no" className="material-symbols-outlined text-white text-lg notranslate">{item.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-primary transition-colors">{item.name}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">{item.task}</p>
                  </div>
                  <button className="size-9 rounded-full bg-white dark:bg-slate-700 shadow-sm border border-slate-100 dark:border-slate-600 text-slate-500 flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
                    <span translate="no" className="material-symbols-outlined text-sm notranslate">chevron_right</span>
                  </button>
                </div>
              ))}
            </div>
            
            <div className="sticky bottom-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur pt-4 mt-2 z-10">
              <Link href="/dashboard/asha" className="w-full py-4 bg-primary text-white font-black rounded-xl shadow-lg shadow-primary/30 flex items-center justify-center gap-2 hover:bg-primary/90 transition-all hover:-translate-y-0.5">
                <span translate="no" className="material-symbols-outlined notranslate">add_circle</span>
                START NEW REGISTRATION
              </Link>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile PWA Bottom Nav */}
      <div className="md:hidden flex items-center justify-around bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-3 px-2 z-40 flex-shrink-0 safe-area-bottom">
        <Link href="/dashboard/asha/map" className="flex flex-col items-center gap-1 text-primary">
          <span translate="no" className="material-symbols-outlined notranslate">map</span>
          <span className="text-[10px] font-bold">MAP</span>
        </Link>
        <Link href="/dashboard/asha" className="flex flex-col items-center gap-1 text-slate-400">
          <span translate="no" className="material-symbols-outlined notranslate">assignment</span>
          <span className="text-[10px] font-bold">LIST</span>
        </Link>
        <Link href="/dashboard/asha" className="-mt-8 size-14 rounded-full bg-primary text-white flex items-center justify-center shadow-xl border-4 border-white dark:border-slate-900 hover:scale-105 transition-transform">
          <span translate="no" className="material-symbols-outlined text-3xl notranslate">add</span>
        </Link>
        <button
          onClick={() => setSyncing(true)}
          className="flex flex-col items-center gap-1 text-slate-400 relative"
        >
          <span translate="no" className={`material-symbols-outlined ${syncing ? "animate-spin text-primary" : ""} notranslate`}>sync</span>
          <span className="text-[10px] font-bold">SYNC</span>
          <span className="absolute -top-1 right-0 sm:-right-2 size-4 bg-orange-500 text-white text-[8px] flex items-center justify-center rounded-full font-bold">8</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-400">
          <span translate="no" className="material-symbols-outlined notranslate">account_circle</span>
          <span className="text-[10px] font-bold">PROFILE</span>
        </button>
      </div>
    </div>
  );
}
