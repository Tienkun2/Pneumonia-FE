export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[17px] font-semibold text-foreground tracking-tight">{children}</h2>
  );
}

export function Panel({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={`bg-card border border-border/50 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ${className}`}>
      {children}
    </div>
  );
}

export function TrendLine({ up = true }: { up?: boolean }) {
  const h = up
    ? [3, 5, 4, 7, 6, 8, 7, 9]
    : [9, 7, 8, 5, 6, 4, 5, 3];
  return (
    <svg width="52" height="24" viewBox="0 0 52 24" className="opacity-60">
      {h.map((v, i) => (
        <rect
          key={i}
          x={i * 7}
          y={24 - v * 2.4}
          width="5"
          height={v * 2.4}
          rx="2"
          fill={up ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"}
          opacity={0.4 + i * 0.08}
        />
      ))}
    </svg>
  );
}
