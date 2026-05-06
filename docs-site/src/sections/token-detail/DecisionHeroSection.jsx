import React, { useMemo } from 'react';
import { KNOWN_STATES } from '../../shared/tokenData';

function buildSimplifiedFlow(token) {
  const nodes = [];
  if (token.segments && token.segments.length > 0) {
    nodes.push({ label: 'Tipo', answer: token.segments[0] });
  }
  if (token.segments && token.segments.length > 1) {
    nodes.push({ label: 'Hierarquia', answer: token.segments[1] });
  }
  if (token.role) {
    nodes.push({ label: 'Papel', answer: token.role });
  }
  const lastSeg = token.segments && token.segments[token.segments.length - 1];
  if (lastSeg && KNOWN_STATES.includes(lastSeg)) {
    nodes.push({ label: 'Estado', answer: lastSeg });
  }
  return nodes;
}

export default function DecisionHeroSection({ token }) {
  const flowNodes = useMemo(() => buildSimplifiedFlow(token), [token]);
  const resultName = token.path || token.name;

  return (
    <div className="td-hero" style={{
      background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)',
      border: '1px solid #dbeafe',
      borderRadius: 16,
      padding: '32px',
      marginBottom: '32px',
    }}>
      {/* Question */}
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px', color: '#076AEA', marginBottom: '12px' }}>
        🎯 Decisão de Design
      </div>
      {token.context && (
        <p style={{ fontSize: 16, fontWeight: 500, color: '#171717', margin: '0 0 24px', lineHeight: 1.5 }}>
          {token.context}
        </p>
      )}

      {/* Decision path */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '20px' }}>
        {flowNodes.map((node, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span style={{ color: '#94a3b8', fontSize: 14 }}>→</span>}
            <span style={{
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: 6,
              padding: '4px 10px',
              fontSize: 11,
              fontWeight: 600,
              color: '#475569',
            }}>
              <span style={{ color: '#94a3b8', fontWeight: 400, marginRight: '4px' }}>{node.label}:</span>
              {node.answer}
            </span>
          </React.Fragment>
        ))}
      </div>

      {/* Result */}
      <div style={{
        background: '#076AEA',
        color: '#fff',
        borderRadius: 8,
        padding: '12px 20px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        <span style={{ fontSize: 11, fontWeight: 500, opacity: 0.8 }}>✓ Token:</span>
        <code style={{ fontSize: 13, fontWeight: 700, fontFamily: 'Source Code Pro, monospace' }}>
          {resultName}
        </code>
      </div>
    </div>
  );
}
