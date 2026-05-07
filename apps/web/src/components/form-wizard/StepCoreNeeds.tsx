"use client";

import { useFormContext } from "react-hook-form";
import { BuildBrief } from "@guildforge/plan-schema";

const NEEDS = [
  "Voice Channels", "Support Tickets", "Verification Gate", 
  "Self-assignable Roles", "Leveling System", "Economy", 
  "Giveaways", "Events / Calendar", "Private Staff Area",
  "Automod / Strict filtering", "Welcome Messages"
];

export default function StepCoreNeeds() {
  const { watch, setValue } = useFormContext<BuildBrief>();
  const coreNeeds = watch("coreNeeds") || [];

  const toggleNeed = (need: string) => {
    if (coreNeeds.includes(need)) {
      setValue("coreNeeds", coreNeeds.filter(n => n !== need));
    } else {
      setValue("coreNeeds", [...coreNeeds, need]);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg text-white font-semibold">Select Core Features Needed</h3>
      <div className="grid grid-cols-2 gap-3">
        {NEEDS.map(need => (
          <button
            key={need}
            type="button"
            onClick={() => toggleNeed(need)}
            className={`p-3 rounded-lg border text-left transition-colors flex items-center justify-between ${
              coreNeeds.includes(need)
                ? "border-emerald-500 bg-emerald-500/20 text-emerald-100"
                : "border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-600"
            }`}
          >
            <span>{need}</span>
            {coreNeeds.includes(need) && <span>✓</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
