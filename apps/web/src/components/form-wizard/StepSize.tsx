"use client";

import { useFormContext } from "react-hook-form";
import { BuildBrief } from "@guildforge/plan-schema";

export default function StepSize() {
  const { register } = useFormContext<BuildBrief>();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg text-white font-semibold">Expected Size</h3>
        <select {...register("size")} className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 text-white">
          <option value="">Select size...</option>
          <option value="Just me and friends (<20)">Just me and friends (&lt;20)</option>
          <option value="Small community (20-100)">Small community (20-100)</option>
          <option value="Growing (100-1000)">Growing (100-1000)</option>
          <option value="Large (1000-5000)">Large (1000-5000)</option>
          <option value="Massive (5000+)">Massive (5000+)</option>
        </select>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg text-white font-semibold">Growth Speed</h3>
        <select {...register("growth")} className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 text-white">
          <option value="">Select growth expectation...</option>
          <option value="Closed / Invite Only">Closed / Invite Only</option>
          <option value="Slow & Steady">Slow & Steady</option>
          <option value="Rapid / Viral">Rapid / Viral</option>
        </select>
      </div>
    </div>
  );
}
