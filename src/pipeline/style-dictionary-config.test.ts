import { describe, it, expect } from 'vitest';
import {
  figmaToCamelTransform,
  camelToCssTransform,
  baseTokenFilter,
  baseTokenCssFilter,
  namingValidationAction,
  crossBrandConsistencyAction,
  createBaseTokenConfig,
  sortSDTokens,
} from './style-dictionary-config';
import type { SDToken } from './style-dictionary-config';
import type { BaseToken } from '../models/base-token.types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeSDToken(overrides: Partial<SDToken> = {}): SDToken {
  return {
    name: 'LfBsColorNeutral100',
    value: '#FAFAFA',
    path: ['Base', 'Colors', 'Neutral', '100'],
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Transforms
// ---------------------------------------------------------------------------

describe('style-dictionary-config', () => {
  describe('figmaToCamelTransform', () => {
    it('converts Figma path to camelCase name', () => {
      const token = makeSDToken({ path: ['Base', 'Colors', 'Neutral', '100'] });
      const result = figmaToCamelTransform.transform(token);
      expect(result).toBe('LfBsColorNeutral100');
    });

    it('filters tokens with Base path prefix', () => {
      expect(figmaToCamelTransform.filter(makeSDToken({ path: ['Base', 'Colors'] }))).toBe(true);
      expect(figmaToCamelTransform.filter(makeSDToken({ path: ['Brand', 'Colors'] }))).toBe(false);
    });

    it('converts border-radius Figma path', () => {
      const token = makeSDToken({ path: ['Base', 'Sizing', 'border', 'radius', 'xx-small'] });
      const result = figmaToCamelTransform.transform(token);
      expect(result).toBe('LfBsBorderRadiusXxSmall');
    });
  });

  describe('camelToCssTransform', () => {
    it('converts camelCase name to CSS custom property', () => {
      const token = makeSDToken({ name: 'LfBsColorNeutral100' });
      const result = camelToCssTransform.transform(token);
      expect(result).toBe('--lf-bs-color-neutral-100');
    });

    it('filters tokens with LfBs prefix', () => {
      expect(camelToCssTransform.filter(makeSDToken({ name: 'LfBsColorNeutral100' }))).toBe(true);
      expect(camelToCssTransform.filter(makeSDToken({ name: 'LfThmColorPrimary' }))).toBe(false);
    });
  });

  // ---------------------------------------------------------------------------
  // Filters
  // ---------------------------------------------------------------------------

  describe('baseTokenFilter', () => {
    it('includes tokens with LfBs prefix', () => {
      expect(baseTokenFilter.filter(makeSDToken({ name: 'LfBsColorNeutral100' }))).toBe(true);
    });

    it('excludes tokens without LfBs prefix', () => {
      expect(baseTokenFilter.filter(makeSDToken({ name: 'LfThmColorPrimary' }))).toBe(false);
    });
  });

  describe('baseTokenCssFilter', () => {
    it('includes tokens with --lf-bs- prefix', () => {
      expect(baseTokenCssFilter.filter(makeSDToken({ name: '--lf-bs-color-neutral-100' }))).toBe(true);
    });

    it('excludes tokens without --lf-bs- prefix', () => {
      expect(baseTokenCssFilter.filter(makeSDToken({ name: '--lf-thm-color-primary' }))).toBe(false);
    });
  });

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  describe('namingValidationAction', () => {
    it('passes for valid token names', () => {
      const tokens = [
        makeSDToken({ name: 'LfBsColorNeutral100' }),
        makeSDToken({ name: 'LfBsSpaceGap200' }),
      ];
      expect(() => namingValidationAction.do(tokens)).not.toThrow();
    });

    it('throws for invalid token names', () => {
      const tokens = [
        makeSDToken({ name: 'LfBsColorNeutral100' }),
        makeSDToken({ name: 'LfColorBad', path: ['Base', 'Colors', 'Bad'] }),
      ];
      expect(() => namingValidationAction.do(tokens)).toThrow('[Naming Convention]');
    });

    it('skips non-base tokens', () => {
      const tokens = [
        makeSDToken({ name: 'LfThmColorPrimary', path: ['Brand', 'Colors'] }),
      ];
      expect(() => namingValidationAction.do(tokens)).not.toThrow();
    });

    it('reports all errors in a single throw', () => {
      const tokens = [
        makeSDToken({ name: 'LfColorBad1', path: ['Base', 'A'] }),
        makeSDToken({ name: 'LfColorBad2', path: ['Base', 'B'] }),
      ];
      expect(() => namingValidationAction.do(tokens)).toThrow('2 token(s)');
    });
  });

  describe('crossBrandConsistencyAction', () => {
    it('passes when brands are consistent', () => {
      const tokens = [
        makeSDToken({ name: 'LfBsColorNeutral100', value: '#FAFAFA', attributes: { brand: 'estacio', category: 'color', subcategory: 'neutral', scale: '100' } }),
        makeSDToken({ name: 'LfBsColorNeutral100', value: '#F0F0F0', attributes: { brand: 'wyden', category: 'color', subcategory: 'neutral', scale: '100' } }),
      ];
      expect(() => crossBrandConsistencyAction.do(tokens)).not.toThrow();
    });

    it('throws when a token is missing in one brand', () => {
      const tokens = [
        makeSDToken({ name: 'LfBsColorNeutral100', value: '#FAFAFA', attributes: { brand: 'estacio', category: 'color', subcategory: 'neutral', scale: '100' } }),
        makeSDToken({ name: 'LfBsColorNeutral100', value: '#F0F0F0', attributes: { brand: 'wyden', category: 'color', subcategory: 'neutral', scale: '100' } }),
        makeSDToken({ name: 'LfBsColorPrimary100', value: '#0000FF', attributes: { brand: 'estacio', category: 'color', subcategory: 'primary', scale: '100' } }),
      ];
      expect(() => crossBrandConsistencyAction.do(tokens)).toThrow('[Cross-Brand Consistency]');
    });

    it('throws when invariant values differ between brands', () => {
      const tokens = [
        makeSDToken({ name: 'LfBsBreakpointSm', value: '768', attributes: { brand: 'estacio', category: 'utility', subcategory: 'breakpoint', scale: 'sm' } }),
        makeSDToken({ name: 'LfBsBreakpointSm', value: '800', attributes: { brand: 'wyden', category: 'utility', subcategory: 'breakpoint', scale: 'sm' } }),
      ];
      expect(() => crossBrandConsistencyAction.do(tokens)).toThrow('Value mismatches');
    });

    it('skips tokens without brand attribute', () => {
      const tokens = [
        makeSDToken({ name: 'LfBsColorNeutral100', value: '#FAFAFA' }),
      ];
      expect(() => crossBrandConsistencyAction.do(tokens)).not.toThrow();
    });
  });

  // ---------------------------------------------------------------------------
  // Configuration factory
  // ---------------------------------------------------------------------------

  describe('createBaseTokenConfig', () => {
    it('returns a complete configuration', () => {
      const config = createBaseTokenConfig();
      expect(config.transforms).toHaveLength(2);
      expect(config.filters).toHaveLength(2);
      expect(config.actions).toHaveLength(2);
      expect(config.brands).toHaveLength(8);
      expect(config.invariantCategories).toContain('breakpoint');
    });

    it('includes all expected transform names', () => {
      const config = createBaseTokenConfig();
      const names = config.transforms.map((t) => t.name);
      expect(names).toContain('name/lf/figmaToCamel');
      expect(names).toContain('name/lf/camelToCss');
    });

    it('includes all expected filter names', () => {
      const config = createBaseTokenConfig();
      const names = config.filters.map((f) => f.name);
      expect(names).toContain('filter/lf/baseTokens');
      expect(names).toContain('filter/lf/baseTokensCss');
    });

    it('includes all expected action names', () => {
      const config = createBaseTokenConfig();
      const names = config.actions.map((a) => a.name);
      expect(names).toContain('action/lf/validateNaming');
      expect(names).toContain('action/lf/checkCrossBrandConsistency');
    });
  });

  // ---------------------------------------------------------------------------
  // sortSDTokens
  // ---------------------------------------------------------------------------

  describe('sortSDTokens', () => {
    it('sorts tokens by category, subcategory, and scale', () => {
      const tokens: SDToken[] = [
        makeSDToken({ name: 'LfBsSpaceGap100', attributes: { category: 'spacing', subcategory: 'gap', scale: '100' } }),
        makeSDToken({ name: 'LfBsColorPrimary200', attributes: { category: 'color', subcategory: 'primary', scale: '200' } }),
        makeSDToken({ name: 'LfBsColorNeutral100', attributes: { category: 'color', subcategory: 'neutral', scale: '100' } }),
      ];
      const sorted = sortSDTokens(tokens);
      expect(sorted).toEqual([
        'LfBsColorNeutral100',
        'LfBsColorPrimary200',
        'LfBsSpaceGap100',
      ]);
    });
  });
});
