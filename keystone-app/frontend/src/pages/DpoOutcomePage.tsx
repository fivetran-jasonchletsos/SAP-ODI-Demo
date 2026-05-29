/*
 * DpoOutcomePage — Post-build outcome page for the dbt-wizard demo.
 *
 * Route: /dbt-wizard/outcome
 *
 * Shows: materialized model card, test pass summary, root-cause panel,
 * before/after lineage, without/with wizard columns, governance posture,
 * and CTAs to replay or return home.
 *
 * Ported from Healthcare-EPIC-Snowflake-Demo/ClarityOutcomePage.tsx
 * for Pendulum Industries SAP-ODI-Demo.
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { wizardDataUrl } from '../components/wizardTypes';

interface LineageNode {
  id: string;
  name: string;
  layer: string;
  built?: boolean;
  new?: boolean;
}

interface LineageEdge {
  from: string;
  to: string;
}

interface Metric {
  label: string;
  value: string;
}

interface Column {
  label: string;
  summary: string;
  metrics: Metric[];
  narrative: string[];
}

interface GovernanceItem {
  label: string;
  value: string;
}

interface RootCause {
  headline: string;
  detail: string;
  affected_cohort: string;
  fallout_count: number;
  total_reviewed: number;
}

interface OutcomeData {
  materialized_model: string;
  row_count: number;
  tests_passed: number;
  tests_written: string;
  build_seconds: number;
  before: { nodes: LineageNode[]; edges: LineageEdge[] };
  after:  { nodes: LineageNode[]; edges: LineageEdge[] };
  root_cause: RootCause;
  without_wizard: Column;
  with_wizard:    Column;
  governance: GovernanceItem[];
  hero: { label: string; value: string; note: string };
}

const NODE_COLOR: Record<string, string> = {
  staging:      '#0073EA',
  intermediate: '#b45309',
  silver:       '#0e7490',
  gold:         '#f59e0b',
  gap:          '#dc2626',
  consumer:     '#be185d',
};

export function DpoOutcomePage() {
  const [o, setO] = useState<OutcomeData | null>(null);

  useEffect(() => {
    fetch(wizardDataUrl('wizard_outcome.json'))
      .then(r => {
        if (!r.ok) throw new Error(`Failed to load wizard_outcome.json: ${r.status}`);
        return r.json();
      })
      .then(setO)
      .catch(() => {});
  }, []);

  if (!o) {
    return (
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: '#64748b', padding: '3rem 1rem' }}>
        Loading outcome...
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* Header */}
      <header>
        <div className="flex items-center gap-3 mb-3">
          <span
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 12, padding: '4px 10px', fontWeight: 700,
              background: 'rgba(52,211,153,0.10)', color: '#34d399',
              border: '1px solid rgba(52,211,153,0.30)', borderRadius: 3,
              fontFamily: 'var(--font-mono)',
            }}
          >
            <span
              style={{
                display: 'inline-block', width: 8, height: 8, borderRadius: 999,
                background: '#34d399', animation: 'signal-pulse 1.8s ease-in-out infinite',
              }}
            />
            Build · Materialized
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em',
              textTransform: 'uppercase', color: '#64748b',
            }}
          >
            Lineage updated
          </span>
        </div>
        <h1
          className="text-3xl sm:text-4xl font-semibold leading-tight text-slate-50 tracking-tight"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Before and after, on the same lake.
        </h1>
        <p className="mt-3 max-w-3xl leading-relaxed text-slate-300" style={{ fontSize: 16 }}>
          The gap on the left. The asset on the right. The delta is what dbt-wizard built in{' '}
          {o.build_seconds} seconds — the same window the CFO waited for an answer.
        </p>
      </header>

      {/* Root-cause panel */}
      <section
        className="rounded p-6"
        style={{
          borderLeft: '5px solid #f59e0b',
          border: '1px solid rgba(245,158,11,0.25)',
          borderLeftWidth: 5,
          background: 'rgba(245,158,11,0.04)',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em',
            textTransform: 'uppercase', color: '#f59e0b', marginBottom: 8,
          }}
        >
          Root cause identified
        </div>
        <p
          className="font-semibold leading-tight text-slate-50 mb-3"
          style={{ fontFamily: 'var(--font-display)', fontSize: 20 }}
        >
          {o.root_cause.headline}
        </p>
        <p className="leading-relaxed text-slate-300 mb-4" style={{ fontSize: 15 }}>
          {o.root_cause.detail}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <div
              style={{
                fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.08em',
                textTransform: 'uppercase', color: '#64748b', marginBottom: 4,
              }}
            >
              Affected cohort
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: '#e2e8f0' }}>
              {o.root_cause.affected_cohort}
            </div>
          </div>
          <div>
            <div
              style={{
                fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.08em',
                textTransform: 'uppercase', color: '#64748b', marginBottom: 4,
              }}
            >
              Invoices affected
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 600, color: '#f59e0b' }}>
              {o.root_cause.fallout_count}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#64748b' }}>
              of {o.root_cause.total_reviewed} reviewed
            </div>
          </div>
          <div>
            <div
              style={{
                fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.08em',
                textTransform: 'uppercase', color: '#64748b', marginBottom: 4,
              }}
            >
              Signature
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: '#e2e8f0' }}>
              EMEA tier-2 · invoices over EUR 5K · routing_status=pending_approval
            </div>
          </div>
        </div>
      </section>

      {/* Lineage comparison */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LineagePanel
          title="Before · the gap"
          subtitle="No gold table tracks DPO by supplier tier, business unit, and quarter."
          nodes={o.before.nodes}
          edges={o.before.edges}
          tone="crisis"
        />
        <LineagePanel
          title="After · the asset"
          subtitle="Materialized to Iceberg. Downstream consumers attached."
          nodes={o.after.nodes}
          edges={o.after.edges}
          tone="resolved"
        />
      </section>

      {/* Without vs. with */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <WizardColumn data={o.without_wizard} tone="crisis" />
        <WizardColumn data={o.with_wizard}    tone="resolved" />
      </section>

      {/* Model card + test summary */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          className="rounded p-5 sm:col-span-2"
          style={{
            background: 'var(--surface-1)',
            border: '1px solid var(--border-medium)',
            borderLeftWidth: 4,
            borderLeftColor: '#f59e0b',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.08em',
              textTransform: 'uppercase', color: '#64748b', marginBottom: 4,
            }}
          >
            Materialized model
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color: '#e2e8f0', marginBottom: 4 }}>
            {o.materialized_model}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#64748b' }}>
            {o.row_count.toLocaleString()} rows · Iceberg v2 · Parquet · ZSTD
          </div>
        </div>
        <div
          className="rounded p-5"
          style={{
            background: 'var(--surface-1)',
            border: '1px solid var(--border-medium)',
            borderLeftWidth: 4,
            borderLeftColor: '#34d399',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.08em',
              textTransform: 'uppercase', color: '#64748b', marginBottom: 4,
            }}
          >
            Tests
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 600, color: '#34d399' }}>
            {o.tests_passed} / {o.tests_passed}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#64748b', marginTop: 4 }}>
            {o.tests_written}
          </div>
        </div>
      </section>

      {/* Governance posture */}
      <section>
        <h2
          className="text-xl font-semibold mb-4 pb-2 text-slate-50"
          style={{ fontFamily: 'var(--font-display)', borderBottom: '1px solid var(--border-soft)' }}
        >
          Governance posture on the new asset
        </h2>
        <div
          className="rounded p-5"
          style={{ background: 'var(--surface-1)', border: '1px solid var(--border-medium)' }}
        >
          <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {o.governance.map(g => (
              <div key={g.label}>
                <dt
                  style={{
                    fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.08em',
                    textTransform: 'uppercase', color: '#64748b', marginBottom: 4,
                  }}
                >
                  {g.label}
                </dt>
                <dd style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: '#e2e8f0' }}>
                  {g.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Hero */}
      <section
        className="rounded p-8"
        style={{
          borderLeft: '5px solid #34d399',
          border: '1px solid rgba(52,211,153,0.20)',
          borderLeftWidth: 5,
          background: 'rgba(52,211,153,0.04)',
        }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
          <div className="sm:col-span-1">
            <div
              style={{
                fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.08em',
                textTransform: 'uppercase', color: '#64748b', marginBottom: 8,
              }}
            >
              dbt-wizard result
            </div>
            <div
              style={{
                fontFamily: 'var(--font-display)', fontSize: 60, fontWeight: 600,
                color: '#34d399', lineHeight: 1.0,
              }}
            >
              {o.hero.value}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, marginTop: 8, color: '#64748b' }}>
              question to materialized
            </div>
          </div>
          <div className="sm:col-span-2">
            <div
              className="text-slate-50 font-semibold leading-tight"
              style={{ fontFamily: 'var(--font-display)', fontSize: 22 }}
            >
              {o.hero.label}
            </div>
            <p className="mt-3 leading-relaxed text-slate-300" style={{ fontSize: 15 }}>
              {o.hero.note}
            </p>
          </div>
        </div>
      </section>

      {/* CTAs */}
      <div
        className="flex flex-col sm:flex-row gap-3 rounded p-5 items-center justify-between"
        style={{ background: 'var(--surface-1)', border: '1px solid var(--border-medium)' }}
      >
        <div>
          <div
            className="text-slate-50 font-semibold"
            style={{ fontFamily: 'var(--font-display)', fontSize: 20 }}
          >
            Run it again?
          </div>
          <div style={{ fontSize: 13, marginTop: 4, color: '#94a3b8' }}>
            The pipeline is real. The sub-agents are deterministic.
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded font-semibold px-5 py-2.5 hover:opacity-90 transition-colors"
            style={{
              background: 'var(--surface-2)',
              border: '1px solid var(--border-medium)',
              color: '#e2e8f0',
              fontSize: 13,
            }}
          >
            Back to home
          </Link>
          <Link
            to="/dbt-wizard/live"
            className="inline-flex items-center gap-2 rounded font-semibold px-5 py-2.5 hover:opacity-90 transition-opacity"
            style={{ background: '#f59e0b', color: '#030712', fontSize: 13 }}
          >
            Replay live build
            <svg viewBox="0 0 24 24" style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
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

function WizardColumn({ data, tone }: { data: Column; tone: 'crisis' | 'resolved' }) {
  const toneColor = tone === 'crisis' ? '#f59e0b' : '#34d399';
  return (
    <div
      className="rounded p-6"
      style={{
        background: 'var(--surface-1)',
        border: '1px solid var(--border-medium)',
        borderLeftWidth: 5,
        borderLeftColor: toneColor,
      }}
    >
      <span
        style={{
          display: 'inline-block', marginBottom: 12,
          fontFamily: 'var(--font-mono)', fontSize: 11, padding: '3px 9px',
          background: tone === 'crisis' ? 'rgba(245,158,11,0.10)' : 'rgba(52,211,153,0.10)',
          color: toneColor,
          border: `1px solid ${tone === 'crisis' ? 'rgba(245,158,11,0.30)' : 'rgba(52,211,153,0.30)'}`,
          borderRadius: 3, fontWeight: 700,
        }}
      >
        {data.label}
      </span>
      <h2
        className="font-semibold mb-2 text-slate-50"
        style={{ fontFamily: 'var(--font-display)', fontSize: 17 }}
      >
        {data.summary}
      </h2>

      <dl
        className="space-y-2 my-5 rounded p-4"
        style={{ background: 'var(--surface-2)', border: '1px solid var(--border-soft)' }}
      >
        {data.metrics.map(m => (
          <div key={m.label} className="flex justify-between gap-3" style={{ fontSize: 13 }}>
            <dt style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#64748b' }}>{m.label}</dt>
            <dd style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: toneColor }}>{m.value}</dd>
          </div>
        ))}
      </dl>

      <div
        style={{
          fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.08em',
          textTransform: 'uppercase', color: '#64748b', marginBottom: 8,
        }}
      >
        Narrative
      </div>
      <ol className="space-y-2" style={{ fontSize: 13 }}>
        {data.narrative.map((n, i) => (
          <li key={n} className="flex gap-2 text-slate-400">
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, flexShrink: 0, marginTop: 2, color: toneColor, fontWeight: 700 }}>
              {String(i + 1).padStart(2, '0')}
            </span>
            <span>{n}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function LineagePanel({
  title,
  subtitle,
  nodes,
  edges,
  tone,
}: {
  title: string;
  subtitle: string;
  nodes: LineageNode[];
  edges: LineageEdge[];
  tone: 'crisis' | 'resolved';
}) {
  const accent = tone === 'crisis' ? '#f59e0b' : '#34d399';

  const layers = ['staging', 'silver', 'intermediate', 'gold', 'gap', 'consumer'];
  const grouped: Record<string, LineageNode[]> = {};
  for (const l of layers) grouped[l] = [];
  for (const n of nodes) {
    const key = grouped[n.layer] ? n.layer : 'staging';
    grouped[key].push(n);
  }
  const populated = layers.filter(l => grouped[l].length > 0);

  return (
    <div
      className="rounded p-5"
      style={{
        background: 'var(--surface-1)',
        border: '1px solid var(--border-medium)',
        borderLeftWidth: 4,
        borderLeftColor: accent,
      }}
    >
      <span
        style={{
          display: 'inline-block', marginBottom: 8,
          fontFamily: 'var(--font-mono)', fontSize: 11, padding: '3px 9px',
          background: tone === 'crisis' ? 'rgba(245,158,11,0.10)' : 'rgba(52,211,153,0.10)',
          color: accent,
          border: `1px solid ${tone === 'crisis' ? 'rgba(245,158,11,0.30)' : 'rgba(52,211,153,0.30)'}`,
          borderRadius: 3, fontWeight: 700,
        }}
      >
        {title}
      </span>
      <div style={{ fontSize: 13, marginBottom: 16, color: '#94a3b8' }}>{subtitle}</div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3" style={{ minHeight: 280 }}>
        {populated.map(layer => (
          <div key={layer}>
            <div
              style={{
                fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.08em',
                textTransform: 'uppercase', color: NODE_COLOR[layer] ?? '#f59e0b',
                marginBottom: 8, fontWeight: 700,
              }}
            >
              {layer}
            </div>
            <div className="space-y-1.5">
              {grouped[layer].map(n => {
                const isGap = layer === 'gap';
                const isNew = n.new;
                return (
                  <div
                    key={n.id}
                    className="rounded p-2.5"
                    style={{
                      borderLeft: `3px solid ${NODE_COLOR[layer] ?? '#f59e0b'}`,
                      border: '1px solid var(--border-soft)',
                      borderLeftColor: NODE_COLOR[layer] ?? '#f59e0b',
                      borderLeftWidth: 3,
                      background: isGap
                        ? 'rgba(220,38,38,0.08)'
                        : isNew
                        ? 'rgba(52,211,153,0.08)'
                        : 'var(--surface-2)',
                      borderStyle: isGap ? 'dashed' : 'solid',
                    }}
                  >
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: NODE_COLOR[layer] ?? '#f59e0b' }}>
                      {layer}
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, marginTop: 2, color: '#e2e8f0' }}>
                      {n.name}
                    </div>
                    {isGap && (
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, marginTop: 4, color: '#dc2626' }}>NOT BUILT</div>
                    )}
                    {isNew && (
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, marginTop: 4, color: '#34d399' }}>
                        BUILT BY dbt-wizard
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div
        className="mt-4 pt-3 flex items-center gap-2"
        style={{ borderTop: '1px solid var(--border-soft)', fontFamily: 'var(--font-mono)', fontSize: 11, color: '#64748b' }}
      >
        <span>{nodes.length} nodes</span>
        <span style={{ color: 'var(--border-soft)' }}>·</span>
        <span>{edges.length} edges</span>
      </div>
    </div>
  );
}
