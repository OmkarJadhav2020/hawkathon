"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Major Indian Languages supported by Google Translate
const LANGUAGES = [
  { code: "en", name: "English", native: "English 🇺🇸" },
  { code: "hi", name: "Hindi", native: "हिंदी" },
  { code: "pa", name: "Punjabi", native: "ਪੰਜਾਬੀ" },
  { code: "bn", name: "Bengali", native: "বাংলা" },
  { code: "te", name: "Telugu", native: "తెలుగు" },
  { code: "mr", name: "Marathi", native: "मराठी" },
  { code: "ta", name: "Tamil", native: "தமிழ்" },
  { code: "gu", name: "Gujarati", native: "ગુજરાતી" },
  { code: "kn", name: "Kannada", native: "ಕನ್ನಡ" },
  { code: "ml", name: "Malayalam", native: "മലയാളം" },
  { code: "or", name: "Odia", native: "ଓଡ଼ିଆ" },
  { code: "ur", name: "Urdu", native: "اردو" }
];

export default function LanguageSelector() {
  const router = useRouter();
  const [lang, setLang] = useState("en");

  useEffect(() => {
    // Read the cookie
    const match = document.cookie.match(new RegExp("(^| )googtrans=([^;]+)"));
    if (match) {
      const val = decodeURIComponent(match[2]);
      const activeLang = LANGUAGES.find(l => val.includes(`/${l.code}`));
      if (activeLang) setLang(activeLang.code);
      else setLang("en");
    }
  }, []);

  const switchLanguage = (targetLang: string) => {
    if (targetLang === "en") {
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" + location.hostname;
    } else {
      document.cookie = `googtrans=/en/${targetLang}; path=/`;
    }
    window.location.reload();
  };

  const currentLang = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];

  return (
    <div className="relative group p-1 translate-parent" style={{ zIndex: 99999 }}>
      <button className="flex items-center gap-1.5 text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-primary transition-colors bg-white/80 dark:bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 shadow-[0_2px_8px_rgba(0,0,0,0.05)] backdrop-blur-md">
        <span translate="no" className="material-symbols-outlined text-[18px] notranslate">translate</span>
        <span className="max-w-[80px] truncate">{lang === "en" ? "EN" : currentLang.native}</span>
      </button>
      
      <div className="absolute right-0 mt-2 w-48 max-h-[60vh] overflow-y-auto bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all flex flex-col scale-95 origin-top-right group-hover:scale-100 divide-y divide-slate-100 dark:divide-slate-700 custom-scrollbar">
        {LANGUAGES.map((l) => (
          <button 
            key={l.code}
            onClick={() => switchLanguage(l.code)} 
            className={`px-4 py-3 text-sm flex items-center justify-between text-left font-bold transition-colors ${lang === l.code ? 'text-primary bg-primary/5' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-primary'}`}
          >
            <span>{l.native}</span>
            <span className="text-[10px] text-slate-400 font-normal uppercase">{l.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
