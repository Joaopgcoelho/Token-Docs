import React from 'react';
import { LAYER_LABELS } from '../../shared/tokenData';

export default function HeaderSection({ enriched, resolvedValue, contrastInfo }) {
  const layerLabel = LAYER_LABELS[enriched.layer] || 'TOKEN';
  // Convert path to dot notation: "Dynamic / Primary / Surface / Default" → "dynamic.primary.surface.default"
  const dotName = enriched.path
    ? enriched.path.split(' / ').map(s => s.toLowerCase().replace(/\s+/g, '-')).join('.')
    : enriched.name;

  // Build badges from segments, role, category
  const badges = [];
  if (enriched.category) badges.push(enriched.category);
  if (enriched.role) badges.push(enriched.role);
  // Add unique segments that aren't already in badges
  if (enriched.segments) {
    enriched.segments.forEach(s => {
      if (!badges.includes(s) && s !== enriched.category) badges.push(s);
    });
  }
  // Limit to 5 badges max
  const displayBadges = badges.slice(0, 5);

  return (
    <div className="td-header">
      <div style={{ flex: 1 }}>
        <span className="td-layer-badge">{layerLabel}</span>
        <h1 className="td-token-name">{dotName}</h1>
        {enriched.context && <p className="td-description">{enriched.context}</p>}
        <div className="td-badges">
          {displayBadges.map((b, i) => (
            <span key={i} className="td-badge">{b}</span>
          ))}
        </div>
        {contrastInfo && (
          <div className="td-wcag-score" style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '8px',
            padding: '4px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600,
            background: contrastInfo.level === 'Fail' ? '#FBE5E5' : contrastInfo.level === 'AAA' ? '#E5F8DF' : '#FFF8E0',
            color: contrastInfo.level === 'Fail' ? '#C42A27' : contrastInfo.level === 'AAA' ? '#176600' : '#92400e',
          }}>
            WCAG {contrastInfo.level} · {contrastInfo.ratio.toFixed(1)}:1
          </div>
        )}
      </div>
      {enriched.isColor && resolvedValue && (
        <div className="td-color-preview">
          <div style={{
            width: 96, height: 96, borderRadius: 12,
            background: resolvedValue, border: '1px solid rgba(0,0,0,.08)',
            boxShadow: '0 2px 8px rgba(0,0,0,.06)',
          }} />
          <code style={{ display: 'block', textAlign: 'center', marginTop: '8px', fontSize: 12, color: '#525252' }}>
            {resolvedValue}
          </code>
        </div>
      )}
    </div>
  );
}
