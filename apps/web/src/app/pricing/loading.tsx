export default function PricingLoading() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-6">
      <div className="max-w-5xl mx-auto text-center">
        <div className="h-10 w-48 bg-slate-800 rounded-lg animate-pulse mx-auto mb-4" />
        <div className="h-4 w-72 bg-slate-800 rounded animate-pulse mx-auto mb-12" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-8 animate-pulse">
              <div className="h-6 w-24 bg-slate-800 rounded mb-4 mx-auto" />
              <div className="h-10 w-32 bg-slate-800 rounded-lg mb-6 mx-auto" />
              <div className="space-y-3 mb-8">
                {[...Array(5)].map((_, j) => (
                  <div key={j} className="h-3 w-full bg-slate-800 rounded" />
                ))}
              </div>
              <div className="h-12 w-full bg-slate-800 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
