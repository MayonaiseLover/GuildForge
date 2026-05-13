export default function BillingLoading() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="h-8 w-32 bg-slate-800 rounded-lg animate-pulse mb-10" />

        {/* Current plan card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 animate-pulse mb-8">
          <div className="h-5 w-28 bg-slate-800 rounded mb-4" />
          <div className="h-10 w-20 bg-slate-800 rounded mb-2" />
          <div className="h-3 w-48 bg-slate-800 rounded" />
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 animate-pulse">
              <div className="h-5 w-20 bg-slate-800 rounded mb-4" />
              <div className="h-8 w-24 bg-slate-800 rounded mb-6" />
              <div className="space-y-2">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="h-3 w-full bg-slate-800 rounded" />
                ))}
              </div>
              <div className="h-10 w-full bg-slate-800 rounded-lg mt-6" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
