import { Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { usePolicyMarkdown, useSnapshot } from '../api/snapshot'
import type { RiskMapEntry } from '../types'
import { PageHeader } from '../components/PageHeader'

export function PolicyPage() {
  const md = usePolicyMarkdown()
  const risks = useSnapshot<RiskMapEntry[]>('policy_risk_map.json')

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Driver"
        title="The article this demo is built around"
        sub="Verbatim text of Taylor Brown's April 29, 2026 Fivetran post. Every other page in this app exists to make one of the four risk areas concrete."
      />

      <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
        <article className="prose-policy border border-slate-800 bg-slate-900/30 rounded-lg p-8">
          {md.isLoading && <p className="text-slate-500">Loading article…</p>}
          {md.data && <ReactMarkdown>{md.data}</ReactMarkdown>}
        </article>

        <aside className="space-y-3">
          <div className="text-xs uppercase tracking-wider text-slate-400 px-1">
            Where this app answers each risk
          </div>
          {risks.data?.map((r, i) => (
            <Link to={r.link} key={i}
                  className="block border border-slate-800 hover:border-amber-400/40 bg-slate-900/40 rounded-lg p-4 transition">
              <div className="text-xs uppercase tracking-wider text-amber-300 mb-1">{r.risk}</div>
              <div className="text-slate-200 text-sm mb-2">{r.answer}</div>
              <div className="text-xs text-amber-300/80">{r.link_label} →</div>
            </Link>
          ))}
          <div className="border border-slate-800 bg-slate-900/40 rounded-lg p-4 text-xs text-slate-400">
            Source: <a href="https://www.fivetran.com/blog/saps-latest-api-policy-raises-the-stakes-for-your-ai-strategy"
                       className="text-amber-300 hover:text-amber-200 underline underline-offset-2"
                       target="_blank" rel="noreferrer">
              fivetran.com/blog/…ai-strategy
            </a>
          </div>
        </aside>
      </div>
    </div>
  )
}
