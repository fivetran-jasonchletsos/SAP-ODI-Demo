import { Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { usePolicyMarkdown, useSnapshot } from '../api/snapshot'
import type { RiskMapEntry } from '../types'
import { PageHeader } from '../components/PageHeader'

function stripFrontmatter(md: string): string {
  if (md.startsWith('---')) {
    const end = md.indexOf('\n---', 3)
    if (end !== -1) return md.slice(end + 4).replace(/^\n+/, '')
  }
  return md
}

const mdComponents = {
  h1: (props: any) => <h1 className="text-3xl font-semibold mt-8 mb-4 text-slate-50" {...props} />,
  h2: (props: any) => <h2 className="text-xl font-semibold mt-6 mb-3 text-amber-200" {...props} />,
  h3: (props: any) => <h3 className="text-lg font-medium mt-4 mb-2 text-slate-100" {...props} />,
  p:  (props: any) => <p  className="my-3 text-slate-300 leading-relaxed" {...props} />,
  ul: (props: any) => <ul className="list-disc list-outside ml-6 my-3 space-y-1 text-slate-300" {...props} />,
  li: (props: any) => <li className="text-slate-300" {...props} />,
  blockquote: (props: any) => <blockquote className="border-l-2 border-amber-400/60 pl-4 my-4 italic text-slate-200" {...props} />,
  code: (props: any) => <code className="bg-slate-900 px-1.5 py-0.5 rounded text-amber-200 text-sm" {...props} />,
  a:    (props: any) => <a className="text-amber-300 underline underline-offset-2 hover:text-amber-200" target="_blank" rel="noreferrer" {...props} />,
  hr:   (props: any) => <hr className="border-slate-800 my-6" {...props} />,
  strong: (props: any) => <strong className="text-slate-100 font-semibold" {...props} />,
  em:   (props: any) => <em className="text-slate-200" {...props} />,
}

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
        <article className="border border-slate-800 bg-slate-900/30 rounded-lg p-8">
          {md.isLoading && <p className="text-slate-500">Loading article…</p>}
          {md.error && (
            <p className="text-rose-400">
              Could not load the article. Try refreshing.
            </p>
          )}
          {md.data && (
            <ReactMarkdown components={mdComponents}>
              {stripFrontmatter(md.data)}
            </ReactMarkdown>
          )}
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
            Source:{' '}
            <a href="https://www.fivetran.com/blog/saps-latest-api-policy-raises-the-stakes-for-your-ai-strategy"
               className="text-amber-300 hover:text-amber-200 underline underline-offset-2"
               target="_blank" rel="noreferrer">
              fivetran.com/blog/saps-latest-api-policy
            </a>
          </div>
        </aside>
      </div>
    </div>
  )
}
