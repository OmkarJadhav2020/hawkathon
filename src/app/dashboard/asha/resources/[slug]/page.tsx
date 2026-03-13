"use client";

import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

const RESOURCE_CONTENT: Record<string, { title: string; category: string; content: React.ReactNode; icon: string }> = {
  hygiene: {
    title: "Hygiene & Sanitation Basics",
    category: "Preventative Healthcare",
    icon: "wash",
    content: (
      <div className="space-y-6">
        <section>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">1. Handwashing Technique</h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4">
            Proper handwashing is the most effective way to prevent the spread of infections like diarrhea and pneumonia.
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
            <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
              <li className="flex gap-2"><span>•</span> Use soap and clean running water.</li>
              <li className="flex gap-2"><span>•</span> Scrub all surfaces (backs of hands, between fingers, under nails) for at least 20 seconds.</li>
              <li className="flex gap-2"><span>•</span> Wash hands before eating, after using the toilet, and after handling animals.</li>
            </ul>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">2. Safe Drinking Water</h3>
          <ul className="list-disc pl-5 space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <li>Boil water vigorously for at least 1 minute to kill germs.</li>
            <li>Store water in clean, covered containers with a narrow neck or a tap.</li>
            <li>Never touch the water inside the container with dirty hands.</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">3. Waste Management</h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
            Ensuring that human and animal waste is disposed of properly helps prevent contamination of surroundings and water sources. Encourage the use of latrines in all households.
          </p>
        </section>
      </div>
    )
  },
  maternal: {
    title: "Maternal Nutrition Guide",
    category: "Maternal & Child Health",
    icon: "pregnant_woman",
    content: (
      <div className="space-y-6">
        <section>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Daily Nutritional Needs</h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
            Pregnant women need an extra 300-500 calories per day to support the growing baby.
          </p>
        </section>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl border border-orange-100 dark:border-orange-800">
            <h4 className="font-bold text-orange-900 dark:text-orange-300 text-sm mb-1">Iron & Folic Acid</h4>
            <p className="text-xs text-orange-800 dark:text-orange-400">Prevents anemia and birth defects. Take 1 IFA tablet daily from 4th month.</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-100 dark:border-green-800">
            <h4 className="font-bold text-green-900 dark:text-green-300 text-sm mb-1">Calcium</h4>
            <p className="text-xs text-green-800 dark:text-green-400">Essential for baby's bone development. Include milk, curd, and leafy greens.</p>
          </div>
        </div>
      </div>
    )
  },
  immunization: {
    title: "Immunization Schedule",
    category: "Child Health",
    icon: "vaccines",
    content: (
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <th className="py-2 font-bold">Age</th>
              <th className="py-2 font-bold">Vaccines</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
            <tr><td className="py-3">At Birth</td><td>BCG, OPV-0, Hep B Birth Dose</td></tr>
            <tr><td className="py-3">6 Weeks</td><td>Pentavalent-1, OPV-1, Rota-1, fIPV-1, PCV-1</td></tr>
            <tr><td className="py-3">10 Weeks</td><td>Pentavalent-2, OPV-2, Rota-2</td></tr>
            <tr><td className="py-3">14 Weeks</td><td>Pentavalent-3, OPV-3, Rota-3, fIPV-2, PCV-2</td></tr>
            <tr><td className="py-3">9-12 Months</td><td>MR-1, PCV-Booster, Vit A dose-1</td></tr>
          </tbody>
        </table>
      </div>
    )
  }
};

export default function ResourceDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  
  const resource = RESOURCE_CONTENT[slug as string];

  if (!resource) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Resource Not Found</h1>
          <button onClick={() => router.back()} className="text-asha font-bold underline">Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background-dark pb-20">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-6">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <span translate="no" className="material-symbols-outlined text-slate-600 dark:text-slate-400 notranslate">arrow_back</span>
          </button>
          <div>
            <p className="text-xs font-bold text-asha uppercase tracking-widest">{resource.category}</p>
            <h1 className="text-xl font-black text-slate-900 dark:text-white">{resource.title}</h1>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-8">
          <div className="mb-8 flex justify-center">
            <div className="size-20 rounded-2xl bg-asha/10 flex items-center justify-center text-asha">
              <span translate="no" className="material-symbols-outlined text-4xl notranslate">{resource.icon}</span>
            </div>
          </div>
          {resource.content}
        </div>
        
        <div className="mt-8 p-6 bg-asha/5 rounded-2xl border border-asha/10">
          <h4 className="text-sm font-bold text-asha mb-2 flex items-center gap-2">
            <span translate="no" className="material-symbols-outlined text-sm notranslate">info</span> ASHA Guidance
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Use these points when conducting household visits. Explain correctly to family members and clarify any doubts they may have regarding hygiene or child safety.
          </p>
        </div>
      </main>
    </div>
  );
}
