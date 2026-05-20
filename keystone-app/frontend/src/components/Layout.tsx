import { NavLink } from 'react-router-dom'

const NAV = [
  { to: '/',            label: 'Overview' },
  { to: '/policy',      label: 'Why this exists' },
  { to: '/finance',     label: 'Finance' },
  { to: '/o2c',         label: 'Order-to-Cash' },
  { to: '/p2p',         label: 'Procure-to-Pay' },
  { to: '/inventory',   label: 'Inventory' },
  { to: '/architecture', label: 'ODI Architecture' },
  { to: '/agent',       label: 'AI Agent' },
  { to: '/pipeline',    label: 'Pipeline' },
]

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950">
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-6">
          <NavLink to="/" className="flex items-baseline gap-2">
            <span className="text-amber-300 font-semibold tracking-tight text-lg">Keystone</span>
            <span className="text-slate-400 text-sm">SAP · Open Data Infrastructure</span>
          </NavLink>
          <nav className="hidden md:flex items-center gap-1 ml-auto text-sm">
            {NAV.map(n => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === '/'}
                className={({ isActive }) =>
                  `px-2.5 py-1.5 rounded-md transition-colors ${
                    isActive
                      ? 'bg-amber-400/10 text-amber-200'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>
      <footer className="border-t border-slate-900 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 text-xs text-slate-500 flex flex-wrap gap-4 justify-between">
          <div>
            Keystone Industries is a fictional global manufacturer.
            Data is synthetic unless the demo is wired to a live SAP source via Fivetran.
          </div>
          <div>
            Driver: Taylor Brown, <em>SAP's latest API policy raises the stakes for your AI strategy</em>, April 29, 2026.
          </div>
        </div>
      </footer>
    </div>
  )
}
