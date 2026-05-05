import React, { useState, useEffect } from 'react';
import LfHeading from '@lift/ds-web/components/LfHeading/';
import LfParagraph from '@lift/ds-web/components/LfParagraph/';
import LfDivider from '@lift/ds-web/components/LfDivider/';

// Import the enriched data at build time
import enrichedData from '../../../docs/tokens-figma-enriched.json';
import comparisonData from '../../../docs/tokens-comparison.json';

const CAT_COLORS = {
  Dynamic: '#076AEA', Interactive: '#603DA2', Static: '#059669', Inputable: '#d97706',
  Core: '#6b7280', Component: '#8b5cf6', Brand: '#076AEA', Elevation: '#525252',
  Base: '#6b7280', Screen: '#f59e0b', Gradient: '#DB025E',
};

export default function TokenComparison() {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [showAliases, setShowAliases] = useState(true);

  const summary = enrichedData.summary;
  const tokens = enrichedData.tokens;
  const comparison = comparisonData;

  // Filter tokens with alias chains
  const tokensWithAliases = tokens.filter(t => t.aliasChain && t.aliasChain.length > 0);

  // Filter by search and category
  const filtered = tokensWithAliases.filter(t => {
    if (selectedCat !== 'all' && t.category !== selectedCat) return false;
    if (search) {
      const q = search.toLowerCase();
      return t.name.toLowerCase().includes(q) || t.path.toLowerCase().includes(q) || t.value.toLowerCase().includes(q);
    }
    return true;
  });

  const categories = [...new Set(tokensWithAliases.map(t => t.category))];

  return (
    <div>
      <LfHeading as="h1">Comparação Figma × Pacote npm</LfHeading>
      <p className="subtitle">Visão geral da cobertura de tokens, cadeias de alias e mapeamento entre Figma e código.</p>

      {/* Summary cards */}
      <div className="tc-summary">
        <div className="tc-card">
          <div className="tc-card-num">{summary.totalTokens}</div>
          <div className="tc-card-label">Tokens no pacote npm</div>
        </div>
        <div className="tc-card">
          <div className="tc-card-num">{summary.colorTokens}</div>
          <div className="tc-card-label">Tokens de cor</div>
        </div>
        <div className="tc-card">
          <div className="tc-card-num">{summary.nonColorTokens}</div>
          <div className="tc-card-label">Tokens não-cor</div>
        </div>
        <div className="tc-card">
          <div className="tc-card-num">{tokensWithAliases.length}</div>
          <div className="tc-card-label">Com cadeia de alias mapeada</div>
        </div>
      </div>

      <LfDivider />

      {/* Category breakdown */}
      <h2>Distribuição por categoria</h2>
      <div className="tc-cat-grid">
        {Object.entries(summary.byCategory).map(([cat, count]) => (
          <div key={cat} className="tc-cat-item">
            <span className="tc-cat-dot" style={{ background: CAT_COLORS[cat] || '#a3a3a3' }} />
            <span className="tc-cat-name">{cat}</span>
            <span className="tc-cat-bar-wrap">
              <span className="tc-cat-bar" style={{ width: `${(count / summary.totalTokens) * 100}%`, background: CAT_COLORS[cat] || '#a3a3a3' }} />
            </span>
            <span className="tc-cat-count">{count}</span>
          </div>
        ))}
      </div>

      <LfDivider />

      {/* Figma coverage */}
      <h2>Cobertura dos grupos do Figma</h2>
      <LfParagraph>Todos os {comparison.summary?.figmaUsageGroupsTotal || 7} grupos de Usage do Figma estão presentes no pacote npm.</LfParagraph>
      <table>
        <thead><tr><th>Grupo Figma</th><th>Tokens no npm</th><th>Status</th></tr></thead>
        <tbody>
          {Object.entries(comparison.figmaUsageGroups || {}).map(([group, data]) => (
            <tr key={group}>
              <td><strong style={{ color: CAT_COLORS[group] }}>{group}</strong></td>
              <td>{data.npmTokenCount}</td>
              <td>{data.coverage === 'present' ? 'Presente' : 'Ausente'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <LfDivider />

      {/* Alias chains */}
      <h2>Cadeias de alias (Usage → Brand → Base)</h2>
      <LfParagraph>
        Tokens semânticos referenciam tokens de marca, que por sua vez referenciam cores base.
        Abaixo estão os mapeamentos conhecidos.
      </LfParagraph>

      <div className="tc-controls">
        <div className="tc-control-group">
          <select className="tb-select" value={selectedCat} onChange={e => setSelectedCat(e.target.value)}>
            <option value="all">Todas categorias ({tokensWithAliases.length})</option>
            {categories.map(c => (
              <option key={c} value={c}>{c} ({tokensWithAliases.filter(t => t.category === c).length})</option>
            ))}
          </select>
        </div>
        <input
          className="tb-search"
          type="text"
          placeholder="Buscar por nome ou valor..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: 300 }}
        />
      </div>

      <div className="tc-alias-list">
        {filtered.slice(0, 100).map(t => (
          <div key={t.name} className="tc-alias-row">
            <div className="tc-alias-chain">
              <span className="tc-alias-token" style={{ borderLeftColor: CAT_COLORS[t.category] || '#a3a3a3' }}>
                <span className="tc-alias-layer">Usage</span>
                <code>{t.path}</code>
                {t.isColor && <span className="tc-alias-swatch" style={{ background: t.value }} />}
              </span>
              {t.aliasChain.map((alias, i) => (
                <span key={i} className="tc-alias-arrow-group">
                  <span className="tc-alias-arrow">→</span>
                  <span className="tc-alias-ref">
                    <span className="tc-alias-layer">{i === 0 ? 'Brand' : 'Base'}</span>
                    <code>{alias}</code>
                  </span>
                </span>
              ))}
              <span className="tc-alias-arrow">→</span>
              <code className="tc-alias-value">{t.value}</code>
            </div>
            <div className="tc-alias-meta">
              <code className="tc-alias-js">{t.name}</code>
              {t.cssProperty && <span className="tc-alias-css">{t.cssProperty}</span>}
            </div>
          </div>
        ))}
        {filtered.length > 100 && (
          <p style={{ textAlign: 'center', color: '#a3a3a3', fontSize: 12 }}>
            Mostrando 100 de {filtered.length} tokens. Use a busca para filtrar.
          </p>
        )}
        {filtered.length === 0 && (
          <div className="tb-empty">Nenhum token com alias encontrado para este filtro.</div>
        )}
      </div>

      <LfDivider />

      {/* Role distribution */}
      <h2>Distribuição por papel (role)</h2>
      <table>
        <thead><tr><th>Papel</th><th>Quantidade</th><th>CSS</th></tr></thead>
        <tbody>
          {Object.entries(summary.byRole || {}).sort((a, b) => b[1] - a[1]).map(([role, count]) => (
            <tr key={role}>
              <td><strong>{role}</strong></td>
              <td>{count}</td>
              <td><code>{
                role === 'surface' ? 'background-color' :
                role === 'onSurface' ? 'color' :
                role === 'container' ? 'background-color' :
                role === 'onContainer' ? 'color' :
                role === 'border' ? 'border-color' :
                role === 'icon' ? 'color / fill' :
                role === 'text' ? 'color' :
                role === 'link' ? 'color' :
                role === 'shadow' ? 'box-shadow' :
                role
              }</code></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
