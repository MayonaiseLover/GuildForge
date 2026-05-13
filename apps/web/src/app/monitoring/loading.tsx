export default function MonitoringLoading() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="h-8 w-52 bg-slate-800 rounded-lg animate-pulse mb-10" />

        {/* Health status cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 animate-pulse">
              <div className="h-3 w-20 bg-slate-800 rounded mb-3" />
              <div className="h-6 w-12 bg-slate-800 rounded" />
            </div>
          ))}
        </div>

        {/* Chart skeleton */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 animate-pulse mb-8">
          <div className="h-4 w-32 bg-slate-800 rounded mb-6" />
          <div className="h-48 bg-slate-800/50 rounded-xl" />
        </div>

        {/* Alert rules */}
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-4 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="h-4 w-48 bg-slate-800 rounded" />
                <div className="h-6 w-16 bg-slate-800 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
