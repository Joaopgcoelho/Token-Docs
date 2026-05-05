/**
 * Generate enriched token data from npm @lift/ds-tokens package.
 *
 * Reads the exported JS tokens, parses each name into a hierarchical path,
 * adds context descriptions, alias chain info, and generates:
 *   - docs/tokens-figma-enriched.json  (enriched flat list)
 *   - docs/tokens-comparison.json      (npm vs known Figma structure)
 *
 * Usage: node scripts/generate-enriched-tokens.js
 */

const fs = require('fs');
const path = require('path');

// ─────────────────────────────────────────────
// 1. Context descriptions for path segments
// ─────────────────────────────────────────────
const SEGMENT_CONTEXT = {
  // Category (first segment after prefix)
  Dynamic: 'Elementos que disparam ações e alteram navegação',
  Interactive: 'Elementos que respondem a interação local',
  Static: 'Composição visual sem interação',
  Inputable: 'Coleta de dados do usuário',
  Core: 'Tokens fundamentais do sistema',
  Elevation: 'Sombras e superfícies de elevação',
  Gradient: 'Gradientes de marca',
  Component: 'Tokens específicos de componentes',
  Brand: 'Tokens de marca (cores, tipografia, espaçamento)',
  Screen: 'Tokens responsivos por breakpoint',

  // Semantic role
  Primary: 'Ação/elemento principal. Máx 1 por área',
  Secondary: 'Ação/elemento alternativo',
  Tertiary: 'Terceira opção hierárquica',
  Critical: 'Erro, perigo, ação destrutiva',
  Success: 'Sucesso, validação positiva',
  Warning: 'Aviso, atenção',
  Info: 'Informação',
  Neutral: 'Neutro, genérico',
  Highlight: 'Destaque especial',
  Ai: 'Inteligência artificial',
  Alpha: 'Transparência/opacidade',
  Contrast: 'Contraste',

  // Variant
  Ghost: 'Sem fundo visível',
  Simple: 'Neutra, baixa hierarquia',
  Unframed: 'Sem moldura/contorno',
  Disabled: 'Estado desabilitado',

  // Target / role
  Surface: 'Background → background-color',
  OnSurface: 'Conteúdo sobre surface → color',
  Container: 'Camada acima do surface (só Static)',
  OnContainer: 'Conteúdo sobre container',
  Border: 'Contorno → border-color',
  Icon: 'Ícones',
  Text: 'Texto',
  Link: 'Links',
  Skeleton: 'Loading skeleton',
  Shadow: 'Sombra',
  Divider: 'Divisor',
  Focus: 'Foco de acessibilidade',

  // Inverse
  Inverse: 'Variante para fundos escuros',

  // State
  Default: 'Estado padrão',
  Hover: 'Cursor sobre',
  Pressed: 'Pressionado',
  Active: 'Ativo/selecionado',
  Loading: 'Processando',
  Visited: 'Link visitado',
  Enabled: 'Habilitado',
  Selected: 'Selecionado',

  // Inputable sub-types
  Field: 'Campos de texto',
  Selectable: 'Checkbox, radio, switch',
  Switch: 'Toggle switch',

  // Intensity (Static)
  Highest: 'Intensidade mais clara',
  Higher: 'Intensidade clara',
  High: 'Intensidade média-clara',
  Medium: 'Intensidade média',
  Low: 'Intensidade média-escura',
  Lower: 'Intensidade escura',
  Lowest: 'Intensidade mais escura',
  Pure: 'Cor pura do feedback',

  // Elevation levels
  Level1: 'Nível 1 de elevação',
  Level2: 'Nível 2 de elevação',
  Level3: 'Nível 3 de elevação',
  Level4: 'Nível 4 de elevação',
};

// ─────────────────────────────────────────────
// 2. Known alias chains (Usage → Brand → Base)
// ─────────────────────────────────────────────
const ALIAS_CHAINS = {
  // Dynamic
  'Dynamic/Primary/Surface/Default': ['Brand/Color/Primary/500', 'saphire/500'],
  'Dynamic/Primary/Surface/Hover': ['Brand/Color/Primary/600', 'saphire/600'],
  'Dynamic/Primary/Surface/Pressed': ['Brand/Color/Primary/700', 'saphire/700'],
  'Dynamic/Primary/Surface/Loading': ['Brand/Color/Primary/500', 'saphire/500'],
  'Dynamic/Primary/OnSurface/Default': ['Brand/Color/Neutral/100', 'gray-light/0'],
  'Dynamic/Critical/Surface/Default': ['Brand/Color/Critical/600', 'red/600'],
  'Dynamic/Critical/Surface/Hover': ['Brand/Color/Critical/700', 'red/700'],
  'Dynamic/Critical/Surface/Pressed': ['Brand/Color/Critical/800', 'red/800'],
  'Dynamic/Critical/Surface/Loading': ['Brand/Color/Critical/600', 'red/600'],
  'Dynamic/Critical/OnSurface/Default': ['Brand/Color/Neutral/100', 'gray-light/0'],
  'Dynamic/Highlight/Surface/Default': ['Brand/Color/Highlight/600', 'pink/600'],
  'Dynamic/Highlight/Surface/Hover': ['Brand/Color/Highlight/700', 'pink/700'],
  'Dynamic/Highlight/Surface/Pressed': ['Brand/Color/Highlight/800', 'pink/800'],
  'Dynamic/Ghost/OnSurface/Default': ['Brand/Color/Primary/500', 'saphire/500'],
  'Dynamic/Ghost/Surface/Hover': ['Brand/Color/Primary/100', 'saphire/50'],
  'Dynamic/Ghost/Surface/Pressed': ['Brand/Color/Primary/200', 'saphire/100'],
  'Dynamic/Secondary/OnSurface/Default': ['Brand/Color/Primary/500', 'saphire/500'],
  'Dynamic/Secondary/OnSurface/Border/Default': ['Brand/Color/Primary/500', 'saphire/500'],
  'Dynamic/Simple/Surface/Default': ['Brand/Color/Neutral/700', 'gray-light/700'],
  'Dynamic/Disabled/Surface/Default': ['Brand/Color/NeutralAlpha/300', 'gray-light-alpha/300'],
  'Dynamic/Disabled/OnSurface/Default': ['Brand/Color/NeutralAlpha/500', 'gray-light-alpha/500'],

  // Core
  'Core/OnSurface/Text/Primary': ['Brand/Color/Neutral/900', 'gray-light/1000'],
  'Core/OnSurface/Text/Secondary': ['Brand/Color/Neutral/700', 'gray-light/700'],
  'Core/OnSurface/Text/Tertiary': ['Brand/Color/Neutral/600', 'gray-light/600'],
  'Core/OnSurface/Text/Brand': ['Brand/Color/Primary/500', 'saphire/500'],
  'Core/OnSurface/Text/Critical': ['Brand/Color/Critical/500', 'red/500'],
  'Core/OnSurface/Text/Warning': ['Brand/Color/Warning/800', 'orange/800'],
  'Core/OnSurface/Text/Success': ['Brand/Color/Success/700', 'green/700'],
  'Core/OnSurface/Text/Info': ['Brand/Color/Info/700', 'purple/700'],
  'Core/OnSurface/Text/Code': ['Brand/Color/Highlight/600', 'pink/600'],
  'Core/OnSurface/Text/Inverse/Primary': ['Brand/Color/Neutral/100', 'gray-light/0'],
  'Core/OnSurface/Border/Primary': ['Brand/Color/Neutral/400', 'gray-light/400'],
  'Core/OnSurface/Border/Secondary': ['Brand/Color/Neutral/200', 'gray-light/200'],
  'Core/OnSurface/Border/Divider': ['Brand/Color/Neutral/400', 'gray-light/400'],
  'Core/OnSurface/Border/Focus': ['Brand/Color/Neutral/800', 'gray-light/800'],
  'Core/OnSurface/Link/Default': ['Brand/Color/Primary/500', 'saphire/500'],
  'Core/OnSurface/Link/Hover': ['Brand/Color/Primary/700', 'saphire/700'],
  'Core/OnSurface/Icon/Primary': ['Brand/Color/Neutral/900', 'gray-light/1000'],
  'Core/OnSurface/Icon/Brand': ['Brand/Color/Primary/500', 'saphire/500'],
  'Core/OnSurface/Skeleton/Default': ['Brand/Color/NeutralAlpha/300', 'gray-light-alpha/300'],
  'Core/Surface/Default': ['Brand/Color/Neutral/100', 'gray-light/0'],
  'Core/Surface/Inverse': ['Brand/Color/Neutral/1000', 'gray-light/1000'],

  // Interactive
  'Interactive/Primary/Surface/Default': ['Brand/Color/Primary/100', 'saphire/50'],
  'Interactive/Primary/Surface/Hover': ['Brand/Color/Primary/300', 'saphire/300'],
  'Interactive/Primary/Surface/Active': ['Brand/Color/Primary/200', 'saphire/100'],
  'Interactive/Primary/OnSurface/Default': ['Brand/Color/Neutral/900', 'gray-light/1000'],
  'Interactive/Secondary/Surface/Default': ['Brand/Color/Secondary/300', 'teal/300'],
  'Interactive/Neutral/Surface/Default': ['Brand/Color/Neutral/200', 'gray-light/200'],
  'Interactive/Critical/Surface/Pure/Default': ['Brand/Color/Critical/100', 'red/50'],
  'Interactive/Critical/Surface/High/Default': ['Brand/Color/Neutral/200', 'gray-light/200'],
  'Interactive/Critical/Surface/Low/Default': ['Brand/Color/Critical/800', 'red/800'],
  'Interactive/Success/Surface/Pure/Default': ['Brand/Color/Success/100', 'green/50'],
  'Interactive/Warning/Surface/Pure/Default': ['Brand/Color/Warning/100', 'orange/50'],
  'Interactive/Info/Surface/Pure/Default': ['Brand/Color/Info/100', 'purple/50'],

  // Static
  'Static/Primary/Surface/Highest': ['Brand/Color/Primary/100', 'saphire/50'],
  'Static/Primary/Surface/Higher': ['Brand/Color/Primary/200', 'saphire/100'],
  'Static/Primary/Surface/High': ['Brand/Color/Primary/300', 'saphire/300'],
  'Static/Primary/Surface/Low': ['Brand/Color/Primary/500', 'saphire/500'],
  'Static/Primary/Surface/Lower': ['Brand/Color/Primary/700', 'saphire/700'],
  'Static/Primary/Surface/Lowest': ['Brand/Color/Primary/900', 'saphire/900'],
  'Static/Critical/Surface/Highest': ['Brand/Color/Critical/100', 'red/50'],
  'Static/Critical/Surface/Higher': ['Brand/Color/Critical/200', 'red/100'],
  'Static/Critical/Surface/Low': ['Brand/Color/Critical/600', 'red/600'],
  'Static/Neutral/Surface/Highest': ['Brand/Color/Neutral/200', 'gray-light/200'],
  'Static/Neutral/Surface/Higher': ['Brand/Color/Neutral/300', 'gray-light/300'],
  'Static/Neutral/Surface/Low': ['Brand/Color/Neutral/700', 'gray-light/700'],
  'Static/Ai/Surface/Highest': ['Brand/Color/Ai/100', 'lime/50'],

  // Inputable
  'Inputable/Field/Neutral/Surface/Default': ['Brand/Color/Neutral/100', 'gray-light/0'],
  'Inputable/Field/Neutral/OnSurface/Default': ['Brand/Color/Neutral/600', 'gray-light/600'],
  'Inputable/Field/Neutral/OnSurface/Border/Default': ['Brand/Color/Neutral/500', 'gray-light/500'],
  'Inputable/Field/Neutral/OnSurface/Border': ['Brand/Color/Neutral/400', 'gray-light/400'],
  'Inputable/Selectable/Neutral/Surface/Default': ['Brand/Color/Primary/500', 'saphire/500'],
  'Inputable/Selectable/Neutral/OnSurface/Border/Default': ['Brand/Color/Neutral/500', 'gray-light/500'],

  // Elevation
  'Elevation/Surface/Level1/Default': ['Brand/Color/Neutral/200', 'gray-light/200'],
  'Elevation/Surface/Level2/Default': ['Brand/Color/Neutral/100', 'gray-light/0'],
};

// ─────────────────────────────────────────────
// 3. CSS property inference
// ─────────────────────────────────────────────
function inferCssProperty(segments) {
  const joined = segments.join('/').toLowerCase();
  if (joined.includes('shadow')) return 'box-shadow';
  if (joined.includes('border') && joined.includes('radius')) return 'border-radius';
  if (joined.includes('border') && joined.includes('width')) return 'border-width';
  if (joined.includes('border')) return 'border-color';
  if (joined.includes('surface') && !joined.includes('onsurface')) return 'background-color';
  if (joined.includes('onsurface') && joined.includes('icon')) return 'color (icon fill)';
  if (joined.includes('onsurface') && joined.includes('text')) return 'color';
  if (joined.includes('onsurface') && joined.includes('link')) return 'color';
  if (joined.includes('onsurface')) return 'color';
  if (joined.includes('container') && !joined.includes('oncontainer')) return 'background-color';
  if (joined.includes('oncontainer') && joined.includes('icon')) return 'color (icon fill)';
  if (joined.includes('oncontainer')) return 'color';
  if (joined.includes('skeleton')) return 'background-color';
  if (joined.includes('divider')) return 'border-color';
  if (joined.includes('focus')) return 'outline-color';
  if (joined.includes('fontfamily')) return 'font-family';
  if (joined.includes('fontweight')) return 'font-weight';
  if (joined.includes('fontsize')) return 'font-size';
  if (joined.includes('lineheight')) return 'line-height';
  if (joined.includes('gap')) return 'gap';
  if (joined.includes('margin')) return 'margin';
  if (joined.includes('padding')) return 'padding';
  if (joined.includes('section')) return 'padding / margin (section)';
  if (joined.includes('zindex')) return 'z-index';
  if (joined.includes('duration')) return 'transition-duration';
  if (joined.includes('motion')) return 'transition-timing-function';
  if (joined.includes('breakpoint')) return '@media min-width';
  if (joined.includes('gradient')) return 'background (gradient)';
  return null;
}

// ─────────────────────────────────────────────
// 4. Detect if a value is a color
// ─────────────────────────────────────────────
function isColor(value) {
  if (typeof value !== 'string') return false;
  return /^#[0-9a-fA-F]{3,8}$/.test(value) || /^rgba?\(/.test(value);
}

// ─────────────────────────────────────────────
// 5. Determine the role from segments
// ─────────────────────────────────────────────
function inferRole(segments) {
  const joined = segments.join('/').toLowerCase();
  if (joined.includes('surface') && !joined.includes('onsurface')) return 'surface';
  if (joined.includes('onsurface') && joined.includes('icon')) return 'icon';
  if (joined.includes('onsurface') && joined.includes('text')) return 'text';
  if (joined.includes('onsurface') && joined.includes('link')) return 'link';
  if (joined.includes('onsurface') && joined.includes('border')) return 'border';
  if (joined.includes('onsurface') && joined.includes('skeleton')) return 'skeleton';
  if (joined.includes('onsurface')) return 'onSurface';
  if (joined.includes('oncontainer') && joined.includes('icon')) return 'icon';
  if (joined.includes('oncontainer')) return 'onContainer';
  if (joined.includes('container')) return 'container';
  if (joined.includes('shadow')) return 'shadow';
  if (joined.includes('border')) return 'border';
  if (joined.includes('gradient')) return 'gradient';
  return null;
}

// ─────────────────────────────────────────────
// 6. Parse token name into segments
// ─────────────────────────────────────────────

/**
 * Parse a PascalCase token name into semantic segments.
 * E.g. "LfThmDynamicPrimarySurfaceDefault" →
 *   { prefix: "LfThm", category: "Dynamic", segments: ["Primary", "Surface", "Default"] }
 */
function parseTokenName(name) {
  // Determine prefix and category
  const prefixes = [
    { prefix: 'LfThmComponent', category: 'Component' },
    { prefix: 'LfThmBrand', category: 'Brand' },
    { prefix: 'LfThmScreen', category: 'Screen' },
    { prefix: 'LfThmCore', category: 'Core' },
    { prefix: 'LfThmDynamic', category: 'Dynamic' },
    { prefix: 'LfThmInteractive', category: 'Interactive' },
    { prefix: 'LfThmStatic', category: 'Static' },
    { prefix: 'LfThmInputable', category: 'Inputable' },
    { prefix: 'LfThmElevation', category: 'Elevation' },
    { prefix: 'LfThmGradient', category: 'Gradient' },
    { prefix: 'LfThm', category: 'Theme' },
    { prefix: 'LfBs', category: 'Base' },
  ];

  let prefix = '';
  let category = 'Unknown';
  let rest = name;

  for (const p of prefixes) {
    if (name.startsWith(p.prefix)) {
      prefix = p.prefix;
      category = p.category;
      rest = name.slice(p.prefix.length);
      break;
    }
  }

  // Split PascalCase into segments using a smarter approach
  // Insert a separator before each uppercase letter that follows a lowercase letter or digit,
  // or before an uppercase letter followed by a lowercase letter (for acronyms)
  const splitRest = rest
    .replace(/([a-z\d])([A-Z])/g, '$1|$2')   // camelCase boundary
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1|$2') // acronym boundary (e.g. "XMLParser" → "XML|Parser")
    .split('|')
    .filter(Boolean);

  // Merge numeric-only segments with previous segment (e.g. ["Primary", "500"] → ["Primary500"])
  const merged = [];
  for (let i = 0; i < splitRest.length; i++) {
    if (/^\d+$/.test(splitRest[i]) && merged.length > 0) {
      merged[merged.length - 1] += splitRest[i];
    } else {
      merged.push(splitRest[i]);
    }
  }

  // Post-process: merge known compound segments
  const COMPOUNDS = {
    'On+Surface': 'OnSurface',
    'On+Container': 'OnContainer',
    'Neutral+Alpha': 'NeutralAlpha',
    'Border+Radius': 'BorderRadius',
    'Border+Width': 'BorderWidth',
    'Font+Family': 'FontFamily',
    'Font+Weight': 'FontWeight',
    'Font+Size': 'FontSize',
    'Line+Height': 'LineHeight',
    'Tag+Filter': 'TagFilter',
    'Tag+Select': 'TagSelect',
    'Tag+Static': 'TagStatic',
    'Card+Base': 'CardBase',
    'Smart+Sugesstionborder': 'SmartSugesstionBorder',
    'Smart+Sugesstionsurface': 'SmartSugesstionSurface',
    'Xx+Small': 'XxSmall',
    'Xx+Large': 'XxLarge',
  };

  const final = [];
  let i = 0;
  while (i < merged.length) {
    if (i + 1 < merged.length) {
      const pair = merged[i] + '+' + merged[i + 1];
      if (COMPOUNDS[pair]) {
        final.push(COMPOUNDS[pair]);
        i += 2;
        continue;
      }
    }
    final.push(merged[i]);
    i++;
  }

  return { prefix, category, segments: final };
}

// ─────────────────────────────────────────────
// 7. Determine the layer from category
// ─────────────────────────────────────────────
function getLayer(category) {
  const layerMap = {
    Base: 'base',
    Brand: 'brand',
    Core: 'usage',
    Dynamic: 'usage',
    Interactive: 'usage',
    Static: 'usage',
    Inputable: 'usage',
    Elevation: 'usage',
    Gradient: 'usage',
    Component: 'component',
    Screen: 'screen',
    Unknown: 'unknown',
  };
  return layerMap[category] || 'unknown';
}

// ─────────────────────────────────────────────
// 8. Build context string from segments
// ─────────────────────────────────────────────
function buildContext(category, segments) {
  const parts = [];

  // Add category context
  if (SEGMENT_CONTEXT[category]) {
    parts.push(SEGMENT_CONTEXT[category]);
  }

  // Add context for each segment
  segments.forEach(seg => {
    // Try exact match first
    if (SEGMENT_CONTEXT[seg]) {
      parts.push(SEGMENT_CONTEXT[seg]);
      return;
    }
    // Try without trailing numbers (e.g. "Primary500" → "Primary")
    const withoutNum = seg.replace(/\d+$/, '');
    if (withoutNum && SEGMENT_CONTEXT[withoutNum]) {
      parts.push(SEGMENT_CONTEXT[withoutNum]);
    }
  });

  // Deduplicate
  return [...new Set(parts)].join('. ') + '.';
}

// ─────────────────────────────────────────────
// 9. Find alias chain for a token
// ─────────────────────────────────────────────
function findAliasChain(category, segments) {
  // Build possible lookup keys
  const keys = [];

  // Full path: Category/Seg1/Seg2/...
  keys.push(category + '/' + segments.join('/'));

  // Try progressively shorter paths
  for (let i = segments.length - 1; i >= 2; i--) {
    keys.push(category + '/' + segments.slice(0, i).join('/'));
  }

  // Also try without Inverse
  const withoutInverse = segments.filter(s => s !== 'Inverse');
  if (withoutInverse.length !== segments.length) {
    keys.push(category + '/' + withoutInverse.join('/'));
    for (let i = withoutInverse.length - 1; i >= 2; i--) {
      keys.push(category + '/' + withoutInverse.slice(0, i).join('/'));
    }
  }

  for (const key of keys) {
    if (ALIAS_CHAINS[key]) {
      return ALIAS_CHAINS[key];
    }
  }

  return null;
}

// ─────────────────────────────────────────────
// 10. Read npm tokens
// ─────────────────────────────────────────────
function readNpmTokens(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error('Token file not found:', filePath);
    return {};
  }
  const content = fs.readFileSync(filePath, 'utf8');
  const tokens = {};
  const re = /export var (\w+)\s*=\s*(.+);/g;
  let match;
  while ((match = re.exec(content)) !== null) {
    let val = match[2].trim();
    // Remove surrounding quotes
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    tokens[match[1]] = val;
  }
  return tokens;
}

// ─────────────────────────────────────────────
// 11. Main execution
// ─────────────────────────────────────────────
function main() {
  const tokenFile = path.join('node_modules', '@lift', 'ds-tokens', 'brands', 'estacio', 'ts', 'default.js');
  console.log('Reading tokens from:', tokenFile);

  const npmTokens = readNpmTokens(tokenFile);
  const tokenNames = Object.keys(npmTokens);
  console.log(`Found ${tokenNames.length} tokens\n`);

  // ── Enrich each token ──
  const enrichedTokens = tokenNames.map(name => {
    const value = npmTokens[name];
    const { prefix, category, segments } = parseTokenName(name);
    const layer = getLayer(category);
    const pathStr = category + ' / ' + segments.join(' / ');
    const context = buildContext(category, segments);
    const aliasChain = findAliasChain(category, segments);
    const role = inferRole([category, ...segments]);
    const cssProperty = inferCssProperty([category, ...segments]);
    const colorFlag = isColor(value);

    return {
      name,
      path: pathStr,
      segments: [category, ...segments],
      category,
      layer,
      value,
      isColor: colorFlag,
      context,
      aliasChain: aliasChain || [],
      role,
      cssProperty,
    };
  });

  // ── Summary stats ──
  const summary = {
    totalTokens: enrichedTokens.length,
    byCategory: {},
    byLayer: {},
    byRole: {},
    colorTokens: 0,
    nonColorTokens: 0,
  };

  enrichedTokens.forEach(t => {
    summary.byCategory[t.category] = (summary.byCategory[t.category] || 0) + 1;
    summary.byLayer[t.layer] = (summary.byLayer[t.layer] || 0) + 1;
    if (t.role) summary.byRole[t.role] = (summary.byRole[t.role] || 0) + 1;
    if (t.isColor) summary.colorTokens++;
    else summary.nonColorTokens++;
  });

  // ── Write enriched JSON ──
  const enrichedOutput = {
    _schema: 'lift-tokens-enriched/1.0.0',
    _source: 'npm @lift/ds-tokens/brands/estacio/ts/default.js',
    generatedAt: new Date().toISOString(),
    summary,
    tokens: enrichedTokens,
  };

  const enrichedPath = path.join('docs', 'tokens-figma-enriched.json');
  fs.writeFileSync(enrichedPath, JSON.stringify(enrichedOutput, null, 2));
  console.log(`✓ Enriched tokens written to ${enrichedPath}`);
  console.log(`  Total: ${summary.totalTokens}`);
  console.log(`  By category:`, JSON.stringify(summary.byCategory));
  console.log(`  By layer:`, JSON.stringify(summary.byLayer));
  console.log(`  Colors: ${summary.colorTokens}, Non-colors: ${summary.nonColorTokens}`);
  console.log('');

  // ─────────────────────────────────────────────
  // 12. Comparison: npm tokens vs known Figma structure
  // ─────────────────────────────────────────────

  // Known Figma Usage groups
  const FIGMA_USAGE_GROUPS = {
    Core: [
      'OnSurface/Text/Primary', 'OnSurface/Text/Secondary', 'OnSurface/Text/Tertiary',
      'OnSurface/Text/Brand', 'OnSurface/Text/Critical', 'OnSurface/Text/Warning',
      'OnSurface/Text/Success', 'OnSurface/Text/Info', 'OnSurface/Text/Code',
      'OnSurface/Text/Inverse/Primary', 'OnSurface/Text/Inverse/Secondary',
      'OnSurface/Text/Inverse/Tertiary', 'OnSurface/Text/Inverse/Brand',
      'OnSurface/Text/Inverse/Critical', 'OnSurface/Text/Inverse/Warning',
      'OnSurface/Text/Inverse/Success', 'OnSurface/Text/Inverse/Info',
      'OnSurface/Text/Inverse/Code',
      'OnSurface/Border/Primary', 'OnSurface/Border/Secondary', 'OnSurface/Border/Tertiary',
      'OnSurface/Border/Brand', 'OnSurface/Border/Critical', 'OnSurface/Border/Warning',
      'OnSurface/Border/Success', 'OnSurface/Border/Info', 'OnSurface/Border/Divider',
      'OnSurface/Border/Focus',
      'OnSurface/Border/Inverse/Primary', 'OnSurface/Border/Inverse/Secondary',
      'OnSurface/Border/Inverse/Tertiary', 'OnSurface/Border/Inverse/Brand',
      'OnSurface/Border/Inverse/Critical', 'OnSurface/Border/Inverse/Warning',
      'OnSurface/Border/Inverse/Success', 'OnSurface/Border/Inverse/Info',
      'OnSurface/Border/Inverse/Divider', 'OnSurface/Border/Inverse/Focus',
      'OnSurface/Link/Default', 'OnSurface/Link/Hover', 'OnSurface/Link/Active', 'OnSurface/Link/Visited',
      'OnSurface/Link/Inverse/Default', 'OnSurface/Link/Inverse/Hover',
      'OnSurface/Link/Inverse/Active', 'OnSurface/Link/Inverse/Visited',
      'OnSurface/Icon/Primary', 'OnSurface/Icon/Secondary', 'OnSurface/Icon/Tertiary',
      'OnSurface/Icon/Brand', 'OnSurface/Icon/Critical', 'OnSurface/Icon/Warning',
      'OnSurface/Icon/Success', 'OnSurface/Icon/Info',
      'OnSurface/Icon/Inverse/Primary', 'OnSurface/Icon/Inverse/Secondary',
      'OnSurface/Icon/Inverse/Tertiary', 'OnSurface/Icon/Inverse/Brand',
      'OnSurface/Icon/Inverse/Critical', 'OnSurface/Icon/Inverse/Warning',
      'OnSurface/Icon/Inverse/Success', 'OnSurface/Icon/Inverse/Info',
      'OnSurface/Skeleton/Default', 'OnSurface/Skeleton/Inverse/Default',
      'Surface/Default', 'Surface/Inverse',
    ],
    Dynamic: [
      'Primary', 'Secondary', 'Critical', 'Highlight', 'Ghost', 'Simple', 'Disabled', 'Unframed',
    ],
    Interactive: [
      'Primary', 'Secondary', 'Tertiary', 'Neutral', 'Critical', 'Success', 'Warning', 'Info', 'Highlight',
    ],
    Static: [
      'Primary', 'Secondary', 'Tertiary', 'Neutral', 'Critical', 'Success', 'Warning', 'Info',
      'Highlight', 'Ai', 'Alpha',
    ],
    Inputable: [
      'Field/Neutral', 'Field/Critical', 'Field/Success', 'Field/Disabled',
      'Selectable/Neutral', 'Selectable/Critical', 'Selectable/Disabled',
    ],
    Elevation: [
      'Surface/Level1', 'Surface/Level2', 'Surface/Level3', 'Surface/Level4',
      'OnSurface/Level1/Border', 'OnSurface/Level2/Border', 'OnSurface/Level3/Border', 'OnSurface/Level4/Border',
      'Shadow/Level1', 'Shadow/Level2', 'Shadow/Level3', 'Shadow/Level4', 'Shadow/Fill',
    ],
    Gradient: ['Start', 'Finish'],
  };

  // Build a set of npm token categories for comparison
  const npmByCategory = {};
  enrichedTokens.forEach(t => {
    if (!npmByCategory[t.category]) npmByCategory[t.category] = [];
    npmByCategory[t.category].push(t);
  });

  // Check which Figma groups have npm coverage
  const comparison = {
    _description: 'Comparison between npm tokens and known Figma token structure',
    generatedAt: new Date().toISOString(),
    figmaUsageGroups: {},
    npmCategories: {},
    npmTokensNotInFigmaStructure: [],
    figmaPathsNotInNpm: [],
  };

  // For each Figma group, check npm coverage
  for (const [group, subPaths] of Object.entries(FIGMA_USAGE_GROUPS)) {
    const groupTokens = npmByCategory[group] || [];
    comparison.figmaUsageGroups[group] = {
      figmaSubPaths: subPaths,
      npmTokenCount: groupTokens.length,
      coverage: groupTokens.length > 0 ? 'present' : 'missing',
      sampleTokens: groupTokens.slice(0, 5).map(t => ({ name: t.name, path: t.path, value: t.value })),
    };
  }

  // npm categories summary
  for (const [cat, tokens] of Object.entries(npmByCategory)) {
    comparison.npmCategories[cat] = {
      count: tokens.length,
      inFigmaStructure: !!FIGMA_USAGE_GROUPS[cat],
      sampleTokens: tokens.slice(0, 3).map(t => t.name),
    };
  }

  // Tokens in npm but not in any known Figma Usage group
  const figmaGroupNames = new Set(Object.keys(FIGMA_USAGE_GROUPS));
  enrichedTokens.forEach(t => {
    if (t.layer === 'usage' && !figmaGroupNames.has(t.category)) {
      comparison.npmTokensNotInFigmaStructure.push({
        name: t.name,
        category: t.category,
        path: t.path,
      });
    }
  });

  // Known Figma paths that don't have a direct npm match
  // Build a set of npm segment paths for lookup
  const npmSegmentPaths = new Set(enrichedTokens.map(t => t.segments.join('/')));

  for (const [group, subPaths] of Object.entries(FIGMA_USAGE_GROUPS)) {
    subPaths.forEach(sp => {
      const fullPath = group + '/' + sp;
      // Check if any npm token starts with this path
      const hasMatch = enrichedTokens.some(t => {
        const tPath = t.segments.join('/');
        return tPath.startsWith(fullPath) || tPath === fullPath;
      });
      if (!hasMatch) {
        comparison.figmaPathsNotInNpm.push({
          figmaGroup: group,
          figmaSubPath: sp,
          fullPath,
        });
      }
    });
  }

  comparison.summary = {
    totalNpmTokens: enrichedTokens.length,
    figmaUsageGroupsCovered: Object.values(comparison.figmaUsageGroups).filter(g => g.coverage === 'present').length,
    figmaUsageGroupsTotal: Object.keys(FIGMA_USAGE_GROUPS).length,
    npmTokensOutsideFigmaUsage: comparison.npmTokensNotInFigmaStructure.length,
    figmaPathsMissingInNpm: comparison.figmaPathsNotInNpm.length,
  };

  const comparisonPath = path.join('docs', 'tokens-comparison.json');
  fs.writeFileSync(comparisonPath, JSON.stringify(comparison, null, 2));
  console.log(`✓ Comparison written to ${comparisonPath}`);
  console.log(`  Figma groups covered: ${comparison.summary.figmaUsageGroupsCovered}/${comparison.summary.figmaUsageGroupsTotal}`);
  console.log(`  npm tokens outside Figma Usage: ${comparison.summary.npmTokensOutsideFigmaUsage}`);
  console.log(`  Figma paths missing in npm: ${comparison.summary.figmaPathsMissingInNpm}`);
  console.log('\nDone!');
}

main();
