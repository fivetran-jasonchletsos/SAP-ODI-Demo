import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useSnapshot } from '../api/snapshot'
import type { InventoryData } from '../types'
import { Card, PageHeader } from '../components/PageHeader'

const money = (v: number) => `$${(v/1000).toFixed(0)}k`

export function InventoryPage() {
  const d = useSnapshot<InventoryData>('inventory.json')
  const data = d.data

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Inventory"
        title="Turns, slow-movers, and value by plant"
        sub="MARA · MARC · MBEW conformed in dim_material. Turns = TTM invoice revenue proxy / inventory value at standard."
      />

      <div className="grid lg:grid-cols-2 gap-5">
        <Card title="Inventory value by plant">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data?.value_by_plant ?? []}>
              <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
              <XAxis dataKey="plant_id" stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155' }}
                       formatter={(v) => money(Number(v))} />
              <Bar dataKey="inventory_value" fill="#fbbf24" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Inventory value by material group">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data?.value_by_group ?? []}>
              <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
              <XAxis dataKey="material_group" stroke="#94a3b8" tick={{ fontSize: 10 }} angle={-12} textAnchor="end" height={50} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155' }}
                       formatter={(v) => money(Number(v))} />
              <Bar dataKey="inventory_value" fill="#a78bfa" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card title="Slow movers">
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <th className="py-2 pr-4">Material</th>
                <th className="py-2 pr-4">Group</th>
                <th className="py-2 pr-4">Plant</th>
                <th className="py-2 pr-4 text-right">On hand</th>
                <th className="py-2 pr-4 text-right">Std price</th>
                <th className="py-2 pr-4 text-right">Value</th>
                <th className="py-2 text-right">Turns</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {data?.slow_movers.map(r => (
                <tr key={`${r.material_id}-${r.plant_id}`} className="text-slate-200">
                  <td className="py-2 pr-4 font-mono text-xs">{r.material_id}</td>
                  <td className="py-2 pr-4">{r.material_group}</td>
                  <td className="py-2 pr-4">{r.plant_name}</td>
                  <td className="py-2 pr-4 text-right tabular-nums">{r.on_hand_quantity.toLocaleString()}</td>
                  <td className="py-2 pr-4 text-right tabular-nums">${r.standard_price.toFixed(2)}</td>
                  <td className="py-2 pr-4 text-right tabular-nums">{money(r.inventory_value)}</td>
                  <td className="py-2 text-right tabular-nums">{r.turns?.toFixed(2) ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
