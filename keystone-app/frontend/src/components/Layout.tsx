import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

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
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  // Close the mobile drawer whenever the route changes
  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  // Lock body scroll while the drawer is open
  useEffect(() => {
    if (mobileOpen) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = prev }
    }
  }, [mobileOpen])

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-6">
          <NavLink to="/" className="flex items-baseline gap-2" onClick={() => setMobileOpen(false)}>
            <span className="text-amber-300 font-semibold tracking-tight text-lg">Keystone</span>
            <span className="hidden sm:inline text-slate-400 text-sm">SAP · Open Data Infrastructure</span>
          </NavLink>

          {/* Desktop nav */}
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

          {/* Mobile hamburger */}
          <button
            type="button"
            className="md:hidden ml-auto inline-flex items-center justify-center w-10 h-10 rounded-md text-slate-300 hover:text-amber-200 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
            aria-controls="mobile-nav"
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMobileOpen(v => !v)}
          >
            {mobileOpen ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <>
            {/* backdrop */}
            <div
              className="md:hidden fixed inset-0 top-[57px] bg-slate-950/70 backdrop-blur-sm z-10"
              aria-hidden="true"
              onClick={() => setMobileOpen(false)}
            />
            <nav
              id="mobile-nav"
              className="md:hidden border-t border-slate-800 bg-slate-950 relative z-20"
            >
              <ul className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex flex-col">
                {NAV.map(n => (
                  <li key={n.to}>
                    <NavLink
                      to={n.to}
                      end={n.to === '/'}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        `block px-3 py-3 text-base rounded-md transition-colors ${
                          isActive
                            ? 'bg-amber-400/10 text-amber-200'
                            : 'text-slate-300 hover:text-amber-200 hover:bg-slate-900'
                        }`
                      }
                    >
                      {n.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
          </>
        )}
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
