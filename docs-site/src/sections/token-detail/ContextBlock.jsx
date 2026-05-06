import React from 'react';

export default function ContextBlock({ enriched, recommendedSurface, contrastInfo }) {
  if (!enriched) return null;

  const fallback = enriched.aliasChain && enriched.aliasChain.length > 0
    ? enriched.aliasChain[0]
    : null;

  const hasContent = recommendedSurface || contrastInfo || fallback;
  if (!hasContent) return null;

  // Translate surface to human-readable
  const surfaceLabel = recommendedSurface
    ? humanizeSurface(recommendedSurface.path || recommendedSurface.name)
    : null;

  return (
    <div className="td-context-block" style={{
      background: '#fafafa', borderRadius: 12, border: '1px solid #f0f0f0',
      padding: '24px', marginBottom: '32px',
    }}>
      <h2 style={{ fontSize: 14, fontWeight: 700, color: '#171717', margin: '0 0 16px' }}>
        Onde funciona melhor
      </h2>

      <div style={{ display: 'grid', gap: '12px' }}>
        {recommendedSurface && (
          <ContextRow label="Prefira sobre">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              {recommendedSurface.isColor && recommendedSurface.value && (
                <span style={{ width: 12, height: 12, borderRadius: 3, background: recommendedSurface.value, border: '1px solid rgba(0,0,0,.08)', flexShrink: 0 }} />
              )}
              <span style={{ fontSize: 13 }}>
                {surfaceLabel}
              </span>
            </span>
          </ContextRow>
        )}

        {contrastInfo && (
          <ContextRow label="Acessibilidade">
            <span style={{
              fontSize: 12, fontWeight: 600,
              color: contrastInfo.level === 'Fail' ? '#C42A27' : contrastInfo.level === 'AAA' ? '#176600' : '#92400e',
            }}>
              {contrastInfo.level === 'Fail'
                ? `⚠ Contraste insuficiente (${contrastInfo.ratio.toFixed(1)}:1)`
                : `✓ Contraste ${contrastInfo.level} — ${contrastInfo.ratio.toFixed(1)}:1`
              }
            </span>
          </ContextRow>
        )}

        {fallback && (
          <ContextRow label="Alternativa">
            <code style={{ fontSize: 12 }}>{fallback}</code>
          </ContextRow>
        )}
      </div>
    </div>
  );
}

function ContextRow({ label, children }) {
  return (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'baseline', padding: '8px 0', borderBottom: '1px solid #f5f5f5' }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: '#525252', minWidth: 140, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 13, color: '#171717' }}>{children}</span>
    </div>
  );
}

function humanizeSurface(path) {
  if (!path) return 'superfície padrão';
  // "Dynamic / Primary / Surface / Default" → "superfícies Primary"
  const parts = path.split(' / ').map(s => s.trim());
  const meaningful = parts.find(p => !['Dynamic', 'Static', 'Surface', 'Default', 'default'].includes(p));
  if (meaningful) return `superfícies ${meaningful}`;
  return 'superfície padrão';
}
