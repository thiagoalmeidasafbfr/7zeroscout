export function SelBadge({ sel, copa }: { sel: string; copa?: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-9 w-12 rounded-md border border-ink-600 bg-ink-800 flex items-center justify-center font-mono font-bold text-pitch-200 text-sm tracking-wider">
        {sel}
      </div>
      {copa != null && (
        <div className="text-ink-300 text-sm font-mono">{copa}</div>
      )}
    </div>
  );
}
