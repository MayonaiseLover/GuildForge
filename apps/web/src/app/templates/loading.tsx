export default function TemplatesLoading() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div className="h-8 w-56 bg-slate-800 rounded-lg animate-pulse" />
          <div className="h-10 w-36 bg-slate-800 rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 animate-pulse">
              <div className="h-5 w-32 bg-slate-800 rounded mb-3" />
              <div className="h-3 w-full bg-slate-800 rounded mb-2" />
              <div className="h-3 w-2/3 bg-slate-800 rounded mb-4" />
              <div className="flex gap-2">
                <div className="h-6 w-16 bg-slate-800 rounded-full" />
                <div className="h-6 w-20 bg-slate-800 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
