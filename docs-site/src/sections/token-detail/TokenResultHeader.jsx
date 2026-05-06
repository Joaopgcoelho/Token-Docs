import React from 'react';
import { LAYER_LABELS } from '../../shared/tokenData';
import CopyButton from '../../components/CopyButton';
import { camelToKebab } from './CodeSection';

export default function TokenResultHeader({ enriched, resolvedValue, contrastInfo, brand }) {
  const layerLabel = LAYER_LABELS[enriched.layer] || 'TOKEN';
  const dotName = enriched.path
    ? enriched.path.split(' / ').map(s => s.toLowerCase().replace(/\s+/g, '-')).join('.')
    : enriched.name;

  const cssVar = `var(--${camelToKebab(enriched.name)})`;

  return (
    <div className="td-result-header" style={{
      display: 'flex', gap: '24px', alignItems: 'flex-start',
      padding: '24px 0', marginBottom: '24px',
      borderBottom: '1px solid #f0f0f0',
    }}>
      {/* Color swatch */}
      {enriched.isColor && resolvedValue && (
        <div style={{
          width: 56, height: 56, borderRadius: 12, flexShrink: 0,
          background: resolvedValue, border: '1px solid rgba(0,0,0,.08)',
          boxShadow: '0 2px 8px rgba(0,0,0,.06)',
        }} />
      )}

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.4px', textTransform: 'uppercase', color: '#a3a3a3' }}>
            {layerLabel}
          </span>
          {contrastInfo && (
            <span style={{
              fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 4,
              background: contrastInfo.level === 'Fail' ? '#FBE5E5' : contrastInfo.level === 'AAA' ? '#E5F8DF' : '#FFF8E0',
              color: contrastInfo.level === 'Fail' ? '#C42A27' : contrastInfo.level === 'AAA' ? '#176600' : '#92400e',
            }}>
              Acessível: {contrastInfo.level} ({contrastInfo.ratio.toFixed(1)}:1)
            </span>
          )}
        </div>
        <h1 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 4px', color: '#171717' }}>
          {dotName}
        </h1>
        <code style={{ fontSize: 12, color: '#525252' }}>{resolvedValue || '—'}</code>
      </div>

      {/* Quick copy — action-oriented labels */}
      <div style={{ flexShrink: 0, display: 'flex', gap: '6px' }}>
        <CopyButton text={cssVar} label="Copiar CSS" />
        <CopyButton text={enriched.path || enriched.name} label="Copiar Figma" />
      </div>
    </div>
  );
}
