import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useSnapshot } from '../api/snapshot'
import type { P2PData } from '../types'
import { Card, PageHeader } from '../components/PageHeader'

const money = (v: number) => `$${(v/1000).toFixed(0)}k`

export function P2PPage() {
  const d = useSnapshot<P2PData>('p2p.json')
  const data = d.data

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Procure-to-Pay"
        title="Supplier scorecard and three-way-match exceptions"
        sub="EKKO + EKPO joined with RSEG (supplier invoice) gives PO-to-invoice match per line. mart_supplier_scorecard.sql grades vendors A-D on three-way-match completion."
      />

      <Card title="Spend trend (by invoice month)">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data?.spend_trend ?? []}>
            <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
            <XAxis dataKey="period" stroke="#94a3b8" tick={{ fontSize: 11 }} />
            <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{ background: '#0f172a', border: '1px solid #334155' }}
              formatter={(v) => money(Number(v))}
            />
            <Bar dataKey="spend" fill="#fbbf24" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card title="Supplier scorecard">
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <th className="py-2 pr-4">Vendor</th>
                <th className="py-2 pr-4 text-right">PO lines</th>
                <th className="py-2 pr-4 text-right">PO value</th>
                <th className="py-2 pr-4 text-right">Invoiced</th>
                <th className="py-2 pr-4 text-right">3-way match</th>
                <th className="py-2 text-center">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {data?.supplier_scorecard.map(s => (
                <tr key={s.vendor_id} className="text-slate-200">
                  <td className="py-2 pr-4">
                    <div>{s.vendor_name}</div>
                    <div className="text-xs text-slate-500 font-mono">{s.vendor_id}</div>
                  </td>
                  <td className="py-2 pr-4 text-right tabular-nums">{s.po_line_count}</td>
                  <td className="py-2 pr-4 text-right tabular-nums">{money(s.total_po_value)}</td>
                  <td className="py-2 pr-4 text-right tabular-nums">{money(s.total_invoiced)}</td>
                  <td className="py-2 pr-4 text-right tabular-nums">{s.three_way_match_pct.toFixed(1)}%</td>
                  <td className="py-2 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                      s.supplier_grade === 'A' ? 'bg-emerald-500/15 text-emerald-300'
                      : s.supplier_grade === 'B' ? 'bg-sky-500/15 text-sky-300'
                      : s.supplier_grade === 'C' ? 'bg-amber-500/15 text-amber-300'
                      : 'bg-rose-500/15 text-rose-300'
                    }`}>
                      {s.supplier_grade}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Three-way-match exceptions (sample)">
        <ul className="text-sm divide-y divide-slate-800">
          {data?.three_way_exceptions.slice(0, 10).map((e, i) => (
            <li key={i} className="py-2 flex flex-wrap gap-3 justify-between">
              <span className="text-slate-300">
                <span className="font-mono text-xs text-slate-500 mr-2">{e.purchase_order_id}-{e.line_item}</span>
                {e.vendor_name} · material {e.material_id}
              </span>
              <span className="text-slate-400 tabular-nums">{money(e.po_line_value)} PO · {money(e.invoiced_amount)} invoiced</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
