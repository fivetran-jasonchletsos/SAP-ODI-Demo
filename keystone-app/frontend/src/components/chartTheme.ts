// Chart theme — Tufte/Few discipline.
// Subtle gridlines, no chartjunk, units on axes, reference lines for benchmarks.

export const theme = {
  grid:       '#1e293b',
  gridSoft:   '#0f172a',
  axis:       '#475569',
  tickLabel:  '#94a3b8',
  primary:    '#fbbf24',   // amber-400 — used sparingly, for the primary metric
  secondary:  '#a78bfa',   // violet-400 — secondary categorical
  good:       '#34d399',   // emerald-400 — favorable threshold
  bad:        '#f87171',   // rose-400  — unfavorable threshold
  reference:  '#64748b',   // slate-500 — neutral target/benchmark line
}

// Compact axis tick: small, slate, no tick lines (Few: remove redundant ink)
export const axisProps = {
  stroke: theme.axis,
  tick: { fontSize: 11, fill: theme.tickLabel },
  tickLine: false,
  axisLine: { stroke: theme.grid },
}

export const gridProps = {
  stroke: theme.gridSoft,
  vertical: false,
  strokeDasharray: '0',
}

export const tooltipProps = {
  contentStyle: {
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: 6,
    fontSize: 12,
  },
  labelStyle:    { color: '#e2e8f0', fontWeight: 500 },
  itemStyle:     { color: '#e2e8f0' },
  cursor:        { fill: '#1e293b40' },
}

export const fmt = {
  money:    (v: number) => `$${(v/1000).toFixed(0)}k`,
  moneyM:   (v: number) => `$${(v/1_000_000).toFixed(1)}M`,
  days:     (v: number) => `${v.toFixed(0)}d`,
  pct:      (v: number) => `${v.toFixed(1)}%`,
  intCommas:(v: number) => v.toLocaleString(),
}
