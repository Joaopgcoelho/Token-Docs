/**
 * @module token-sorting
 * @description Funções de ordenação de Base Tokens dentro de categorias.
 *
 * Garante que os tokens são ordenados de forma consistente em todas as
 * plataformas de saída:
 * 1. Por categoria (seguindo a ordem definida em TOKEN_CATEGORIES)
 * 2. Dentro de cada categoria, alfabeticamente por subcategoria (paleta/subgrupo)
 * 3. Dentro de cada subcategoria, numericamente pela escala (se numérica)
 *    ou alfabeticamente (se semântica)
 *
 * @see {@link ../constants/base-token-config.ts} para TOKEN_CATEGORIES
 * @see {@link ../models/base-token.types.ts} para BaseToken
 */

import type { BaseToken, TokenCategory } from '../models/base-token.types';
import { TOKEN_CATEGORIES } from '../constants/base-token-config';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns the index of a category in TOKEN_CATEGORIES.
 * Categories not found are placed at the end.
 */
function categoryIndex(category: TokenCategory): number {
  const idx = TOKEN_CATEGORIES.indexOf(category);
  return idx === -1 ? TOKEN_CATEGORIES.length : idx;
}

/**
 * Attempts to parse a scale value as a number.
 * Returns `NaN` if the value is not purely numeric.
 */
function parseScale(scale: string): number {
  // Only treat as numeric if the entire string is digits (possibly with leading minus)
  if (/^-?\d+(\.\d+)?$/.test(scale)) {
    return Number(scale);
  }
  return NaN;
}

/**
 * Compares two scale values.
 * - If both are numeric, compares numerically (ascending).
 * - If one is numeric and the other is not, the numeric one comes first.
 * - If neither is numeric, compares alphabetically (case-insensitive).
 */
function compareScales(a: string, b: string): number {
  const numA = parseScale(a);
  const numB = parseScale(b);

  const aIsNum = !Number.isNaN(numA);
  const bIsNum = !Number.isNaN(numB);

  if (aIsNum && bIsNum) {
    return numA - numB;
  }
  if (aIsNum && !bIsNum) {
    return -1;
  }
  if (!aIsNum && bIsNum) {
    return 1;
  }
  // Both semantic — alphabetical comparison
  return a.toLowerCase().localeCompare(b.toLowerCase());
}

// ---------------------------------------------------------------------------
// Main sorting function
// ---------------------------------------------------------------------------

/**
 * Sorts an array of BaseTokens in a deterministic, platform-consistent order.
 *
 * Sorting criteria (applied in order):
 * 1. **Category** — follows the order defined in `TOKEN_CATEGORIES`:
 *    color → typography → spacing → border → shadow → opacity → utility
 * 2. **Subcategory** — alphabetical (case-insensitive) within each category
 * 3. **Scale** — numeric ascending for numeric scales, alphabetical for
 *    semantic scales (e.g. "none", "small", "medium")
 *
 * The function returns a **new array** and does not mutate the input.
 *
 * @param tokens - Array of BaseToken objects to sort
 * @returns A new sorted array of BaseToken objects
 *
 * @example
 * ```ts
 * const sorted = sortTokens([
 *   { name: 'LfBsColorPrimary200', category: 'color', subcategory: 'primary', scale: '200', ... },
 *   { name: 'LfBsColorNeutral100', category: 'color', subcategory: 'neutral', scale: '100', ... },
 *   { name: 'LfBsSpaceGap100', category: 'spacing', subcategory: 'gap', scale: '100', ... },
 * ]);
 * // Result: neutral-100, primary-200, gap-100
 * ```
 */
export function sortTokens(tokens: readonly BaseToken[]): BaseToken[] {
  return [...tokens].sort((a, b) => {
    // 1. Compare by category order
    const catDiff = categoryIndex(a.category) - categoryIndex(b.category);
    if (catDiff !== 0) return catDiff;

    // 2. Compare by subcategory (alphabetical, case-insensitive)
    const subCmp = a.subcategory.toLowerCase().localeCompare(b.subcategory.toLowerCase());
    if (subCmp !== 0) return subCmp;

    // 3. Compare by scale (numeric or alphabetical)
    return compareScales(a.scale, b.scale);
  });
}
