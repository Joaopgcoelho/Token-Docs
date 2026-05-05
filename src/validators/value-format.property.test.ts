import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  validateOpaqueColor,
  validateAlphaColor,
  validateSpacing,
  validateOpacity,
  validateDuration,
  validateMotion,
  validateShadow,
  validateUnitlessInteger,
  validateValueFormat,
} from './value-format';

// ---------------------------------------------------------------------------
// Arbitraries: generators for valid values per category
// ---------------------------------------------------------------------------

/**
 * Generates a valid 6-digit hex color (#RRGGBB).
 */
const validHexColorArb = fc
  .tuple(
    fc.integer({ min: 0, max: 255 }),
    fc.integer({ min: 0, max: 255 }),
    fc.integer({ min: 0, max: 255 }),
  )
  .map(([r, g, b]) => {
    const hex = (n: number) => n.toString(16).padStart(2, '0');
    return `#${hex(r)}${hex(g)}${hex(b)}`;
  });

/**
 * Generates a valid rgba(r,g,b,a) color string.
 */
const validRgbaColorArb = fc
  .tuple(
    fc.integer({ min: 0, max: 255 }),
    fc.integer({ min: 0, max: 255 }),
    fc.integer({ min: 0, max: 255 }),
    fc.integer({ min: 0, max: 100 }),
  )
  .map(([r, g, b, aPct]) => {
    const a = (aPct / 100).toFixed(2).replace(/\.?0+$/, '') || '0';
    return `rgba(${r},${g},${b},${a})`;
  });

/**
 * Generates a valid spacing value (px or rem).
 */
const validSpacingArb = fc.oneof(
  fc.integer({ min: 0, max: 9999 }).map((n) => `${n}px`),
  fc
    .tuple(fc.integer({ min: 0, max: 99 }), fc.integer({ min: 0, max: 9 }))
    .map(([whole, frac]) => (frac === 0 ? `${whole}rem` : `${whole}.${frac}rem`)),
);

/**
 * Generates a valid opacity value (decimal string in [0, 1]).
 */
const validOpacityArb = fc
  .integer({ min: 0, max: 100 })
  .map((n) => {
    const val = n / 100;
    // Produce clean string representations
    if (val === 0) return '0';
    if (val === 1) return '1';
    return val.toString();
  });

/**
 * Generates a valid duration value (integer ms).
 */
const validDurationArb = fc
  .integer({ min: 0, max: 99999 })
  .map((n) => `${n}ms`);

/**
 * Generates a valid cubic-bezier motion value.
 */
const validMotionArb = fc
  .tuple(
    fc.double({ min: -1, max: 2, noNaN: true }),
    fc.double({ min: -1, max: 2, noNaN: true }),
    fc.double({ min: -1, max: 2, noNaN: true }),
    fc.double({ min: -1, max: 2, noNaN: true }),
  )
  .map(([a, b, c, d]) => {
    // Use fixed precision to avoid floating point weirdness
    const fmt = (n: number) => Number(n.toFixed(4)).toString();
    return `cubic-bezier(${fmt(a)}, ${fmt(b)}, ${fmt(c)}, ${fmt(d)})`;
  });

/**
 * Generates a valid CSS box-shadow value.
 */
const validShadowArb = fc
  .tuple(
    fc.integer({ min: -50, max: 50 }),
    fc.integer({ min: -50, max: 50 }),
    fc.integer({ min: 0, max: 100 }),
    fc.integer({ min: 0, max: 255 }),
    fc.integer({ min: 0, max: 255 }),
    fc.integer({ min: 0, max: 255 }),
    fc.integer({ min: 0, max: 100 }),
  )
  .map(([ox, oy, blur, r, g, b, aPct]) => {
    const a = (aPct / 100).toFixed(2).replace(/\.?0+$/, '') || '0';
    return `${ox}px ${oy}px ${blur}px rgba(${r},${g},${b},${a})`;
  });

/**
 * Generates a valid unitless non-negative integer string.
 */
const validUnitlessIntArb = fc
  .integer({ min: 0, max: 99999 })
  .map((n) => n.toString());

// ---------------------------------------------------------------------------
// Arbitraries: generators for INVALID values per category
// ---------------------------------------------------------------------------

/**
 * Generates invalid hex colors (shorthand, 8-digit, no hash, non-hex chars).
 */
const invalidHexColorArb = fc.oneof(
  // 3-digit shorthand
  fc.constant('#FFF'),
  fc.constant('#abc'),
  // 8-digit
  fc.constant('#FAFAFA00'),
  // No hash
  fc.stringMatching(/^[0-9A-Fa-f]{6}$/),
  // Non-hex chars
  fc.constant('#GGGGGG'),
  // Empty
  fc.constant(''),
  // rgba format
  fc.constant('rgba(0,0,0,1)'),
);

/**
 * Generates invalid rgba values.
 */
const invalidRgbaArb = fc.oneof(
  fc.constant('rgb(0,0,0)'),
  fc.constant('#FAFAFA'),
  fc.constant(''),
  fc.constant('rgba(256,0,0,0.5)'),
  fc.constant('rgba(0,0,0,1.5)'),
  fc.constant('rgba(0,0,0)'),
);

/**
 * Generates invalid spacing values.
 */
const invalidSpacingArb = fc.oneof(
  fc.integer({ min: 0, max: 999 }).map((n) => `${n}em`),
  fc.integer({ min: 0, max: 999 }).map((n) => `${n}`),
  fc.constant(''),
  fc.constant('50%'),
  fc.integer({ min: 1, max: 999 }).map((n) => `-${n}px`),
);

/**
 * Generates invalid opacity values.
 */
const invalidOpacityArb = fc.oneof(
  fc.double({ min: 1.01, max: 10, noNaN: true }).map((n) => n.toFixed(2)),
  fc.double({ min: -10, max: -0.01, noNaN: true }).map((n) => n.toFixed(2)),
  fc.constant('abc'),
  fc.constant(''),
);

/**
 * Generates invalid duration values.
 */
const invalidDurationArb = fc.oneof(
  fc.integer({ min: 0, max: 999 }).map((n) => `${n}`),
  fc.integer({ min: 0, max: 999 }).map((n) => `${n}s`),
  fc.constant(''),
  fc.constant('1.5ms'),
);

/**
 * Generates invalid motion values.
 */
const invalidMotionArb = fc.oneof(
  fc.constant('ease-in-out'),
  fc.constant('linear'),
  fc.constant(''),
  fc.constant('cubic-bezier(0, 0, 1)'),
);

/**
 * Generates invalid unitless integer values.
 */
const invalidUnitlessIntArb = fc.oneof(
  fc.constant('1.5'),
  fc.integer({ min: 0, max: 999 }).map((n) => `${n}px`),
  fc.constant('-1'),
  fc.constant(''),
);

// ---------------------------------------------------------------------------
// Property 3: Formato de valor por categoria
// ---------------------------------------------------------------------------

describe('Property 3: Formato de valor por categoria', () => {
  /**
   * **Validates: Requirements 1.6, 3.3, 5.2, 6.2, 7.3**
   *
   * For any randomly generated valid opaque color (#RRGGBB),
   * the validator must accept it.
   */
  it('accepts all valid opaque hex colors (min 100 iterations)', () => {
    fc.assert(
      fc.property(validHexColorArb, (color) => {
        const result = validateOpaqueColor(color);
        expect(result.valid).toBe(true);
        expect(result.errors).toEqual([]);
      }),
      { numRuns: 200 },
    );
  });

  /**
   * **Validates: Requirements 1.6**
   *
   * For any randomly generated invalid hex color,
   * the validator must reject it.
   */
  it('rejects all invalid opaque hex colors (min 100 iterations)', () => {
    fc.assert(
      fc.property(invalidHexColorArb, (color) => {
        const result = validateOpaqueColor(color);
        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      }),
      { numRuns: 200 },
    );
  });

  /**
   * **Validates: Requirements 1.6**
   *
   * For any randomly generated valid rgba color,
   * the validator must accept it.
   */
  it('accepts all valid rgba colors (min 100 iterations)', () => {
    fc.assert(
      fc.property(validRgbaColorArb, (color) => {
        const result = validateAlphaColor(color);
        expect(result.valid).toBe(true);
        expect(result.errors).toEqual([]);
      }),
      { numRuns: 200 },
    );
  });

  /**
   * **Validates: Requirements 1.6**
   *
   * For any randomly generated invalid rgba color,
   * the validator must reject it.
   */
  it('rejects all invalid rgba colors (min 100 iterations)', () => {
    fc.assert(
      fc.property(invalidRgbaArb, (color) => {
        const result = validateAlphaColor(color);
        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      }),
      { numRuns: 200 },
    );
  });

  /**
   * **Validates: Requirements 3.3**
   *
   * For any randomly generated valid spacing value (px or rem),
   * the validator must accept it.
   */
  it('accepts all valid spacing values (min 100 iterations)', () => {
    fc.assert(
      fc.property(validSpacingArb, (spacing) => {
        const result = validateSpacing(spacing);
        expect(result.valid).toBe(true);
        expect(result.errors).toEqual([]);
      }),
      { numRuns: 200 },
    );
  });

  /**
   * **Validates: Requirements 3.3**
   *
   * For any randomly generated invalid spacing value,
   * the validator must reject it.
   */
  it('rejects all invalid spacing values (min 100 iterations)', () => {
    fc.assert(
      fc.property(invalidSpacingArb, (spacing) => {
        const result = validateSpacing(spacing);
        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      }),
      { numRuns: 200 },
    );
  });

  /**
   * **Validates: Requirements 6.2**
   *
   * For any randomly generated valid opacity value (decimal in [0, 1]),
   * the validator must accept it.
   */
  it('accepts all valid opacity values (min 100 iterations)', () => {
    fc.assert(
      fc.property(validOpacityArb, (opacity) => {
        const result = validateOpacity(opacity);
        expect(result.valid).toBe(true);
        expect(result.errors).toEqual([]);
      }),
      { numRuns: 200 },
    );
  });

  /**
   * **Validates: Requirements 6.2**
   *
   * For any randomly generated invalid opacity value,
   * the validator must reject it.
   */
  it('rejects all invalid opacity values (min 100 iterations)', () => {
    fc.assert(
      fc.property(invalidOpacityArb, (opacity) => {
        const result = validateOpacity(opacity);
        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      }),
      { numRuns: 200 },
    );
  });

  /**
   * **Validates: Requirements 7.3**
   *
   * For any randomly generated valid duration value (integer ms),
   * the validator must accept it.
   */
  it('accepts all valid duration values (min 100 iterations)', () => {
    fc.assert(
      fc.property(validDurationArb, (duration) => {
        const result = validateDuration(duration);
        expect(result.valid).toBe(true);
        expect(result.errors).toEqual([]);
      }),
      { numRuns: 200 },
    );
  });

  /**
   * **Validates: Requirements 7.3**
   *
   * For any randomly generated invalid duration value,
   * the validator must reject it.
   */
  it('rejects all invalid duration values (min 100 iterations)', () => {
    fc.assert(
      fc.property(invalidDurationArb, (duration) => {
        const result = validateDuration(duration);
        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      }),
      { numRuns: 200 },
    );
  });

  /**
   * **Validates: Requirements 7.3**
   *
   * For any randomly generated valid cubic-bezier motion value,
   * the validator must accept it.
   */
  it('accepts all valid motion values (min 100 iterations)', () => {
    fc.assert(
      fc.property(validMotionArb, (motion) => {
        const result = validateMotion(motion);
        expect(result.valid).toBe(true);
        expect(result.errors).toEqual([]);
      }),
      { numRuns: 200 },
    );
  });

  /**
   * **Validates: Requirements 7.3**
   *
   * For any randomly generated invalid motion value,
   * the validator must reject it.
   */
  it('rejects all invalid motion values (min 100 iterations)', () => {
    fc.assert(
      fc.property(invalidMotionArb, (motion) => {
        const result = validateMotion(motion);
        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      }),
      { numRuns: 200 },
    );
  });

  /**
   * **Validates: Requirements 5.2**
   *
   * For any randomly generated valid CSS box-shadow value,
   * the validator must accept it.
   */
  it('accepts all valid shadow values (min 100 iterations)', () => {
    fc.assert(
      fc.property(validShadowArb, (shadow) => {
        const result = validateShadow(shadow);
        expect(result.valid).toBe(true);
        expect(result.errors).toEqual([]);
      }),
      { numRuns: 200 },
    );
  });

  /**
   * **Validates: Requirements 7.3**
   *
   * For any randomly generated valid unitless integer (breakpoint/z-index),
   * the validator must accept it.
   */
  it('accepts all valid unitless integer values (min 100 iterations)', () => {
    fc.assert(
      fc.property(validUnitlessIntArb, (val) => {
        const result = validateUnitlessInteger(val);
        expect(result.valid).toBe(true);
        expect(result.errors).toEqual([]);
      }),
      { numRuns: 200 },
    );
  });

  /**
   * **Validates: Requirements 7.3**
   *
   * For any randomly generated invalid unitless integer value,
   * the validator must reject it.
   */
  it('rejects all invalid unitless integer values (min 100 iterations)', () => {
    fc.assert(
      fc.property(invalidUnitlessIntArb, (val) => {
        const result = validateUnitlessInteger(val);
        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      }),
      { numRuns: 200 },
    );
  });

  /**
   * **Validates: Requirements 1.6, 3.3, 5.2, 6.2, 7.3**
   *
   * The dispatcher validateValueFormat correctly routes to the right validator
   * for each category and produces consistent results.
   */
  it('dispatcher routes correctly for all categories (min 100 iterations)', () => {
    const categoryArbs = fc.oneof(
      validHexColorArb.map((v) => ({ value: v, category: 'opaque-color' as const })),
      validRgbaColorArb.map((v) => ({ value: v, category: 'alpha-color' as const })),
      validSpacingArb.map((v) => ({ value: v, category: 'spacing' as const })),
      validOpacityArb.map((v) => ({ value: v, category: 'opacity' as const })),
      validDurationArb.map((v) => ({ value: v, category: 'duration' as const })),
      validMotionArb.map((v) => ({ value: v, category: 'motion' as const })),
      validShadowArb.map((v) => ({ value: v, category: 'shadow' as const })),
      validUnitlessIntArb.map((v) => ({ value: v, category: 'unitless-integer' as const })),
    );

    fc.assert(
      fc.property(categoryArbs, ({ value, category }) => {
        const result = validateValueFormat(value, category);
        expect(result.valid).toBe(true);
        expect(result.errors).toEqual([]);
      }),
      { numRuns: 200 },
    );
  });
});
