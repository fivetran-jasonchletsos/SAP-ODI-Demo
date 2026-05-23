/*
 * WizardVisuals — hero visualizations for the dbt-wizard pages.
 * Ported from Healthcare-EPIC-Snowflake-Demo for Pendulum Industries SAP-ODI-Demo.
 *
 * Components:
 *   LineagePanel         — live-evolving lineage graph for WizardLivePage
 *   BuildCompleteSummary — 4-pane summary for build-complete panel
 *
 * Zero-dep SVG and CSS. Aligned with the Pendulum Industries amber palette.
 */

import { useMemo } from 'react';
import type { WizardScenario } from './wizardTypes';

// ─────────────────────────────────────────────────────────────────────────
// Accent tokens — aligned with Pendulum Industries dark amber palette
// ─────────────────────────────────────────────────────────────────────────

const C = {
  fivetran: '#0073EA',
  iceberg:  '#7C3AED',
  dbt:      '#FF694A',
  snow:     '#29B5E8',
  amber:    '#f59e0b',
  violet:   '#7c3aed',
  rose:     '#be185d',
  green:    '#145e36',
  inkDim:   '#64748b',
  ink:      '#e2e8f0',
};

// ─────────────────────────────────────────────────────────────────────────
// LineagePanel — live-evolving lineage graph for WizardLivePage
// ─────────────────────────────────────────────────────────────────────────

type LineageNodeKind = 'silver' | 'gold-new' | 'gold-existing';
type LineageNode = {
  id: string;
  label: string;
  kind: LineageNodeKind;
  x: number;
  y: number;
};

type LineageEdge = { from: string; to: string };

export function LineagePanel({
  currentStep,
  complete,
  scenario,
}: {
  currentStep: number;
  complete: boolean;
  scenario: WizardScenario | null;
}) {
  const nodes: LineageNode[] = useMemo(() => {
    const upstream = scenario?.upstream_models ?? [];
    const silvers: LineageNode[] = upstream.slice(0, 4).map((u, i) => ({
      id: u.model,
      label: u.model.replace(/^(silver|gold)\./, ''),
      kind: 'silver' as LineageNodeKind,
      x: 18,
      y: 18 + i * 22,
    }));
    const gold: LineageNode = {
      id: scenario?.metric_code ?? 'gold.new',
      label: (scenario?.metric_code ?? 'gold.new').replace(/^gold\./, ''),
      kind: 'gold-new',
      x: 82,
      y: 48,
    };
    return [...silvers, gold];
  }, [scenario]);

  const edges: LineageEdge[] = useMemo(() => {
    const silvers = nodes.filter((n) => n.kind === 'silver');
    const gold    = nodes.find((n) => n.kind === 'gold-new');
    if (!gold) return [];
    return silvers.map((s) => ({ from: s.id, to: gold.id }));
  }, [nodes]);

  const nodeOpacity = (n: LineageNode): number => {
    if (n.kind === 'silver') return currentStep >= 1 ? 1 : 0.05;
    if (n.kind === 'gold-new') return currentStep >= 4 ? 1 : currentStep >= 3 ? 0.35 : 0.05;
    return 1;
  };
  const edgeOpacity = (): number => (currentStep >= 2 ? 1 : 0.0);
  const goldStateClass = complete
    ? 'lineage-gold-live'
    : currentStep >= 6
      ? 'lineage-gold-live'
      : currentStep >= 5
        ? 'lineage-gold-tested'
        : currentStep >= 4
          ? 'lineage-gold-built'
          : 'lineage-gold-pending';

  return (
    <div
      className="wizard-card flex flex-col"
      style={{ minHeight: 220, background: 'var(--surface-1)', border: '1px solid var(--border-medium)', borderRadius: 6 }}
    >
      <header
        className="px-5 py-3 border-b flex items-center justify-between"
        style={{ borderColor: 'var(--border-medium)' }}
      >
        <div className="flex items-center gap-3 flex-wrap min-w-0">
          <div
            style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.amber, fontWeight: 600 }}
          >
            Lineage · building live
          </div>
          <span
            style={{
              color: C.iceberg, background: `${C.iceberg}18`, border: `1px solid ${C.iceberg}55`,
              fontSize: 10, padding: '3px 8px', fontWeight: 700, borderRadius: 3,
              fontFamily: 'var(--font-mono)',
            }}
          >
            iceberg-resolved
          </span>
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', color: C.inkDim, fontSize: 12 }}>
          {nodes.filter((n) => n.kind === 'silver').length} upstream - 1 new gold
        </span>
      </header>
      <div className="flex-1 relative" style={{ minHeight: 180, padding: '14px 14px 12px' }}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full" role="img" aria-label="Live model lineage">
          {edges.map((e, i) => {
            const a = nodes.find((n) => n.id === e.from);
            const b = nodes.find((n) => n.id === e.to);
            if (!a || !b) return null;
            return (
              <g key={i}>
                <path
                  d={`M ${a.x + 7} ${a.y} C ${(a.x + b.x) / 2} ${a.y}, ${(a.x + b.x) / 2} ${b.y}, ${b.x - 7} ${b.y}`}
                  fill="none"
                  stroke={C.amber}
                  strokeWidth="0.45"
                  strokeDasharray="1 1.2"
                  opacity={edgeOpacity()}
                  style={{ transition: 'opacity 600ms ease' }}
                />
              </g>
            );
          })}
          {nodes.map((n) => {
            const fill = n.kind === 'silver' ? '#334155' : C.amber;
            const stroke = n.kind === 'silver' ? '#475569' : (currentStep >= 6 || complete) ? C.green : C.amber;
            return (
              <g key={n.id} opacity={nodeOpacity(n)} style={{ transition: 'opacity 700ms ease' }}>
                <rect
                  x={n.x - 7} y={n.y - 3.5}
                  width="14" height="7"
                  rx="1" ry="1"
                  fill={fill}
                  stroke={stroke}
                  strokeWidth="0.4"
                  className={n.kind === 'gold-new' ? goldStateClass : ''}
                />
                <text
                  x={n.x} y={n.y + 1.2}
                  textAnchor="middle"
                  fill={n.kind === 'silver' ? '#e2e8f0' : '#030712'}
                  style={{ fontSize: 2.6, fontFamily: 'var(--font-mono)', fontWeight: 700 }}
                >
                  {truncate(n.label, 22)}
                </text>
              </g>
            );
          })}
          <text x="2" y="12" fill={C.inkDim} style={{ fontSize: 2.6, letterSpacing: '0.2em', fontFamily: 'var(--font-mono)' }}>UPSTREAM</text>
          <text x="98" y="12" textAnchor="end" fill={C.inkDim} style={{ fontSize: 2.6, letterSpacing: '0.2em', fontFamily: 'var(--font-mono)' }}>GOLD</text>
        </svg>
        <div
          className="absolute left-3 bottom-2 right-3 flex items-center justify-between"
          style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: C.inkDim }}
        >
          <span>{stepCaption(currentStep, complete)}</span>
          <span style={{ color: complete ? C.green : C.amber }}>
            {complete ? '● live in iceberg' : currentStep >= 4 ? '◐ materializing' : currentStep >= 2 ? '◐ joins validated' : '○ discovering'}
          </span>
        </div>
      </div>
      <style>{`
        .lineage-gold-pending { filter: grayscale(0.5); }
        .lineage-gold-built  { animation: lineageBuilt 1.2s ease-out 1; }
        .lineage-gold-tested { animation: lineageTested 1.2s ease-out 1; }
        .lineage-gold-live   { animation: lineageLive 1.4s ease-in-out infinite alternate; }
        @keyframes lineageBuilt {
          0%   { transform-origin: center; transform: scale(0.6); filter: brightness(1.6); }
          100% { transform: scale(1);   filter: brightness(1); }
        }
        @keyframes lineageTested {
          0%, 100% { filter: brightness(1); }
          50%      { filter: brightness(1.4); }
        }
        @keyframes lineageLive {
          0%   { filter: drop-shadow(0 0 1px ${C.green}88); }
          100% { filter: drop-shadow(0 0 2.5px ${C.green}); }
        }
      `}</style>
    </div>
  );
}

function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max - 1) + '…' : s;
}

function stepCaption(step: number, complete: boolean): string {
  if (complete) return 'New gold table is live · downstream consumers see it on next read';
  if (step >= 6) return 'Materialized · Iceberg parquet written to gold prefix';
  if (step >= 5) return 'Schema YAML written · column tests + uniqueness asserted';
  if (step >= 4) return 'Worker authoring · model file emerging in repo';
  if (step >= 3) return 'Worker validating proposed grain against upstream tables';
  if (step >= 2) return 'Summary confirming schema · join keys · null rates';
  if (step >= 1) return 'Explorer found candidate upstream models';
  return 'Awaiting Explorer to map upstream candidates';
}

// ─────────────────────────────────────────────────────────────────────────
// BuildCompleteSummary
// ─────────────────────────────────────────────────────────────────────────

type SummaryStat = { label: string; value: string; sub?: string };

export function BuildCompleteSummary({
  seconds,
  modelCode,
  rows = 312,
  columnTests = 7,
  combinationTests = 1,
}: {
  seconds: number;
  modelCode: string;
  rows?: number;
  columnTests?: number;
  combinationTests?: number;
}) {
  const panels: { title: string; stats: SummaryStat[]; accent: string }[] = [
    {
      title: 'Time saved',
      accent: C.amber,
      stats: [
        { label: 'dbt-wizard build', value: `${seconds}s` },
        { label: 'Manual equivalent', value: '3-5 days' },
        { label: 'Speedup', value: `approx ${Math.round((3 * 24 * 3600) / seconds)}x` },
      ],
    },
    {
      title: 'Model file',
      accent: C.rose,
      stats: [
        { label: 'Path', value: modelCode.replace('gold.', 'models/gold/'), sub: '.sql' },
        { label: 'Layer', value: 'gold' },
        { label: 'Materialization', value: 'table · Iceberg' },
      ],
    },
    {
      title: 'Tests written',
      accent: C.green,
      stats: [
        { label: 'Column tests', value: `${columnTests}` },
        { label: 'Combination uniqueness', value: `${combinationTests}` },
        { label: 'Schema contract', value: 'enforced' },
      ],
    },
    {
      title: 'Lineage delta',
      accent: C.iceberg,
      stats: [
        { label: 'Upstream refs', value: '4 gold/silver' },
        { label: 'Downstream readers', value: 'auto-discover' },
        { label: 'Iceberg snapshot', value: `+${rows.toLocaleString()} rows` },
      ],
    },
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
      {panels.map((p) => (
        <div
          key={p.title}
          style={{
            borderTop: `3px solid ${p.accent}`,
            background: 'var(--surface-2)',
            border: '1px solid var(--border-soft)',
            borderTopColor: p.accent,
            borderRadius: 6,
            padding: '1rem',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: p.accent,
            }}
          >
            {p.title}
          </div>
          <div className="mt-3 space-y-2">
            {p.stats.map((s) => (
              <div key={s.label}>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 9.5,
                    color: C.inkDim,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                  }}
                >
                  {s.label}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 600,
                    fontSize: 16,
                    color: '#e2e8f0',
                    lineHeight: 1.2,
                  }}
                >
                  {s.value}
                  {s.sub ? (
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: C.inkDim }}>
                      {s.sub}
                    </span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

import React from 'react';
