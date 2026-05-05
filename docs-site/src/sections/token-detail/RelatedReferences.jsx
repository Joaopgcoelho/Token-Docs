import React from 'react';

export default function RelatedReferences({ relatedTokens, onNavigate }) {
  if (!relatedTokens || relatedTokens.length === 0) return null;

  // Limit to 20 related tokens to avoid overwhelming the UI
  const displayed = relatedTokens.slice(0, 20);

  return (
    <div className="td-related">
      <h2>Tokens Relacionados</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {displayed.map((t) => (
          <button
            key={t.name}
            className="td-related-tag"
            onClick={() => onNavigate('token-detail:' + t.name)}
            style={{
              cursor: 'pointer', background: '#f5f5f5', border: '1px solid #e5e5e5',
              borderRadius: 6, padding: '4px 12px', fontSize: 11, fontFamily: 'Source Code Pro, monospace',
              color: '#0549A1', transition: 'all .15s',
            }}
          >
            {t.path || t.name}
          </button>
        ))}
        {relatedTokens.length > 20 && (
          <span style={{ fontSize: 11, color: '#a3a3a3', alignSelf: 'center' }}>
            +{relatedTokens.length - 20} mais
          </span>
        )}
      </div>
    </div>
  );
}
