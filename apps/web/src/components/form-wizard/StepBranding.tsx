"use client";

import { useFormContext } from "react-hook-form";
import { BuildBrief } from "@guildforge/plan-schema";

export default function StepBranding() {
  const { register } = useFormContext<BuildBrief>();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-sm text-slate-400 font-semibold uppercase tracking-wider">Server Name</h3>
        <input 
          {...register("serverName")} 
          placeholder="e.g. NightOps Gaming" 
          className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 text-white" 
        />
      </div>

      <div className="space-y-2">
        <h3 className="text-sm text-slate-400 font-semibold uppercase tracking-wider">Primary Color (Hex)</h3>
        <div className="flex space-x-2">
          <input 
            {...register("brandColor")} 
            type="color"
            className="w-12 h-12 rounded bg-transparent border-0 cursor-pointer" 
          />
          <input 
            {...register("brandColor")} 
            placeholder="#FF4D6D" 
            className="flex-1 p-3 rounded-lg bg-slate-800 border border-slate-700 text-white" 
          />
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm text-slate-400 font-semibold uppercase tracking-wider">Brand Tone</h3>
        <select {...register("brandTone")} className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 text-white">
          <option value="">Select tone...</option>
          <option value="formal">Formal & Professional</option>
          <option value="friendly">Friendly & Welcoming</option>
          <option value="playful">Playful & Fun</option>
          <option value="edgy">Edgy & Rebellious</option>
          <option value="hype">Hype & Energetic</option>
        </select>
      </div>
    </div>
  );
}
