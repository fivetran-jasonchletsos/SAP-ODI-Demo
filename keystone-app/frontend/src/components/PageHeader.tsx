export function PageHeader({ eyebrow, title, sub }: { eyebrow?: string; title: string; sub?: string }) {
  return (
    <div className="mb-6">
      {eyebrow && (
        <div
          className="text-xs uppercase tracking-widest mb-1.5 font-medium"
          style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)', letterSpacing: '0.12em' }}
        >
          {eyebrow}
        </div>
      )}
      <h1
        className="text-2xl font-semibold text-slate-50 leading-tight"
        style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}
      >
        {title}
      </h1>
      {sub && (
        <p className="text-slate-400 mt-2 max-w-3xl leading-relaxed text-sm">{sub}</p>
      )}
    </div>
  )
}

export function Card({ title, children, right }: { title?: string; children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="card rounded-md p-5">
      {(title || right) && (
        <div className="flex items-center justify-between mb-4">
          {title && (
            <h2
              className="text-xs font-semibold uppercase text-slate-400"
              style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.10em' }}
            >
              {title}
            </h2>
          )}
          {right}
        </div>
      )}
      {children}
    </div>
  )
}
