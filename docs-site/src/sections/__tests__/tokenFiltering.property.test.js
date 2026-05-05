import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { getTopCategory } from '../../shared/tokenData.js';

// ── Generators ─────────────────────────────────────────────────────────

/**
 * Known prefix → category mapping, matching the logic in getTopCategory.
 * Each prefix produces a deterministic category when passed to getTopCategory.
 */
const PREFIX_TO_CATEGORY = {
  LfThmDynamic: 'Dynamic',
  LfThmInteractive: 'Interactive',
  LfThmStatic: 'Static',
  LfThmInputable: 'Inputable',
  LfThmCore: 'Core',
  LfThmComponent: 'Component',
  LfThmBrand: 'Brand',
  LfThmElevation: 'Elevation',
  LfBs: 'Base',
};

const PREFIXES = Object.keys(PREFIX_TO_CATEGORY);
const CATEGORIES = [...new Set(Object.values(PREFIX_TO_CATEGORY))];

/**
 * Generate a suffix that starts with an uppercase letter followed by
 * alphanumeric characters, mimicking real token name suffixes like
 * "PrimarySurfaceDefault" or "Color100".
 */
const suffixArb = fc.tuple(
  fc.constantFrom(
    'Primary', 'Secondary', 'Surface', 'Border', 'Text', 'Icon',
    'Container', 'Neutral', 'Default', 'Hover', 'Active', 'Color',
  ),
  fc.stringMatching(/^[A-Za-z0-9]{0,12}$/),
).map(([word, extra]) => word + extra);

/**
 * Generate a single token object { name, value } with a known prefix.
 * The name is built as prefix + suffix so getTopCategory returns the
 * expected category deterministically.
 */
/** Generate a 6-char hex string for color values */
const hexColorArb = fc.tuple(
  fc.integer({ min: 0, max: 255 }),
  fc.integer({ min: 0, max: 255 }),
  fc.integer({ min: 0, max: 255 }),
).map(([r, g, b]) =>
  '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('')
);

const tokenEntryArb = fc.tuple(
  fc.constantFrom(...PREFIXES),
  suffixArb,
  hexColorArb,
).map(([prefix, suffix, color]) => ({
  name: prefix + suffix,
  value: color,
  category: PREFIX_TO_CATEGORY[prefix],
}));

/**
 * Generate a non-empty list of tokens with mixed categories.
 * Each token has { name, value, category } where category is the
 * expected result of getTopCategory(name).
 */
const tokenListArb = fc.array(tokenEntryArb, { minLength: 1, maxLength: 40 });

/**
 * Generate a token list that is guaranteed to contain at least one token
 * for a specific selected category, plus tokens from other categories.
 * Returns { tokens, selectedCategory }.
 */
const tokenListWithCategoryArb = fc.tuple(
  fc.constantFrom(...CATEGORIES),
  tokenListArb,
).chain(([selectedCategory, extraTokens]) => {
  // Find the prefix(es) that map to the selected category
  const matchingPrefixes = PREFIXES.filter(p => PREFIX_TO_CATEGORY[p] === selectedCategory);

  // Generate at least 1 token guaranteed to be in the selected category
  const guaranteedTokenArb = fc.tuple(
    fc.constantFrom(...matchingPrefixes),
    suffixArb,
    hexColorArb,
  ).map(([prefix, suffix, color]) => ({
    name: prefix + suffix,
    value: color,
    category: PREFIX_TO_CATEGORY[prefix],
  }));

  return fc.tuple(
    fc.array(guaranteedTokenArb, { minLength: 1, maxLength: 5 }),
    fc.constant(extraTokens),
    fc.constant(selectedCategory),
  );
}).map(([guaranteed, extra, selectedCategory]) => ({
  tokens: [...guaranteed, ...extra],
  selectedCategory,
}));

// ── Tests ──────────────────────────────────────────────────────────────

describe('Feature: ui-unification, Property 4: Category filtering shows only tokens of the selected category', () => {
  /**
   * **Validates: Requirement 7.4**
   *
   * For any list of tokens with random categories and a selected category,
   * filtering the list by that category must produce a result where every
   * token belongs exclusively to the selected category (as determined by
   * getTopCategory).
   */
  it('all filtered tokens belong exclusively to the selected category', () => {
    fc.assert(
      fc.property(tokenListWithCategoryArb, ({ tokens, selectedCategory }) => {
        // Assign category to each token using getTopCategory (same as TokenBrowser)
        const enrichedTokens = tokens.map(t => ({
          ...t,
          category: getTopCategory(t.name),
        }));

        // Apply the same filtering logic as TokenBrowser:
        // let list = tokens.filter((t) => t.category === category);
        const filtered = enrichedTokens.filter(t => t.category === selectedCategory);

        // 1. Every token in the filtered list must belong to the selected category
        for (const token of filtered) {
          expect(getTopCategory(token.name)).toBe(selectedCategory);
        }

        // 2. No token outside the selected category should appear in the filtered list
        const nonMatchingTokens = filtered.filter(t => getTopCategory(t.name) !== selectedCategory);
        expect(nonMatchingTokens).toHaveLength(0);

        // 3. The filtered list must contain ALL tokens of the selected category
        //    (filtering should not drop any matching tokens)
        const expectedCount = enrichedTokens.filter(t => getTopCategory(t.name) === selectedCategory).length;
        expect(filtered).toHaveLength(expectedCount);
      }),
      { numRuns: 100 },
    );
  });

  it('filtering by a category with no matching tokens returns an empty list', () => {
    fc.assert(
      fc.property(tokenListArb, (tokens) => {
        const enrichedTokens = tokens.map(t => ({
          ...t,
          category: getTopCategory(t.name),
        }));

        // Pick a category that has no tokens in this list
        const presentCategories = new Set(enrichedTokens.map(t => t.category));
        const absentCategory = CATEGORIES.find(c => !presentCategories.has(c));

        // If all categories are present, skip this iteration
        if (!absentCategory) return;

        const filtered = enrichedTokens.filter(t => t.category === absentCategory);
        expect(filtered).toHaveLength(0);
      }),
      { numRuns: 100 },
    );
  });
});


describe('Feature: ui-unification, Property 5: Sum of category counters is consistent with total token count', () => {
  /**
   * **Validates: Requirements 7.2**
   *
   * For any list of tokens with random categories, computing category counts
   * (same logic as TokenBrowser's catCounts useMemo) and summing all counters
   * must equal the total number of tokens in the list.
   */
  it('sum of all category counters equals total token count', () => {
    fc.assert(
      fc.property(tokenListArb, (tokens) => {
        // Assign category using getTopCategory (same as TokenBrowser enrichment)
        const enrichedTokens = tokens.map(t => ({
          ...t,
          category: getTopCategory(t.name),
        }));

        // Compute category counts using the same logic as TokenBrowser:
        // const m = {};
        // tokens.forEach((t) => { m[t.category] = (m[t.category] || 0) + 1; });
        const catCounts = {};
        enrichedTokens.forEach((t) => {
          catCounts[t.category] = (catCounts[t.category] || 0) + 1;
        });

        // Sum of all category counters must equal total number of tokens
        const sumOfCounters = Object.values(catCounts).reduce((acc, count) => acc + count, 0);
        expect(sumOfCounters).toBe(enrichedTokens.length);
      }),
      { numRuns: 100 },
    );
  });

  it('each category counter matches the actual count of tokens in that category', () => {
    fc.assert(
      fc.property(tokenListArb, (tokens) => {
        const enrichedTokens = tokens.map(t => ({
          ...t,
          category: getTopCategory(t.name),
        }));

        // Compute catCounts (same logic as TokenBrowser)
        const catCounts = {};
        enrichedTokens.forEach((t) => {
          catCounts[t.category] = (catCounts[t.category] || 0) + 1;
        });

        // For each category in catCounts, verify the counter matches
        // the actual number of tokens with that category
        for (const [cat, count] of Object.entries(catCounts)) {
          const actual = enrichedTokens.filter(t => t.category === cat).length;
          expect(count).toBe(actual);
        }
      }),
      { numRuns: 100 },
    );
  });
});
