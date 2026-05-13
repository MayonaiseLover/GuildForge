"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function BillingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Billing error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="text-6xl">💳</div>
        <h1 className="text-2xl font-bold text-white">Billing Error</h1>
        <p className="text-slate-400 text-sm leading-relaxed">
          {error.message || "Failed to load billing information. Your subscription is unaffected."}
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <button
            onClick={reset}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors text-sm"
          >
            Try Again
          </button>
          <Link
            href="/dashboard"
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-semibold rounded-xl transition-colors text-sm"
          >
            Back to Dashboard
          </Link>
        </div>
        {process.env.NODE_ENV === "development" && error.digest && (
          <p className="text-xs text-slate-600 font-mono">Digest: {error.digest}</p>
        )}
      </div>
    </div>
  );
}
