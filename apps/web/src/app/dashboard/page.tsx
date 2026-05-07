"use client";
// Placeholder for TanStack query + actual fetching
export default function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-8">
      <h1 className="text-3xl font-bold mb-8">Your Guilds</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-6 border border-slate-800 rounded-xl bg-slate-900/50">
          <h2 className="text-xl font-semibold mb-4">Loading guilds...</h2>
        </div>
      </div>
    </div>
  );
}
