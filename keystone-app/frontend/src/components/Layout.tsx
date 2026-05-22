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

  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  useEffect(() => {
    if (mobileOpen) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = prev }
    }
  }, [mobileOpen])

  return (
    <div className="min-h-screen" style={{ background: 'var(--surface-0)' }}>
      {/* Header — 2px top stripe lives in CSS body::before */}
      <header
        className="border-b sticky top-0 z-20 backdrop-blur-md"
        style={{
          borderColor: 'var(--border-medium)',
          background: 'rgba(3,7,18,0.88)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-6">
          <NavLink to="/" className="flex items-baseline gap-2.5" onClick={() => setMobileOpen(false)}>
            <span
              className="font-semibold tracking-tight text-base"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--accent)', letterSpacing: '-0.01em' }}
            >
              Meridian
            </span>
            <span className="hidden sm:inline text-slate-500 text-xs font-light tracking-wide">
              SAP · Open Data Infrastructure
            </span>
          </NavLink>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-0.5 ml-auto text-sm">
            {NAV.map(n => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === '/'}
                className={({ isActive }) =>
                  `px-2.5 py-1.5 rounded transition-colors text-xs font-medium ${
                    isActive
                      ? 'text-amber-300'
                      : 'text-slate-500 hover:text-slate-200'
                  }`
                }
                style={({ isActive }) => isActive ? { background: 'var(--accent-muted)' } : {}}
              >
                {n.label}
              </NavLink>
            ))}
          </nav>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="md:hidden ml-auto inline-flex items-center justify-center w-10 h-10 rounded text-slate-400 hover:text-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-400/40"
            style={{ background: 'transparent' }}
            aria-controls="mobile-nav"
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMobileOpen(v => !v)}
          >
            {mobileOpen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <>
            <div
              className="md:hidden fixed inset-0 top-[53px] z-10"
              style={{ background: 'rgba(3,7,18,0.72)', backdropFilter: 'blur(4px)' }}
              aria-hidden="true"
              onClick={() => setMobileOpen(false)}
            />
            <nav
              id="mobile-nav"
              className="md:hidden relative z-20"
              style={{ borderTop: '1px solid var(--border-soft)', background: 'var(--surface-0)' }}
            >
              <ul className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex flex-col">
                {NAV.map(n => (
                  <li key={n.to}>
                    <NavLink
                      to={n.to}
                      end={n.to === '/'}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        `block px-3 py-3 text-sm rounded transition-colors ${
                          isActive
                            ? 'text-amber-300'
                            : 'text-slate-400 hover:text-slate-100'
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 page-enter">
        {children}
      </main>

      <footer style={{ borderTop: '1px solid var(--border-soft)' }} className="mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-wrap gap-4 justify-between"
             style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#475569' }}>
          <div>
            Meridian Industries is a fictional global manufacturer.
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
