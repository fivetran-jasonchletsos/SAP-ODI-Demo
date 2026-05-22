import { useState } from 'react'
import { useSnapshot } from '../api/snapshot'
import type { AgentData } from '../types'
import { Card, PageHeader } from '../components/PageHeader'

export function AgentPage() {
  const d = useSnapshot<AgentData>('agent.json')
  const [q, setQ] = useState('')
  const [history, setHistory] = useState<Array<{ q: string; a: string }>>([])

  function ask(question: string) {
    const a = simulatedAnswer(question)
    setHistory(h => [...h, { q: question, a }])
    setQ('')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="AI Agent"
        title="Claude reads the Iceberg lake. SAP never sees the request."
        sub="The point of this page is the architecture, not the answer. Every callout below describes a path that never touches an SAP API or ODP RFC."
      />

      <div className="grid lg:grid-cols-[1fr_320px] gap-5">
        <Card title="Ask the lake">
          <form onSubmit={(e) => { e.preventDefault(); if (q.trim()) ask(q.trim()) }}
                className="flex gap-2 mb-4">
            <input value={q} onChange={(e) => setQ(e.target.value)}
                   placeholder="e.g. Which vendors are below 90% three-way match?"
                   className="flex-1 bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:border-amber-400/60 outline-none" />
            <button className="px-3 py-2 rounded-md bg-amber-400/90 text-slate-950 text-sm font-medium hover:bg-amber-300">
              Ask
            </button>
          </form>

          <div className="text-xs uppercase tracking-wider text-slate-400 mb-2">Sample questions</div>
          <div className="flex flex-wrap gap-2 mb-5">
            {d.data?.sample_questions.map(s => (
              <button key={s} onClick={() => ask(s)}
                      className="text-xs px-3 py-1 rounded-full border border-slate-800 hover:border-amber-400/40 text-slate-300 transition">
                {s}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {history.length === 0 && (
              <div className="text-sm text-slate-500 italic">
                Pick a question above or type your own. This is a stubbed agent — the rules
                below pattern-match the question and return canned analytical answers
                computed from the same JSON the other pages render.
              </div>
            )}
            {history.map((h, i) => (
              <div key={i} className="border border-slate-800 rounded-md">
                <div className="px-3 py-2 bg-slate-900/40 text-slate-300 text-sm">Q: {h.q}</div>
                <div className="px-3 py-2 text-slate-200 text-sm whitespace-pre-wrap">{h.a}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="What just happened">
          <ul className="space-y-2 text-sm">
            {d.data?.policy_callouts.map((c, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-amber-300 mt-0.5">›</span>
                <span className="text-slate-300">{c}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  )
}

function simulatedAnswer(q: string): string {
  const lower = q.toLowerCase()
  if (lower.includes('dso') || lower.includes('receivable'))
    return 'Top DSO offenders pulled from mart_dso: customers with the highest AR / monthly revenue ratio surface on /o2c. Run: SELECT customer_id, AVG(dso_days) FROM mart_dso GROUP BY 1 ORDER BY 2 DESC LIMIT 10;'
  if (lower.includes('three-way') || lower.includes('three way') || lower.includes('vendor'))
    return 'Vendors below 90% three-way match are surfaced on /p2p. Source: mart_supplier_scorecard. Grades A–D reflect closed PO lines / total PO lines. No SAP RFC call needed.'
  if (lower.includes('slow') || lower.includes('inventory'))
    return 'Slow movers come from mart_inventory_turns: materials where (TTM invoice value / inventory value at standard) < 1.0. See /inventory for the ranked list and value-at-risk.'
  if (lower.includes('trial') || lower.includes('balance'))
    return 'Trial balance on /finance is computed in mart_trial_balance: BSEG line items joined to BKPF headers, summed by GL account with debit/credit class. Current fiscal quarter is the default view.'
  if (lower.includes('open') && lower.includes('order'))
    return 'Open sales orders are flagged in mart_sales_orders by comparing order qty to billed qty per line. /o2c shows the funnel and blocked-order list.'
  return 'This question would route to the gold layer in Iceberg via Athena (or any engine you point at the lake). The agent does not call SAP — it reads parquet, governed by Glue, summarized by the dbt models in transform/models/gold/.'
}
