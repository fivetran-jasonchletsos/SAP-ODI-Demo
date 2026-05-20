export function PageHeader({ eyebrow, title, sub }: { eyebrow?: string; title: string; sub?: string }) {
  return (
    <div className="mb-6">
      {eyebrow && <div className="text-xs uppercase tracking-wider text-amber-300 mb-1">{eyebrow}</div>}
      <h1 className="text-2xl font-semibold text-slate-50">{title}</h1>
      {sub && <p className="text-slate-400 mt-2 max-w-3xl leading-relaxed">{sub}</p>}
    </div>
  )
}

export function Card({ title, children, right }: { title?: string; children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="border border-slate-800 bg-slate-900/30 rounded-lg p-5">
      {(title || right) && (
        <div className="flex items-center justify-between mb-3">
          {title && <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">{title}</h2>}
          {right}
        </div>
      )}
      {children}
    </div>
  )
}
