"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GuildForge Error]", error);
  }, [error]);

  return (
    <html>
      <body className="bg-slate-950 text-slate-50">
        <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
          <div className="text-6xl mb-4">⚡</div>
          <h1 className="text-2xl font-bold mb-3">Something went wrong</h1>
          <p className="text-slate-400 mb-8 max-w-md">
            GuildForge hit an unexpected error. This has been logged.
          </p>
          <button
            onClick={reset}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors"
          >
            Try again
          </button>
          {error.digest && (
            <p className="mt-4 text-xs text-slate-600 font-mono">Error ID: {error.digest}</p>
          )}
        </div>
      </body>
    </html>
  );
}
