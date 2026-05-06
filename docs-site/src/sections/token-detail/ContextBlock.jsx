import React from 'react';
import { wcagLevel } from '../../shared/colorUtils';

export default function ContextBlock({ enriched, recommendedSurface, contrastInfo }) {
  if (!enriched) return null;

  const whenToUse = enriched.context || null;
  const whenNotToUse = deriveWhenNotToUse(enriched.role);
  const fallback = enriched.aliasChain && enriched.aliasChain.length > 0
    ? enriched.aliasChain[0]
    : null;

  const hasContent = whenToUse || whenNotToUse || recommendedSurface || contrastInfo || fallback;
  if (!hasContent) return null;

  return (
    <div className="td-context-block" style={{
      background: '#fafafa', borderRadius: 12, border: '1px solid #f0f0f0',
      padding: '24px', marginBottom: '32px',
    }}>
      <h2 style={{ fontSize: 14, fontWeight: 700, color: '#171717', margin: '0 0 16px' }}>Contexto de Uso</h2>

      <div style={{ display: 'grid', gap: '12px' }}>
        {recommendedSurface && (
          <ContextRow label="Superfície recomendada">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              {recommendedSurface.isColor && recommendedSurface.value && (
                <span style={{ width: 12, height: 12, borderRadius: 3, background: recommendedSurface.value, border: '1px solid rgba(0,0,0,.08)', flexShrink: 0 }} />
              )}
              <code style={{ fontSize: 12 }}>{recommendedSurface.path || recommendedSurface.name}</code>
            </span>
          </ContextRow>
        )}

        {contrastInfo && (
          <ContextRow label="Contraste">
            <span style={{
              fontSize: 12, fontWeight: 600,
              color: contrastInfo.level === 'Fail' ? '#C42A27' : contrastInfo.level === 'AAA' ? '#176600' : '#92400e',
            }}>
              {contrastInfo.ratio.toFixed(1)}:1 ({contrastInfo.level})
            </span>
          </ContextRow>
        )}

        {whenToUse && <ContextRow label="Quando usar">{whenToUse}</ContextRow>}
        {whenNotToUse && <ContextRow label="Quando NÃO usar">{whenNotToUse}</ContextRow>}
        {fallback && <ContextRow label="Fallback"><code style={{ fontSize: 12 }}>{fallback}</code></ContextRow>}
      </div>
    </div>
  );
}

function ContextRow({ label, children }) {
  return (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'baseline', padding: '6px 0', borderBottom: '1px solid #f5f5f5' }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: '#525252', minWidth: 160, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 13, color: '#171717' }}>{children}</span>
    </div>
  );
}

function deriveWhenNotToUse(role) {
  switch (role) {
    case 'onSurface': case 'text': case 'icon':
      return 'Não use como background ou cor de borda.';
    case 'surface': case 'container':
      return 'Não use como cor de texto ou ícone.';
    case 'border':
      return 'Não use como cor de fundo ou cor de texto.';
    case 'shadow':
      return 'Não crie sombras customizadas — use tokens de Elevation.';
    default:
      return null;
  }
}
