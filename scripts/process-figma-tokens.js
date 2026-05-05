/**
 * Process Figma tokens JSON and generate enriched data for the docs site.
 * 
 * Usage: node scripts/process-figma-tokens.js <figma-json-file>
 * 
 * Outputs:
 * - docs/tokens-figma-enriched.json  (flat list with resolved aliases + context)
 * - docs/tokens-comparison.json      (Figma vs npm comparison)
 */

const fs = require('fs');
const path = require('path');

// ── Load Figma JSON from stdin or file ──
const inputFile = process.argv[2] || 'docs/tokens-figma-structure.json';
if (!fs.existsSync(inputFile)) {
  console.error('Input file not found:', inputFile);
  console.error('Please save the Figma tokens JSON to', inputFile);
  process.exit(1);
}
const figmaData = JSON.parse(fs.readFileSync(inputFile, 'utf8'));

// ── Load npm tokens for comparison ──
const npmBrands = ['estacio', 'wyden', 'yduqs', 'ibmec', 'idomed', 'damasio', 'ensine-me', 'estacio-curso-tecnico'];
const npmTokens = {};
npmBrands.forEach(brand => {
  ['default', 'high-contrast'].forEach(mode => {
    const file = path.join('node_modules/@lift/ds-tokens/brands', brand, 'ts', mode + '.js');
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      const tokens = {};
      const re = /export var (\w+) = (.+);/g;
      let match;
      while ((match = re.exec(content)) !== null) {
        let val = match[2].trim();
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        tokens[match[1]] = val;
      }
      if (!npmTokens[brand]) npmTokens[brand] = {};
      npmTokens[brand][mode] = tokens;
    }
  });
});

// ── Flatten Figma JSON into token list ──
const figmaTokens = [];

function flatten(obj, pathParts, layer) {
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    const currentPath = [...pathParts, key];

    // Detect if this is a token leaf (has $type and $value)
    if (val && typeof val === 'object' && val.$type !== undefined && val.$value !== undefined) {
      const token = {
        path: currentPath.join('/'),
        name: key,
        type: val.$type,
        value: val.$value,
        layer: layer,
        isAlias: typeof val.$value === 'string' && val.$value.startsWith('{'),
        aliasRef: null,
        hasModes: false,
        modes: null,
      };

      // Check if value is multi-mode (object with Light/Dark/High Contrast)
      if (typeof val.$value === 'object' && !Array.isArray(val.$value)) {
        const keys = Object.keys(val.$value);
        if (keys.some(k => ['Light', 'Dark', 'High Contrast', 'Desktop', 'Tablet', 'Mobile'].includes(k))) {
          token.hasModes = true;
          token.modes = val.$value;
          // Check aliases in each mode
          const firstVal = val.$value[keys[0]];
          token.isAlias = typeof firstVal === 'string' && firstVal.startsWith('{');
        }
      }

      if (token.isAlias && typeof token.value === 'string') {
        token.aliasRef = token.value.replace(/[{}]/g, '');
      }

      figmaTokens.push(token);
    } else if (val && typeof val === 'object' && !val.$type) {
      // Determine layer
      let nextLayer = layer;
      if (currentPath.length === 1) {
        const top = currentPath[0];
        if (top === 'Base') nextLayer = 'base';
        else if (top === 'Brand') nextLayer = 'brand';
        else if (top === 'Usage') nextLayer = 'usage';
        else if (top === 'Web' || top === 'APP') nextLayer = 'screen';
        else if (top === 'Component Collection') nextLayer = 'component';
      }
      flatten(val, currentPath, nextLayer);
    }
  }
}

flatten(figmaData, [], 'unknown');

// ── Build context map ──
const contextMap = {
  'Dynamic': 'Elementos que disparam ações e alteram o fluxo de navegação.',
  'Interactive': 'Elementos que respondem a interação local sem alterar navegação.',
  'Static': 'Elementos de composição visual sem interação direta.',
  'Inputable': 'Elementos de coleta de dados do usuário.',
  'Core': 'Tokens fundamentais — texto, ícones, bordas, links, fundo.',
  'Elevation': 'Sombras e superfícies de elevação.',
  'Gradient': 'Gradientes de marca.',
  'Primary': 'Ação/elemento principal.',
  'Secondary': 'Ação/elemento alternativo.',
  'Critical': 'Erro, perigo, ação destrutiva.',
  'Success': 'Sucesso, validação positiva.',
  'Warning': 'Aviso, atenção.',
  'Info': 'Informação.',
  'Neutral': 'Neutro, genérico.',
  'Highlight': 'Destaque especial.',
  'Ghost': 'Sem fundo visível.',
  'Simple': 'Neutra, baixa hierarquia.',
  'Disabled': 'Estado desabilitado.',
  'Surface': 'Background do componente → background-color.',
  'OnSurface': 'Conteúdo sobre o surface → color.',
  'Container': 'Camada acima do surface (só Static).',
  'OnContainer': 'Conteúdo sobre o container.',
  'Border': 'Contorno → border-color.',
  'Icon': 'Ícones.',
  'Inverse': 'Variante para fundos escuros/invertidos.',
  'Field': 'Campos de texto (input, textarea, select).',
  'Selectable': 'Controles de seleção (checkbox, radio, switch).',
  'Switch': 'Componente switch/toggle.',
  'Highest': 'Intensidade mais clara.',
  'Lowest': 'Intensidade mais escura.',
  'Default': 'Estado padrão, sem interação.',
  'Hover': 'Cursor sobre o elemento.',
  'Pressed': 'Elemento pressionado.',
  'Active': 'Elemento ativo/selecionado.',
  'Loading': 'Processando.',
};

// Add context to each token
figmaTokens.forEach(t => {
  const parts = t.path.split('/');
  const contexts = [];
  parts.forEach(p => {
    if (contextMap[p]) contexts.push(contextMap[p]);
  });
  t.context = contexts.join(' ');
});

// ── Convert Figma path to npm token name ──
function figmaPathToNpmName(figmaPath) {
  // Usage/Core/OnSurface/Text/Primary → LfThmCoreOnSurfaceTextPrimary
  // Usage/Dynamic/Primary/Surface/Default → LfThmDynamicPrimarySurfaceDefault
  // Brand/Color/Primary/500 → LfThmBrandColorPrimary500
  // Base/Sizing/border/width/100 → LfBsBorderWidth100
  
  let parts = figmaPath.split('/');
  
  // Remove top-level collection names
  if (parts[0] === 'Usage') parts = parts.slice(1);
  if (parts[0] === 'Base' && parts[1] === 'Sizing') parts = parts.slice(2);
  if (parts[0] === 'Base' && parts[1] === 'Colors') return null; // Base colors don't map directly
  
  // Build camelCase name
  let prefix = 'LfThm';
  if (figmaPath.startsWith('Base/Sizing')) prefix = 'LfBs';
  
  const camelParts = parts.map(p => {
    // Handle multi-word segments
    return p.split(/[\s-]+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
  });
  
  return prefix + camelParts.join('');
}

// ── Comparison: Figma vs npm ──
const comparison = {
  summary: { figmaTotal: figmaTokens.length, npmTotal: 0, matched: 0, figmaOnly: 0, npmOnly: 0 },
  matched: [],
  figmaOnly: [],
  npmOnly: [],
};

// Use estacio default as reference
const refNpm = npmTokens.estacio?.default || {};
comparison.summary.npmTotal = Object.keys(refNpm).length;

const npmNameSet = new Set(Object.keys(refNpm));
const matchedNpmNames = new Set();

figmaTokens.forEach(t => {
  const npmName = figmaPathToNpmName(t.path);
  if (npmName && npmNameSet.has(npmName)) {
    matchedNpmNames.add(npmName);
    comparison.matched.push({
      figmaPath: t.path,
      npmName: npmName,
      npmValue: refNpm[npmName],
      figmaType: t.type,
      layer: t.layer,
    });
  } else {
    comparison.figmaOnly.push({
      path: t.path,
      type: t.type,
      layer: t.layer,
      attemptedNpmName: npmName,
    });
  }
});

npmNameSet.forEach(name => {
  if (!matchedNpmNames.has(name)) {
    comparison.npmOnly.push({
      npmName: name,
      value: refNpm[name],
    });
  }
});

comparison.summary.matched = comparison.matched.length;
comparison.summary.figmaOnly = comparison.figmaOnly.length;
comparison.summary.npmOnly = comparison.npmOnly.length;

// ── Output ──
const enrichedOutput = {
  _schema: 'lift-figma-tokens/1.0.0',
  generatedAt: new Date().toISOString(),
  summary: {
    totalTokens: figmaTokens.length,
    byLayer: {},
    byType: {},
  },
  tokens: figmaTokens,
};

// Count by layer and type
figmaTokens.forEach(t => {
  enrichedOutput.summary.byLayer[t.layer] = (enrichedOutput.summary.byLayer[t.layer] || 0) + 1;
  enrichedOutput.summary.byType[t.type] = (enrichedOutput.summary.byType[t.type] || 0) + 1;
});

fs.writeFileSync('docs/tokens-figma-enriched.json', JSON.stringify(enrichedOutput, null, 2));
fs.writeFileSync('docs/tokens-comparison.json', JSON.stringify(comparison, null, 2));

console.log('✓ Enriched tokens:', figmaTokens.length);
console.log('  By layer:', JSON.stringify(enrichedOutput.summary.byLayer));
console.log('  By type:', JSON.stringify(enrichedOutput.summary.byType));
console.log('');
console.log('✓ Comparison (Figma vs npm estacio/default):');
console.log('  Figma tokens:', comparison.summary.figmaTotal);
console.log('  npm tokens:', comparison.summary.npmTotal);
console.log('  Matched:', comparison.summary.matched);
console.log('  Figma only:', comparison.summary.figmaOnly);
console.log('  npm only:', comparison.summary.npmOnly);
