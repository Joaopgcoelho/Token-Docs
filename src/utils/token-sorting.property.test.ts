import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { sortTokens } from './token-sorting';
import type { BaseToken, TokenCategory } from '../models/base-token.types';
import {
  TOKEN_CATEGORIES,
  ALL_COLOR_PALETTES,
  COLOR_SCALE,
  SPACING_SUBGROUPS,
  BORDER_WIDTH_SCALE,
  BORDER_RADIUS_VARIANTS,
  OPACITY_SCALE,
  SHADOW_LEVELS,
  SHADOW_LAYERS,
  BREAKPOINT_NAMES,
  DURATION_VALUES,
  MOTION_CURVE_NAMES,
  ZINDEX_VALUES,
  TYPOGRAPHY_ROLES,
  TYPOGRAPHY_ROLE_WEIGHTS,
  BASE_TOKEN_PREFIX,
} from '../constants/base-token-config';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

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
  overrides: Partial<BaseToken> & Pick<BaseToken, 'name' | 'category' | 'subcategory' | 'scale'>,
): BaseToken {
  return {
    cssProperty: `--lf-bs-${overrides.name.toLowerCase()}`,
    value: '#000000',
    tsType: 'string',
    isInvariant: false,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Arbitraries: generate realistic BaseToken objects
// ---------------------------------------------------------------------------

/** Color token arbitrary */
const colorTokenArb = fc
  .tuple(
    fc.constantFrom(...ALL_COLOR_PALETTES),
    fc.constantFrom(...COLOR_SCALE),
  )
  .map(([palette, scale]) =>
    makeToken({
      name: `${BASE_TOKEN_PREFIX}Color${hyphenatedToPascal(palette)}${scale}`,
      category: 'color',
      subcategory: palette as string,
      scale: String(scale),
    }),
  );

/** Spacing token arbitrary */
const spacingTokenArb = fc
  .tuple(
    fc.constantFrom(...SPACING_SUBGROUPS),
    fc.integer({ min: 0, max: 20 }).map((n) => n * 100),
  )
  .map(([sub, scale]) =>
    makeToken({
      name: `${BASE_TOKEN_PREFIX}Space${capitalize(sub)}${scale}`,
      category: 'spacing',
      subcategory: sub,
      scale: String(scale),
    }),
  );

/** Border-width token arbitrary */
const borderWidthTokenArb = fc
  .constantFrom(...BORDER_WIDTH_SCALE)
  .map((scale) =>
    makeToken({
      name: `${BASE_TOKEN_PREFIX}BorderWidth${scale}`,
      category: 'border',
      subcategory: 'width',
      scale: String(scale),
    }),
  );

/** Border-radius token arbitrary */
const borderRadiusTokenArb = fc
  .constantFrom(...BORDER_RADIUS_VARIANTS)
  .map((variant) =>
    makeToken({
      name: `${BASE_TOKEN_PREFIX}BorderRadius${hyphenatedToPascal(variant)}`,
      category: 'border',
      subcategory: 'radius',
      scale: variant as string,
    }),
  );

/** Shadow token arbitrary */
const shadowTokenArb = fc
  .tuple(
    fc.constantFrom(...SHADOW_LEVELS),
    fc.constantFrom(...SHADOW_LAYERS),
  )
  .map(([level, layer]) =>
    makeToken({
      name: `${BASE_TOKEN_PREFIX}ShadowLevel${level}Layer${layer}`,
      category: 'shadow',
      subcategory: `level${level}`,
      scale: String(layer),
    }),
  );

/** Opacity token arbitrary */
const opacityTokenArb = fc
  .constantFrom(...OPACITY_SCALE)
  .map((scale) =>
    makeToken({
      name: `${BASE_TOKEN_PREFIX}Opacity${scale}`,
      category: 'opacity',
      subcategory: 'opacity',
      scale: String(scale),
    }),
  );

/** Breakpoint token arbitrary */
const breakpointTokenArb = fc
  .constantFrom(...BREAKPOINT_NAMES)
  .map((name) =>
    makeToken({
      name: `${BASE_TOKEN_PREFIX}Breakpoint${capitalize(name)}`,
      category: 'utility',
      subcategory: 'breakpoint',
      scale: name,
    }),
  );

/** Duration token arbitrary */
const durationTokenArb = fc
  .constantFrom(...DURATION_VALUES)
  .map((val) =>
    makeToken({
      name: `${BASE_TOKEN_PREFIX}Duration${val}`,
      category: 'utility',
      subcategory: 'duration',
      scale: String(val),
    }),
  );

/** Motion token arbitrary */
const motionTokenArb = fc
  .constantFrom(...MOTION_CURVE_NAMES)
  .map((curve) =>
    makeToken({
      name: `${BASE_TOKEN_PREFIX}MotionMovent${hyphenatedToPascal(curve)}`,
      category: 'utility',
      subcategory: 'motion',
      scale: curve as string,
    }),
  );

/** Z-index token arbitrary */
const zindexTokenArb = fc
  .constantFrom(...ZINDEX_VALUES)
  .map((val) =>
    makeToken({
      name: `${BASE_TOKEN_PREFIX}Zindex${val}`,
      category: 'utility',
      subcategory: 'z-index',
      scale: String(val),
    }),
  );

/** Typography font-family token arbitrary */
const typographyFontFamilyArb = fc
  .constantFrom(...TYPOGRAPHY_ROLES)
  .map((role) =>
    makeToken({
      name: `${BASE_TOKEN_PREFIX}TypographyFontFamily${capitalize(role)}`,
      category: 'typography',
      subcategory: 'font-family',
      scale: role,
    }),
  );

/** Typography font-weight token arbitrary */
const typographyFontWeightArb = fc
  .constantFrom(...TYPOGRAPHY_ROLES)
  .chain((role) => {
    const weights = TYPOGRAPHY_ROLE_WEIGHTS[role];
    return fc
      .constantFrom(...weights)
      .map((weight) =>
        makeToken({
          name: `${BASE_TOKEN_PREFIX}TypographyFontWeight${capitalize(role)}${capitalize(weight)}`,
          category: 'typography',
          subcategory: 'font-weight',
          scale: `${role}-${weight}`,
        }),
      );
  });

/** Typography font-size token arbitrary */
const typographyFontSizeArb = fc
  .integer({ min: 1, max: 20 })
  .map((n) => n * 100)
  .map((scale) =>
    makeToken({
      name: `${BASE_TOKEN_PREFIX}TypographyFontSize${scale}`,
      category: 'typography',
      subcategory: 'font-size',
      scale: String(scale),
    }),
  );

/** Typography line-height token arbitrary */
const typographyLineHeightArb = fc
  .integer({ min: 1, max: 20 })
  .map((n) => n * 100)
  .map((scale) =>
    makeToken({
      name: `${BASE_TOKEN_PREFIX}TypographyLineHeight${scale}`,
      category: 'typography',
      subcategory: 'line-height',
      scale: String(scale),
    }),
  );

/**
 * Union of all valid token arbitraries.
 */
const anyTokenArb = fc.oneof(
  colorTokenArb,
  spacingTokenArb,
  borderWidthTokenArb,
  borderRadiusTokenArb,
  shadowTokenArb,
  opacityTokenArb,
  breakpointTokenArb,
  durationTokenArb,
  motionTokenArb,
  zindexTokenArb,
  typographyFontFamilyArb,
  typographyFontWeightArb,
  typographyFontSizeArb,
  typographyLineHeightArb,
);

/**
 * Generates a list of 0-30 random tokens (may contain duplicates).
 */
const tokenListArb = fc.array(anyTokenArb, { minLength: 0, maxLength: 30 });

// ---------------------------------------------------------------------------
// Property 7: Ordenação de tokens dentro de categorias
// ---------------------------------------------------------------------------

describe('Property 7: Ordenação de tokens dentro de categorias', () => {
  /**
   * **Validates: Requirements 8.3, 8.4**
   *
   * For any randomly generated list of tokens, after sorting:
   * - Categories appear in TOKEN_CATEGORIES order
   * - Within each category, subcategories are in alphabetical order
   * - Within each subcategory, numeric scales are in ascending order
   */
  it('sorted tokens respect category order from TOKEN_CATEGORIES (min 100 iterations)', () => {
    fc.assert(
      fc.property(tokenListArb, (tokens) => {
        const sorted = sortTokens(tokens);

        // Verify category order: for any two adjacent tokens,
        // the category index of the first must be <= the second
        for (let i = 1; i < sorted.length; i++) {
          const prevCatIdx = TOKEN_CATEGORIES.indexOf(sorted[i - 1].category);
          const currCatIdx = TOKEN_CATEGORIES.indexOf(sorted[i].category);
          expect(prevCatIdx).toBeLessThanOrEqual(currCatIdx);
        }
      }),
      { numRuns: 200 },
    );
  });

  /**
   * **Validates: Requirements 8.3, 8.4**
   *
   * Within each category, subcategories are sorted alphabetically.
   */
  it('subcategories are alphabetically ordered within each category (min 100 iterations)', () => {
    fc.assert(
      fc.property(tokenListArb, (tokens) => {
        const sorted = sortTokens(tokens);

        for (let i = 1; i < sorted.length; i++) {
          if (sorted[i - 1].category === sorted[i].category) {
            const cmp = sorted[i - 1].subcategory
              .toLowerCase()
              .localeCompare(sorted[i].subcategory.toLowerCase());
            expect(cmp).toBeLessThanOrEqual(0);
          }
        }
      }),
      { numRuns: 200 },
    );
  });

  /**
   * **Validates: Requirements 8.3, 8.4**
   *
   * Within each subcategory, numeric scales are in ascending order.
   */
  it('numeric scales are in ascending order within each subcategory (min 100 iterations)', () => {
    fc.assert(
      fc.property(tokenListArb, (tokens) => {
        const sorted = sortTokens(tokens);

        for (let i = 1; i < sorted.length; i++) {
          if (
            sorted[i - 1].category === sorted[i].category &&
            sorted[i - 1].subcategory === sorted[i].subcategory
          ) {
            const prevNum = Number(sorted[i - 1].scale);
            const currNum = Number(sorted[i].scale);

            // Only check numeric ordering when both scales are numeric
            if (!Number.isNaN(prevNum) && !Number.isNaN(currNum)) {
              expect(prevNum).toBeLessThanOrEqual(currNum);
            }
          }
        }
      }),
      { numRuns: 200 },
    );
  });

  /**
   * **Validates: Requirements 8.3, 8.4**
   *
   * sortTokens does not mutate the input array.
   */
  it('does not mutate the input array (min 100 iterations)', () => {
    fc.assert(
      fc.property(tokenListArb, (tokens) => {
        const copy = tokens.map((t) => ({ ...t }));
        sortTokens(tokens);

        // Each token in the original array should be unchanged
        expect(tokens).toEqual(copy);
      }),
      { numRuns: 200 },
    );
  });

  /**
   * **Validates: Requirements 8.3, 8.4**
   *
   * sortTokens preserves all elements (same length, same set of names).
   */
  it('preserves all elements after sorting (min 100 iterations)', () => {
    fc.assert(
      fc.property(tokenListArb, (tokens) => {
        const sorted = sortTokens(tokens);

        expect(sorted.length).toBe(tokens.length);

        // Same multiset of names
        const inputNames = tokens.map((t) => t.name).sort();
        const sortedNames = sorted.map((t) => t.name).sort();
        expect(sortedNames).toEqual(inputNames);
      }),
      { numRuns: 200 },
    );
  });

  /**
   * **Validates: Requirements 8.3, 8.4**
   *
   * Sorting is idempotent: sorting an already-sorted array produces the same result.
   */
  it('sorting is idempotent (min 100 iterations)', () => {
    fc.assert(
      fc.property(tokenListArb, (tokens) => {
        const sorted1 = sortTokens(tokens);
        const sorted2 = sortTokens(sorted1);

        expect(sorted2).toEqual(sorted1);
      }),
      { numRuns: 200 },
    );
  });
});
