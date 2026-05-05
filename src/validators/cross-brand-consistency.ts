/**
 * @module cross-brand-consistency
 * @description Verificação de consistência dos Base Tokens entre todas as marcas do design system Lift.
 *
 * Garante que todas as 8 marcas possuem a mesma estrutura de Base Tokens
 * (mesmos nomes) e que tokens de categorias invariantes (breakpoint, duration,
 * motion, z-index, border-width) possuem valores idênticos entre marcas.
 *
 * Tokens de cor podem ter valores diferentes entre marcas, desde que a
 * estrutura de paletas e escalas seja a mesma.
 *
 * @see {@link ../models/base-token.types.ts} para `ConsistencyReport` e `BaseToken`
 * @see {@link ../constants/base-token-config.ts} para `INVARIANT_CATEGORIES` e `BRAND_NAMES`
 */

import type { BaseToken, ConsistencyReport } from '../models/base-token.types';

/**
 * Compara a estrutura de Base Tokens entre todas as marcas.
 *
 * A verificação ocorre em duas etapas:
 * 1. **Estrutura**: Todas as marcas devem possuir exatamente os mesmos nomes de token.
 *    Tokens presentes em algumas marcas mas não em todas são reportados como
 *    `missingTokens` (para a marca que não possui) e `extraTokens` (para a marca
 *    que possui a mais em relação às demais).
 * 2. **Valores invariantes**: Para tokens cujo `subcategory` pertence a uma das
 *    `invariantCategories`, os valores devem ser idênticos em todas as marcas.
 *    Divergências são reportadas em `valueMismatches`.
 *
 * @param brandTokens - Mapa de marca → lista de tokens
 * @param invariantCategories - Categorias/subcategorias que devem ter valores idênticos
 * @returns Relatório de consistência
 *
 * @example
 * ```ts
 * const report = checkCrossBrandConsistency(
 *   { damasio: [...], estacio: [...], ... },
 *   ['breakpoint', 'duration', 'motion', 'z-index', 'border-width'],
 * );
 * if (!report.consistent) {
 *   console.error('Inconsistências encontradas:', report);
 * }
 * ```
 *
 * @see Requisitos 10.1, 10.2, 10.3, 10.4
 */
export function checkCrossBrandConsistency(
  brandTokens: Record<string, BaseToken[]>,
  invariantCategories: string[],
): ConsistencyReport {
  const missingTokens: ConsistencyReport['missingTokens'] = [];
  const extraTokens: ConsistencyReport['extraTokens'] = [];
  const valueMismatches: ConsistencyReport['valueMismatches'] = [];

  const brandNames = Object.keys(brandTokens);

  // Edge case: no brands or single brand is trivially consistent
  if (brandNames.length <= 1) {
    return { consistent: true, missingTokens, extraTokens, valueMismatches };
  }

  // Step 1: Compute the union of all token names across all brands
  const allTokenNames = new Set<string>();
  const brandTokenMaps = new Map<string, Map<string, BaseToken>>();

  for (const brand of brandNames) {
    const tokenMap = new Map<string, BaseToken>();
    for (const token of brandTokens[brand]) {
      tokenMap.set(token.name, token);
      allTokenNames.add(token.name);
    }
    brandTokenMaps.set(brand, tokenMap);
  }

  // Step 2: For each token name, check presence in all brands
  // A token is "missing" from a brand if it exists in the union but not in that brand.
  // A token is "extra" in a brand if it exists in that brand but not in ALL other brands
  // (i.e., at least one other brand doesn't have it).
  for (const tokenName of allTokenNames) {
    const brandsWithToken: string[] = [];
    const brandsWithoutToken: string[] = [];

    for (const brand of brandNames) {
      const tokenMap = brandTokenMaps.get(brand)!;
      if (tokenMap.has(tokenName)) {
        brandsWithToken.push(brand);
      } else {
        brandsWithoutToken.push(brand);
      }
    }

    // If not all brands have this token, report missing and extra
    if (brandsWithoutToken.length > 0) {
      // Brands that don't have it → missing
      for (const brand of brandsWithoutToken) {
        missingTokens.push({ brand, tokenName });
      }

      // Brands that have it but others don't → extra
      for (const brand of brandsWithToken) {
        extraTokens.push({ brand, tokenName });
      }
    }
  }

  // Step 3: For invariant categories, check that values are identical across all brands
  const invariantSet = new Set(invariantCategories);

  for (const tokenName of allTokenNames) {
    // Get the token from any brand that has it to check its subcategory
    let referenceToken: BaseToken | undefined;
    for (const brand of brandNames) {
      const tokenMap = brandTokenMaps.get(brand)!;
      const token = tokenMap.get(tokenName);
      if (token) {
        referenceToken = token;
        break;
      }
    }

    if (!referenceToken) continue;

    // Check if this token belongs to an invariant category
    if (!invariantSet.has(referenceToken.subcategory)) continue;

    // Collect values from all brands that have this token
    const brandValues: Record<string, string> = {};
    let firstValue: string | undefined;
    let hasMismatch = false;

    for (const brand of brandNames) {
      const tokenMap = brandTokenMaps.get(brand)!;
      const token = tokenMap.get(tokenName);
      if (!token) continue;

      brandValues[brand] = token.value;

      if (firstValue === undefined) {
        firstValue = token.value;
      } else if (token.value !== firstValue) {
        hasMismatch = true;
      }
    }

    if (hasMismatch) {
      valueMismatches.push({ tokenName, brands: brandValues });
    }
  }

  const consistent =
    missingTokens.length === 0 &&
    extraTokens.length === 0 &&
    valueMismatches.length === 0;

  return { consistent, missingTokens, extraTokens, valueMismatches };
}
