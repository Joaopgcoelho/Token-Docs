import React from 'react';
import VisualPreview from './VisualPreview';
import UsageExamples from './UsageExamples';
import GuidelinesPanel from './GuidelinesPanel';

function deriveUseWhen(enriched) {
  if (enriched.context) return enriched.context;
  // Fallback based on role + category
  const role = enriched.role;
  const cat = enriched.category;
  if (role === 'onSurface' || role === 'text') return `Use para textos e ícones sobre superfícies ${cat || 'padrão'}.`;
  if (role === 'surface' || role === 'container') return `Use como fundo de containers e cards ${cat || ''}.`;
  if (role === 'border') return `Use para bordas e divisores.`;
  if (role === 'shadow') return `Use para elevação de elementos.`;
  return null;
}

function deriveAvoidWhen(enriched) {
  const role = enriched.role;
  if (role === 'onSurface' || role === 'text' || role === 'icon') return 'Evite usar como cor de fundo ou borda.';
  if (role === 'surface' || role === 'container') return 'Evite usar como cor de texto — contraste insuficiente.';
  if (role === 'border') return 'Evite usar como cor de fundo ou texto.';
  if (role === 'shadow') return 'Evite criar sombras customizadas — prefira tokens de Elevation.';
  return null;
}

export default function UsageBlock({ enriched, resolvedValue, brand, mode, guidelines }) {
  const useWhen = deriveUseWhen(enriched);
  const avoidWhen = deriveAvoidWhen(enriched);

  return (
    <div className="td-usage-block" style={{ marginBottom: '32px' }}>

      {/* Action-oriented guidance */}
      {(useWhen || avoidWhen) && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
          {useWhen && (
            <div style={{ padding: '16px', background: '#f0fdf4', borderRadius: 10, border: '1px solid #dcfce7' }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#16a34a', letterSpacing: '.3px', marginBottom: '8px' }}>
                ✓ Use quando
              </div>
              <p style={{ fontSize: 13, color: '#171717', margin: 0, lineHeight: 1.5 }}>{useWhen}</p>
            </div>
          )}
          {avoidWhen && (
            <div style={{ padding: '16px', background: '#fef2f2', borderRadius: 10, border: '1px solid #fecaca' }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#dc2626', letterSpacing: '.3px', marginBottom: '8px' }}>
                ✗ Evite quando
              </div>
              <p style={{ fontSize: 13, color: '#171717', margin: 0, lineHeight: 1.5 }}>{avoidWhen}</p>
            </div>
          )}
        </div>
      )}

      {/* Preview — prominent */}
      <VisualPreview enriched={enriched} resolvedValue={resolvedValue} />

      {/* Usage examples */}
      <div style={{ marginTop: '24px' }}>
        <UsageExamples enriched={enriched} resolvedValue={resolvedValue} brand={brand} mode={mode} />
      </div>

      {/* Guidelines — do/don't */}
      {guidelines && guidelines.length > 0 && (
        <div style={{ marginTop: '24px' }}>
          <GuidelinesPanel guidelines={guidelines} />
        </div>
      )}
    </div>
  );
}
