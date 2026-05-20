import {
  Bar, BarChart, CartesianGrid, Line, LineChart, ReferenceLine,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { useSnapshot } from '../api/snapshot'
import type { FinanceData } from '../types'
import { Card, PageHeader } from '../components/PageHeader'
import { Caption } from '../components/Caption'
import { theme, axisProps, gridProps, tooltipProps, fmt } from '../components/chartTheme'

const DSO_TARGET = 45     // days — manufacturer benchmark

export function FinancePage() {
  const fin = useSnapshot<FinanceData>('finance.json')

  const dsoTrend = fin.data?.dso_trend ?? []
  const lastDso  = dsoTrend.length ? dsoTrend[dsoTrend.length - 1] : null

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Finance"
        title="Trial balance, close progress, and DSO trend"
        sub="Computed in dbt against the gold layer in Iceberg. Source models: mart_trial_balance, mart_dso, mart_finance_close. Same SQL, swappable engine."
      />

      <div className="grid lg:grid-cols-2 gap-5">
        <Card title="DSO trend">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={dsoTrend} margin={{ top: 10, right: 16, bottom: 8, left: 8 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="period" {...axisProps} />
              <YAxis
                {...axisProps}
                tickFormatter={(v) => `${v}d`}
                domain={[0, (max: number) => Math.max(80, Math.ceil(max / 10) * 10)]}
              />
              <ReferenceLine
                y={DSO_TARGET}
                stroke={theme.reference}
                strokeDasharray="3 3"
                label={{ value: `Target ${DSO_TARGET}d`, fill: theme.reference, fontSize: 10, position: 'insideTopRight' }}
              />
              <Tooltip {...tooltipProps} formatter={(v, n) => n === 'dso_days' ? `${v} days` : v} />
              <Line type="monotone" dataKey="dso_days" stroke={theme.primary} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
          <Caption>
            Latest month: <span className="text-slate-200">{lastDso?.dso_days?.toFixed(0)} days</span>
            {' '}on <span className="text-slate-200">{fmt.money(lastDso?.revenue ?? 0)}</span> billed
            against <span className="text-slate-200">{fmt.money(lastDso?.ar ?? 0)}</span> open AR.
            Target band: 30–{DSO_TARGET} days.
          </Caption>
        </Card>

        <Card title="Close progress (current month)">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={fin.data?.close_progress ?? []}
                      margin={{ top: 10, right: 16, bottom: 8, left: 8 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="posting_date" {...axisProps} tick={{ fontSize: 10, fill: theme.tickLabel }} />
              <YAxis {...axisProps} label={{ value: 'postings', angle: -90, position: 'insideLeft', fill: theme.tickLabel, fontSize: 10 }} />
              <Tooltip {...tooltipProps} />
              <Bar dataKey="posting_count" fill={theme.primary} />
            </BarChart>
          </ResponsiveContainer>
          <Caption>
            Postings per day this fiscal month. Read the shape: a flat distribution = even cadence;
            a back-loaded curve = manual catch-up at month-end.
          </Caption>
        </Card>
      </div>

      <Card title="Trial balance">
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <th className="py-2 pr-4">GL account</th>
                <th className="py-2 pr-4">Description</th>
                <th className="py-2 pr-4">Class</th>
                <th className="py-2 pr-4 text-right">Debit</th>
                <th className="py-2 pr-4 text-right">Credit</th>
                <th className="py-2 text-right">Net</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {fin.data?.trial_balance.map(r => (
                <tr key={r.gl_account} className="text-slate-200">
                  <td className="py-2 pr-4 font-mono text-xs">{r.gl_account}</td>
                  <td className="py-2 pr-4">{r.gl_account_description}</td>
                  <td className="py-2 pr-4">
                    <span className="text-xs uppercase tracking-wide text-slate-400">{r.account_class}</span>
                  </td>
                  <td className="py-2 pr-4 text-right tabular-nums">{fmt.money(r.debit_total)}</td>
                  <td className="py-2 pr-4 text-right tabular-nums">{fmt.money(r.credit_total)}</td>
                  <td className="py-2 text-right tabular-nums">{fmt.money(r.net_balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Caption>
          Source: <code className="bg-slate-900 px-1 py-0.5 rounded text-amber-200">mart_trial_balance.sql</code>.
          Sums signed posting amounts by GL account from <code className="bg-slate-900 px-1 py-0.5 rounded text-amber-200">fct_gl_journal</code>.
        </Caption>
      </Card>

      <Card title="Top postings by absolute value">
        <ul className="text-sm divide-y divide-slate-800">
          {fin.data?.top_gl_postings.slice(0, 15).map((p, i) => (
            <li key={i} className="py-2 flex justify-between gap-3">
              <span className="text-slate-300">
                <span className="font-mono text-xs text-slate-500 mr-2">{p.document_number}</span>
                {p.gl_account_description}
                {p.customer_id && <span className="text-xs text-slate-500 ml-2">customer {p.customer_id}</span>}
                {p.vendor_id && <span className="text-xs text-slate-500 ml-2">vendor {p.vendor_id}</span>}
              </span>
              <span className="tabular-nums text-slate-200">{fmt.money(p.signed_local_amount)}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
