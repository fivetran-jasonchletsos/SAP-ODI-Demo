/*
 * DpoScenarioPage — Scenario framing page for the dbt-wizard demo.
 *
 * Route: /dbt-wizard/scenario
 *
 * Shows the CFO's question, a T-minus countdown to the Audit Committee
 * meeting, 4-tile KPI grid, upstream-model panel, state-of-world detail,
 * 6-step build path, and a CTA to launch the Live Build.
 *
 * Ported from Healthcare-EPIC-Snowflake-Demo/ClarityScenarioPage.tsx
 * for Pendulum Industries SAP-ODI-Demo.
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { wizardDataUrl } from '../components/wizardTypes';

interface UpstreamModel {
  model: string;
  layer: string;
  grain: string;
  description: string;
}

interface ScenarioData {
  company: string;
  request_id: string;
  requested_by: string;
  timezone_label: string;
  question: string;
  metric_label: string;
  metric_code: string;
  sop_meeting_label: string;
  business_unit: string;
  supplier_tier: string;
  target_schema: string;
  target_model: string;
  target_grain: string;
  prior_crisis_id: string;
  upstream_models: UpstreamModel[];
  manual_time_days: string;
  build_room_seconds: number;
}

function formatCountdown(totalSec: number): string {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `T-${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

const LAYER_COLOR: Record<string, string> = {
  staging:      '#7c3aed',
  intermediate: '#b45309',
  gold:         '#f59e0b',
  silver:       '#0e7490',
  gap:          '#dc2626',
};

export function DpoScenarioPage() {
  const [s, setS] = useState<ScenarioData | null>(null);
  const [tMinus, setTMinus] = useState('T-22:00:00');

  useEffect(() => {
    fetch(wizardDataUrl('wizard_scenario.json')).then(r => r.json()).then(setS);
  }, []);

  useEffect(() => {
    let remaining = 22 * 3600; // 22-hour countdown to Audit Committee
    const id = setInterval(() => {
      remaining = Math.max(0, remaining - 1);
      setTMinus(formatCountdown(remaining));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  if (!s) {
    return (
      <div className="space-y-8">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: '#64748b' }}>
          Loading scenario...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

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
            Gap · Active
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em',
              textTransform: 'uppercase', color: '#64748b',
            }}
          >
            {s.request_id}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em',
              textTransform: 'uppercase', color: '#64748b',
            }}
          >
            Follows {s.prior_crisis_id}
          </span>
        </div>
        <h1
          className="text-3xl sm:text-4xl font-semibold leading-tight text-slate-50 tracking-tight"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {s.timezone_label}.{' '}
          <span style={{ color: '#f59e0b' }}>{s.requested_by}.</span>
        </h1>
        <p className="mt-3 max-w-3xl leading-relaxed text-slate-300" style={{ fontSize: 16 }}>
          No <code style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#f59e0b' }}>
            gold.fct_dpo_by_supplier_tier_bu_quarter
          </code> exists.
          The {s.business_unit} {s.supplier_tier} DPO variance is unresolved.
          Audit Committee meets in 22 hours. Manual build ETA: {s.manual_time_days}.
          dbt-wizard ETA: {s.build_room_seconds} seconds.
        </p>

        {/* CFO question highlight */}
        <div
          className="mt-5 rounded p-5"
          style={{
            borderLeft: '4px solid #f59e0b',
            border: '1px solid rgba(245,158,11,0.25)',
            borderLeftWidth: 4,
            background: 'rgba(245,158,11,0.04)',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.10em',
              textTransform: 'uppercase', color: '#f59e0b', marginBottom: 8,
            }}
          >
            The CFO's question
          </div>
          <p
            className="font-semibold leading-tight text-slate-50"
            style={{ fontFamily: 'var(--font-display)', fontSize: 22 }}
          >
            "{s.question}"
          </p>
        </div>
      </header>

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiTile
          label="Audit Committee"
          value={tMinus}
          unit={s.sop_meeting_label}
          tone="#f59e0b"
        />
        <KpiTile
          label="Metric requested"
          value="NEW"
          unit={s.metric_label}
          tone="#f59e0b"
        />
        <KpiTile
          label="Manual ETA"
          value={s.manual_time_days}
          unit="data engineering"
          tone="#0d9488"
        />
        <KpiTile
          label="dbt-wizard ETA"
          value={`${s.build_room_seconds}s`}
          unit="four sub-agents"
          tone="#34d399"
        />
      </div>

      {/* Upstream models + state of world */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div
          className="lg:col-span-2 rounded p-5"
          style={{
            background: 'var(--surface-1)',
            border: '1px solid var(--border-medium)',
          }}
        >
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em',
                  textTransform: 'uppercase', color: '#64748b', marginBottom: 4,
                }}
              >
                Upstream models available
              </div>
              <div
                className="text-slate-50 font-semibold"
                style={{ fontFamily: 'var(--font-display)', fontSize: 18 }}
              >
                Four signals. Already in the lake.
              </div>
            </div>
            <span
              style={{
                fontFamily: 'var(--font-mono)', fontSize: 11, padding: '3px 9px',
                background: 'rgba(52,211,153,0.10)', color: '#34d399',
                border: '1px solid rgba(52,211,153,0.3)', borderRadius: 3, fontWeight: 700,
              }}
            >
              4 of 4
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            {s.upstream_models.map(u => (
              <div
                key={u.model}
                className="rounded relative p-4"
                style={{
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border-soft)',
                  borderLeftWidth: 4,
                  borderLeftColor: LAYER_COLOR[u.layer] ?? '#f59e0b',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-mono)', fontSize: 11,
                    color: LAYER_COLOR[u.layer] ?? '#f59e0b',
                    letterSpacing: '0.06em',
                  }}
                >
                  {u.layer}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700,
                    marginTop: 4, color: '#e2e8f0',
                  }}
                >
                  {u.model}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)', fontSize: 11, marginTop: 4,
                    color: '#64748b',
                  }}
                >
                  grain · {u.grain}
                </div>
                <p
                  style={{
                    fontSize: 12, marginTop: 8, lineHeight: 1.5, color: '#94a3b8',
                  }}
                >
                  {u.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div
          className="rounded p-5"
          style={{
            background: 'var(--surface-1)',
            border: '1px solid var(--border-medium)',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em',
              textTransform: 'uppercase', color: '#64748b', marginBottom: 12,
            }}
          >
            State of the world
          </div>
          <dl className="space-y-3" style={{ fontSize: 13 }}>
            <Row k="Question requested by" v={s.requested_by} />
            <Row k="Requested at" v={<code style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{s.timezone_label}</code>} />
            <Row k="Company" v={s.company} />
            <Row k="Business unit" v={s.business_unit} />
            <Row k="Supplier tier" v={s.supplier_tier} />
            <Row k="Target schema" v={<code style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{s.target_schema}</code>} />
            <Row k="Target model" v={<code style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{s.target_model}</code>} />
            <Row k="Target grain" v={<code style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{s.target_grain}</code>} />
            <Row k="At risk" v={<span style={{ color: '#f59e0b', fontWeight: 600 }}>$18M working-capital</span>} />
            <Row
              k="Committee next"
              v={<span style={{ fontFamily: 'var(--font-mono)', color: '#f59e0b', fontSize: 12 }}>{s.sop_meeting_label}</span>}
            />
          </dl>
        </div>
      </div>

      {/* 6-step build path */}
      <div
        className="rounded p-5"
        style={{
          background: 'var(--surface-1)',
          border: '1px solid var(--border-medium)',
          borderLeftWidth: 4,
          borderLeftColor: '#f59e0b',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em',
            textTransform: 'uppercase', color: '#f59e0b', marginBottom: 12,
          }}
        >
          The path through six steps
        </div>
        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3" style={{ fontSize: 13 }}>
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex gap-3">
              <span
                style={{
                  fontFamily: 'var(--font-mono)', fontSize: 12, flexShrink: 0,
                  marginTop: 2, color: step.color, fontWeight: 700,
                }}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <div style={{ fontWeight: 600, color: '#e2e8f0' }}>{step.title}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#64748b', marginTop: 2 }}>
                  {step.who} · {step.tools}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* CTA */}
      <div
        className="flex flex-col sm:flex-row gap-3 items-center justify-between rounded p-5"
        style={{
          background: 'var(--surface-1)',
          border: '1px solid var(--border-medium)',
        }}
      >
        <div>
          <div
            className="text-slate-50 font-semibold"
            style={{ fontFamily: 'var(--font-display)', fontSize: 20 }}
          >
            Ready to open the Live Build?
          </div>
          <div style={{ fontSize: 13, marginTop: 4, color: '#94a3b8' }}>
            Four sub-agents will be paged. The new model gets written character-by-character on screen.
          </div>
        </div>
        <Link
          to="/dbt-wizard/live"
          state={{ question: s.question }}
          className="inline-flex items-center gap-2 rounded font-semibold px-6 py-3.5 whitespace-nowrap hover:opacity-90 transition-opacity"
          style={{ background: '#f59e0b', color: '#030712', fontSize: 14 }}
        >
          Open the Live Build
          <svg viewBox="0 0 24 24" style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
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

const STEPS = [
  { title: 'Discovery',            who: 'Explorer',     tools: 'status, search',        color: '#f59e0b' },
  { title: 'Schema Understanding', who: 'Summary',      tools: 'describe, lineage',     color: '#7c3aed' },
  { title: 'Data Inspection',      who: 'Worker',       tools: 'warehouse, dbt_show',   color: '#be185d' },
  { title: 'Model Creation',       who: 'Worker',       tools: 'file edits, model gen', color: '#be185d' },
  { title: 'Test Authoring',       who: 'Verification', tools: 'describe, dbt_show',    color: '#34d399' },
  { title: 'Materialization',      who: 'Worker + Ver', tools: 'dbt_run, lineage',      color: '#34d399' },
];

function KpiTile({
  label,
  value,
  unit,
  tone,
}: {
  label: string;
  value: string;
  unit: string;
  tone: string;
}) {
  return (
    <div
      className="rounded p-5"
      style={{
        background: 'var(--surface-1)',
        border: '1px solid var(--border-medium)',
        borderLeftWidth: 4,
        borderLeftColor: tone,
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em',
          textTransform: 'uppercase', color: '#64748b', marginBottom: 8,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 600,
          color: tone, letterSpacing: '-0.02em',
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-mono)', fontSize: 11, marginTop: 8, color: '#64748b',
        }}
      >
        {unit}
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3">
      <dt style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#64748b' }}>{k}</dt>
      <dd style={{ textAlign: 'right', color: '#e2e8f0', fontSize: 13 }}>{v}</dd>
    </div>
  );
}
