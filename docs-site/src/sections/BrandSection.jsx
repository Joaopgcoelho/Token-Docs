import React, { useState, useMemo } from 'react';
import LfAlert from '@lift/ds-web/components/LfAlert/';
import LfHeading from '@lift/ds-web/components/LfHeading/';
import LfParagraph from '@lift/ds-web/components/LfParagraph/';
import { BRANDS, isColor } from '../shared/tokenData.js';
import { BRAND_LOGOS } from '../shared/brandLogos.js';

/**
 * Extrai escalas de cor dos tokens de uma marca.
 * Filtra tokens com prefixo "LfThmBrandColor", agrupa por nome da escala,
 * e extrai os steps numéricos.
 *
 * @param {Object} brandTokens - Módulo de tokens (ex: BRANDS['estacio'].default)
 * @returns {Record<string, Record<string, string>>}
 *   Ex: { Primary: { '100': '#E0ECFC', '200': '#B3D4F9', ... } }
 */
export function extractColorScales(brandTokens) {
  const scales = {};
  const prefix = 'LfThmBrandColor';

  Object.entries(brandTokens).forEach(([key, value]) => {
    if (!key.startsWith(prefix)) return;
    if (typeof value !== 'string' || !isColor(value)) return;

    const rest = key.slice(prefix.length); // ex: "Primary100"
    // Separar nome da escala e step numérico
    const match = rest.match(/^([A-Za-z]+)(\d+)$/);
    if (!match) return;

    const [, scaleName, step] = match;
    if (!scales[scaleName]) scales[scaleName] = {};
    scales[scaleName][step] = value;
  });

  return scales;
}

/**
 * Extrai tokens de tipografia (font-family e font-weight) dos tokens de uma marca.
 *
 * @param {Object} brandTokens - Módulo de tokens
 * @returns {{ fontFamily: Record<string, string>, fontWeight: Record<string, Record<string, string>> }}
 */
export function extractTypography(brandTokens) {
  const fontFamily = {};
  const fontWeight = {};
  const familyPrefix = 'LfThmBrandTypographyFontFamily';
  const weightPrefix = 'LfThmBrandTypographyFontWeight';

  Object.entries(brandTokens).forEach(([key, value]) => {
    if (key.startsWith(familyPrefix)) {
      const role = key.slice(familyPrefix.length); // ex: "Display"
      fontFamily[role] = String(value);
    } else if (key.startsWith(weightPrefix)) {
      const rest = key.slice(weightPrefix.length); // ex: "DisplayLight"
      // Split role from weight variant: "DisplayLight" → role="Display", variant="Light"
      const match = rest.match(/^([A-Z][a-z]+)(Light|Regular|Medium|Semibold|Bold)$/);
      if (match) {
        const [, role, variant] = match;
        if (!fontWeight[role]) fontWeight[role] = {};
        fontWeight[role][variant] = String(value);
      }
    }
  });

  return { fontFamily, fontWeight };
}

/**
 * Extrai tokens de border-radius dos tokens de uma marca.
 *
 * @param {Object} brandTokens - Módulo de tokens
 * @returns {Array<{ variant: string, value: string, cssToken: string }>}
 */
export function extractBorderRadius(brandTokens) {
  const prefix = 'LfThmBrandBorderRadius';
  const results = [];

  // Map JS key suffixes to display names and CSS kebab-case
  const variantMap = {
    None: { label: 'None', css: 'none' },
    XxSmall: { label: 'XX-Small', css: 'xx-small' },
    XSmall: { label: 'X-Small', css: 'x-small' },
    Small: { label: 'Small', css: 'small' },
    Medium: { label: 'Medium', css: 'medium' },
    Large: { label: 'Large', css: 'large' },
    Pill: { label: 'Pill', css: 'pill' },
  };

  Object.entries(brandTokens).forEach(([key, value]) => {
    if (!key.startsWith(prefix)) return;
    const suffix = key.slice(prefix.length);
    const info = variantMap[suffix];
    if (info) {
      results.push({
        variant: info.label,
        value: String(value),
        cssToken: `--lf-thm-brand-border-radius-${info.css}`,
      });
    }
  });

  // Sort by the order in variantMap
  const order = Object.keys(variantMap).map(k => variantMap[k].label);
  results.sort((a, b) => order.indexOf(a.variant) - order.indexOf(b.variant));

  return results;
}

/**
 * Extrai tokens de espaçamento (gap, padding, margin, section) dos tokens de uma marca.
 *
 * @param {Object} brandTokens - Módulo de tokens
 * @returns {{ gap: Array, padding: Array, margin: Array, section: Array }}
 */
export function extractSpacing(brandTokens) {
  const categories = {
    gap: { prefix: 'LfThmBrandSpaceGap', cssPrefix: 'gap', items: [] },
    padding: { prefix: 'LfThmBrandSpacePadding', cssPrefix: 'padding', items: [] },
    margin: { prefix: 'LfThmBrandSpaceMargin', cssPrefix: 'margin', items: [] },
    section: { prefix: 'LfThmBrandSpaceSection', cssPrefix: 'section', items: [] },
  };

  Object.entries(brandTokens).forEach(([key, value]) => {
    for (const [catKey, cat] of Object.entries(categories)) {
      if (key.startsWith(cat.prefix)) {
        const suffix = key.slice(cat.prefix.length); // ex: "0", "100", "450"
        categories[catKey].items.push({
          token: `${cat.cssPrefix}-${suffix}`,
          value: String(value),
          sortKey: parseInt(suffix, 10),
        });
        break;
      }
    }
  });

  // Sort each category numerically
  for (const cat of Object.values(categories)) {
    cat.items.sort((a, b) => a.sortKey - b.sortKey);
  }

  return {
    gap: categories.gap.items,
    padding: categories.padding.items,
    margin: categories.margin.items,
    section: categories.section.items,
  };
}

/**
 * Convert a camelCase role name to kebab-case for CSS token display.
 * e.g. "Display" → "display", "XxSmall" → "xx-small"
 */
function toKebab(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}

function ColorScale({ name, scale }) {
  const kebabName = name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  return (
    <div style={{ marginBottom: '24px' }}>
      <LfHeading as="h3">{name}</LfHeading>
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {Object.entries(scale).map(([step, hex]) => (
          <div key={step} style={{ textAlign: 'center', width: '72px' }}>
            <div
              style={{
                width: '100%',
                height: '48px',
                backgroundColor: hex,
                borderRadius: '6px',
                border: '1px solid #E5E5E5',
              }}
            />
            <div style={{ fontSize: '11px', marginTop: '6px', fontWeight: 600 }}>{step}</div>
            <div style={{ fontSize: '9px', color: '#737373', wordBreak: 'break-all', lineHeight: 1.3 }}>{hex}</div>
            <div style={{ fontSize: '8px', color: '#a3a3a3', lineHeight: 1.3 }}>{kebabName}-{step}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BrandSection() {
  const [brand, setBrand] = useState('estacio');

  const brandTokens = BRANDS[brand].default;

  const colorScales = useMemo(
    () => extractColorScales(brandTokens),
    [brandTokens]
  );

  const typography = useMemo(
    () => extractTypography(brandTokens),
    [brandTokens]
  );

  const borderRadius = useMemo(
    () => extractBorderRadius(brandTokens),
    [brandTokens]
  );

  const spacing = useMemo(
    () => extractSpacing(brandTokens),
    [brandTokens]
  );

  const handleBrandChange = (e) => {
    setBrand(e.target.value);
  };

  // Resolve logo: BRAND_LOGOS uses 'ensineme' (no hyphen), BRANDS uses 'ensine-me'
  const brandLogo = BRAND_LOGOS[brand] || BRAND_LOGOS[brand.replace(/-/g, '')];

  // Ordered roles for typography tables
  const fontFamilyRoles = ['Display', 'Heading', 'Paragraph', 'Link', 'Label', 'Caption', 'Overline', 'Code'];
  const fontWeightVariants = ['Light', 'Regular', 'Medium', 'Semibold', 'Bold'];
  const fontWeightRoles = ['Display', 'Heading', 'Paragraph', 'Label', 'Caption', 'Link', 'Code', 'Overline'];

  return (
    <div>
      <LfHeading as="h1">Brand</LfHeading>
      <p className="subtitle">Paleta de cores da marca — base para todos os tokens semânticos.</p>

      <div className="tb-header">
        <div className="tb-select-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
          <label className="tb-label" style={{ marginBottom: 0 }}>Marca</label>
          <select className="tb-select" value={brand} onChange={handleBrandChange}>
            {Object.entries(BRANDS).map(([id, b]) => (
              <option key={id} value={id}>{b.label}</option>
            ))}
          </select>
        </div>
      </div>

      <LfAlert variant="warning">
        Tokens Brand <strong>não devem</strong> ser usados diretamente em componentes de UI.
        Eles existem como referência interna para os tokens semânticos (Usage Collection).
        Sempre prefira tokens Dynamic, Interactive, Static, Inputable ou Core.
      </LfAlert>


      {/* ── Color Scales ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '36px', marginBottom: '10px', paddingBottom: '6px', borderBottom: '2px solid #e5e5e5' }}>
        <span style={{ fontFamily: '"Montserrat", sans-serif', fontSize: '20px', fontWeight: 700 }}>Escalas de cor</span>
        {brandLogo ? (
          <div
            className="brand-logo"
            dangerouslySetInnerHTML={{ __html: brandLogo.positive }}
          />
        ) : (
          <div className="brand-logo brand-logo-text">{BRANDS[brand].label}</div>
        )}
      </div>
      <LfParagraph>Cada escala vai de 100 (mais claro) a 900 (mais escuro). O valor 500 é o tom principal.</LfParagraph>

      {Object.keys(colorScales).length > 0 ? (
        (() => {
          const SCALE_ORDER = ['Primary', 'Secondary', 'Tertiary', 'Highlight', 'Ai', 'Info', 'Critical', 'Warning', 'Success', 'Neutral', 'NeutralAlpha', 'Contrast'];
          const sorted = Object.entries(colorScales).sort(([a], [b]) => {
            const ia = SCALE_ORDER.indexOf(a);
            const ib = SCALE_ORDER.indexOf(b);
            return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
          });
          return sorted.map(([name, scale]) => (
            <ColorScale key={name} name={name} scale={scale} />
          ));
        })()
      ) : (
        <p style={{ color: '#a3a3a3', fontStyle: 'italic' }}>Nenhuma escala de cor disponível para esta marca.</p>
      )}


      {/* ── Typography ── */}
      <LfHeading as="h2">Typography</LfHeading>
      <LfParagraph>Os Brand Tokens de tipografia definem as famílias de fonte e pesos para cada papel tipográfico.</LfParagraph>

      <LfHeading as="h3">Font Family</LfHeading>
      <table>
        <thead>
          <tr><th>Papel</th><th>Fonte ({BRANDS[brand].label})</th><th>Token CSS</th></tr>
        </thead>
        <tbody>
          {fontFamilyRoles.map((role) => (
            <tr key={role}>
              <td><strong>{role}</strong></td>
              <td>{typography.fontFamily[role] || '—'}</td>
              <td><code>--lf-thm-brand-typography-font-family-{toKebab(role)}</code></td>
            </tr>
          ))}
        </tbody>
      </table>

      <LfHeading as="h3">Font Weight</LfHeading>
      <table>
        <thead>
          <tr>
            <th>Papel</th>
            {fontWeightVariants.map((v) => <th key={v}>{v}</th>)}
          </tr>
        </thead>
        <tbody>
          {fontWeightRoles.map((role) => (
            <tr key={role}>
              <td><strong>{role}</strong></td>
              {fontWeightVariants.map((v) => (
                <td key={v}>
                  {(typography.fontWeight[role] && typography.fontWeight[role][v]) || '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>


      {/* ── Border Radius ── */}
      <LfHeading as="h2">Border Radius</LfHeading>
      <LfParagraph>Tokens de arredondamento de borda disponíveis na camada Brand.</LfParagraph>

      <table>
        <thead>
          <tr><th>Variante</th><th>Valor ({BRANDS[brand].label})</th><th>Token CSS</th></tr>
        </thead>
        <tbody>
          {borderRadius.map((item) => (
            <tr key={item.variant}>
              <td><strong>{item.variant}</strong></td>
              <td>{item.value}</td>
              <td><code>{item.cssToken}</code></td>
            </tr>
          ))}
        </tbody>
      </table>


      {/* ── Spacing ── */}
      <LfHeading as="h2">Spacing</LfHeading>
      <LfParagraph>Os Brand Tokens de espaçamento são divididos em quatro categorias: Gap, Padding, Margin e Section.</LfParagraph>

      <LfHeading as="h3">Gap</LfHeading>
      <table>
        <thead>
          <tr><th>Token</th><th>Valor</th></tr>
        </thead>
        <tbody>
          {spacing.gap.map((item) => (
            <tr key={item.token}>
              <td><code>{item.token}</code></td>
              <td>{item.value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <LfHeading as="h3">Padding</LfHeading>
      <table>
        <thead>
          <tr><th>Token</th><th>Valor</th></tr>
        </thead>
        <tbody>
          {spacing.padding.map((item) => (
            <tr key={item.token}>
              <td><code>{item.token}</code></td>
              <td>{item.value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <LfHeading as="h3">Margin</LfHeading>
      <table>
        <thead>
          <tr><th>Token</th><th>Valor</th></tr>
        </thead>
        <tbody>
          {spacing.margin.map((item) => (
            <tr key={item.token}>
              <td><code>{item.token}</code></td>
              <td>{item.value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <LfHeading as="h3">Section</LfHeading>
      <table>
        <thead>
          <tr><th>Token</th><th>Valor</th></tr>
        </thead>
        <tbody>
          {spacing.section.map((item) => (
            <tr key={item.token}>
              <td><code>{item.token}</code></td>
              <td>{item.value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ── Convenção de Nomes ── */}
      <LfHeading as="h2">Convenção de Nomes</LfHeading>
      <LfParagraph>Os Brand Tokens seguem uma convenção de nomenclatura consistente que facilita a identificação e o uso.</LfParagraph>

      <LfHeading as="h3">Prefixo</LfHeading>
      <LfParagraph>
        Todos os Brand Tokens usam o prefixo <code>LfThm</code> (Lift Theme) no Figma e <code>--lf-thm-brand-</code> no CSS:
      </LfParagraph>
      <pre>{`Figma:  LfThm / Brand / Color / Primary / 500
CSS:    --lf-thm-brand-color-primary-500
JS:     lfThmBrandColorPrimary500`}</pre>

      <LfHeading as="h3">Estrutura do nome</LfHeading>
      <table>
        <thead>
          <tr><th>Segmento</th><th>Descrição</th><th>Exemplos</th></tr>
        </thead>
        <tbody>
          <tr><td><code>lf-thm</code></td><td>Prefixo do tema Lift</td><td>Fixo</td></tr>
          <tr><td><code>brand</code></td><td>Camada Brand</td><td>Fixo</td></tr>
          <tr><td><code>color | typography | border-radius | space</code></td><td>Categoria do token</td><td>color, typography, space</td></tr>
          <tr><td><code>primary | secondary | gap | padding ...</code></td><td>Subcategoria</td><td>primary, neutral, gap</td></tr>
          <tr><td><code>100 ... 1000 | light | bold ...</code></td><td>Variante / intensidade</td><td>500, semibold</td></tr>
        </tbody>
      </table>

      <LfHeading as="h3">Sobre as 8 marcas</LfHeading>
      <LfParagraph>
        O Lift DS suporta 8 marcas distintas. Cada marca possui seu próprio arquivo CSS de Brand Tokens
        com valores diferentes. Ao trocar o arquivo CSS importado, todos os tokens Brand mudam automaticamente,
        e por consequência todos os Usage e Component Tokens que os referenciam.
      </LfParagraph>
      <pre>{`@lift/ds-tokens/brands/damasio/css/default.css   → Damásio
@lift/ds-tokens/brands/estacio/css/default.css   → Estácio
@lift/ds-tokens/brands/ibmec/css/default.css     → IBMEC
@lift/ds-tokens/brands/wyden/css/default.css     → Wyden
@lift/ds-tokens/brands/yduqs/css/default.css     → Yduqs
@lift/ds-tokens/brands/idomed/css/default.css    → Idomed
@lift/ds-tokens/brands/ensineme/css/default.css  → Ensineme`}</pre>


      {/* ── Como Brand alimenta tokens semânticos ── */}
      <LfHeading as="h2">Como Brand alimenta os tokens semânticos</LfHeading>
      <table>
        <thead>
          <tr><th>Token semântico</th><th>Alias Brand</th><th>Valor</th></tr>
        </thead>
        <tbody>
          <tr><td><code>Dynamic/Primary/Surface/Default</code></td><td><code>Brand/Color/Primary/500</code></td><td><code>#076AEA</code></td></tr>
          <tr><td><code>Dynamic/Critical/Surface/Default</code></td><td><code>Brand/Color/Critical/600</code></td><td><code>#C42A27</code></td></tr>
          <tr><td><code>Static/Success/Surface/Highest</code></td><td><code>Brand/Color/Success/100</code></td><td><code>#BDEFAF</code></td></tr>
          <tr><td><code>Core/On Surface/Text/Primary</code></td><td><code>Brand/Color/Neutral/900</code></td><td><code>#171717</code></td></tr>
          <tr><td><code>Core/Surface/Default</code></td><td><code>Brand/Color/Neutral/100</code></td><td><code>#FFFFFF</code></td></tr>
        </tbody>
      </table>

      <LfAlert variant="info">
        Quando a paleta Brand muda (ex: troca de marca Estácio → Wyden), todos os tokens semânticos
        se atualizam automaticamente via cadeia de aliases.
      </LfAlert>
    </div>
  );
}
