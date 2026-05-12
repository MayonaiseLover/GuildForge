export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header skeleton */}
        <div className="flex items-center justify-between mb-10">
          <div className="h-8 w-48 bg-slate-800 rounded-lg animate-pulse" />
          <div className="h-10 w-32 bg-slate-800 rounded-lg animate-pulse" />
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 animate-pulse">
              <div className="h-4 w-24 bg-slate-800 rounded mb-3" />
              <div className="h-8 w-16 bg-slate-800 rounded" />
            </div>
          ))}
        </div>

        {/* Guild cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-slate-800 rounded-full" />
                <div>
                  <div className="h-4 w-32 bg-slate-800 rounded mb-2" />
                  <div className="h-3 w-20 bg-slate-800 rounded" />
                </div>
              </div>
              <div className="h-3 w-full bg-slate-800 rounded mb-2" />
              <div className="h-3 w-2/3 bg-slate-800 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
