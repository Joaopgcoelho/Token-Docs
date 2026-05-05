import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { extractColorScales } from '../BrandSection.jsx';
import { isColor } from '../../shared/tokenData.js';

// ── Generators ─────────────────────────────────────────────────────────

const SCALE_NAMES = ['Primary', 'Secondary', 'Neutral', 'Critical', 'Warning', 'Success', 'Info', 'Highlight', 'Tertiary'];
const STEPS = [100, 200, 300, 400, 500, 600, 700, 800, 900];

/** Generate a valid hex color #RRGGBB */
const hexColorArb = fc.tuple(
  fc.integer({ min: 0, max: 255 }),
  fc.integer({ min: 0, max: 255 }),
  fc.integer({ min: 0, max: 255 }),
).map(([r, g, b]) =>
  '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('')
);

/** Generate a brand color token entry: { key: 'LfThmBrandColor{Scale}{Step}', value: '#RRGGBB' } */
const brandColorEntryArb = fc.tuple(
  fc.constantFrom(...SCALE_NAMES),
  fc.constantFrom(...STEPS),
  hexColorArb,
).map(([scale, step, color]) => ({
  key: `LfThmBrandColor${scale}${step}`,
  value: color,
  scale,
  step: String(step),
}));

/** Non-matching key prefixes that should be filtered out */
const nonMatchingKeyArb = fc.oneof(
  fc.constant('LfThmDynamic').chain(prefix =>
    fc.string({ minLength: 3, maxLength: 12 }).map(s => prefix + s.replace(/[^A-Za-z0-9]/g, 'x'))
  ),
  fc.constant('LfBs').chain(prefix =>
    fc.string({ minLength: 3, maxLength: 12 }).map(s => prefix + s.replace(/[^A-Za-z0-9]/g, 'x'))
  ),
  fc.constant('SomeOtherKey').chain(prefix =>
    fc.string({ minLength: 1, maxLength: 8 }).map(s => prefix + s.replace(/[^A-Za-z0-9]/g, 'x'))
  ),
);

/** Non-color values that should be filtered out */
const nonColorValueArb = fc.oneof(
  fc.integer(),
  fc.boolean(),
  fc.constant(''),
  fc.constant('not-a-color'),
  fc.constant('12px'),
);

/** Generate a noise entry (non-matching key with any value, or matching key with non-color value) */
const noiseEntryArb = fc.oneof(
  fc.tuple(nonMatchingKeyArb, fc.oneof(hexColorArb, nonColorValueArb)).map(([key, value]) => ({
    key,
    value,
    isBrandColor: false,
  })),
  fc.tuple(
    fc.constantFrom(...SCALE_NAMES),
    fc.constantFrom(...STEPS),
    nonColorValueArb,
  ).map(([scale, step, value]) => ({
    key: `LfThmBrandColor${scale}${step}`,
    value,
    isBrandColor: false,
  })),
);

/**
 * Generate a mixed token object with both valid brand color entries and noise.
 * Returns { tokens, expectedEntries } where expectedEntries are the valid brand color entries.
 */
const mixedTokensArb = fc.tuple(
  fc.array(brandColorEntryArb, { minLength: 1, maxLength: 20 }),
  fc.array(noiseEntryArb, { minLength: 0, maxLength: 15 }),
).map(([brandEntries, noiseEntries]) => {
  const tokens = {};
  const expectedEntries = [];

  // Deduplicate brand entries by key (last one wins, matching Object.entries behavior)
  const brandMap = new Map();
  for (const entry of brandEntries) {
    brandMap.set(entry.key, entry);
  }

  for (const entry of brandMap.values()) {
    tokens[entry.key] = entry.value;
    expectedEntries.push(entry);
  }

  for (const entry of noiseEntries) {
    // Avoid overwriting valid brand entries with noise
    if (!tokens[entry.key]) {
      tokens[entry.key] = entry.value;
    }
  }

  return { tokens, expectedEntries };
});

// ── Tests ──────────────────────────────────────────────────────────────

describe('Feature: ui-unification, Property 1: Color scale extraction filters and groups correctly', () => {
  /**
   * **Validates: Requirements 3.3, 3.4**
   *
   * For any token object containing a mix of LfThmBrandColor-prefixed keys and
   * other prefixes, extractColorScales must:
   * 1. Return only tokens with prefix LfThmBrandColor
   * 2. Group correctly by scale name and index by numeric step
   * 3. Each value in the result must be a valid color string
   */
  it('filters only LfThmBrandColor tokens, groups by scale, indexes by step, and all values are valid colors', () => {
    fc.assert(
      fc.property(mixedTokensArb, ({ tokens, expectedEntries }) => {
        const result = extractColorScales(tokens);

        // 1. Every scale/step in the result must correspond to a valid brand color entry
        for (const [scaleName, steps] of Object.entries(result)) {
          for (const [step, colorValue] of Object.entries(steps)) {
            // The key must have been a LfThmBrandColor-prefixed key
            const expectedKey = `LfThmBrandColor${scaleName}${step}`;
            expect(tokens).toHaveProperty(expectedKey);

            // 2. The value must match the original token value
            expect(colorValue).toBe(tokens[expectedKey]);

            // 3. Each value must be a valid color string
            expect(isColor(colorValue)).toBe(true);
          }
        }

        // 4. Every expected valid brand color entry must appear in the result
        for (const entry of expectedEntries) {
          expect(result).toHaveProperty(entry.scale);
          expect(result[entry.scale]).toHaveProperty(entry.step);
          expect(result[entry.scale][entry.step]).toBe(entry.value);
        }

        // 5. No non-LfThmBrandColor keys should appear in the result
        //    (verified implicitly: all result keys map back to LfThmBrandColor{scale}{step})
        const totalResultEntries = Object.values(result).reduce(
          (sum, steps) => sum + Object.keys(steps).length,
          0
        );
        expect(totalResultEntries).toBe(expectedEntries.length);
      }),
      { numRuns: 100 }
    );
  });

  it('returns empty object when no LfThmBrandColor tokens are present', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.tuple(nonMatchingKeyArb, fc.oneof(hexColorArb, nonColorValueArb)),
          { minLength: 0, maxLength: 10 }
        ),
        (entries) => {
          const tokens = Object.fromEntries(entries);
          const result = extractColorScales(tokens);
          expect(Object.keys(result).length).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});
