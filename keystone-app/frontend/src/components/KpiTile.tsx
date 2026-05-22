import type { Kpi } from '../types'

export function KpiTile({ kpi }: { kpi: Kpi }) {
  return (
    <div className="kpi-tile p-4">
      <div
        className="text-xs uppercase font-medium text-slate-500 mb-1"
        style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.09em' }}
      >
        {kpi.label}
      </div>
      <div
        className="text-xl font-semibold text-slate-100 tabular-nums"
        style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}
      >
        {kpi.value}
      </div>
      {kpi.sublabel && (
        <div className="text-xs text-slate-500 mt-0.5" style={{ fontFamily: 'var(--font-mono)' }}>
          {kpi.sublabel}
        </div>
      )}
    </div>
  )
}
