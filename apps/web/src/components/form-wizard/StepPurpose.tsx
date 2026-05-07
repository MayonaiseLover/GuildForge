"use client";

import { useFormContext } from "react-hook-form";
import { BuildBrief } from "@guildforge/plan-schema";

const PURPOSES = [
  "Gaming Community", "Creator/Streamer Fans", "Web3 / Crypto",
  "Education / Study", "Startup / App Community", "Friends Hangout",
  "Music / Artists", "Course Cohort", "Custom"
];

export default function StepPurpose() {
  const { register, watch, setValue } = useFormContext<BuildBrief>();
  const current = watch("purpose");

  return (
    <div className="space-y-4">
      <h3 className="text-lg text-white font-semibold">What is the main purpose of this server?</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {PURPOSES.map(p => (
          <button
            key={p}
            type="button"
            onClick={() => setValue("purpose", p)}
            className={`p-4 rounded-lg border text-left transition-colors ${
              current === p 
                ? "border-blue-500 bg-blue-500/20 text-blue-100" 
                : "border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-600 hover:bg-slate-700"
            }`}
          >
            {p}
          </button>
        ))}
      </div>
      {current === "Custom" && (
        <input 
          {...register("purpose")}
          type="text" 
          placeholder="Describe your custom purpose..."
          className="w-full mt-4 p-3 rounded-lg bg-slate-800 border border-slate-700 text-white"
        />
      )}
    </div>
  );
}
