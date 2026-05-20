import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="text-center py-20">
      <h1 className="text-3xl font-semibold text-slate-100">404</h1>
      <p className="text-slate-400 mt-2">Not found.</p>
      <Link to="/" className="text-amber-300 mt-4 inline-block hover:text-amber-200">← Back to overview</Link>
    </div>
  )
}
