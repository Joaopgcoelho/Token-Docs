import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  validateTokenName,
  camelToCssProperty,
  cssPropertyToCamel,
} from './naming-convention';
import {
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
  FONT_WEIGHTS,
  TYPOGRAPHY_ROLE_WEIGHTS,
  BASE_TOKEN_PREFIX,
} from '../constants/base-token-config';

// ---------------------------------------------------------------------------
// Helpers: build camelCase token names from category data
// ---------------------------------------------------------------------------

/**
 * Capitalize first letter of a string.
 */
function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Convert a hyphenated string to PascalCase.
 * e.g. "xx-small" → "XxSmall", "ease-in-out" → "EaseInOut", "neutral-alpha" → "NeutralAlpha"
 */
function hyphenatedToPascal(s: string): string {
  return s
    .split('-')
    .map((seg) => capitalize(seg))
    .join('');
}

// ---------------------------------------------------------------------------
// Arbitrary: generates a valid LfBs token name from known categories
// ---------------------------------------------------------------------------

/** Color token: LfBsColor{Palette}{Scale} */
const colorTokenArb = fc
  .tuple(
    fc.constantFrom(...ALL_COLOR_PALETTES),
    fc.constantFrom(...COLOR_SCALE),
  )
  .map(([palette, scale]) => `${BASE_TOKEN_PREFIX}Color${hyphenatedToPascal(palette)}${scale}`);

/** Spacing token: LfBsSpace{Subgroup}{Scale} — scale 0..2000 in steps of 100 */
const spacingScaleArb = fc.integer({ min: 0, max: 20 }).map((n) => n * 100);
const spacingTokenArb = fc
  .tuple(
    fc.constantFrom(...SPACING_SUBGROUPS),
    spacingScaleArb,
  )
  .map(([sub, scale]) => `${BASE_TOKEN_PREFIX}Space${capitalize(sub)}${scale}`);

/** Border-width token: LfBsBorderWidth{Scale} */
const borderWidthTokenArb = fc
  .constantFrom(...BORDER_WIDTH_SCALE)
  .map((scale) => `${BASE_TOKEN_PREFIX}BorderWidth${scale}`);

/** Border-radius token: LfBsBorderRadius{Variant} */
const borderRadiusTokenArb = fc
  .constantFrom(...BORDER_RADIUS_VARIANTS)
  .map((variant) => `${BASE_TOKEN_PREFIX}BorderRadius${hyphenatedToPascal(variant)}`);

/** Shadow token: LfBsShadowLevel{N}Layer{N} */
const shadowTokenArb = fc
  .tuple(
    fc.constantFrom(...SHADOW_LEVELS),
    fc.constantFrom(...SHADOW_LAYERS),
  )
  .map(([level, layer]) => `${BASE_TOKEN_PREFIX}ShadowLevel${level}Layer${layer}`);

/** Opacity token: LfBsOpacity{Scale} */
const opacityTokenArb = fc
  .constantFrom(...OPACITY_SCALE)
  .map((scale) => `${BASE_TOKEN_PREFIX}Opacity${scale}`);

/** Breakpoint token: LfBsBreakpoint{Name} */
const breakpointTokenArb = fc
  .constantFrom(...BREAKPOINT_NAMES)
  .map((name) => `${BASE_TOKEN_PREFIX}Breakpoint${capitalize(name)}`);

/** Duration token: LfBsDuration{Value} */
const durationTokenArb = fc
  .constantFrom(...DURATION_VALUES)
  .map((val) => `${BASE_TOKEN_PREFIX}Duration${val}`);

/** Motion token: LfBsMotionMovent{Curve} */
const motionTokenArb = fc
  .constantFrom(...MOTION_CURVE_NAMES)
  .map((curve) => `${BASE_TOKEN_PREFIX}MotionMovent${hyphenatedToPascal(curve)}`);

/** Z-index token: LfBsZindex{Value} */
const zindexTokenArb = fc
  .constantFrom(...ZINDEX_VALUES)
  .map((val) => `${BASE_TOKEN_PREFIX}Zindex${val}`);

/** Typography font-family token: LfBsTypographyFontFamily{Role} */
const typographyFontFamilyArb = fc
  .constantFrom(...TYPOGRAPHY_ROLES)
  .map((role) => `${BASE_TOKEN_PREFIX}TypographyFontFamily${capitalize(role)}`);

/** Typography font-weight token: LfBsTypographyFontWeight{Role}{Weight} */
const typographyFontWeightArb = fc
  .constantFrom(...TYPOGRAPHY_ROLES)
  .chain((role) => {
    const weights = TYPOGRAPHY_ROLE_WEIGHTS[role];
    return fc
      .constantFrom(...weights)
      .map((weight) => `${BASE_TOKEN_PREFIX}TypographyFontWeight${capitalize(role)}${capitalize(weight)}`);
  });

/** Typography font-size token: LfBsTypographyFontSize{Scale} */
const typographyFontSizeArb = fc
  .integer({ min: 1, max: 20 })
  .map((n) => n * 100)
  .map((scale) => `${BASE_TOKEN_PREFIX}TypographyFontSize${scale}`);

/** Typography line-height token: LfBsTypographyLineHeight{Scale} */
const typographyLineHeightArb = fc
  .integer({ min: 1, max: 20 })
  .map((n) => n * 100)
  .map((scale) => `${BASE_TOKEN_PREFIX}TypographyLineHeight${scale}`);

/**
 * Union of all valid token name arbitraries.
 */
const validTokenNameArb = fc.oneof(
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

// ---------------------------------------------------------------------------
// Property 1: LfBs naming convention
// ---------------------------------------------------------------------------

describe('Property 1: Convenção de nomenclatura LfBs', () => {
  /**
   * **Validates: Requirements 1.4, 2.5, 3.4, 4.3, 5.3, 6.3, 7.5, 11.1**
   *
   * For any randomly generated token name (category + palette/subcategory + scale),
   * the name must pass validateTokenName — i.e. it starts with LfBs, has an
   * uppercase category after the prefix, and contains only alphanumeric chars.
   */
  it('generated token names pass validateTokenName (min 100 iterations)', () => {
    fc.assert(
      fc.property(validTokenNameArb, (name) => {
        const result = validateTokenName(name);
        expect(result.valid).toBe(true);
        expect(result.errors).toEqual([]);
        expect(name.startsWith(BASE_TOKEN_PREFIX)).toBe(true);
      }),
      { numRuns: 200 },
    );
  });

  /**
   * **Validates: Requirements 1.4, 2.5, 3.4, 4.3, 5.3, 6.3, 7.5, 11.1**
   *
   * Generated names contain only alphanumeric characters (camelCase, no hyphens
   * or underscores).
   */
  it('generated token names are purely alphanumeric', () => {
    fc.assert(
      fc.property(validTokenNameArb, (name) => {
        expect(name).toMatch(/^[A-Za-z0-9]+$/);
      }),
      { numRuns: 200 },
    );
  });

  /**
   * **Validates: Requirements 11.1**
   *
   * The character immediately after the LfBs prefix is always uppercase,
   * representing the start of the category segment.
   */
  it('category segment starts with uppercase letter after prefix', () => {
    fc.assert(
      fc.property(validTokenNameArb, (name) => {
        const afterPrefix = name[BASE_TOKEN_PREFIX.length];
        expect(afterPrefix).toBe(afterPrefix.toUpperCase());
        expect(afterPrefix).not.toBe(afterPrefix.toLowerCase());
      }),
      { numRuns: 200 },
    );
  });
});

// ---------------------------------------------------------------------------
// Arbitrary: generates valid LfBs names for round-trip testing
// ---------------------------------------------------------------------------

/**
 * Generates a random PascalCase segment (1-6 lowercase letters, first capitalized).
 */
const pascalSegmentArb = fc
  .stringMatching(/^[a-z]{1,6}$/)
  .map((s) => s.charAt(0).toUpperCase() + s.slice(1));

/**
 * Generates a valid LfBs camelCase name by combining:
 * 1. The LfBs prefix
 * 2. 1-4 PascalCase segments (category + subcategory parts)
 * 3. Optional trailing numeric scale
 */
const roundTripNameArb = fc
  .tuple(
    fc.array(pascalSegmentArb, { minLength: 1, maxLength: 4 }),
    fc.option(fc.integer({ min: 0, max: 9999 }), { nil: undefined }),
  )
  .map(([segments, num]) => {
    const body = segments.join('');
    return num !== undefined
      ? `${BASE_TOKEN_PREFIX}${body}${num}`
      : `${BASE_TOKEN_PREFIX}${body}`;
  });

// ---------------------------------------------------------------------------
// Property 2: Round-trip camelCase ↔ CSS
// ---------------------------------------------------------------------------

describe('Property 2: Round-trip de conversão camelCase ↔ CSS', () => {
  /**
   * **Validates: Requirements 1.5, 3.5, 4.4, 5.4, 6.4, 11.2, 11.3**
   *
   * For any valid LfBs camelCase name, converting to CSS custom property and
   * back must yield the original name:
   * cssPropertyToCamel(camelToCssProperty(name)) === name
   */
  it('round-trip holds for randomly generated LfBs names (min 100 iterations)', () => {
    fc.assert(
      fc.property(roundTripNameArb, (name) => {
        const css = camelToCssProperty(name);
        const back = cssPropertyToCamel(css);
        expect(back).toBe(name);
      }),
      { numRuns: 200 },
    );
  });

  /**
   * **Validates: Requirements 11.2, 11.3**
   *
   * The CSS property always starts with the --lf-bs- prefix.
   */
  it('CSS property always starts with --lf-bs- prefix', () => {
    fc.assert(
      fc.property(roundTripNameArb, (name) => {
        const css = camelToCssProperty(name);
        expect(css.startsWith('--lf-bs-')).toBe(true);
      }),
      { numRuns: 200 },
    );
  });

  /**
   * **Validates: Requirements 11.2**
   *
   * The CSS property contains only lowercase letters, digits, and hyphens
   * (after the leading --).
   */
  it('CSS property body contains only lowercase, digits, and hyphens', () => {
    fc.assert(
      fc.property(roundTripNameArb, (name) => {
        const css = camelToCssProperty(name);
        // Remove leading "--"
        const body = css.slice(2);
        expect(body).toMatch(/^[a-z0-9-]+$/);
      }),
      { numRuns: 200 },
    );
  });

  /**
   * **Validates: Requirements 1.5, 3.5, 4.4, 5.4, 6.4, 11.2, 11.3**
   *
   * Round-trip also holds for all known real token names from the design system.
   */
  it('round-trip holds for known real token names', () => {
    fc.assert(
      fc.property(validTokenNameArb, (name) => {
        const css = camelToCssProperty(name);
        const back = cssPropertyToCamel(css);
        expect(back).toBe(name);
      }),
      { numRuns: 200 },
    );
  });
});
