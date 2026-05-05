import React from 'react';
import { wcagLevel } from '../../shared/colorUtils';

export default function ContextSection({ enriched, recommendedSurface, contrastRatio }) {
  if (!enriched) return null;

  // Derive "Quando Usar" from enriched.context
  const whenToUse = enriched.context || '—';

  // Derive "Quando NÃO Usar" from role
  const whenNotToUse = deriveWhenNotToUse(enriched.role);

  // Derive fallback from aliasChain
  const fallback = enriched.aliasChain && enriched.aliasChain.length > 0
    ? enriched.aliasChain[0]
    : '—';

  // Format contrast ratio
  let contrastDisplay = '—';
  if (contrastRatio != null && typeof contrastRatio === 'number') {
    const level = wcagLevel(contrastRatio);
    contrastDisplay = `${contrastRatio.toFixed(1)}:1 (${level})`;
  }

  const fields = [
    {
      label: 'Superfície Recomendada',
      value: recommendedSurface ? (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          {recommendedSurface.isColor && recommendedSurface.value && (
            <span style={{
              display: 'inline-block',
              width: 14,
              height: 14,
              borderRadius: 4,
              background: recommendedSurface.value,
              border: '1px solid rgba(0,0,0,.08)',
              flexShrink: 0,
            }} />
          )}
          <code>{recommendedSurface.path || recommendedSurface.name}</code>
        </span>
      ) : '—',
    },
    { label: 'Contraste Mínimo', value: contrastDisplay },
    { label: 'Quando Usar', value: whenToUse },
    { label: 'Quando NÃO Usar', value: whenNotToUse },
    { label: 'Fallback', value: fallback !== '—' ? <code>{fallback}</code> : '—' },
  ];

  return (
    <div className="td-context">
      <h2>Contexto de Uso</h2>
      {fields.map((f, i) => (
        <div key={i} className="td-context-field" style={{
          display: 'flex',
          gap: '12px',
          padding: '8px 0',
          borderBottom: '1px solid #f0f0f0',
          alignItems: 'baseline',
        }}>
          <span style={{ fontWeight: 600, minWidth: 180, fontSize: 13, color: '#171717', flexShrink: 0 }}>
            {f.label}
          </span>
          <span style={{ fontSize: 13, color: '#525252' }}>
            {f.value}
          </span>
        </div>
      ))}
    </div>
  );
}

function deriveWhenNotToUse(role) {
  switch (role) {
    case 'onSurface':
    case 'text':
    case 'icon':
      return 'Não use como background ou cor de borda.';
    case 'surface':
    case 'container':
      return 'Não use como cor de texto ou ícone.';
    case 'border':
      return 'Não use como cor de fundo ou cor de texto.';
    case 'shadow':
      return 'Não crie sombras customizadas — use os tokens de Elevation.';
    case 'onContainer':
      return 'Não use fora do grupo Static ou sobre superfícies de outro grupo.';
    default:
      return '—';
  }
}
