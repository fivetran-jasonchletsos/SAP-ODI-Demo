import { useState } from 'react'
import { useSnapshot } from '../api/snapshot'
import type { IcebergData } from '../types'
import { Card, PageHeader } from '../components/PageHeader'

export function ArchitecturePage() {
  const d = useSnapshot<IcebergData>('iceberg.json')
  const data = d.data
  const [selectedEngine, setSelectedEngine] = useState(0)

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="ODI Architecture"
        title="The architecture that makes the SAP API policy a non-event"
        sub="Single Iceberg copy in your S3. Glue as the catalog. dbt builds the marts. Any engine reads — including the LLM that powers /agent."
      />

      <section id="engines">
        <Card title="Multi-engine read on a single copy of the data">
          <p className="text-sm text-slate-400 mb-4 max-w-3xl">
            One of the four risk areas the article calls out is cost stacking — the compounding cost
            of paying SAP for extraction, then for the analytical surface, then again to land
            elsewhere. ODI answers it by writing one copy of the gold layer to Iceberg and
            letting every engine read it.
          </p>
          <div className="grid md:grid-cols-5 gap-2 mb-4">
            {data?.engines.map((e, i) => (
              <button key={e.name}
                      onClick={() => setSelectedEngine(i)}
                      className={`text-left px-3 py-2 rounded-md border transition ${
                        selectedEngine === i
                          ? 'border-amber-400/60 bg-amber-400/10 text-amber-200'
                          : 'border-slate-800 hover:border-slate-600 text-slate-300'
                      }`}>
                <div className="text-sm font-medium">{e.name}</div>
                <div className="text-xs text-slate-500 mt-0.5">{e.use_case}</div>
              </button>
            ))}
          </div>
          {data?.engines[selectedEngine] && (
            <pre className="bg-slate-950 border border-slate-800 rounded-md p-4 text-xs text-amber-200 overflow-auto whitespace-pre-wrap">
{data.engines[selectedEngine].sample_sql}
            </pre>
          )}
        </Card>
      </section>

      <section id="infra">
        <Card title="Iceberg tables in S3 (Glue-cataloged)">
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  <th className="py-2 pr-4">Schema</th>
                  <th className="py-2 pr-4">Table</th>
                  <th className="py-2 pr-4 text-right">Rows</th>
                  <th className="py-2 pr-4">Format</th>
                  <th className="py-2 pr-4">Catalog</th>
                  <th className="py-2">Storage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {data?.tables.map(t => (
                  <tr key={`${t.schema}.${t.table}`} className="text-slate-200">
                    <td className="py-2 pr-4 text-xs text-slate-400 font-mono">{t.schema}</td>
                    <td className="py-2 pr-4 font-mono text-amber-200">{t.table}</td>
                    <td className="py-2 pr-4 text-right tabular-nums">{t.row_count.toLocaleString()}</td>
                    <td className="py-2 pr-4 text-xs">{t.format}</td>
                    <td className="py-2 pr-4 text-xs">{t.catalog}</td>
                    <td className="py-2 text-xs text-slate-500 font-mono">{t.storage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      <Card title="SAP BW / Datasphere vs Open Data Infrastructure">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <th className="py-2 pr-4"></th>
              <th className="py-2 pr-4">SAP BW / Datasphere</th>
              <th className="py-2">ODI (this demo)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {data?.mds_vs_odi.map(r => (
              <tr key={r.dimension} className="text-slate-200">
                <td className="py-2 pr-4 font-semibold text-slate-300">{r.dimension}</td>
                <td className="py-2 pr-4 text-slate-400">{r.sap_bw}</td>
                <td className="py-2 text-amber-200">{r.odi}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card title="Lineage">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {data?.lineage.nodes.map((n, i) => (
            <div key={n.id} className="flex items-center gap-2">
              <span className={`px-3 py-1.5 rounded-md border ${
                n.group === 'source'    ? 'border-rose-500/40 text-rose-300 bg-rose-500/5'
                : n.group === 'ingest'  ? 'border-amber-500/40 text-amber-300 bg-amber-500/5'
                : n.group === 'lake'    ? 'border-sky-500/40 text-sky-300 bg-sky-500/5'
                : n.group === 'transform' ? 'border-violet-500/40 text-violet-300 bg-violet-500/5'
                : 'border-emerald-500/40 text-emerald-300 bg-emerald-500/5'
              }`}>{n.label}</span>
              {i < (data?.lineage.nodes.length ?? 0) - 1 && <span className="text-slate-600">→</span>}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
