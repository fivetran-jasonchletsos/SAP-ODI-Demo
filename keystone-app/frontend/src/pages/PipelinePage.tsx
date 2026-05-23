import { Link } from 'react-router-dom'
import { useSnapshot } from '../api/snapshot'
import type { PipelineData } from '../types'
import { Card, PageHeader } from '../components/PageHeader'

const FIVETRAN_BASE = 'https://fivetran.com/dashboard/connectors'

export function PipelinePage() {
  const d = useSnapshot<PipelineData>('pipeline.json')
  const data = d.data
  const connectorId = data?.connector_status.fivetran_id

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Pipeline"
        title="Connector and layer status"
        sub="Fivetran's SAP ERP on HANA connector (no ODP RFC dependency), four dbt layers, snapshot publication to the frontend. The failure simulator below shows what would and would not break under common incidents — including the July 2026 ODP RFC blocking."
      />

      <Card title="Source connector">
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
          <Stat label="Source"          value={data?.connector_status.name ?? '—'} />
          <Stat label="State"           value={data?.connector_status.state ?? '—'} highlight />
          <Stat label="Last sync"       value={data?.connector_status.last_sync_at ?? '—'} />
          <Stat label="Tables"          value={`${data?.connector_status.tables_replicated ?? 0} · every ${data?.connector_status.sync_frequency_min ?? 0} min`} />
        </div>

        {/* Fivetran connector ID + deep link */}
        <div
          className="flex flex-wrap items-center gap-3 pt-3"
          style={{ borderTop: '1px solid var(--border-soft)' }}
        >
          <div className="flex items-center gap-2">
            <span
              className="text-xs text-slate-500 uppercase"
              style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}
            >
              Fivetran connector ID
            </span>
            <code
              className="text-xs px-2 py-0.5 rounded"
              style={{
                fontFamily: 'var(--font-mono)',
                background: 'var(--surface-2)',
                color: '#a78bfa',
                border: '1px solid var(--border-soft)',
              }}
            >
              {connectorId ?? '—'}
            </code>
          </div>

          {connectorId && (
            <a
              href={`${FIVETRAN_BASE}/${connectorId}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium rounded px-3 py-1.5 transition-colors"
              style={{
                background: 'var(--accent-muted)',
                color: 'var(--accent)',
                border: '1px solid rgba(251,191,36,0.25)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              Open in Fivetran
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 3H3a1 1 0 00-1 1v9a1 1 0 001 1h9a1 1 0 001-1v-3M10 2h4m0 0v4m0-4L6 10" />
              </svg>
            </a>
          )}
        </div>
      </Card>

      <Card title="Layer status">
        <ul className="space-y-2">
          {data?.layer_status.map(l => (
            <li key={l.layer} className="flex items-center justify-between rounded px-4 py-2.5"
                style={{ border: '1px solid var(--border-soft)', background: 'var(--surface-2)' }}>
              <div>
                <div className="text-slate-100 text-sm" style={{ fontFamily: 'var(--font-mono)' }}>{l.layer}</div>
                <div className="text-xs text-slate-500 mt-0.5">Last run: {l.last_run}</div>
              </div>
              <div className="text-right">
                <div className={`text-xs uppercase font-medium ${l.state === 'healthy' ? 'text-emerald-400' : 'text-amber-400'}`}
                     style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>
                  {l.state}
                </div>
                {l.rows !== null && (
                  <div className="text-sm tabular-nums text-slate-300 mt-0.5"
                       style={{ fontFamily: 'var(--font-mono)' }}>
                    {l.rows.toLocaleString()} rows
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </Card>

      {/* dbt-wizard callout — links to live demo */}
      <div
        className="rounded p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        style={{
          border: '1px solid rgba(245,158,11,0.22)',
          background: 'linear-gradient(135deg, rgba(245,158,11,0.05) 0%, rgba(3,7,18,0) 60%)',
        }}
      >
        <div>
          <div
            className="text-xs uppercase tracking-widest mb-2 font-medium"
            style={{ fontFamily: 'var(--font-mono)', color: '#f59e0b', letterSpacing: '0.12em' }}
          >
            dbt-wizard · on-demand gold models
          </div>
          <div
            className="text-base font-semibold text-slate-50 mb-1"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            When a CFO question has no gold model to answer it
          </div>
          <p className="text-sm text-slate-400 max-w-xl">
            Four sub-agents surface the upstreams, author the SQL, write the tests, and
            materialize a new Iceberg gold table in 90 seconds — against the same Snowflake
            account this pipeline feeds. Watch it live on the DPO scenario.
          </p>
        </div>
        <div className="flex flex-col gap-2 shrink-0">
          <Link
            to="/dbt-wizard/scenario"
            className="px-4 py-2 rounded text-sm font-semibold transition-colors whitespace-nowrap text-center"
            style={{ background: '#f59e0b', color: '#030712' }}
          >
            See the DPO scenario
          </Link>
          <Link
            to="/dbt-wizard/live"
            className="px-4 py-2 rounded text-sm font-medium transition-colors whitespace-nowrap text-center"
            style={{ border: '1px solid rgba(245,158,11,0.30)', color: '#f59e0b' }}
          >
            Jump to Live Build
          </Link>
        </div>
      </div>

      <Card title="Failure simulator">
        <div className="space-y-3">
          {data?.failure_sim.map(f => (
            <div key={f.id}
                 className="rounded p-4"
                 style={{
                   border: `1px solid ${f.would_impact ? 'rgba(245,158,11,0.30)' : 'rgba(52,211,153,0.20)'}`,
                   background: f.would_impact ? 'rgba(245,158,11,0.04)' : 'rgba(52,211,153,0.04)',
                 }}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="text-sm font-medium text-slate-100">{f.title}</div>
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    color: f.would_impact ? '#fbbf24' : '#34d399',
                    background: f.would_impact ? 'rgba(251,191,36,0.10)' : 'rgba(52,211,153,0.10)',
                    letterSpacing: '0.06em',
                  }}
                >
                  {f.would_impact ? 'Would impact' : 'No impact'}
                </span>
              </div>
              <p className="text-sm text-slate-400">{f.narrative}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <div
        className="text-xs uppercase text-slate-500 mb-0.5"
        style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.09em' }}
      >
        {label}
      </div>
      <div className={`text-sm ${highlight ? 'font-semibold uppercase' : 'text-slate-200'}`}
           style={{ color: highlight ? '#34d399' : undefined, fontFamily: highlight ? 'var(--font-mono)' : undefined }}>
        {value}
      </div>
    </div>
  )
}
