export default function LoginLoading() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center p-6">
      <div className="max-w-sm w-full text-center animate-pulse">
        <div className="h-16 w-16 bg-slate-800 rounded-2xl mx-auto mb-6" />
        <div className="h-8 w-40 bg-slate-800 rounded-lg mx-auto mb-3" />
        <div className="h-4 w-56 bg-slate-800 rounded mx-auto mb-10" />
        <div className="h-12 w-full bg-slate-800 rounded-xl" />
      </div>
    </div>
  );
}
