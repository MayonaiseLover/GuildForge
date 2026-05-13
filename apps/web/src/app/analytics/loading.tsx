export default function AnalyticsLoading() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="h-8 w-36 bg-slate-800 rounded-lg animate-pulse mb-10" />

        {/* KPI row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 animate-pulse">
              <div className="h-3 w-16 bg-slate-800 rounded mb-3" />
              <div className="h-7 w-14 bg-slate-800 rounded" />
            </div>
          ))}
        </div>

        {/* Charts grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 animate-pulse">
              <div className="h-4 w-28 bg-slate-800 rounded mb-6" />
              <div className="h-44 bg-slate-800/50 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
