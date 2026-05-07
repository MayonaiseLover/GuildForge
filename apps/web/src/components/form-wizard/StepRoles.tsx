"use client";

import { useFormContext } from "react-hook-form";
import { BuildBrief } from "@guildforge/plan-schema";

export default function StepRoles() {
  const { register } = useFormContext<BuildBrief>();

  return (
    <div className="space-y-4">
      <h3 className="text-lg text-white font-semibold">Are there any specific roles you need?</h3>
      <p className="text-slate-400 text-sm">Mention VIPs, staff tiers, or self-assignable roles you have in mind.</p>
      
      <textarea 
        {...register("roles")}
        rows={6}
        placeholder="e.g. 'Founders', 'Mods', 'VIP', and self-assign roles for 'PC', 'Xbox', 'Playstation'."
        className="w-full p-4 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 resize-none"
      />
    </div>
  );
}
