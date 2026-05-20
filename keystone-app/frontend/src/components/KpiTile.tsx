import type { Kpi } from '../types'

export function KpiTile({ kpi }: { kpi: Kpi }) {
  return (
    <div className="border border-slate-800 bg-slate-900/40 rounded-lg p-4">
      <div className="text-xs uppercase tracking-wider text-slate-400">{kpi.label}</div>
      <div className="text-2xl font-semibold text-slate-100 mt-1">{kpi.value}</div>
      {kpi.sublabel && <div className="text-xs text-slate-500 mt-1">{kpi.sublabel}</div>}
    </div>
  )
}
