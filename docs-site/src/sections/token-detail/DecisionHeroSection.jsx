import React, { useMemo, useState } from 'react';
import { KNOWN_STATES, getEnrichedToken, getResolvedValue } from '../../shared/tokenData';

function buildSimplifiedFlow(token) {
  const nodes = [];
  if (token.segments && token.segments.length > 0) {
    nodes.push({ key: 'type', label: 'Tipo', answer: token.segments[0] });
  }
  if (token.segments && token.segments.length > 1) {
    nodes.push({ key: 'hierarchy', label: 'Hierarquia', answer: token.segments[1] });
  }
  if (token.role) {
    nodes.push({ key: 'role', label: 'Papel', answer: token.role });
  }
  const lastSeg = token.segments && token.segments[token.segments.length - 1];
  if (lastSeg && KNOWN_STATES.includes(lastSeg)) {
    nodes.push({ key: 'state', label: 'Estado', answer: lastSeg });
  }
  return nodes;
}

// Derive available options for each step from the token's siblings
function getStepOptions(token, stepKey) {
  if (!token.segments) return [];
  switch (stepKey) {
    case 'type':
      return token.segments.length > 0 ? [token.segments[0]] : [];
    case 'hierarchy':
      return token.segments.length > 1 ? [token.segments[1]] : [];
    case 'role':
      return token.role ? [token.role] : [];
    case 'state': {
      const last = token.segments[token.segments.length - 1];
      return last && KNOWN_STATES.includes(last) ? [last, 'default'] : ['default'];
    }
    default:
      return [];
  }
}

export default function DecisionHeroSection({ token, onNavigate }) {
  const flowNodes = useMemo(() => buildSimplifiedFlow(token), [token]);
  const resultName = token.path || token.name;
  const [activeStep, setActiveStep] = useState(null);

  return (
    <div className="td-hero" style={{
      background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)',
      border: '1px solid #dbeafe',
      borderRadius: 16,
      padding: '32px',
      marginBottom: '32px',
    }}>
      {/* Action-oriented header */}
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px', color: '#076AEA', marginBottom: '8px' }}>
        ✓ Decisão resolvida
      </div>
      <p style={{ fontSize: 18, fontWeight: 600, color: '#171717', margin: '0 0 8px', lineHeight: 1.4 }}>
        Para esse cenário, use:
      </p>
      {token.context && (
        <p style={{ fontSize: 14, color: '#525252', margin: '0 0 24px', lineHeight: 1.5 }}>
          {token.context}
        </p>
      )}

      {/* Interactive decision path */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.4px', color: '#94a3b8', marginBottom: '10px' }}>
          Caminho da decisão
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {flowNodes.map((node, i) => (
            <React.Fragment key={node.key}>
              {i > 0 && <span style={{ color: '#94a3b8', fontSize: 14 }}>→</span>}
              <button
                onClick={() => setActiveStep(activeStep === node.key ? null : node.key)}
                style={{
                  background: activeStep === node.key ? '#076AEA' : '#fff',
                  border: `1px solid ${activeStep === node.key ? '#076AEA' : '#e2e8f0'}`,
                  borderRadius: 6,
                  padding: '6px 12px',
                  fontSize: 11,
                  fontWeight: 600,
                  color: activeStep === node.key ? '#fff' : '#475569',
                  cursor: 'pointer',
                  transition: 'all 150ms ease',
                }}
              >
                <span style={{ opacity: 0.6, fontWeight: 400, marginRight: '4px' }}>{node.label}:</span>
                {node.answer}
              </button>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Result — action-oriented */}
      <div style={{
        background: '#076AEA',
        color: '#fff',
        borderRadius: 10,
        padding: '14px 24px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
      }}>
        <span style={{ fontSize: 16 }}>→</span>
        <div>
          <div style={{ fontSize: 10, fontWeight: 500, opacity: 0.8, marginBottom: '2px' }}>Use este token</div>
          <code style={{ fontSize: 14, fontWeight: 700, fontFamily: 'Source Code Pro, monospace' }}>
            {resultName}
          </code>
        </div>
      </div>
    </div>
  );
}
