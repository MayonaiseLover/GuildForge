export default function TeamsLoading() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div className="h-8 w-40 bg-slate-800 rounded-lg animate-pulse" />
          <div className="h-10 w-36 bg-slate-800 rounded-lg animate-pulse" />
        </div>
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-800 rounded-full" />
                <div className="flex-1">
                  <div className="h-5 w-40 bg-slate-800 rounded mb-2" />
                  <div className="h-3 w-24 bg-slate-800 rounded" />
                </div>
                <div className="h-8 w-20 bg-slate-800 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
