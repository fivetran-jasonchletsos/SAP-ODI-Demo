/*
 * DbtWizardPage — Hub page for the dbt-wizard demo.
 *
 * Route: /dbt-wizard
 *
 * Shows the CFO scenario framing with a CTA to go to the Scenario page
 * or directly into the Live Build.
 */

import React from 'react';
import { Link } from 'react-router-dom';

export function DbtWizardPage() {
  return (
    <div className="space-y-8">

      {/* Header */}
      <header>
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <span
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 12, padding: '4px 10px', fontWeight: 700,
              background: 'rgba(245,158,11,0.10)', color: '#f59e0b',
              border: '1px solid rgba(245,158,11,0.35)',
              borderRadius: 3, fontFamily: 'var(--font-mono)',
            }}
          >
            <span
              style={{
                display: 'inline-block', width: 8, height: 8, borderRadius: 999,
                background: '#f59e0b', animation: 'signal-pulse 1.8s ease-in-out infinite',
              }}
            />
            dbt-wizard · live demo
          </span>
        </div>
        <h1
          className="text-3xl sm:text-4xl font-semibold leading-tight text-slate-50 tracking-tight"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          A CFO question. No gold model. 22 hours to the Audit Committee.
        </h1>
        <p className="mt-3 max-w-3xl leading-relaxed text-slate-300" style={{ fontSize: 16 }}>
          When Pendulum Industries' CFO asks why DPO extended 9 days for EMEA tier-2 suppliers
          last quarter, <code style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#f59e0b' }}>
            gold.fct_dpo_by_supplier_tier_bu_quarter
          </code> does not exist.
          Manual build ETA: 3 to 5 days. dbt-wizard ETA: 90 seconds.
        </p>
      </header>

      {/* Scenario overview card */}
      <div
        className="rounded p-6"
        style={{
          background: 'var(--surface-1)',
          border: '1px solid rgba(245,158,11,0.25)',
          borderLeftWidth: 5,
          borderLeftColor: '#f59e0b',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em',
            textTransform: 'uppercase', color: '#f59e0b', marginBottom: 8,
          }}
        >
          The scenario
        </div>
        <p
          className="font-semibold leading-tight text-slate-50 mb-4"
          style={{ fontFamily: 'var(--font-display)', fontSize: 20 }}
        >
          "Why did days-payable-outstanding extend 9 days for tier-2 suppliers in the EMEA
          business unit last quarter while NA held?"
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          <Stat label="$ at risk" value="$18M working-capital impact + supplier-risk exposure" tone="#f59e0b" />
          <Stat label="Audit Committee" value="22 hours" tone="#f59e0b" />
          <Stat label="Manual ETA" value="3 to 5 days" tone="#64748b" />
        </div>
      </div>

      {/* Root cause preview */}
      <div
        className="rounded p-5"
        style={{ background: 'var(--surface-1)', border: '1px solid var(--border-medium)' }}
      >
        <div
          style={{
            fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em',
            textTransform: 'uppercase', color: '#64748b', marginBottom: 8,
          }}
        >
          What dbt-wizard finds
        </div>
        <p className="text-slate-200" style={{ fontSize: 15, lineHeight: 1.6 }}>
          EMEA AP team picked up an invoice-routing rule from a configuration push three weeks
          ago that flags EUR 5K-plus invoices for an extra approval stop. The bottleneck is the
          routing rule, not an AP staffing issue — config rollback, not a hiring decision.
        </p>
      </div>

      {/* Four sub-agents */}
      <div>
        <div
          style={{
            fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em',
            textTransform: 'uppercase', color: '#64748b', marginBottom: 12,
          }}
        >
          Four sub-agents · one loop
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {AGENTS.map(a => (
            <div
              key={a.code}
              className="rounded p-4"
              style={{
                background: 'var(--surface-1)',
                border: '1px solid var(--border-medium)',
                borderTopWidth: 3,
                borderTopColor: a.color,
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  style={{
                    fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 12,
                    color: a.color,
                    background: `${a.color}18`,
                    border: `1px solid ${a.color}44`,
                    borderRadius: 3, padding: '2px 7px',
                  }}
                >
                  {a.code}
                </span>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, color: '#e2e8f0' }}>
                  {a.name}
                </span>
              </div>
              <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>{a.blurb}</p>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#64748b', marginTop: 8, letterSpacing: '0.04em' }}>
                {a.tools}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          to="/dbt-wizard/scenario"
          className="inline-flex items-center gap-2 rounded font-semibold px-6 py-3.5 hover:opacity-90 transition-opacity"
          style={{ background: '#f59e0b', color: '#030712', fontSize: 14 }}
        >
          See the full scenario
          <svg viewBox="0 0 24 24" style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        </Link>
        <Link
          to="/dbt-wizard/live"
          className="inline-flex items-center gap-2 rounded font-semibold px-6 py-3.5 hover:opacity-90 transition-opacity"
          style={{
            background: 'var(--surface-2)',
            border: '1px solid var(--border-medium)',
            color: '#e2e8f0',
            fontSize: 14,
          }}
        >
          Jump to Live Build
        </Link>
      </div>

      <style>{`
        @keyframes signal-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.28; }
        }
      `}</style>
    </div>
  );
}

const AGENTS = [
  { code: 'EXP', name: 'Explorer',     color: '#f59e0b', blurb: 'Maps what exists in the project. Finds the four upstream candidates from AP and procurement vocabulary.',    tools: 'status · search' },
  { code: 'SUM', name: 'Summary',      color: '#7c3aed', blurb: 'Documents the schema. Confirms grain, join keys, and where the gap sits before any SQL is written.',         tools: 'describe · lineage' },
  { code: 'WRK', name: 'Worker',       color: '#be185d', blurb: 'Authors the SQL. Validates the proposed grain with a dbt_show slice, then writes the full model file.',      tools: 'warehouse · dbt_show · file edits' },
  { code: 'VER', name: 'Verification', color: '#34d399', blurb: 'Tests and tags. Writes the YAML companion, enforces schema contract, and updates lineage on materialize.',   tools: 'describe · dbt_show · lineage' },
];

function Stat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#64748b', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, color: tone }}>
        {value}
      </div>
    </div>
  );
}
