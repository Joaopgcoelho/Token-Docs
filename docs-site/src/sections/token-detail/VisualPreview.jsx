import React from 'react';

/**
 * Determines the preview type based on the token's role and isColor flag.
 * @param {string} role - Token role (e.g. 'surface', 'onSurface', 'border', 'shadow')
 * @param {boolean} isColor - Whether the token is a color token
 * @returns {'typography' | 'surface' | 'border' | 'shadow' | 'non-color'}
 */
export function getPreviewType(role, isColor) {
  if (role === 'onSurface' || role === 'text' || role === 'icon') return 'typography';
  if (role === 'surface' || role === 'container') return 'surface';
  if (role === 'border') return isColor ? 'border' : 'non-color';
  if (role === 'shadow') return 'shadow';
  if (!isColor) return 'non-color';
  // Fallback for other color roles (link, skeleton, gradient, onContainer, etc.)
  return 'surface';
}

export default function VisualPreview({ enriched, resolvedValue }) {
  if (!enriched) return null;

  const previewType = getPreviewType(enriched.role, enriched.isColor);
  const val = resolvedValue || enriched.value || '';

  return (
    <div className="td-preview">
      <h2>Preview Visual</h2>
      <div className="preview-area">
        {previewType === 'typography' && (
          <div className="td-preview-typo">
            <div style={{ fontSize: 64, fontWeight: 700, color: val, lineHeight: 1, marginBottom: '8px' }}>
              Ag
            </div>
            <p style={{ color: val, fontSize: 14, margin: 0 }}>
              O design system garante consistência visual em todos os produtos.
            </p>
          </div>
        )}

        {previewType === 'surface' && (
          <div
            className="td-preview-surface"
            style={{
              width: '100%',
              minHeight: 80,
              borderRadius: 10,
              background: val,
              border: '1px solid rgba(0,0,0,.08)',
            }}
          />
        )}

        {previewType === 'border' && (
          <div
            className="td-preview-border"
            style={{
              width: '100%',
              minHeight: 60,
              borderRadius: 10,
              border: `2px solid ${val}`,
              background: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              color: '#a3a3a3',
            }}
          >
            border-color: {val}
          </div>
        )}

        {previewType === 'shadow' && (
          <div
            className="td-preview-shadow"
            style={{
              width: '80%',
              minHeight: 60,
              borderRadius: 10,
              background: '#fff',
              boxShadow: val,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              color: '#525252',
              padding: '16px',
            }}
          >
            Elevated card
          </div>
        )}

        {previewType === 'non-color' && (
          <NonColorPreview enriched={enriched} value={val} />
        )}
      </div>
    </div>
  );
}

function NonColorPreview({ enriched, value }) {
  const cssProperty = enriched.cssProperty || '';

  // ── Typography tokens ────────────────────────────────────────────────

  if (cssProperty.includes('font-family')) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontFamily: value, fontSize: 24, fontWeight: 700, color: '#171717' }}>
          Ag — The quick brown fox
        </div>
        <span style={{ fontSize: 12, color: '#525252' }}>{value}</span>
      </div>
    );
  }

  if (cssProperty.includes('font-size')) {
    return (
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
        <span style={{ fontSize: value, fontWeight: 600, color: '#171717' }}>Ag</span>
        <span style={{ fontSize: 12, color: '#525252' }}>{value}</span>
      </div>
    );
  }

  if (cssProperty.includes('font-weight')) {
    return (
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
        <span style={{ fontSize: 24, fontWeight: parseInt(value) || 400, color: '#171717' }}>Ag — Design System</span>
        <span style={{ fontSize: 12, color: '#525252' }}>{value}</span>
      </div>
    );
  }

  if (cssProperty.includes('line-height')) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <p style={{ fontSize: 14, lineHeight: value, color: '#171717', background: 'rgba(7,106,234,0.08)', padding: '4px 8px', borderRadius: 4 }}>
          O design system garante consistência visual em todos os produtos. Esta linha demonstra o espaçamento entre linhas.
        </p>
        <span style={{ fontSize: 12, color: '#525252' }}>line-height: {value}</span>
      </div>
    );
  }

  // ── Opacity tokens ───────────────────────────────────────────────────

  if (cssProperty.includes('opacity')) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 60, height: 60, background: '#076AEA', opacity: parseFloat(value) || 1, borderRadius: 8 }} />
        <div style={{ width: 60, height: 60, background: '#171717', opacity: parseFloat(value) || 1, borderRadius: 8 }} />
        <span style={{ fontSize: 12, color: '#525252' }}>opacity: {value}</span>
      </div>
    );
  }

  // ── Spacing / gap / padding tokens → ruler ───────────────────────────

  if (cssProperty.includes('gap') || cssProperty.includes('padding') || cssProperty.includes('margin') || cssProperty.includes('spacing')) {
    return (
      <div className="td-preview-spacing" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: value,
          height: 24,
          background: 'rgba(7, 106, 234, 0.2)',
          border: '1px dashed #076AEA',
          borderRadius: 4,
          minWidth: 4,
        }} />
        <span style={{ fontSize: 12, color: '#525252' }}>{value}</span>
      </div>
    );
  }

  // ── Border-width tokens → thickness sample ───────────────────────────

  if (cssProperty.includes('border-width') || cssProperty.includes('border-size')) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: '60%',
          borderTop: `${value} solid #171717`,
          borderRadius: 1,
        }} />
        <span style={{ fontSize: 12, color: '#525252' }}>{value}</span>
      </div>
    );
  }

  // ── Border-radius tokens ─────────────────────────────────────────────

  if (cssProperty.includes('border-radius') || cssProperty.includes('radius')) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 60,
          height: 60,
          background: '#e5e5e5',
          borderRadius: value,
          border: '1px solid #d4d4d4',
        }} />
        <span style={{ fontSize: 12, color: '#525252' }}>{value}</span>
      </div>
    );
  }

  // ── Fallback: show raw value ─────────────────────────────────────────

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <code style={{ fontSize: 14, fontWeight: 600 }}>{value}</code>
    </div>
  );
}
