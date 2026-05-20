// A short caption beneath a chart explaining what to look at.
// Pattern from Few: every chart should answer a specific question.

export function Caption({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs text-slate-500 mt-2 leading-snug max-w-prose">{children}</p>
  )
}
