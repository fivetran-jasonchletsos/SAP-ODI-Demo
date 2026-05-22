import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useSnapshot } from '../api/snapshot'
import type { InventoryData } from '../types'
import { Card, PageHeader } from '../components/PageHeader'
import { Caption } from '../components/Caption'
import { theme, axisProps, gridProps, tooltipProps, fmt } from '../components/chartTheme'

export function InventoryPage() {
  const d = useSnapshot<InventoryData>('inventory.json')
  const data = d.data

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Inventory"
        title="Turns, slow-movers, and value by plant"
        sub="MARA · MARC · MBEW conformed in dim_material. Turns = TTM invoice revenue / inventory value at standard."
      />

      <div className="grid lg:grid-cols-2 gap-5">
        <Card title="Inventory value by plant">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data?.value_by_plant ?? []} margin={{ top: 10, right: 16, bottom: 8, left: 8 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="plant_id" {...axisProps} />
              <YAxis {...axisProps} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip {...tooltipProps} formatter={(v) => fmt.money(Number(v))} />
              <Bar dataKey="inventory_value" fill={theme.primary} />
            </BarChart>
          </ResponsiveContainer>
          <Caption>Standard-cost inventory at each plant. Read the range, not the ranks.</Caption>
        </Card>

        <Card title="Inventory value by material group">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data?.value_by_group ?? []} margin={{ top: 10, right: 16, bottom: 18, left: 8 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="material_group" {...axisProps}
                     tick={{ fontSize: 10, fill: theme.tickLabel }}
                     angle={-12} textAnchor="end" height={50} />
              <YAxis {...axisProps} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip {...tooltipProps} formatter={(v) => fmt.money(Number(v))} />
              <Bar dataKey="inventory_value" fill={theme.secondary} />
            </BarChart>
          </ResponsiveContainer>
          <Caption>Material group breakdown — concentration risk if one group dominates.</Caption>
        </Card>
      </div>

      <Card title="Slow movers">
        <div className="overflow-auto">
          <table className="data-table min-w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="py-2 pr-4">Material</th>
                <th className="py-2 pr-4">Group</th>
                <th className="py-2 pr-4">Plant</th>
                <th className="py-2 pr-4 text-right">On hand</th>
                <th className="py-2 pr-4 text-right">Std price</th>
                <th className="py-2 pr-4 text-right">Value</th>
                <th className="py-2 text-right">Turns</th>
              </tr>
            </thead>
            <tbody>
              {data?.slow_movers.map(r => (
                <tr key={`${r.material_id}-${r.plant_id}`} className="text-slate-200">
                  <td className="py-2 pr-4 text-xs text-violet-300" style={{ fontFamily: 'var(--font-mono)' }}>{r.material_id}</td>
                  <td className="py-2 pr-4">{r.material_group}</td>
                  <td className="py-2 pr-4">{r.plant_name}</td>
                  <td className="py-2 pr-4 text-right tabular-nums">{r.on_hand_quantity.toLocaleString()}</td>
                  <td className="py-2 pr-4 text-right tabular-nums">${r.standard_price.toFixed(2)}</td>
                  <td className="py-2 pr-4 text-right tabular-nums">{fmt.money(r.inventory_value)}</td>
                  <td className="py-2 text-right tabular-nums">{r.turns?.toFixed(2) ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Caption>
          Turns &lt; 1.0 = inventory sitting longer than a year of revenue justifies.
          Source: <code className="bg-slate-900 px-1 py-0.5 rounded text-amber-200">mart_inventory_turns.sql</code>.
        </Caption>
      </Card>
    </div>
  )
}
