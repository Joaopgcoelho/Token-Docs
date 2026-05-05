import { describe, it, expect } from 'vitest';
import { checkCrossBrandConsistency } from './cross-brand-consistency';
import type { BaseToken } from '../models/base-token.types';
import { INVARIANT_CATEGORIES } from '../constants/base-token-config';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

/**
 * Creates a set of tokens shared across brands for consistent scenarios.
 */
function makeConsistentBrandTokens(brands: string[]): Record<string, BaseToken[]> {
  const sharedTokens: BaseToken[] = [
    makeToken({ name: 'LfBsBreakpointSm', value: '768', subcategory: 'breakpoint' }),
    makeToken({ name: 'LfBsBreakpointMd', value: '1024', subcategory: 'breakpoint' }),
    makeToken({ name: 'LfBsDuration100', value: '100ms', subcategory: 'duration' }),
    makeToken({ name: 'LfBsZindex100', value: '100', subcategory: 'z-index' }),
    makeToken({
      name: 'LfBsColorPrimary500',
      value: '#FF0000',
      subcategory: 'primary',
      category: 'color',
      isInvariant: false,
    }),
  ];

  const result: Record<string, BaseToken[]> = {};
  for (const brand of brands) {
    // Deep clone so each brand has its own token instances
    result[brand] = sharedTokens.map((t) => ({ ...t }));
  }
  return result;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('cross-brand-consistency', () => {
  describe('checkCrossBrandConsistency', () => {
    // -----------------------------------------------------------------------
    // Consistent brands
    // -----------------------------------------------------------------------
    it('returns consistent: true when all brands have identical tokens', () => {
      const brands = ['damasio', 'estacio', 'ibmec', 'wyden'];
      const brandTokens = makeConsistentBrandTokens(brands);

      const report = checkCrossBrandConsistency(brandTokens, [...INVARIANT_CATEGORIES]);

      expect(report.consistent).toBe(true);
      expect(report.missingTokens).toEqual([]);
      expect(report.extraTokens).toEqual([]);
      expect(report.valueMismatches).toEqual([]);
    });

    it('returns consistent: true for a single brand', () => {
      const brandTokens: Record<string, BaseToken[]> = {
        damasio: [
          makeToken({ name: 'LfBsBreakpointSm', value: '768', subcategory: 'breakpoint' }),
        ],
      };

      const report = checkCrossBrandConsistency(brandTokens, [...INVARIANT_CATEGORIES]);

      expect(report.consistent).toBe(true);
    });

    it('returns consistent: true for empty brands map', () => {
      const report = checkCrossBrandConsistency({}, [...INVARIANT_CATEGORIES]);

      expect(report.consistent).toBe(true);
    });

    // -----------------------------------------------------------------------
    // Missing token in one brand
    // -----------------------------------------------------------------------
    it('reports missing token when one brand lacks a token present in others', () => {
      const brandTokens: Record<string, BaseToken[]> = {
        damasio: [
          makeToken({ name: 'LfBsBreakpointSm', value: '768', subcategory: 'breakpoint' }),
          makeToken({ name: 'LfBsBreakpointMd', value: '1024', subcategory: 'breakpoint' }),
        ],
        estacio: [
          makeToken({ name: 'LfBsBreakpointSm', value: '768', subcategory: 'breakpoint' }),
          // Missing LfBsBreakpointMd
        ],
      };

      const report = checkCrossBrandConsistency(brandTokens, [...INVARIANT_CATEGORIES]);

      expect(report.consistent).toBe(false);
      expect(report.missingTokens).toContainEqual({
        brand: 'estacio',
        tokenName: 'LfBsBreakpointMd',
      });
    });

    // -----------------------------------------------------------------------
    // Extra token in one brand
    // -----------------------------------------------------------------------
    it('reports extra token when one brand has a token not present in others', () => {
      const brandTokens: Record<string, BaseToken[]> = {
        damasio: [
          makeToken({ name: 'LfBsBreakpointSm', value: '768', subcategory: 'breakpoint' }),
          makeToken({ name: 'LfBsBreakpointMd', value: '1024', subcategory: 'breakpoint' }),
        ],
        estacio: [
          makeToken({ name: 'LfBsBreakpointSm', value: '768', subcategory: 'breakpoint' }),
          // Missing LfBsBreakpointMd — so damasio has it as "extra"
        ],
      };

      const report = checkCrossBrandConsistency(brandTokens, [...INVARIANT_CATEGORIES]);

      expect(report.consistent).toBe(false);
      expect(report.extraTokens).toContainEqual({
        brand: 'damasio',
        tokenName: 'LfBsBreakpointMd',
      });
    });

    // -----------------------------------------------------------------------
    // Value mismatch in invariant (utility) token
    // -----------------------------------------------------------------------
    it('reports value mismatch when an invariant token has different values across brands', () => {
      const brandTokens: Record<string, BaseToken[]> = {
        damasio: [
          makeToken({ name: 'LfBsBreakpointSm', value: '768', subcategory: 'breakpoint' }),
        ],
        estacio: [
          makeToken({ name: 'LfBsBreakpointSm', value: '800', subcategory: 'breakpoint' }),
        ],
        wyden: [
          makeToken({ name: 'LfBsBreakpointSm', value: '768', subcategory: 'breakpoint' }),
        ],
      };

      const report = checkCrossBrandConsistency(brandTokens, [...INVARIANT_CATEGORIES]);

      expect(report.consistent).toBe(false);
      expect(report.valueMismatches).toHaveLength(1);
      expect(report.valueMismatches[0].tokenName).toBe('LfBsBreakpointSm');
      expect(report.valueMismatches[0].brands).toEqual({
        damasio: '768',
        estacio: '800',
        wyden: '768',
      });
    });

    // -----------------------------------------------------------------------
    // Color tokens with different values between brands (allowed)
    // -----------------------------------------------------------------------
    it('allows different color values between brands without reporting mismatch', () => {
      const brandTokens: Record<string, BaseToken[]> = {
        damasio: [
          makeToken({
            name: 'LfBsColorPrimary500',
            value: '#FF0000',
            subcategory: 'primary',
            category: 'color',
            isInvariant: false,
          }),
        ],
        estacio: [
          makeToken({
            name: 'LfBsColorPrimary500',
            value: '#0000FF',
            subcategory: 'primary',
            category: 'color',
            isInvariant: false,
          }),
        ],
      };

      const report = checkCrossBrandConsistency(brandTokens, [...INVARIANT_CATEGORIES]);

      expect(report.consistent).toBe(true);
      expect(report.valueMismatches).toEqual([]);
    });

    // -----------------------------------------------------------------------
    // Mixed scenario: missing + value mismatch
    // -----------------------------------------------------------------------
    it('reports both missing tokens and value mismatches in a single report', () => {
      const brandTokens: Record<string, BaseToken[]> = {
        damasio: [
          makeToken({ name: 'LfBsBreakpointSm', value: '768', subcategory: 'breakpoint' }),
          makeToken({ name: 'LfBsDuration100', value: '100ms', subcategory: 'duration' }),
        ],
        estacio: [
          makeToken({ name: 'LfBsBreakpointSm', value: '800', subcategory: 'breakpoint' }),
          // Missing LfBsDuration100
        ],
      };

      const report = checkCrossBrandConsistency(brandTokens, [...INVARIANT_CATEGORIES]);

      expect(report.consistent).toBe(false);
      expect(report.missingTokens.length).toBeGreaterThan(0);
      expect(report.valueMismatches.length).toBeGreaterThan(0);
    });

    // -----------------------------------------------------------------------
    // Duration invariant check
    // -----------------------------------------------------------------------
    it('reports value mismatch for duration tokens with different values', () => {
      const brandTokens: Record<string, BaseToken[]> = {
        damasio: [
          makeToken({ name: 'LfBsDuration100', value: '100ms', subcategory: 'duration' }),
        ],
        ibmec: [
          makeToken({ name: 'LfBsDuration100', value: '150ms', subcategory: 'duration' }),
        ],
      };

      const report = checkCrossBrandConsistency(brandTokens, [...INVARIANT_CATEGORIES]);

      expect(report.consistent).toBe(false);
      expect(report.valueMismatches).toContainEqual({
        tokenName: 'LfBsDuration100',
        brands: { damasio: '100ms', ibmec: '150ms' },
      });
    });

    // -----------------------------------------------------------------------
    // Non-invariant category with different values (allowed)
    // -----------------------------------------------------------------------
    it('allows different values for non-invariant categories', () => {
      const brandTokens: Record<string, BaseToken[]> = {
        damasio: [
          makeToken({
            name: 'LfBsBorderRadiusSmall',
            value: '8px',
            subcategory: 'radius',
            category: 'border',
            isInvariant: false,
          }),
        ],
        estacio: [
          makeToken({
            name: 'LfBsBorderRadiusSmall',
            value: '12px',
            subcategory: 'radius',
            category: 'border',
            isInvariant: false,
          }),
        ],
      };

      const report = checkCrossBrandConsistency(brandTokens, [...INVARIANT_CATEGORIES]);

      expect(report.consistent).toBe(true);
      expect(report.valueMismatches).toEqual([]);
    });

    // -----------------------------------------------------------------------
    // All 8 brands consistent
    // -----------------------------------------------------------------------
    it('returns consistent: true when all 8 real brands have identical tokens', () => {
      const brands = [
        'damasio', 'ensine-me', 'estacio', 'estacio-curso-tecnico',
        'ibmec', 'idomed', 'wyden', 'yduqs',
      ];
      const brandTokens = makeConsistentBrandTokens(brands);

      const report = checkCrossBrandConsistency(brandTokens, [...INVARIANT_CATEGORIES]);

      expect(report.consistent).toBe(true);
    });
  });
});
