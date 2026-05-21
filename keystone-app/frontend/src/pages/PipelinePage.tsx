import { useSnapshot } from '../api/snapshot'
import type { PipelineData } from '../types'
import { Card, PageHeader } from '../components/PageHeader'

export function PipelinePage() {
  const d = useSnapshot<PipelineData>('pipeline.json')
  const data = d.data

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Pipeline"
        title="Connector and layer status"
        sub="Fivetran's SAP ERP on HANA connector (no ODP RFC dependency), four dbt layers, snapshot publication to the frontend. The failure simulator below shows what would and would not break under common incidents — including the July 2026 ODP RFC blocking."
      />

      <Card title="Source connector">
        <div className="grid md:grid-cols-4 gap-4 text-sm">
          <Stat label="Source"          value={data?.connector_status.name ?? '—'} />
          <Stat label="State"           value={data?.connector_status.state ?? '—'} highlight />
          <Stat label="Last sync"       value={data?.connector_status.last_sync_at ?? '—'} />
          <Stat label="Tables"          value={`${data?.connector_status.tables_replicated ?? 0} · every ${data?.connector_status.sync_frequency_min ?? 0} min`} />
        </div>
      </Card>

      <Card title="Layer status">
        <ul className="space-y-2">
          {data?.layer_status.map(l => (
            <li key={l.layer} className="flex items-center justify-between border border-slate-800 rounded-md px-4 py-2">
              <div>
                <div className="text-slate-100 font-mono">{l.layer}</div>
                <div className="text-xs text-slate-500">Last run: {l.last_run}</div>
              </div>
              <div className="text-right">
                <div className={`text-xs uppercase ${l.state === 'healthy' ? 'text-emerald-300' : 'text-amber-300'}`}>
                  {l.state}
                </div>
                {l.rows !== null && <div className="text-sm tabular-nums text-slate-300">{l.rows.toLocaleString()} rows</div>}
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <Card title="Failure simulator">
        <div className="space-y-3">
          {data?.failure_sim.map(f => (
            <div key={f.id}
                 className={`border rounded-md p-4 ${
                   f.would_impact ? 'border-amber-500/40 bg-amber-500/5' : 'border-emerald-500/30 bg-emerald-500/5'
                 }`}>
              <div className="flex items-center justify-between mb-1">
                <div className="font-medium text-slate-100">{f.title}</div>
                <span className={`text-xs uppercase tracking-wider px-2 py-0.5 rounded ${
                  f.would_impact ? 'text-amber-300 bg-amber-500/15' : 'text-emerald-300 bg-emerald-500/15'
                }`}>
                  {f.would_impact ? 'Would impact' : 'No impact'}
                </span>
              </div>
              <p className="text-sm text-slate-300">{f.narrative}</p>
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
      <div className="text-xs uppercase tracking-wider text-slate-500">{label}</div>
      <div className={`mt-1 ${highlight ? 'text-emerald-300 font-semibold uppercase' : 'text-slate-100'}`}>
        {value}
      </div>
    </div>
  )
}
