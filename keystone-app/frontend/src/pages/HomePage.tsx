import { Link } from 'react-router-dom'
import { useSnapshot } from '../api/snapshot'
import type { SummaryData, RiskMapEntry } from '../types'
import { KpiTile } from '../components/KpiTile'
import { Card } from '../components/PageHeader'

export function HomePage() {
  const summary = useSnapshot<SummaryData>('summary.json')
  const risks = useSnapshot<RiskMapEntry[]>('policy_risk_map.json')

  return (
    <div className="space-y-8">
      <section className="border border-amber-500/20 bg-amber-500/5 rounded-lg p-6">
        <div className="text-xs uppercase tracking-wider text-amber-300 mb-2">
          Why Keystone built this
        </div>
        <h1 className="text-3xl md:text-4xl font-semibold text-slate-50 leading-tight">
          When the vendor of record restricts AI access to your own data,
          the only safe place for your AI strategy is your own lakehouse.
        </h1>
        <p className="text-slate-300 mt-4 max-w-3xl leading-relaxed">
          {summary.data?.policy_excerpt ?? 'Loading...'}
        </p>
        <div className="flex flex-wrap gap-3 mt-5">
          <Link to="/policy" className="px-4 py-2 rounded-md bg-amber-400/90 text-slate-950 font-medium hover:bg-amber-300 transition">
            Read the policy brief
          </Link>
          <Link to="/architecture" className="px-4 py-2 rounded-md border border-slate-700 text-slate-200 hover:border-slate-500 transition">
            See the ODI architecture
          </Link>
        </div>
      </section>

      <section>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {summary.data?.kpis.map((k, i) => <KpiTile key={i} kpi={k} />)}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-3">
          Four risk areas. Four answers in this demo.
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {risks.data?.map((r, i) => (
            <Card key={i} title={r.risk}>
              <p className="text-slate-400 text-sm mb-2 italic">"{r.claim}"</p>
              <p className="text-slate-200 text-sm mb-3">{r.answer}</p>
              <Link to={r.link} className="text-amber-300 text-sm hover:text-amber-200">
                {r.link_label} →
              </Link>
            </Card>
          ))}
        </div>
      </section>

      <section className="text-xs text-slate-500">
        Last sync: {summary.data?.last_sync_at ?? '—'} · As-of date: {summary.data?.today ?? '—'}
      </section>
    </div>
  )
}
