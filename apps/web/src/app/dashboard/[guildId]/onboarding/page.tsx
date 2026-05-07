"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { FormWizard } from "../../../../components/form-wizard/FormWizard";
import { BuildBrief, briefToPrompt } from "@guildforge/plan-schema";

export default function OnboardingPage({ params }: { params: Promise<{ guildId: string }> }) {
  const { guildId } = use(params);
  const router = useRouter();
  
  const [mode, setMode] = useState<"wizard" | "freeform">("wizard");
  const [freeformText, setFreeformText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (brief?: BuildBrief, freeform?: string) => {
    setIsSubmitting(true);
    setError(null);
    try {
      // 1. Create a conversation
      const convRes = await fetch("http://localhost:3001/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guildId })
      });
      if (!convRes.ok) throw new Error("Failed to create conversation");
      const { conversation } = await convRes.json();

      // 2. Generate plan
      const promptText = brief ? briefToPrompt(brief) : freeform;
      const planRes = await fetch(`http://localhost:3001/conversations/${conversation.id}/plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ freeformDescription: promptText })
      });
      if (!planRes.ok) throw new Error("Failed to generate plan");

      // 3. Clear local storage
      localStorage.removeItem(`guildforge_brief_${guildId}`);

      // 4. Navigate to execution page
      router.push(`/dashboard/${guildId}/plan/${conversation.id}`);
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message || "An error occurred");
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (mode === "freeform") {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-50 p-8 flex items-center justify-center">
        <div className="max-w-2xl w-full p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Describe Your Server</h2>
            <button onClick={() => setMode("wizard")} className="text-sm text-blue-400 hover:text-blue-300">
              ← Back to Wizard
            </button>
          </div>
          <p className="text-slate-400 text-sm">Tell the AI exactly what you want in plain english. It will figure out the categories, channels, and roles.</p>
          <textarea
            value={freeformText}
            onChange={(e) => setFreeformText(e.target.value)}
            rows={10}
            placeholder="I want a chill server for playing Destiny 2 with my clan. We need LFGs, voice channels, a meme chat..."
            className="w-full p-4 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 resize-none"
          />
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <div className="flex justify-end pt-4">
            <button
              onClick={() => handleSubmit(undefined, freeformText)}
              disabled={isSubmitting || !freeformText.trim()}
              className="px-6 py-2 rounded bg-blue-600 text-white hover:bg-blue-500 font-bold disabled:opacity-50"
            >
              {isSubmitting ? "Generating..." : "Generate Plan"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-8 pt-16">
      <div className="max-w-2xl mx-auto mb-8 text-center space-y-2">
        <h1 className="text-3xl font-bold">Guild Architect</h1>
        <p className="text-slate-400">Let&apos;s design your Discord server step by step.</p>
      </div>
      
      {error && <div className="max-w-2xl mx-auto mb-4 p-4 bg-red-900/50 border border-red-800 text-red-200 rounded-lg">{error}</div>}
      
      {isSubmitting ? (
        <div className="max-w-2xl mx-auto p-12 bg-slate-900 border border-slate-800 rounded-xl text-center space-y-4">
          <div className="text-blue-500 animate-spin text-4xl">⚙</div>
          <h3 className="text-xl font-bold">The AI is architecting your server...</h3>
          <p className="text-slate-400">This usually takes about 10-20 seconds.</p>
        </div>
      ) : (
        <FormWizard 
          guildId={guildId} 
          onComplete={(brief) => handleSubmit(brief)} 
          onSkip={() => setMode("freeform")} 
        />
      )}
    </div>
  );
}
