import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useSnapshot } from '../api/snapshot'
import type { O2CData } from '../types'
import { Card, PageHeader } from '../components/PageHeader'
import { Caption } from '../components/Caption'
import { theme, axisProps, gridProps, tooltipProps, fmt } from '../components/chartTheme'

export function O2CPage() {
  const d = useSnapshot<O2CData>('o2c.json')
  const data = d.data

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Order-to-Cash"
        title="Funnel, on-time delivery, and customer ranking"
        sub="Built from VBAK/VBAP joined with VBRK/VBRP in the silver layer; order status derives from comparing order quantity to billed quantity per line."
      />

      <div className="grid sm:grid-cols-3 gap-4">
        <Card title="Funnel">
          <div className="space-y-2 text-sm">
            <Row label="Created"  value={data?.funnel.created ?? 0} />
            <Row label="Billed"   value={data?.funnel.billed ?? 0} />
            <Row label="Open"     value={data?.funnel.open ?? 0} />
          </div>
          <Caption>Sales order count by status (TTM).</Caption>
        </Card>
        <Card title="On-time delivery">
          <div className="text-3xl font-semibold text-slate-100">
            {data?.on_time_delivery.pct.toFixed(1) ?? '0'}<span className="text-base text-slate-400">%</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {data?.on_time_delivery.on_time ?? 0} of {data?.on_time_delivery.total_closed ?? 0} closed orders billed within 30 days
          </div>
          <Caption>Proxy for shipped-on-time using days-to-first-bill.</Caption>
        </Card>
        <Card title="Order-to-cash cycle">
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={data?.o2c_bands ?? []} margin={{ top: 4, right: 8, bottom: 8, left: 0 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="band" {...axisProps} />
              <YAxis {...axisProps} width={36} />
              <Tooltip {...tooltipProps} />
              <Bar dataKey="count" fill={theme.primary} />
            </BarChart>
          </ResponsiveContainer>
          <Caption>fast ≤14d · normal ≤30d · slow ≤60d · very_slow &gt;60d · unbilled</Caption>
        </Card>
      </div>

      <Card title="Top customers by revenue">
        <div className="overflow-auto">
          <table className="data-table min-w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="py-2 pr-4">Customer</th>
                <th className="py-2 pr-4 text-right">Orders</th>
                <th className="py-2 pr-4 text-right">Revenue (closed)</th>
                <th className="py-2 text-right">Open value</th>
              </tr>
            </thead>
            <tbody>
              {data?.customer_ranking.slice(0, 20).map(c => (
                <tr key={c.customer_id} className="text-slate-200">
                  <td className="py-2 pr-4">
                    <div>{c.customer_name}</div>
                    <div className="text-xs text-slate-500" style={{ fontFamily: 'var(--font-mono)' }}>{c.customer_id}</div>
                  </td>
                  <td className="py-2 pr-4 text-right tabular-nums" style={{ fontFamily: 'var(--font-mono)' }}>{c.order_count}</td>
                  <td className="py-2 pr-4 text-right tabular-nums" style={{ fontFamily: 'var(--font-mono)' }}>{fmt.money(c.revenue)}</td>
                  <td className="py-2 text-right tabular-nums text-slate-400" style={{ fontFamily: 'var(--font-mono)' }}>{fmt.money(c.open_value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Blocked orders (sample)">
        <ul className="text-sm divide-y divide-slate-800">
          {data?.blocked_orders.slice(0, 12).map((b, i) => (
            <li key={i} className="py-2 flex flex-wrap gap-3 justify-between">
              <span className="text-slate-300">
                <span className="font-mono text-xs text-slate-500 mr-2">{b.sales_doc_id}-{b.line_item}</span>
                {b.customer_name} · material {b.material_id}
              </span>
              <span className="text-slate-400 tabular-nums">{fmt.money(b.order_value)}</span>
            </li>
          ))}
        </ul>
        <Caption>Open sales order lines with no billing record yet.</Caption>
      </Card>
    </div>
  )
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between text-slate-200">
      <span className="text-slate-400">{label}</span>
      <span className="tabular-nums">{value.toLocaleString()}</span>
    </div>
  )
}
