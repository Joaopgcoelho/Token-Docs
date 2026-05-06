import React from 'react';
import { LAYER_LABELS } from '../../shared/tokenData';
import CopyButton from '../../components/CopyButton';
import { camelToKebab } from './CodeSection';

/**
 * HeroSection — compact, always-visible summary of the token.
 * Combines header info + visual preview + value + copy actions.
 */
export default function HeroSection({ enriched, resolvedValue, contrastInfo, brand }) {
  const layerLabel = LAYER_LABELS[enriched.layer] || 'TOKEN';
  const dotName = enriched.path
    ? enriched.path.split(' / ').map(s => s.toLowerCase().replace(/\s+/g, '-')).join('.')
    : enriched.name;

  const cssVar = `var(--${camelToKebab(enriched.name)})`;
  const figmaPath = enriched.path || enriched.name;

  return (
    <div className="td-hero" style={{
      display: 'flex', gap: '32px', alignItems: 'flex-start',
      padding: '32px', background: '#fafafa', borderRadius: 16,
      border: '1px solid #f0f0f0', marginBottom: '24px',
    }}>
      {/* Left: info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{
          fontSize: 10, fontWeight: 700, letterSpacing: '.5px',
          textTransform: 'uppercase', color: '#a3a3a3', marginBottom: '8px', display: 'block',
        }}>
          {layerLabel}
        </span>
        <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 8px', color: '#171717' }}>
          {dotName}
        </h1>
        {enriched.context && (
          <p style={{ fontSize: 14, color: '#525252', margin: '0 0 16px', lineHeight: 1.5 }}>
            {enriched.context}
          </p>
        )}

        {/* WCAG badge */}
        {contrastInfo && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '16px',
            padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600,
            background: contrastInfo.level === 'Fail' ? '#FBE5E5' : contrastInfo.level === 'AAA' ? '#E5F8DF' : '#FFF8E0',
            color: contrastInfo.level === 'Fail' ? '#C42A27' : contrastInfo.level === 'AAA' ? '#176600' : '#92400e',
          }}>
            WCAG {contrastInfo.level} · {contrastInfo.ratio.toFixed(1)}:1
          </div>
        )}

        {/* Value */}
        <div style={{ marginBottom: '16px' }}>
          <code style={{ fontSize: 13, fontWeight: 600, color: '#171717' }}>
            {resolvedValue || '—'}
          </code>
        </div>

        {/* Copy actions */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <CopyButton text={cssVar} label="CSS" />
          <CopyButton text={`import { ${enriched.name} } from '@lift/ds-tokens/brands/${brand}/ts/default.js';`} label="JS" />
          <CopyButton text={figmaPath} label="Figma" />
        </div>
      </div>

      {/* Right: visual preview (compact) */}
      {enriched.isColor && resolvedValue && (
        <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{
            width: 80, height: 80, borderRadius: 12,
            background: resolvedValue, border: '1px solid rgba(0,0,0,.08)',
            boxShadow: '0 2px 8px rgba(0,0,0,.06)',
          }} />
          <code style={{ fontSize: 11, color: '#525252', marginTop: '8px' }}>
            {resolvedValue}
          </code>
        </div>
      )}
    </div>
  );
}
