import {
  Bar, BarChart, CartesianGrid, Line, LineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { useSnapshot } from '../api/snapshot'
import type { FinanceData } from '../types'
import { Card, PageHeader } from '../components/PageHeader'

const fmtMoney = (v: number) => `$${(v / 1000).toFixed(0)}k`

export function FinancePage() {
  const fin = useSnapshot<FinanceData>('finance.json')

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Finance"
        title="Trial balance, close progress, and DSO trend"
        sub="Every value here is computed in dbt against the gold layer in Iceberg. Same SQL, swappable engine. View source: transform/models/gold/."
      />

      <div className="grid lg:grid-cols-2 gap-5">
        <Card title="DSO trend (months)">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={fin.data?.dso_trend ?? []}>
              <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
              <XAxis dataKey="period" stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155' }} />
              <Line type="monotone" dataKey="dso_days" stroke="#fbbf24" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Close progress (current month)">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={fin.data?.close_progress ?? []}>
              <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
              <XAxis dataKey="posting_date" stroke="#94a3b8" tick={{ fontSize: 10 }} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155' }} />
              <Bar dataKey="posting_count" fill="#fbbf24" />
            </BarChart>
          </ResponsiveContainer>
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
                  <td className="py-2 pr-4 text-right tabular-nums">{fmtMoney(r.debit_total)}</td>
                  <td className="py-2 pr-4 text-right tabular-nums">{fmtMoney(r.credit_total)}</td>
                  <td className="py-2 text-right tabular-nums">{fmtMoney(r.net_balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
              <span className="tabular-nums text-slate-200">{fmtMoney(p.signed_local_amount)}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
