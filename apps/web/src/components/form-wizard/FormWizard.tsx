"use client";

import { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BuildBriefSchema, BuildBrief } from "@guildforge/plan-schema";
import StepPurpose from "./StepPurpose";
import StepSize from "./StepSize";
import StepAudience from "./StepAudience";
import StepCoreNeeds from "./StepCoreNeeds";
import StepTopics from "./StepTopics";
import StepRoles from "./StepRoles";
import StepBranding from "./StepBranding";
import StepReview from "./StepReview";

const STEPS = 8;

export function FormWizard({ guildId, onComplete, onSkip }: { guildId: string, onComplete: (brief: BuildBrief) => void, onSkip: () => void }) {
  const [step, setStep] = useState(1);
  const storageKey = `guildforge_brief_${guildId}`;

  const methods = useForm<BuildBrief>({
    resolver: zodResolver(BuildBriefSchema),
    defaultValues: {
      vibeChips: [],
      coreNeeds: []
    }
  });

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        methods.reset(JSON.parse(saved));
      } catch {
        // ignore
      }
    }
  }, [guildId, methods, storageKey]);

  // Save to localStorage on change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/incompatible-library
    const subscription = methods.watch((value) => {
      localStorage.setItem(storageKey, JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  const nextStep = async () => {
    // We could validate specific fields per step here if we wanted
    if (step < STEPS) {
      setStep(s => s + 1);
    } else {
      methods.handleSubmit(onSubmit)();
    }
  };

  const prevStep = () => {
    if (step > 1) setStep(s => s - 1);
  };

  const onSubmit = (data: BuildBrief) => {
    onComplete(data);
  };

  return (
    <FormProvider {...methods}>
      <div className="max-w-2xl mx-auto p-6 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Build Wizard (Step {step} of {STEPS})</h2>
          {step === 1 && (
            <button onClick={onSkip} className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
              Skip & Just Describe It →
            </button>
          )}
        </div>

        <div className="min-h-[300px]">
          {step === 1 && <StepPurpose />}
          {step === 2 && <StepSize />}
          {step === 3 && <StepAudience />}
          {step === 4 && <StepCoreNeeds />}
          {step === 5 && <StepTopics />}
          {step === 6 && <StepRoles />}
          {step === 7 && <StepBranding />}
          {step === 8 && <StepReview />}
        </div>

        <div className="flex justify-between mt-8 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={prevStep}
            disabled={step === 1}
            className="px-4 py-2 rounded bg-slate-800 text-white disabled:opacity-50 hover:bg-slate-700"
          >
            Back
          </button>
          <button
            type="button"
            onClick={nextStep}
            className="px-6 py-2 rounded bg-blue-600 text-white hover:bg-blue-500 font-bold"
          >
            {step === STEPS ? "Generate Plan" : "Next"}
          </button>
        </div>
      </div>
    </FormProvider>
  );
}
