import React from 'react';
import { getEnrichedToken, getResolvedValue, LAYER_LABELS, isColor } from '../../shared/tokenData';

export default function TokenMappingSection({ enriched, brand, mode }) {
  // Build chain: [current token, ...aliases]
  const chain = [enriched];
  if (enriched.aliasChain && enriched.aliasChain.length > 0) {
    enriched.aliasChain.forEach(aliasName => {
      const aliasToken = getEnrichedToken(aliasName);
      chain.push(aliasToken || { name: aliasName, path: aliasName, layer: '?', isColor: false });
    });
  }

  return (
    <div className="td-mapping">
      <h2>Mapeamento de Token</h2>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        {chain.map((node, i) => {
          const val = getResolvedValue(node.name, brand, mode);
          const nodeIsColor = node.isColor && val && isColor(val);
          return (
            <React.Fragment key={i}>
              {i > 0 && <span style={{ color: '#a3a3a3', fontSize: 18 }}>→</span>}
              <div className="td-mapping-node" style={{
                background: '#fff', border: '1px solid #e5e5e5', borderRadius: 10,
                padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '8px',
              }}>
                {nodeIsColor && (
                  <div className="td-mapping-swatch" style={{
                    width: 24, height: 24, borderRadius: 6, background: val,
                    border: '1px solid rgba(0,0,0,.08)', flexShrink: 0,
                  }} />
                )}
                <div>
                  <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', color: '#a3a3a3', letterSpacing: '.3px' }}>
                    {LAYER_LABELS[node.layer] || node.layer || '?'}
                  </div>
                  <code style={{ fontSize: 11, fontWeight: 600 }}>{node.path || node.name}</code>
                  {val && <div style={{ fontSize: 10, color: '#525252', marginTop: '8px' }}>{val}</div>}
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
