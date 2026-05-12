"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  const isAuthError =
    error.message?.toLowerCase().includes("unauthorized") ||
    error.message?.toLowerCase().includes("401");

  const isLimitError = error.message?.toLowerCase().includes("limit");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="text-6xl">
          {isAuthError ? "🔐" : isLimitError ? "🚫" : "⚡"}
        </div>

        <h1 className="text-2xl font-bold text-white">
          {isAuthError
            ? "Session Expired"
            : isLimitError
            ? "Build Limit Reached"
            : "Something went wrong"}
        </h1>

        <p className="text-slate-400 text-sm leading-relaxed">
          {isAuthError
            ? "Your session has expired. Please log in again to continue."
            : isLimitError
            ? "You've used all your builds for this month. Upgrade your plan to continue building."
            : error.message || "An unexpected error occurred. If this keeps happening, try refreshing."}
        </p>

        <div className="flex gap-3 justify-center flex-wrap">
          {isAuthError ? (
            <a
              href="/login"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors text-sm"
            >
              Log In Again
            </a>
          ) : isLimitError ? (
            <a
              href="/pricing"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors text-sm"
            >
              Upgrade Plan
            </a>
          ) : (
            <button
              onClick={reset}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors text-sm"
            >
              Try Again
            </button>
          )}
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
