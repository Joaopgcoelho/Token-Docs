// docs-site/src/shared/tokenData.js
// Shared data module extracted from TokenBrowser.jsx
// Provides brand imports, enriched data, constants, and utility functions
// for both TokenBrowser and TokenDetailPage.

// ── Brand imports ──────────────────────────────────────────────────────
import * as EstacioDefault from '@lift/ds-tokens/brands/estacio/ts/default.js';
import * as EstacioHC from '@lift/ds-tokens/brands/estacio/ts/high-contrast.js';
import * as WydenDefault from '@lift/ds-tokens/brands/wyden/ts/default.js';
import * as WydenHC from '@lift/ds-tokens/brands/wyden/ts/high-contrast.js';
import * as YduqsDefault from '@lift/ds-tokens/brands/yduqs/ts/default.js';
import * as YduqsHC from '@lift/ds-tokens/brands/yduqs/ts/high-contrast.js';
import * as IbmecDefault from '@lift/ds-tokens/brands/ibmec/ts/default.js';
import * as IbmecHC from '@lift/ds-tokens/brands/ibmec/ts/high-contrast.js';
import * as IdomedDefault from '@lift/ds-tokens/brands/idomed/ts/default.js';
import * as IdomedHC from '@lift/ds-tokens/brands/idomed/ts/high-contrast.js';
import * as DamasioDefault from '@lift/ds-tokens/brands/damasio/ts/default.js';
import * as DamasioHC from '@lift/ds-tokens/brands/damasio/ts/high-contrast.js';
import * as EnsineMeDefault from '@lift/ds-tokens/brands/ensine-me/ts/default.js';
import * as EnsineMeHC from '@lift/ds-tokens/brands/ensine-me/ts/high-contrast.js';
import * as EstacioCTDefault from '@lift/ds-tokens/brands/estacio-curso-tecnico/ts/default.js';
import * as EstacioCTHC from '@lift/ds-tokens/brands/estacio-curso-tecnico/ts/high-contrast.js';

// ── Enriched data ──────────────────────────────────────────────────────
import enrichedData from '../../../docs/tokens-figma-enriched.json';
export { enrichedData };

// ── BRANDS ─────────────────────────────────────────────────────────────
export const BRANDS = {
  estacio: { label: 'Estácio', default: EstacioDefault, 'high-contrast': EstacioHC },
  wyden: { label: 'Wyden', default: WydenDefault, 'high-contrast': WydenHC },
  yduqs: { label: 'YDUQS', default: YduqsDefault, 'high-contrast': YduqsHC },
  ibmec: { label: 'Ibmec', default: IbmecDefault, 'high-contrast': IbmecHC },
  idomed: { label: 'Idomed', default: IdomedDefault, 'high-contrast': IdomedHC },
  damasio: { label: 'Damásio', default: DamasioDefault, 'high-contrast': DamasioHC },
  'ensine-me': { label: 'Ensine.me', default: EnsineMeDefault, 'high-contrast': EnsineMeHC },
  'estacio-ct': { label: 'Estácio Curso Técnico', default: EstacioCTDefault, 'high-contrast': EstacioCTHC },
};

// ── MODES ──────────────────────────────────────────────────────────────
export const MODES = [
  { id: 'default', label: 'Default' },
  { id: 'high-contrast', label: 'High Contrast' },
];

// ── ENRICHED_MAP ───────────────────────────────────────────────────────
export const ENRICHED_MAP = {};
if (enrichedData && enrichedData.tokens) {
  enrichedData.tokens.forEach(t => { ENRICHED_MAP[t.name] = t; });
}

// ── Category context ───────────────────────────────────────────────────
export const CAT_CONTEXT = {
  Dynamic: 'Elementos que disparam ações e alteram o fluxo de navegação — botões de submit, CTAs, ações destrutivas.',
  Interactive: 'Elementos que respondem a interação local sem alterar navegação — accordions, tabs, tooltips, dropdowns.',
  Static: 'Elementos de composição visual sem interação direta — cards, banners, alertas, divisores.',
  Inputable: 'Elementos de coleta de dados do usuário — inputs, checkboxes, selects, switches.',
  Core: 'Tokens fundamentais do sistema — texto, ícones, bordas, links, fundo de página.',
  Component: 'Tokens específicos por componente. Uso restrito ao time de System Ops.',
  Brand: 'Tokens de marca — cores, tipografia, espaçamentos, border-radius. Não usar diretamente em UI.',
  Elevation: 'Sombras de elevação para hierarquia visual entre camadas.',
  Base: 'Valores brutos fundamentais — border-width, breakpoints, durations, z-index. Camada de controle.',
};

// ── Sub-path context ───────────────────────────────────────────────────
export const PATH_CONTEXT = {
  'Dynamic/Primary': 'Ação principal da área. Máx 1 por região visível.',
  'Dynamic/Secondary': 'Ação alternativa ao primary.',
  'Dynamic/Critical': 'Ação destrutiva ou de risco.',
  'Dynamic/Highlight': 'Destaque promocional.',
  'Dynamic/Ghost': 'Ação sem fundo visível.',
  'Dynamic/Simple': 'Ação neutra, baixa hierarquia.',
  'Dynamic/Disabled': 'Estado desabilitado.',
  'Interactive/Primary': 'Tab ativa, accordion aberto.',
  'Interactive/Secondary': 'Tab alternativa.',
  'Interactive/Neutral': 'Toggle genérico.',
  'Static/Primary': 'Card ou banner com destaque de marca.',
  'Static/Neutral': 'Container branco/neutro.',
  'Static/Critical': 'Alerta de erro.',
  'Static/Success': 'Alerta de sucesso.',
  'Static/Warning': 'Alerta de aviso.',
  'Static/Info': 'Alerta informativo.',
  'Inputable/Field': 'Campos de texto (input, textarea, select).',
  'Inputable/Selectable': 'Controles de seleção (checkbox, radio, switch).',
  'Surface': 'Background do componente → background-color',
  'On Surface': 'Conteúdo sobre o surface → color',
  'Container': 'Camada acima do surface (só Static) → background-color',
  'On Container': 'Conteúdo sobre o container → color',
  'Border': 'Contorno do componente → border-color',
  'Icon': 'Ícones sobre a superfície.',
  'Inverse': 'Variante para fundos escuros/invertidos.',
};

// ── Category colors ────────────────────────────────────────────────────
export const CAT_COLORS = {
  Dynamic: '#076AEA', Interactive: '#603DA2', Static: '#059669', Inputable: '#d97706',
  Core: '#6b7280', Component: '#8b5cf6', Brand: '#076AEA', Elevation: '#525252', Base: '#6b7280',
};

// ── Category order ─────────────────────────────────────────────────────
export const CAT_ORDER = ['Dynamic', 'Interactive', 'Static', 'Inputable', 'Core', 'Component', 'Brand', 'Elevation', 'Base'];

// ── New constants ──────────────────────────────────────────────────────
export const KNOWN_STATES = ['Default', 'Hover', 'Pressed', 'Active', 'Loading', 'Disabled'];

export const LAYER_LABELS = {
  usage: 'USAGE TOKEN',
  base: 'BASE TOKEN',
  brand: 'BRAND TOKEN',
  component: 'COMPONENT TOKEN',
  screen: 'SCREEN TOKEN',
};

// ── Utility functions (extracted from TokenBrowser.jsx) ────────────────

/**
 * Convert camelCase token key to path segments.
 * @param {string} name - Token JS name (e.g. "LfThmDynamicPrimarySurfaceDefault")
 * @returns {string[]} - Path segments (e.g. ["Dynamic", "Primary", "Surface", "Default"])
 */
export function tokenToSegments(name) {
  let clean = name;
  if (clean.startsWith('LfThm')) clean = clean.slice(5);
  else if (clean.startsWith('LfBs')) clean = clean.slice(4);
  return clean
    .replace(/([a-z])([A-Z])/g, '$1/$2')
    .replace(/([A-Za-z])(\d)/g, '$1/$2')
    .replace(/(\d)([A-Z])/g, '$1/$2')
    .split('/');
}

/**
 * Get the top-level category for a token based on its JS name prefix.
 * @param {string} name - Token JS name
 * @returns {string} - Category name (e.g. "Dynamic", "Base", "Brand")
 */
export function getTopCategory(name) {
  if (name.startsWith('LfBs')) return 'Base';
  if (name.startsWith('LfThmBrand')) return 'Brand';
  if (name.startsWith('LfThmDynamic')) return 'Dynamic';
  if (name.startsWith('LfThmInteractive')) return 'Interactive';
  if (name.startsWith('LfThmStatic')) return 'Static';
  if (name.startsWith('LfThmInputable')) return 'Inputable';
  if (name.startsWith('LfThmCore')) return 'Core';
  if (name.startsWith('LfThmComponent')) return 'Component';
  if (name.startsWith('LfThmElevation')) return 'Elevation';
  return 'Other';
}

/**
 * Check if a value is a CSS color string.
 * @param {*} val - Value to check
 * @returns {boolean}
 */
export function isColor(val) {
  if (typeof val !== 'string') return false;
  return /^#[0-9a-fA-F]{3,8}$/.test(val) || val.startsWith('rgba(') || val.startsWith('rgb(');
}

/**
 * Build a tree from a flat token list.
 * Merges "On" + "Surface" into "On Surface", "On" + "Container" into "On Container".
 * @param {Array} tokens - Array of token objects with `segments` property
 * @returns {Object} - Tree root with `children` and `tokens` properties
 */
export function buildTree(tokens) {
  const root = { children: {}, tokens: [] };
  tokens.forEach((t) => {
    const segs = t.segments;
    let node = root;
    for (let i = 0; i < segs.length - 1; i++) {
      const seg = segs[i];
      if (seg === 'On' && i + 1 < segs.length - 1 && (segs[i + 1] === 'Surface' || segs[i + 1] === 'Container')) {
        const merged = seg + ' ' + segs[i + 1];
        if (!node.children[merged]) node.children[merged] = { children: {}, tokens: [] };
        node = node.children[merged];
        i++;
        continue;
      }
      if (!node.children[seg]) node.children[seg] = { children: {}, tokens: [] };
      node = node.children[seg];
    }
    node.tokens.push(t);
  });
  return root;
}

/**
 * Count all tokens in a tree node (including children).
 * @param {Object} node - Tree node
 * @returns {number}
 */
export function countAll(node) {
  let c = node.tokens.length;
  Object.values(node.children).forEach((ch) => { c += countAll(ch); });
  return c;
}

/**
 * Collect all tokens from a tree node (including children).
 * @param {Object} node - Tree node
 * @returns {Array}
 */
export function collectAllTokens(node) {
  let all = [...node.tokens];
  Object.values(node.children).forEach((ch) => { all = all.concat(collectAllTokens(ch)); });
  return all;
}

// ── New functions ──────────────────────────────────────────────────────

/**
 * Look up an enriched token by its JS name.
 * @param {string} tokenName - Token JS name (e.g. "LfThmDynamicPrimarySurfaceDefault")
 * @returns {Object|undefined} - The enriched token object, or undefined if not found
 */
export function getEnrichedToken(tokenName) {
  return ENRICHED_MAP[tokenName];
}

/**
 * Look up the resolved value for a token in a specific brand/mode.
 * @param {string} tokenName - Token JS name
 * @param {string} brand - Brand ID (e.g. "estacio")
 * @param {string} mode - Mode ID ("default" or "high-contrast")
 * @returns {string|undefined} - The resolved value string, or undefined
 */
export function getResolvedValue(tokenName, brand, mode) {
  const brandData = BRANDS[brand];
  if (!brandData) return undefined;
  const modeModule = brandData[mode];
  if (!modeModule) return undefined;
  const val = modeModule[tokenName];
  return val !== undefined ? String(val) : undefined;
}

/**
 * Find tokens that share the same semantic group and hierarchy
 * (first 2 significant segments) but differ in role or state.
 * Does NOT include the token itself.
 * @param {Object} token - Enriched token object (must have `name` and `segments`)
 * @returns {Object[]} - Array of related enriched token objects
 */
export function getRelatedTokens(token) {
  if (!token || !token.segments || token.segments.length < 2) return [];
  const group = token.segments[0];
  const hierarchy = token.segments[1];
  if (!enrichedData || !enrichedData.tokens) return [];
  return enrichedData.tokens.filter(t =>
    t.name !== token.name &&
    t.segments.length >= 2 &&
    t.segments[0] === group &&
    t.segments[1] === hierarchy
  );
}

/**
 * For tokens with role 'onSurface', 'text', or 'icon', find the corresponding
 * 'surface' token with the same group and hierarchy segments, preferring 'Default' state.
 * @param {Object} token - Enriched token object
 * @returns {Object|undefined} - The recommended surface token, or undefined
 */
export function getRecommendedSurface(token) {
  if (!token || !token.role) return undefined;
  if (token.role !== 'onSurface' && token.role !== 'text' && token.role !== 'icon') return undefined;
  if (!token.segments || token.segments.length < 2) return undefined;
  const group = token.segments[0];
  const hierarchy = token.segments[1];
  if (!enrichedData || !enrichedData.tokens) return undefined;

  // Find all surface tokens with matching group and hierarchy
  const candidates = enrichedData.tokens.filter(t =>
    t.role === 'surface' &&
    t.segments.length >= 2 &&
    t.segments[0] === group &&
    t.segments[1] === hierarchy
  );

  if (candidates.length === 0) return undefined;

  // Prefer the one with 'Default' state
  const defaultCandidate = candidates.find(t => t.segments.includes('Default'));
  return defaultCandidate || candidates[0];
}
