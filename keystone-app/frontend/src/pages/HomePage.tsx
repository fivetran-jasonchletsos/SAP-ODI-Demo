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
      <section
        className="rounded-md p-6 md:p-8"
        style={{
          border: '1px solid rgba(251,191,36,0.18)',
          background: 'linear-gradient(135deg, rgba(251,191,36,0.04) 0%, rgba(3,7,18,0) 60%)',
        }}
      >
        <div
          className="text-xs uppercase tracking-widest mb-2 font-medium"
          style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)', letterSpacing: '0.12em' }}
        >
          Why Pendulum Industries built this
        </div>
        <h1
          className="text-2xl sm:text-3xl md:text-[2.2rem] font-semibold text-slate-50 leading-tight max-w-3xl"
          style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}
        >
          When the vendor of record restricts AI access to your own data,
          the only safe place for your AI strategy is your own lakehouse.
        </h1>
        <p className="text-slate-300 mt-4 max-w-3xl leading-relaxed text-sm">
          {summary.data?.policy_excerpt ?? 'Loading...'}
        </p>
        <div className="flex flex-wrap gap-3 mt-6">
          <Link
            to="/policy"
            className="px-4 py-2 rounded text-sm font-semibold transition-colors"
            style={{
              background: 'var(--accent)',
              color: '#030712',
            }}
          >
            Read the policy brief
          </Link>
          <Link
            to="/architecture"
            className="px-4 py-2 rounded text-sm font-medium transition-colors"
            style={{
              border: '1px solid var(--border-strong)',
              color: '#cbd5e1',
            }}
          >
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

      {/* dbt-wizard demo CTA */}
      <section
        className="rounded-md p-6"
        style={{
          border: '1px solid rgba(245,158,11,0.22)',
          background: 'linear-gradient(135deg, rgba(245,158,11,0.06) 0%, rgba(3,7,18,0) 60%)',
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div
              className="text-xs uppercase tracking-widest mb-2 font-medium"
              style={{ fontFamily: 'var(--font-mono)', color: '#f59e0b', letterSpacing: '0.12em' }}
            >
              dbt-wizard · live demo
            </div>
            <h2
              className="text-xl sm:text-2xl font-semibold text-slate-50 leading-tight max-w-2xl"
              style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}
            >
              CFO asks why EMEA DPO extended 9 days. No gold model exists.
              Audit Committee meets in 22 hours.
            </h2>
            <p className="text-slate-400 mt-2 text-sm">
              dbt-wizard surfaces the upstreams, authors the SQL, writes the tests, and
              materializes the Iceberg table in 90 seconds.
              $18M working-capital exposure. Root cause: config rollback, not a hiring decision.
            </p>
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            <Link
              to="/dbt-wizard/scenario"
              className="px-5 py-2.5 rounded text-sm font-semibold transition-colors whitespace-nowrap text-center"
              style={{ background: '#f59e0b', color: '#030712' }}
            >
              See the scenario
            </Link>
            <Link
              to="/dbt-wizard/live"
              className="px-5 py-2.5 rounded text-sm font-medium transition-colors whitespace-nowrap text-center"
              style={{ border: '1px solid rgba(245,158,11,0.30)', color: '#f59e0b' }}
            >
              Jump to Live Build
            </Link>
          </div>
        </div>
      </section>

      <section className="text-xs text-slate-500">
        Last sync: {summary.data?.last_sync_at ?? '—'} · As-of date: {summary.data?.today ?? '—'}
      </section>
    </div>
  )
}
