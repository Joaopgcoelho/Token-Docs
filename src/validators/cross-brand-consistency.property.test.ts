import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { checkCrossBrandConsistency } from './cross-brand-consistency';
import type { BaseToken } from '../models/base-token.types';
import {
  BRAND_NAMES,
  INVARIANT_CATEGORIES,
  BASE_TOKEN_PREFIX,
  BREAKPOINT_NAMES,
  DURATION_VALUES,
  MOTION_CURVE_NAMES,
  ZINDEX_VALUES,
  BORDER_WIDTH_SCALE,
  ALL_COLOR_PALETTES,
  COLOR_SCALE,
} from '../constants/base-token-config';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Capitalize first letter of a string.
 */
function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Convert a hyphenated string to PascalCase.
 */
function hyphenatedToPascal(s: string): string {
  return s
    .split('-')
    .map((seg) => capitalize(seg))
    .join('');
}

/**
 * Creates a minimal BaseToken for testing purposes.
 */
function makeToken(
  overrides: Partial<BaseToken> & Pick<BaseToken, 'name' | 'value' | 'subcategory'>,
): BaseToken {
  return {
    cssProperty: `--lf-bs-${overrides.name.toLowerCase()}`,
    category: 'utility',
    scale: '100',
    tsType: 'string',
    isInvariant: true,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Arbitraries: generate token definitions for cross-brand testing
// ---------------------------------------------------------------------------

/**
 * Generates a random invariant token definition (name, value, subcategory)
 * from the known invariant categories.
 */
const invariantTokenDefArb = fc.oneof(
  // Breakpoint tokens
  fc.constantFrom(...BREAKPOINT_NAMES).map((name) => ({
    name: `${BASE_TOKEN_PREFIX}Breakpoint${capitalize(name)}`,
    value: String(Math.floor(Math.random() * 2000)),
    subcategory: 'breakpoint',
  })),
  // Duration tokens
  fc.constantFrom(...DURATION_VALUES).map((val) => ({
    name: `${BASE_TOKEN_PREFIX}Duration${val}`,
    value: `${val}ms`,
    subcategory: 'duration',
  })),
  // Motion tokens
  fc.constantFrom(...MOTION_CURVE_NAMES).map((curve) => ({
    name: `${BASE_TOKEN_PREFIX}MotionMovent${hyphenatedToPascal(curve)}`,
    value: `cubic-bezier(0.42, 0, 0.58, 1)`,
    subcategory: 'motion',
  })),
  // Z-index tokens
  fc.constantFrom(...ZINDEX_VALUES).map((val) => ({
    name: `${BASE_TOKEN_PREFIX}Zindex${val}`,
    value: String(val),
    subcategory: 'z-index',
  })),
  // Border-width tokens
  fc.constantFrom(...BORDER_WIDTH_SCALE).map((scale) => ({
    name: `${BASE_TOKEN_PREFIX}BorderWidth${scale}`,
    value: `${scale}px`,
    subcategory: 'border-width',
  })),
);

/**
 * Generates a random color token definition (non-invariant).
 */
const colorTokenDefArb = fc
  .tuple(
    fc.constantFrom(...ALL_COLOR_PALETTES),
    fc.constantFrom(...COLOR_SCALE),
    fc.stringMatching(/^[0-9a-f]{6}$/),
  )
  .map(([palette, scale, hex]) => ({
    name: `${BASE_TOKEN_PREFIX}Color${hyphenatedToPascal(palette)}${scale}`,
    value: `#${hex}`,
    subcategory: palette as string,
    category: 'color' as const,
    isInvariant: false,
  }));

/**
 * Generates a set of 1-5 unique invariant token definitions.
 */
const invariantTokenSetArb = fc
  .array(invariantTokenDefArb, { minLength: 1, maxLength: 5 })
  .map((defs) => {
    // Deduplicate by name
    const seen = new Set<string>();
    return defs.filter((d) => {
      if (seen.has(d.name)) return false;
      seen.add(d.name);
      return true;
    });
  })
  .filter((defs) => defs.length > 0);

/**
 * Generates a set of 0-3 unique color token definitions.
 */
const colorTokenSetArb = fc
  .array(colorTokenDefArb, { minLength: 0, maxLength: 3 })
  .map((defs) => {
    const seen = new Set<string>();
    return defs.filter((d) => {
      if (seen.has(d.name)) return false;
      seen.add(d.name);
      return true;
    });
  });

/**
 * Generates a subset of brand names (at least 2).
 */
const brandSubsetArb = fc
  .subarray([...BRAND_NAMES], { minLength: 2, maxLength: BRAND_NAMES.length })
  .filter((arr) => arr.length >= 2);

// ---------------------------------------------------------------------------
// Property 5: Cross-brand consistency
// ---------------------------------------------------------------------------

describe('Property 5: Consistência cross-marca', () => {
  /**
   * **Validates: Requirements 10.1, 10.2**
   *
   * When all brands have the exact same set of token names with the same
   * values for invariant tokens, the consistency check must return
   * consistent: true with no missingTokens, extraTokens, or valueMismatches.
   */
  it('consistent brands produce consistent: true (min 100 iterations)', () => {
    fc.assert(
      fc.property(
        brandSubsetArb,
        invariantTokenSetArb,
        colorTokenSetArb,
        (brands, invariantDefs, colorDefs) => {
          const brandTokens: Record<string, BaseToken[]> = {};

          for (const brand of brands) {
            const tokens: BaseToken[] = [];

            // Add invariant tokens — same value for all brands
            for (const def of invariantDefs) {
              tokens.push(makeToken({
                name: def.name,
                value: def.value,
                subcategory: def.subcategory,
              }));
            }

            // Add color tokens — each brand gets its own random color value
            // but same token names
            for (const def of colorDefs) {
              tokens.push(makeToken({
                name: def.name,
                value: `#${Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0')}`,
                subcategory: def.subcategory,
                category: 'color',
                isInvariant: false,
              }));
            }

            brandTokens[brand] = tokens;
          }

          const report = checkCrossBrandConsistency(brandTokens, [...INVARIANT_CATEGORIES]);

          expect(report.consistent).toBe(true);
          expect(report.missingTokens).toEqual([]);
          expect(report.extraTokens).toEqual([]);
          expect(report.valueMismatches).toEqual([]);
        },
      ),
      { numRuns: 150 },
    );
  });

  /**
   * **Validates: Requirements 10.1, 10.2**
   *
   * When one brand is missing a token that all other brands have,
   * the consistency check must report it as inconsistent with the
   * missing token listed.
   */
  it('missing token in one brand produces consistent: false (min 100 iterations)', () => {
    fc.assert(
      fc.property(
        brandSubsetArb,
        invariantTokenSetArb,
        (brands, invariantDefs) => {
          // Ensure we have at least one token to remove
          fc.pre(invariantDefs.length >= 1);

          const brandTokens: Record<string, BaseToken[]> = {};

          for (const brand of brands) {
            const tokens: BaseToken[] = [];
            for (const def of invariantDefs) {
              tokens.push(makeToken({
                name: def.name,
                value: def.value,
                subcategory: def.subcategory,
              }));
            }
            brandTokens[brand] = tokens;
          }

          // Remove the first token from the first brand
          const targetBrand = brands[0];
          const removedToken = brandTokens[targetBrand].shift()!;

          const report = checkCrossBrandConsistency(brandTokens, [...INVARIANT_CATEGORIES]);

          expect(report.consistent).toBe(false);
          expect(report.missingTokens).toContainEqual({
            brand: targetBrand,
            tokenName: removedToken.name,
          });
        },
      ),
      { numRuns: 150 },
    );
  });

  /**
   * **Validates: Requirements 10.1, 10.2**
   *
   * When an invariant token has a different value in one brand,
   * the consistency check must report a value mismatch.
   */
  it('divergent invariant value produces valueMismatch (min 100 iterations)', () => {
    fc.assert(
      fc.property(
        brandSubsetArb,
        invariantTokenSetArb,
        (brands, invariantDefs) => {
          fc.pre(invariantDefs.length >= 1);

          const brandTokens: Record<string, BaseToken[]> = {};

          for (const brand of brands) {
            const tokens: BaseToken[] = [];
            for (const def of invariantDefs) {
              tokens.push(makeToken({
                name: def.name,
                value: def.value,
                subcategory: def.subcategory,
              }));
            }
            brandTokens[brand] = tokens;
          }

          // Alter the first token's value in the first brand
          const targetBrand = brands[0];
          const alteredToken = brandTokens[targetBrand][0];
          alteredToken.value = alteredToken.value + '-ALTERED';

          const report = checkCrossBrandConsistency(brandTokens, [...INVARIANT_CATEGORIES]);

          expect(report.consistent).toBe(false);
          expect(report.valueMismatches.length).toBeGreaterThan(0);
          const mismatch = report.valueMismatches.find(
            (m) => m.tokenName === alteredToken.name,
          );
          expect(mismatch).toBeDefined();
          expect(mismatch!.brands[targetBrand]).toBe(alteredToken.value);
        },
      ),
      { numRuns: 150 },
    );
  });

  /**
   * **Validates: Requirements 10.1, 10.2**
   *
   * Token names in the report are always a subset of the union of all
   * token names across all brands.
   */
  it('reported token names are always from the union of all brand tokens (min 100 iterations)', () => {
    fc.assert(
      fc.property(
        brandSubsetArb,
        invariantTokenSetArb,
        colorTokenSetArb,
        (brands, invariantDefs, colorDefs) => {
          const brandTokens: Record<string, BaseToken[]> = {};
          const allNames = new Set<string>();

          for (const brand of brands) {
            const tokens: BaseToken[] = [];
            for (const def of invariantDefs) {
              const token = makeToken({
                name: def.name,
                value: def.value,
                subcategory: def.subcategory,
              });
              tokens.push(token);
              allNames.add(token.name);
            }
            for (const def of colorDefs) {
              const token = makeToken({
                name: def.name,
                value: def.value,
                subcategory: def.subcategory,
                category: 'color',
                isInvariant: false,
              });
              tokens.push(token);
              allNames.add(token.name);
            }
            brandTokens[brand] = tokens;
          }

          const report = checkCrossBrandConsistency(brandTokens, [...INVARIANT_CATEGORIES]);

          for (const entry of report.missingTokens) {
            expect(allNames.has(entry.tokenName)).toBe(true);
          }
          for (const entry of report.extraTokens) {
            expect(allNames.has(entry.tokenName)).toBe(true);
          }
          for (const entry of report.valueMismatches) {
            expect(allNames.has(entry.tokenName)).toBe(true);
          }
        },
      ),
      { numRuns: 150 },
    );
  });
});
