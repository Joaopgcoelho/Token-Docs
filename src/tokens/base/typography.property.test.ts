import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import typographyData from './typography.json';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Extracts the scale keys from a typography sub-object (FontSize or LineHeight).
 */
function getScaleKeys(obj: Record<string, unknown>): string[] {
  return Object.keys(obj);
}

const fontSizeEntries = typographyData.Base.Typography.FontSize;
const lineHeightEntries = typographyData.Base.Typography.LineHeight;

const fontSizeScales = getScaleKeys(fontSizeEntries);
const lineHeightScales = getScaleKeys(lineHeightEntries);

// ---------------------------------------------------------------------------
// Property 8: Correspondência font-size ↔ line-height
// ---------------------------------------------------------------------------

describe('Property 8: Correspondência font-size ↔ line-height', () => {
  /**
   * **Validates: Requirements 2.4**
   *
   * For every font-size token, there must exist a line-height token
   * with the same numeric scale, ensuring each font size has an
   * associated line height for readability.
   */
  it('every font-size scale has a corresponding line-height scale (min 100 iterations)', () => {
    // Arbitrary that picks a random non-empty subset of font-size scales
    const fontSizeSubsetArb = fc
      .subarray(fontSizeScales, { minLength: 1 })
      .filter((arr) => arr.length > 0);

    fc.assert(
      fc.property(fontSizeSubsetArb, (subset) => {
        for (const scale of subset) {
          expect(
            lineHeightScales,
            `line-height scale set should contain scale "${scale}" matching font-size`,
          ).toContain(scale);
        }
      }),
      { numRuns: 200 },
    );
  });

  /**
   * **Validates: Requirements 2.4**
   *
   * For any randomly selected font-size scale, the corresponding
   * line-height value must be a valid dimension (px value) and
   * its numeric value must be greater than or equal to the font-size value,
   * ensuring adequate line spacing for legibility.
   */
  it('line-height value is >= font-size value for each scale (min 100 iterations)', () => {
    const fontSizeScaleArb = fc.constantFrom(...fontSizeScales);

    fc.assert(
      fc.property(fontSizeScaleArb, (scale) => {
        const fontSizeEntry = fontSizeEntries[scale as keyof typeof fontSizeEntries];
        const lineHeightEntry = lineHeightEntries[scale as keyof typeof lineHeightEntries];

        expect(lineHeightEntry).toBeDefined();

        const fontSizeValue = parseFloat(fontSizeEntry.$value);
        const lineHeightValue = parseFloat(lineHeightEntry.$value);

        expect(lineHeightValue).toBeGreaterThanOrEqual(fontSizeValue);
      }),
      { numRuns: 200 },
    );
  });

  /**
   * **Validates: Requirements 2.4**
   *
   * The set of font-size scales and line-height scales must be identical,
   * verified by picking random permutations and checking bijection.
   */
  it('font-size and line-height have identical scale sets (min 100 iterations)', () => {
    // Generate random indices to verify the correspondence from both directions
    const indexArb = fc.integer({ min: 0, max: Math.max(fontSizeScales.length, lineHeightScales.length) - 1 });

    fc.assert(
      fc.property(indexArb, (_index) => {
        // Every font-size scale exists in line-height
        for (const scale of fontSizeScales) {
          expect(lineHeightScales).toContain(scale);
        }
        // Every line-height scale exists in font-size
        for (const scale of lineHeightScales) {
          expect(fontSizeScales).toContain(scale);
        }
        // Same count
        expect(fontSizeScales.length).toBe(lineHeightScales.length);
      }),
      { numRuns: 200 },
    );
  });
});
