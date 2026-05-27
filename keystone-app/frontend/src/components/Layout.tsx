import { useState, useEffect, useRef } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

// Canonical nav pattern matching Clarity / Verity / Altavest / FinServ.
// 7 top-level entries (4 flat links + 3 grouped dropdowns) collapses from
// the previous flat 12-item list. dbt-Wizard and ODI become dropdowns so
// they stop visually dominating the bar.
type NavEntry =
  | { kind: 'link'; to: string; label: string }
  | { kind: 'group'; label: string; matchPrefixes: string[]; children: { to: string; label: string }[] }

const NAV: NavEntry[] = [
  { kind: 'link', to: '/',        label: 'Home' },
  { kind: 'link', to: '/policy',  label: 'Why this exists' },
  { kind: 'link', to: '/finance', label: 'Finance' },
  {
    kind: 'group',
    label: 'Operations',
    matchPrefixes: ['/o2c', '/p2p', '/inventory'],
    children: [
      { to: '/o2c',       label: 'Order-to-Cash' },
      { to: '/p2p',       label: 'Procure-to-Pay' },
      { to: '/inventory', label: 'Inventory' },
    ],
  },
  { kind: 'link', to: '/agent',   label: 'AI Agent' },
  {
    kind: 'group',
    label: 'dbt-Wizard',
    matchPrefixes: ['/dbt-wizard'],
    children: [
      { to: '/dbt-wizard/scenario', label: 'Scenario' },
      { to: '/dbt-wizard/live',     label: 'Live build' },
      { to: '/dbt-wizard/outcome',  label: 'Outcome' },
    ],
  },
  {
    kind: 'group',
    label: 'ODI',
    matchPrefixes: ['/architecture', '/pipeline'],
    children: [
      { to: '/architecture', label: 'Architecture' },
      { to: '/pipeline',     label: 'Pipeline' },
    ],
  },
]

// Flatten NAV for the mobile drawer — keep group labels as section dividers.
type FlatItem =
  | { kind: 'item'; to: string; label: string }
  | { kind: 'section'; label: string }

function flattenForMobile(): FlatItem[] {
  const out: FlatItem[] = []
  for (const entry of NAV) {
    if (entry.kind === 'link') {
      out.push({ kind: 'item', to: entry.to, label: entry.label })
    } else {
      out.push({ kind: 'section', label: entry.label })
      for (const c of entry.children) out.push({ kind: 'item', to: c.to, label: c.label })
    }
  }
  return out
}

function NavEntryEl({ entry, pathname }: { entry: NavEntry; pathname: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  useEffect(() => { setOpen(false) }, [pathname])

  if (entry.kind === 'link') {
    return (
      <NavLink
        to={entry.to}
        end={entry.to === '/'}
        className={({ isActive }) =>
          `px-2.5 py-1.5 rounded transition-colors text-xs font-medium whitespace-nowrap ${
            isActive ? 'text-amber-300' : 'text-slate-500 hover:text-slate-200'
          }`
        }
        style={({ isActive }) => isActive ? { background: 'var(--accent-muted)' } : {}}
      >
        {entry.label}
      </NavLink>
    )
  }

  const isActive = entry.matchPrefixes.some((p) => pathname === p || pathname.startsWith(p + '/'))
  return (
    <span ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`px-2.5 py-1.5 rounded transition-colors text-xs font-medium whitespace-nowrap inline-flex items-center gap-1 ${
          isActive ? 'text-amber-300' : 'text-slate-500 hover:text-slate-200'
        }`}
        style={isActive ? { background: 'var(--accent-muted)' } : {}}
      >
        {entry.label}
        <svg width="9" height="9" viewBox="0 0 10 10" aria-hidden className={`transition-transform ${open ? 'rotate-180' : ''}`}>
          <path d="M2 4 L5 7 L8 4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <span
          role="menu"
          className="absolute left-0 top-full mt-1 min-w-[180px] rounded-md overflow-hidden z-50"
          style={{
            background: 'var(--surface-0)',
            border: '1px solid var(--border-medium)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.45)',
          }}
        >
          {entry.children.map((c) => (
            <NavLink
              key={c.to}
              to={c.to}
              end={c.to === '/'}
              className={({ isActive: ia }) =>
                `block px-3.5 py-2 text-xs font-medium transition-colors ${
                  ia ? 'text-amber-300' : 'text-slate-400 hover:text-slate-100'
                }`
              }
              style={({ isActive: ia }) => ia ? { background: 'var(--accent-muted)' } : {}}
            >
              {c.label}
            </NavLink>
          ))}
        </span>
      )}
    </span>
  )
}

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

  const mobileItems = flattenForMobile()

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
              Pendulum Industries
            </span>
            <span className="hidden sm:inline text-slate-500 text-xs font-light tracking-wide">
              SAP · Open Data Infrastructure
            </span>
          </NavLink>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-0.5 ml-auto text-sm">
            {NAV.map((entry) => (
              <NavEntryEl
                key={entry.kind === 'link' ? entry.to : entry.label}
                entry={entry}
                pathname={location.pathname}
              />
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
                {mobileItems.map((m, i) => m.kind === 'section' ? (
                  <li key={`section-${m.label}-${i}`} className="px-3 pt-3 pb-1 text-[10px] uppercase tracking-[0.18em] text-slate-500 font-semibold">
                    {m.label}
                  </li>
                ) : (
                  <li key={m.to}>
                    <NavLink
                      to={m.to}
                      end={m.to === '/'}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        `block px-3 py-2.5 text-sm rounded transition-colors ${
                          isActive ? 'text-amber-300' : 'text-slate-400 hover:text-slate-100'
                        }`
                      }
                    >
                      {m.label}
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-wrap gap-4 justify-between items-center"
             style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#475569' }}>
          <div>
            Pendulum Industries is a fictional global manufacturer.
            Data is synthetic unless the demo is wired to a live SAP source via Fivetran.
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <div>
              Driver: Taylor Brown, <em>SAP's latest API policy raises the stakes for your AI strategy</em>, April 29, 2026.
            </div>
            <a
              href={`${import.meta.env.BASE_URL?.replace(/\/$/, '')}/Pendulum-Industries-3min-Demo-Runbook.pdf`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '4px 10px', borderRadius: 3, fontWeight: 700, fontSize: '0.68rem',
                background: 'rgba(245,158,11,0.10)', color: '#f59e0b',
                border: '1px solid rgba(245,158,11,0.30)', textDecoration: 'none',
                letterSpacing: '0.06em', textTransform: 'uppercase',
              }}
            >
              3-min runbook PDF
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
