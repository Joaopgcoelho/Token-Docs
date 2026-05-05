import React, { useMemo } from 'react';
import { KNOWN_STATES } from '../../shared/tokenData';

/**
 * Generic reusable flow component.
 * Accepts an array of nodes with { label, answer, isFinal? } and renders
 * a horizontal decision flow with arrows between nodes.
 */
function DecisionFlow({ nodes }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
      {nodes.map((node, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span style={{ color: '#a3a3a3', fontSize: 18, flexShrink: 0 }}>→</span>}
          <div style={{
            background: node.isFinal ? '#E0ECFC' : '#fff',
            border: `2px solid ${node.isFinal ? '#076AEA' : '#e5e5e5'}`,
            borderRadius: 10, padding: '12px 16px', minWidth: 100,
          }}>
            <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', color: '#a3a3a3', letterSpacing: '.3px', marginBottom: '8px' }}>
              {node.label}
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: node.isFinal ? '#076AEA' : '#171717' }}>
              {node.answer}
            </div>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

function buildDecisionFlow(token) {
  const nodes = [];
  if (token.segments && token.segments.length > 0) {
    nodes.push({ label: 'Regra 2 · Tipo do elemento', answer: token.segments[0], isFinal: false });
  }
  if (token.segments && token.segments.length > 1) {
    nodes.push({ label: 'Regra 3 · Hierarquia', answer: token.segments[1], isFinal: false });
  }
  if (token.role) {
    nodes.push({ label: 'Regra 4 · Papel (role)', answer: token.role, isFinal: false });
  }
  const lastSeg = token.segments && token.segments[token.segments.length - 1];
  if (lastSeg && KNOWN_STATES.includes(lastSeg)) {
    nodes.push({ label: 'Regra 5 · Estado', answer: lastSeg, isFinal: false });
  }
  nodes.push({ label: 'Regra 6 · Token resultante', answer: token.path || token.name, isFinal: true });
  return nodes;
}

export default function DecisionEngineSection({ enriched }) {
  const nodes = useMemo(() => buildDecisionFlow(enriched), [enriched]);

  if (!nodes || nodes.length === 0) return null;

  return (
    <div className="td-decision">
      <h2>Decision Engine</h2>
      <p style={{ fontSize: 13, color: '#525252', marginBottom: '12px' }}>
        Fluxo de decisão que leva a este token, baseado nas Regras 1–8 do Decision Engine.
      </p>
      <DecisionFlow nodes={nodes} />
    </div>
  );
}

export { DecisionFlow };
