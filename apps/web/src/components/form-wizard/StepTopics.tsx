"use client";

import { useFormContext } from "react-hook-form";
import { BuildBrief } from "@guildforge/plan-schema";

export default function StepTopics() {
  const { register } = useFormContext<BuildBrief>();

  return (
    <div className="space-y-4">
      <h3 className="text-lg text-white font-semibold">What specific topics or channels do you want?</h3>
      <p className="text-slate-400 text-sm">List out categories or channel names. The AI will flesh out the rest.</p>
      
      <textarea 
        {...register("topics")}
        rows={6}
        placeholder="e.g. Needs a 'Memes' channel, a category for 'Esports', an 'Off-topic' lounge, and a 'Looking for Group' channel."
        className="w-full p-4 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 resize-none"
      />
    </div>
  );
}
