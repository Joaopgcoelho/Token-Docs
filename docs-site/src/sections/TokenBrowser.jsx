import React, { useState, useMemo, useCallback } from 'react';
import LfHeading from '@lift/ds-web/components/LfHeading/';
import LfParagraph from '@lift/ds-web/components/LfParagraph/';

import {
  BRANDS, MODES, ENRICHED_MAP, CAT_CONTEXT, PATH_CONTEXT, CAT_COLORS, CAT_ORDER,
  tokenToSegments, getTopCategory, isColor, buildTree, countAll, collectAllTokens
} from '../shared/tokenData';

// Recursive tree component
function TreeNode({ name, node, depth, path, expanded, toggleExpand, onTokenClick }) {
  const fullPath = path ? path + '/' + name : name;
  const isOpen = expanded[fullPath] !== false; // default open for depth < 2
  const childKeys = Object.keys(node.children);
  const hasChildren = childKeys.length > 0;
  const total = countAll(node);
  const ctx = PATH_CONTEXT[fullPath] || PATH_CONTEXT[name] || '';

  const handleToggle = useCallback(() => {
    toggleExpand(fullPath);
  }, [fullPath, toggleExpand]);

  // Collect direct tokens
  const directTokens = node.tokens;
  const colorTokens = directTokens.filter((t) => t.isColor);
  const otherTokens = directTokens.filter((t) => !t.isColor);

  return (
    <div className="tt-node" style={{ marginLeft: depth > 0 ? 16 : 0 }}>
      <button className="tt-folder" onClick={handleToggle}>
        <span className="tt-icon">{hasChildren || directTokens.length ? (isOpen ? '▾' : '▸') : '–'}</span>
        <span className="tt-name">{name}</span>
        <span className="tt-count">{total}</span>
        {ctx && <span className="tt-ctx">{ctx}</span>}
      </button>

      {isOpen && (
        <div className="tt-children">
          {/* Render child folders */}
          {childKeys.map((ck) => (
            <TreeNode
              key={ck}
              name={ck}
              node={node.children[ck]}
              depth={depth + 1}
              path={fullPath}
              expanded={expanded}
              toggleExpand={toggleExpand}
              onTokenClick={onTokenClick}
            />
          ))}

          {/* Render direct color tokens */}
          {colorTokens.length > 0 && (
            <div className="tt-tokens-grid">
              {colorTokens.map((t) => (
                <div key={t.name} className="tt-token-card" onClick={() => onTokenClick && onTokenClick(t.name)} style={{ cursor: onTokenClick ? 'pointer' : undefined }}>
                  <div className="tt-token-swatch" style={{ background: t.value }} />
                  <div className="tt-token-info">
                    <div className="tt-token-leaf">{t.segments[t.segments.length - 1]}</div>
                    <code className="tt-token-val">{t.value}</code>
                    {ENRICHED_MAP[t.name]?.aliasChain?.length > 0 && (
                      <div className="tt-token-alias">
                        {ENRICHED_MAP[t.name].aliasChain.map((a, i) => (
                          <span key={i}>→ <code>{a}</code></span>
                        ))}
                      </div>
                    )}
                    {ENRICHED_MAP[t.name]?.cssProperty && (
                      <span className="tt-token-css">{ENRICHED_MAP[t.name].cssProperty}</span>
                    )}
                    <code className="tt-token-js">{t.name}</code>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Render direct non-color tokens */}
          {otherTokens.length > 0 && (
            <table className="tt-table">
              <thead><tr><th>Token</th><th>Valor</th><th>Nome JS</th></tr></thead>
              <tbody>
                {otherTokens.map((t) => (
                  <tr key={t.name} onClick={() => onTokenClick && onTokenClick(t.name)} style={{ cursor: onTokenClick ? 'pointer' : undefined }}>
                    <td><code>{t.segments[t.segments.length - 1]}</code></td>
                    <td><code>{t.value}</code></td>
                    <td className="tt-js-cell"><code>{t.name}</code></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export default function TokenBrowser({ onNavigate, onBrowserStateChange }) {
  const [brand, setBrand] = useState('estacio');
  const [mode, setMode] = useState('default');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Dynamic');
  const [expanded, setExpanded] = useState({});

  const handleTokenClick = useCallback((tokenName) => {
    if (onBrowserStateChange) {
      onBrowserStateChange({ brand, mode, category, search });
    }
    if (onNavigate) {
      onNavigate('token-detail:' + tokenName);
    }
  }, [brand, mode, category, search, onNavigate, onBrowserStateChange]);

  const tokens = useMemo(() => {
    const src = BRANDS[brand]?.[mode] || {};
    return Object.entries(src)
      .filter(([k]) => k.startsWith('Lf'))
      .map(([name, value]) => ({
        name,
        value: String(value),
        segments: tokenToSegments(name),
        category: getTopCategory(name),
        isColor: isColor(String(value)),
      }));
  }, [brand, mode]);

  const categories = useMemo(() => {
    const cats = new Set(tokens.map((t) => t.category));
    return CAT_ORDER.filter((c) => cats.has(c));
  }, [tokens]);

  const catCounts = useMemo(() => {
    const m = {};
    tokens.forEach((t) => { m[t.category] = (m[t.category] || 0) + 1; });
    return m;
  }, [tokens]);

  const filtered = useMemo(() => {
    let list = tokens.filter((t) => t.category === category);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.segments.join('/').toLowerCase().includes(q) ||
          t.value.toLowerCase().includes(q)
      );
    }
    return list;
  }, [tokens, category, search]);

  const tree = useMemo(() => buildTree(filtered), [filtered]);

  // For the tree, skip the top-level category node (e.g. "Dynamic") since we already show it as a tab
  const displayTree = useMemo(() => {
    const catKey = Object.keys(tree.children)[0];
    if (catKey && Object.keys(tree.children).length === 1) {
      return tree.children[catKey];
    }
    return tree;
  }, [tree]);

  const displayRootName = useMemo(() => {
    const keys = Object.keys(tree.children);
    return keys.length === 1 ? keys[0] : category;
  }, [tree, category]);

  const toggleExpand = useCallback((path) => {
    setExpanded((prev) => ({ ...prev, [path]: prev[path] === false ? true : false }));
  }, []);

  // Reset expanded when switching category/brand/mode
  const handleCategoryChange = (c) => { setCategory(c); setExpanded({}); };
  const handleBrandChange = (e) => { setBrand(e.target.value); setExpanded({}); };
  const handleModeChange = (m) => { setMode(m); setExpanded({}); };

  return (
    <div>
      <LfHeading as="h1">Consulta de Tokens</LfHeading>
      <p className="subtitle">Explore todos os tokens do Lift DS. Navegue pela árvore de pastas para encontrar o token certo.</p>

      {/* Header controls */}
      <div className="tb-header">
        <div className="tb-select-group">
          <label className="tb-label">Marca</label>
          <select className="tb-select" value={brand} onChange={handleBrandChange}>
            {Object.entries(BRANDS).map(([id, b]) => (
              <option key={id} value={id}>{b.label}</option>
            ))}
          </select>
        </div>
        <div className="tb-select-group">
          <label className="tb-label">Modo</label>
          <div className="tb-mode-toggle">
            {MODES.map((m) => (
              <button
                key={m.id}
                className={`tb-mode-btn ${mode === m.id ? 'tb-mode-active' : ''}`}
                onClick={() => handleModeChange(m.id)}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
        <div className="tb-select-group tb-search-group">
          <label className="tb-label">Buscar</label>
          <input
            className="tb-search"
            type="text"
            placeholder="Nome, caminho ou valor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Category menu + content layout */}
      <div className="tb-layout">
        <nav className="tb-cat-menu">
          {categories.map((c) => (
            <button
              key={c}
              className={`tb-cat-menu-item ${category === c ? 'tb-cat-menu-active' : ''}`}
              onClick={() => handleCategoryChange(c)}
            >
              <span className="tb-cat-dot" style={{ background: CAT_COLORS[c] }} />
              <span className="tb-cat-menu-label">{c}</span>
              <span className="tb-cat-count">{catCounts[c] || 0}</span>
            </button>
          ))}
        </nav>
        <div className="tb-content">
          {/* Category context */}
          {CAT_CONTEXT[category] && (
            <div className="tb-context-box">
              <div className="tb-context-title">
                <span className="tb-context-dot" style={{ background: CAT_COLORS[category] }} />
                {category}
                <span className="tb-context-count">{catCounts[category] || 0} tokens</span>
              </div>
              <p className="tb-context-desc">{CAT_CONTEXT[category]}</p>
            </div>
          )}

          <div className="tb-stats">{filtered.length} tokens · Navegue pelas pastas abaixo</div>

          {/* Tree */}
          <div className="tt-tree">
            {Object.keys(displayTree.children).map((ck) => (
              <TreeNode
                key={ck}
                name={ck}
                node={displayTree.children[ck]}
                depth={0}
                path={displayRootName}
                expanded={expanded}
                toggleExpand={toggleExpand}
                onTokenClick={handleTokenClick}
              />
            ))}
            {/* Direct tokens at root level */}
            {displayTree.tokens.length > 0 && (
              <div className="tt-tokens-grid">
                {displayTree.tokens.filter((t) => t.isColor).map((t) => (
                  <div key={t.name} className="tt-token-card" onClick={() => handleTokenClick(t.name)} style={{ cursor: 'pointer' }}>
                    <div className="tt-token-swatch" style={{ background: t.value }} />
                    <div className="tt-token-info">
                      <div className="tt-token-leaf">{t.segments[t.segments.length - 1]}</div>
                      <code className="tt-token-val">{t.value}</code>
                      <code className="tt-token-js">{t.name}</code>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {filtered.length === 0 && (
            <div className="tb-empty">Nenhum token encontrado para esta combinação de filtros.</div>
          )}
        </div>
      </div>
    </div>
  );
}
