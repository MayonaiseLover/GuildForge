"use client";

import { useFormContext } from "react-hook-form";
import { BuildBrief, briefToPrompt } from "@guildforge/plan-schema";

export default function StepReview() {
  const { watch } = useFormContext<BuildBrief>();
  const brief = watch();
  
  const prompt = briefToPrompt(brief);

  return (
    <div className="space-y-4">
      <h3 className="text-lg text-white font-semibold">Review your Server Brief</h3>
      <p className="text-slate-400 text-sm">Here is what we will send to the AI architect to generate your server plan.</p>
      
      <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-mono text-sm whitespace-pre-wrap leading-relaxed">
        {prompt || "No details provided yet."}
      </div>
      
      <p className="text-emerald-400 text-sm italic pt-4">
        Ready? Click &quot;Generate Plan&quot; below.
      </p>
    </div>
  );
}
