import React, { useState, useMemo } from 'react';

const SURFACE_VARIATIONS = [
  { label: 'Superfície Clara', bg: '#FFFFFF', textColor: '#171717' },
  { label: 'Superfície Escura', bg: '#171717', textColor: '#FFFFFF' },
  { label: 'Superfície de Marca', bg: '#076AEA', textColor: '#FFFFFF' },
];

function getExampleTabs(role, cssProperty) {
  // Typography tokens
  if (cssProperty) {
    if (cssProperty.includes('font-family')) {
      return ['Título', 'Corpo', 'Código', 'Legenda'];
    }
    if (cssProperty.includes('font-size')) {
      return ['Título', 'Corpo', 'Legenda', 'Botão'];
    }
    if (cssProperty.includes('font-weight')) {
      return ['Regular', 'Médio', 'Negrito', 'Extra-Negrito'];
    }
    if (cssProperty.includes('line-height')) {
      return ['Compacto', 'Normal', 'Espaçado'];
    }
    // Spacing tokens
    if (cssProperty.includes('gap') || cssProperty.includes('padding') || cssProperty.includes('margin') || cssProperty.includes('spacing')) {
      return ['Card', 'Lista', 'Formulário', 'Grid'];
    }
    // Border tokens
    if (cssProperty.includes('border-width') || cssProperty.includes('border-radius')) {
      return ['Input', 'Card', 'Botão', 'Badge'];
    }
    // Opacity tokens
    if (cssProperty.includes('opacity')) {
      return ['Desabilitado', 'Hover', 'Overlay'];
    }
  }

  // Role-based fallbacks
  if (role === 'onSurface' || role === 'text' || role === 'icon') {
    return ['Texto Principal', 'Título', 'Corpo', 'Legenda', 'Link', 'Ícone'];
  }
  if (role === 'surface' || role === 'container') {
    return ['Card', 'Banner', 'Alerta', 'Container'];
  }
  if (role === 'border') {
    return ['Input', 'Card', 'Divisor'];
  }
  if (role === 'shadow') {
    return ['Card Elevado', 'Modal', 'Dropdown'];
  }
  return ['Exemplo'];
}

function UsageSnippet({ role, value, tab, textColor, cssProperty }) {
  // ── Typography: font-family ──────────────────────────────────────────
  if (cssProperty && cssProperty.includes('font-family')) {
    const sizes = { 'Título': 24, 'Corpo': 14, 'Código': 13, 'Legenda': 11 };
    const weights = { 'Título': 700, 'Corpo': 400, 'Código': 400, 'Legenda': 400 };
    return (
      <div style={{ fontFamily: value, fontSize: sizes[tab] || 14, fontWeight: weights[tab] || 400, color: textColor, lineHeight: 1.5 }}>
        {tab === 'Código' ? 'const token = getResolvedValue();' : 'O design system garante consistência visual em todos os produtos.'}
      </div>
    );
  }

  // ── Typography: font-size ────────────────────────────────────────────
  if (cssProperty && cssProperty.includes('font-size')) {
    const scales = { 'Título': 1.5, 'Corpo': 1, 'Legenda': 0.75, 'Botão': 0.9 };
    const scale = scales[tab] || 1;
    const numericValue = parseFloat(value) || 14;
    return (
      <p style={{ fontSize: numericValue * scale, fontWeight: tab === 'Título' ? 700 : 400, color: textColor, margin: 0, lineHeight: 1.5 }}>
        Ag — Design System ({tab})
      </p>
    );
  }

  // ── Typography: font-weight ──────────────────────────────────────────
  if (cssProperty && cssProperty.includes('font-weight')) {
    const weightMap = { 'Regular': 400, 'Médio': 500, 'Negrito': 700, 'Extra-Negrito': 800 };
    const baseWeight = parseInt(value) || 400;
    const displayWeight = weightMap[tab] || baseWeight;
    return (
      <p style={{ fontSize: 18, fontWeight: displayWeight, color: textColor, margin: 0, lineHeight: 1.5 }}>
        Ag — Design System (weight: {displayWeight})
      </p>
    );
  }

  // ── Typography: line-height ──────────────────────────────────────────
  if (cssProperty && cssProperty.includes('line-height')) {
    const lhMap = { 'Compacto': 1.2, 'Normal': parseFloat(value) || 1.5, 'Espaçado': 2 };
    return (
      <p style={{ fontSize: 13, lineHeight: lhMap[tab] || 1.5, color: textColor, margin: 0 }}>
        O design system garante consistência visual em todos os produtos. Esta linha demonstra o espaçamento entre linhas com line-height aplicado.
      </p>
    );
  }

  // ── Spacing tokens ───────────────────────────────────────────────────
  if (cssProperty && (cssProperty.includes('gap') || cssProperty.includes('padding') || cssProperty.includes('margin') || cssProperty.includes('spacing'))) {
    if (tab === 'Card') {
      return (
        <div style={{ padding: value, background: 'rgba(7,106,234,0.08)', borderRadius: 8, border: '1px dashed rgba(7,106,234,0.3)' }}>
          <div style={{ background: '#fff', borderRadius: 6, padding: '8px', fontSize: 11, color: textColor }}>Conteúdo do card com padding: {value}</div>
        </div>
      );
    }
    if (tab === 'Lista') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: value }}>
          {['Item 1', 'Item 2', 'Item 3'].map((item, i) => (
            <div key={i} style={{ background: 'rgba(7,106,234,0.08)', padding: '4px 8px', borderRadius: 4, fontSize: 11, color: textColor }}>{item}</div>
          ))}
        </div>
      );
    }
    if (tab === 'Formulário') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: value }}>
          <div style={{ height: 28, background: '#f5f5f5', borderRadius: 4, border: '1px solid #e5e5e5' }} />
          <div style={{ height: 28, background: '#f5f5f5', borderRadius: 4, border: '1px solid #e5e5e5' }} />
        </div>
      );
    }
    // Grid
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: value }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{ height: 32, background: 'rgba(7,106,234,0.08)', borderRadius: 4, border: '1px dashed rgba(7,106,234,0.3)' }} />
        ))}
      </div>
    );
  }

  // ── Border tokens (width / radius) ───────────────────────────────────
  if (cssProperty && (cssProperty.includes('border-width') || cssProperty.includes('border-radius'))) {
    const isBorderWidth = cssProperty.includes('border-width');
    const style = isBorderWidth
      ? { border: `${value} solid #171717`, borderRadius: 8, padding: '12px', minHeight: 36 }
      : { border: '1px solid #e5e5e5', borderRadius: value, padding: '12px', minHeight: 36, background: '#f5f5f5' };
    return (
      <div style={{ ...style, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 11, color: textColor }}>{tab} — {isBorderWidth ? `border-width: ${value}` : `border-radius: ${value}`}</span>
      </div>
    );
  }

  // ── Opacity tokens ───────────────────────────────────────────────────
  if (cssProperty && cssProperty.includes('opacity')) {
    const opacityMap = { 'Desabilitado': parseFloat(value) || 0.4, 'Hover': Math.min((parseFloat(value) || 0.5) + 0.2, 1), 'Overlay': parseFloat(value) || 0.5 };
    const opacity = opacityMap[tab] || parseFloat(value) || 1;
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 48, height: 48, background: '#076AEA', opacity, borderRadius: 8 }} />
        <span style={{ fontSize: 11, color: textColor }}>opacity: {opacity.toFixed(2)}</span>
      </div>
    );
  }

  // ── Role-based fallbacks (color tokens) ──────────────────────────────

  if (role === 'onSurface' || role === 'text' || role === 'icon') {
    const fontSize = tab === 'Título' ? 20 : tab === 'Legenda' ? 11 : tab === 'Ícone' ? 24 : 14;
    const fontWeight = tab === 'Título' ? 700 : tab === 'Link' ? 500 : 400;
    const textDecoration = tab === 'Link' ? 'underline' : 'none';
    return (
      <p style={{ color: value, fontSize, fontWeight, textDecoration, margin: 0, lineHeight: 1.5 }}>
        {tab === 'Ícone' ? '★ ◆ ● ▲' : 'O design system garante consistência visual.'}
      </p>
    );
  }
  if (role === 'surface' || role === 'container') {
    return (
      <div style={{ background: value, borderRadius: 8, padding: '12px', minHeight: 40, border: '1px solid rgba(0,0,0,.06)' }}>
        <span style={{ fontSize: 11, color: textColor, opacity: 0.7 }}>Conteúdo sobre {tab.toLowerCase()}</span>
      </div>
    );
  }
  if (role === 'border') {
    return (
      <div style={{ border: `2px solid ${value}`, borderRadius: 8, padding: '12px', minHeight: 40 }}>
        <span style={{ fontSize: 11, color: textColor, opacity: 0.7 }}>{tab} com borda</span>
      </div>
    );
  }
  if (role === 'shadow') {
    return (
      <div style={{ boxShadow: value, borderRadius: 8, padding: '12px', minHeight: 40, background: '#fff' }}>
        <span style={{ fontSize: 11, color: '#525252' }}>{tab}</span>
      </div>
    );
  }
  return <code style={{ fontSize: 12 }}>{value}</code>;
}

export default function UsageExamples({ enriched, resolvedValue, brand, mode }) {
  const cssProperty = enriched.cssProperty || '';
  const tabs = useMemo(() => getExampleTabs(enriched.role, cssProperty), [enriched.role, cssProperty]);
  const [activeTab, setActiveTab] = useState(0);

  const val = resolvedValue || enriched.value || '';
  const role = enriched.role;

  return (
    <div className="td-usage">
      <h2>Exemplos de Uso</h2>
      <div className="td-usage-tabs" style={{ display: 'flex', gap: 0, borderBottom: '2px solid #e5e5e5', marginBottom: '12px' }}>
        {tabs.map((tab, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            style={{
              padding: '8px 16px', border: 'none', background: 'none', cursor: 'pointer',
              fontSize: 12, fontWeight: activeTab === i ? 700 : 500,
              color: activeTab === i ? '#076AEA' : '#a3a3a3',
              borderBottom: activeTab === i ? '2px solid #076AEA' : '2px solid transparent',
              marginBottom: -2, fontFamily: 'Inter, sans-serif',
            }}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="td-usage-surfaces" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        {SURFACE_VARIATIONS.map((surface, i) => (
          <div key={i} className="td-usage-surface-card" style={{
            flex: '1 1 200px', background: surface.bg, borderRadius: 10,
            padding: '18px', border: '1px solid #e5e5e5', minHeight: 80,
          }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: surface.textColor, opacity: 0.5, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '.5px' }}>
              {surface.label}
            </div>
            <UsageSnippet role={role} value={val} tab={tabs[activeTab]} textColor={surface.textColor} cssProperty={cssProperty} />
          </div>
        ))}
      </div>
    </div>
  );
}
