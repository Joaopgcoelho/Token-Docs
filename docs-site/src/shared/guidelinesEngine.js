// docs-site/src/shared/guidelinesEngine.js
// Motor de diretrizes Do/Don't — gera regras baseadas nos metadados do token.
// Regras derivadas do DecisionEngine (Regras 1–8).

/**
 * @typedef {Object} Guideline
 * @property {'do' | 'dont'} type
 * @property {string} text
 */

/**
 * Generates Do/Don't guidelines based on token metadata.
 * Rules derived from the DecisionEngine (Rules 1–8).
 *
 * @param {Object} token - Enriched token object with fields: role, layer, category, segments
 * @returns {Array<{ type: 'do' | 'dont', text: string }>} - Array of guidelines, never empty for valid tokens
 */
export function generateGuidelines(token) {
  const guidelines = [];

  if (!token) return [{ type: 'do', text: 'Consulte a documentação do Design System para orientações de uso.' }];

  const { role, layer, segments } = token;
  const lastSegment = Array.isArray(segments) && segments.length > 0
    ? segments[segments.length - 1]
    : null;

  // ── Layer-based rules ────────────────────────────────────────────────

  if (layer === 'usage') {
    guidelines.push({ type: 'do', text: 'Use este token diretamente em componentes de UI.' });
    guidelines.push({ type: 'dont', text: 'Não use tokens Base ou Brand diretamente — use tokens Usage.' });
  }

  if (layer === 'base') {
    guidelines.push({ type: 'do', text: 'Use apenas como referência — tokens Base alimentam as camadas superiores.' });
    guidelines.push({ type: 'dont', text: 'Não use tokens Base diretamente em UI — eles são valores brutos.' });
  }

  if (layer === 'brand') {
    guidelines.push({ type: 'do', text: 'Consulte o token Usage correspondente que referencia este Brand token.' });
    guidelines.push({ type: 'dont', text: 'Não use tokens Brand diretamente — use tokens Usage que os referenciam.' });
  }

  if (layer === 'component') {
    guidelines.push({ type: 'do', text: 'Prefira Component tokens quando disponíveis para o componente Lift.' });
    guidelines.push({ type: 'dont', text: 'Não altere valores de Component tokens — eles são gerenciados pelo time de System Ops.' });
  }

  // ── Role-based rules ─────────────────────────────────────────────────

  if (role === 'surface') {
    guidelines.push({ type: 'do', text: 'Pareie com o token On Surface do mesmo grupo e hierarquia.' });
    guidelines.push({ type: 'dont', text: 'Não use On Surface de um grupo diferente sobre esta superfície.' });
  }

  if (role === 'onSurface' || role === 'text' || role === 'icon') {
    guidelines.push({ type: 'do', text: 'Use sobre a superfície correspondente do mesmo grupo e hierarquia.' });
    guidelines.push({ type: 'dont', text: 'Não aplique sobre superfícies de outro grupo semântico.' });
  }

  if (role === 'border') {
    guidelines.push({ type: 'do', text: 'Use como cor de borda em componentes do grupo correspondente.' });
    guidelines.push({ type: 'dont', text: 'Não use como cor de fundo ou cor de texto.' });
  }

  if (role === 'shadow') {
    guidelines.push({ type: 'do', text: 'Use para criar hierarquia visual entre camadas de elevação.' });
    guidelines.push({ type: 'dont', text: 'Não crie sombras customizadas — use os tokens de Elevation.' });
  }

  if (role === 'container' || role === 'onContainer') {
    guidelines.push({ type: 'do', text: 'Use em camadas acima do surface (apenas grupo Static).' });
    guidelines.push({ type: 'dont', text: 'Não use Container tokens fora do grupo Static.' });
  }

  // ── Segment-based rules ──────────────────────────────────────────────

  if (lastSegment === 'Disabled') {
    guidelines.push({ type: 'do', text: 'Use o token Disabled para estados desabilitados.' });
    guidelines.push({ type: 'dont', text: 'Não altere a opacidade manualmente — use o token Disabled.' });
  }

  // ── Fallback: ensure non-empty array for valid tokens ────────────────

  if (guidelines.length === 0) {
    guidelines.push({ type: 'do', text: 'Consulte a documentação do Design System para orientações de uso.' });
  }

  return guidelines;
}
