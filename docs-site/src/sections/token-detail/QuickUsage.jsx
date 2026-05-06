import React from 'react';

/**
 * QuickUsage — lightweight usage guidance derived from enriched data.
 * Shows: when to use, when to avoid, combine with.
 */
export default function QuickUsage({ enriched, recommendedSurface }) {
  const whenToUse = enriched.context || null;
  const whenToAvoid = deriveAvoid(enriched.role);
  const combineWith = recommendedSurface
    ? (recommendedSurface.path || recommendedSurface.name)
    : null;

  if (!whenToUse && !whenToAvoid && !combineWith) return null;

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px', marginBottom: '24px',
    }}>
      {whenToUse && (
        <div style={{ padding: '16px', background: '#f0fdf4', borderRadius: 10, border: '1px solid #dcfce7' }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: '#16a34a', letterSpacing: '.3px', marginBottom: '8px' }}>
            ✓ Usar quando
          </div>
          <p style={{ fontSize: 13, color: '#171717', margin: 0, lineHeight: 1.5 }}>{whenToUse}</p>
        </div>
      )}
      {whenToAvoid && (
        <div style={{ padding: '16px', background: '#fef2f2', borderRadius: 10, border: '1px solid #fecaca' }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: '#dc2626', letterSpacing: '.3px', marginBottom: '8px' }}>
            ✗ Evitar
          </div>
          <p style={{ fontSize: 13, color: '#171717', margin: 0, lineHeight: 1.5 }}>{whenToAvoid}</p>
        </div>
      )}
      {combineWith && (
        <div style={{ padding: '16px', background: '#eff6ff', borderRadius: 10, border: '1px solid #dbeafe' }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: '#2563eb', letterSpacing: '.3px', marginBottom: '8px' }}>
            ↔ Combinar com
          </div>
          <code style={{ fontSize: 12, color: '#171717' }}>{combineWith}</code>
        </div>
      )}
    </div>
  );
}

function deriveAvoid(role) {
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
      return 'Não crie sombras customizadas — use tokens de Elevation.';
    default:
      return null;
  }
}
