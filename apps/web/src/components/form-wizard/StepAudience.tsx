"use client";

import { useFormContext } from "react-hook-form";
import { BuildBrief } from "@guildforge/plan-schema";

const VIBES = ["Casual", "Hype", "Professional", "Cozy", "Meme-heavy", "Strict", "Chaotic", "Supportive"];

export default function StepAudience() {
  const { register, watch, setValue } = useFormContext<BuildBrief>();
  const vibeChips = watch("vibeChips") || [];

  const toggleVibe = (vibe: string) => {
    if (vibeChips.includes(vibe)) {
      setValue("vibeChips", vibeChips.filter(v => v !== vibe));
    } else {
      setValue("vibeChips", [...vibeChips, vibe]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <h3 className="text-sm text-slate-400 font-semibold uppercase tracking-wider">Age Range</h3>
          <input {...register("audienceAge")} placeholder="e.g. 18-25, All ages" className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 text-white" />
        </div>
        <div className="space-y-2">
          <h3 className="text-sm text-slate-400 font-semibold uppercase tracking-wider">Region</h3>
          <input {...register("audienceRegion")} placeholder="e.g. North America, Global" className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 text-white" />
        </div>
        <div className="space-y-2">
          <h3 className="text-sm text-slate-400 font-semibold uppercase tracking-wider">Language</h3>
          <input {...register("audienceLanguage")} placeholder="e.g. English, Spanish" className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 text-white" />
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg text-white font-semibold">Vibe / Culture</h3>
        <div className="flex flex-wrap gap-2">
          {VIBES.map(v => (
            <button
              key={v}
              type="button"
              onClick={() => toggleVibe(v)}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${
                vibeChips.includes(v)
                  ? "bg-blue-600 text-white border-transparent"
                  : "bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-500"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
