export function PageLoader() {
  return (
    <div className="min-h-screen bg-[#080b0f] flex items-center justify-center animate-fade-in">
      <div className="flex flex-col items-center gap-3">
        <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-zinc-600">Loading…</p>
      </div>
    </div>
  );
}
