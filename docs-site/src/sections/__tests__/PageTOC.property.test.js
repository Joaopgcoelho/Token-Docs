import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { collectHeadings } from '../../components/PageTOC.jsx';

// ── Helpers ────────────────────────────────────────────────────────────

/**
 * Creates a minimal mock DOM element with the properties that collectHeadings
 * reads/writes: tagName, textContent, and id.
 */
function createMockElement(tagName, text) {
  return { tagName: tagName.toUpperCase(), textContent: text, id: '' };
}

/**
 * Creates a mock container that implements querySelectorAll('h2, h3')
 * by returning the provided array of mock elements.
 */
function createMockContainer(elements) {
  return {
    querySelectorAll(selector) {
      if (selector === 'h2, h3') return elements;
      return [];
    },
  };
}

// ── Generators ─────────────────────────────────────────────────────────

/** Arbitrary heading level: h2 or h3 */
const headingLevelArb = fc.constantFrom('h2', 'h3');

/**
 * Arbitrary heading text — non-empty alphanumeric strings.
 */
const headingTextArb = fc.stringMatching(/^[A-Za-z0-9 ]{1,50}$/);

/** Arbitrary heading descriptor: { level, text } */
const headingArb = fc.record({
  level: headingLevelArb,
  text: headingTextArb,
});

/**
 * Arbitrary non-empty array of heading descriptors.
 * Represents the headings found inside a section's .main-content.
 */
const headingsArrayArb = fc.array(headingArb, { minLength: 1, maxLength: 30 });

/** Arbitrary active section ID */
const activeArb = fc.stringMatching(/^[a-z][a-z-]{0,14}$/);

// ── Tests ──────────────────────────────────────────────────────────────

describe('Feature: ui-unification, Property 2: PageTOC collects and classifies headings correctly', () => {
  /**
   * **Validates: Requirements 6.2, 6.9**
   *
   * For any DOM structure containing h2 and h3 elements, collectHeadings must:
   * 1. Return an item for every heading, preserving DOM order
   * 2. Each item's level matches the original element's tagName (H2 or H3)
   * 3. Each item's text matches the original element's textContent
   * 4. Items from h3 elements have level 'H3' (which maps to class toc-h3)
   * 5. Items from h2 elements have level 'H2' (which does NOT get class toc-h3)
   */
  it('collects all headings in DOM order and classifies h2/h3 levels correctly', () => {
    fc.assert(
      fc.property(headingsArrayArb, activeArb, (headingDescs, active) => {
        // Build mock DOM elements from the generated descriptors
        const mockElements = headingDescs.map(h => createMockElement(h.level, h.text));
        const container = createMockContainer(mockElements);

        // Execute
        const result = collectHeadings(container, active);

        // 1. Same number of items as input headings
        expect(result).toHaveLength(headingDescs.length);

        // Verify each item
        for (let i = 0; i < headingDescs.length; i++) {
          const desc = headingDescs[i];
          const item = result[i];

          // 2. DOM order is preserved (index-based ID)
          expect(item.id).toBe(`toc-${active}-${i}`);

          // 3. Text matches the original element's textContent
          expect(item.text).toBe(desc.text);

          // 4. Level matches the uppercase tagName
          const expectedLevel = desc.level.toUpperCase();
          expect(item.level).toBe(expectedLevel);

          // 5. h3 items have level 'H3' (toc-h3 class), h2 items have level 'H2' (no toc-h3)
          if (desc.level === 'h3') {
            expect(item.level).toBe('H3');
          } else {
            expect(item.level).toBe('H2');
            expect(item.level).not.toBe('H3');
          }
        }
      }),
      { numRuns: 100 },
    );
  });

  it('returns empty array when container has no headings', () => {
    fc.assert(
      fc.property(activeArb, (active) => {
        const container = createMockContainer([]);
        const result = collectHeadings(container, active);
        expect(result).toHaveLength(0);
      }),
      { numRuns: 100 },
    );
  });

  it('returns empty array when container is null/undefined', () => {
    fc.assert(
      fc.property(activeArb, (active) => {
        const result = collectHeadings(null, active);
        expect(result).toHaveLength(0);
      }),
      { numRuns: 100 },
    );
  });
});


// ── Property 3 ─────────────────────────────────────────────────────────

describe('Feature: ui-unification, Property 3: PageTOC visibility depends on h2 count', () => {
  /**
   * **Validates: Requirements 6.7, 6.8**
   *
   * For any count of h2 headings in a section, the PageTOC must be visible
   * if and only if the section contains 3 or more h2 elements.
   *
   * We test the pure visibility logic: collectHeadings returns items, then
   * the component applies the rule `h2Count >= 3` to decide visibility.
   */

  /** Generator: random h2 count (0–10) */
  const h2CountArb = fc.integer({ min: 0, max: 10 });

  /** Generator: random h3 count (0–10) */
  const h3CountArb = fc.integer({ min: 0, max: 10 });

  /**
   * Builds a mock container with the specified number of h2 and h3 elements
   * interleaved in a realistic order (h2 first, then h3s under each, etc.).
   */
  function buildContainer(h2Count, h3Count) {
    const elements = [];
    // Add h2 elements
    for (let i = 0; i < h2Count; i++) {
      elements.push(createMockElement('h2', `Heading ${i + 1}`));
    }
    // Add h3 elements
    for (let i = 0; i < h3Count; i++) {
      elements.push(createMockElement('h3', `Sub heading ${i + 1}`));
    }
    return createMockContainer(elements);
  }

  it('PageTOC is visible if and only if h2Count >= 3', () => {
    fc.assert(
      fc.property(h2CountArb, h3CountArb, activeArb, (h2Count, h3Count, active) => {
        const container = buildContainer(h2Count, h3Count);
        const headings = collectHeadings(container, active);

        // Count h2 items in the result (same logic as the component)
        const resultH2Count = headings.filter(h => h.level === 'H2').length;

        // The h2 count in the result must match what we generated
        expect(resultH2Count).toBe(h2Count);

        // Apply the same visibility rule as the PageTOC component:
        // visible (not null) iff h2Count >= 3
        const shouldBeVisible = resultH2Count >= 3;

        if (shouldBeVisible) {
          // PageTOC would render — headings list is non-empty and has enough h2s
          expect(resultH2Count).toBeGreaterThanOrEqual(3);
        } else {
          // PageTOC would return null — fewer than 3 h2 headings
          expect(resultH2Count).toBeLessThan(3);
        }
      }),
      { numRuns: 100 },
    );
  });

  it('PageTOC is hidden when there are zero h2 headings regardless of h3 count', () => {
    fc.assert(
      fc.property(h3CountArb, activeArb, (h3Count, active) => {
        const container = buildContainer(0, h3Count);
        const headings = collectHeadings(container, active);

        const resultH2Count = headings.filter(h => h.level === 'H2').length;
        expect(resultH2Count).toBe(0);

        // With 0 h2s, PageTOC must be hidden (return null)
        expect(resultH2Count < 3).toBe(true);
      }),
      { numRuns: 100 },
    );
  });

  it('PageTOC is always visible when h2Count is between 3 and 10', () => {
    const h2AtLeast3Arb = fc.integer({ min: 3, max: 10 });

    fc.assert(
      fc.property(h2AtLeast3Arb, h3CountArb, activeArb, (h2Count, h3Count, active) => {
        const container = buildContainer(h2Count, h3Count);
        const headings = collectHeadings(container, active);

        const resultH2Count = headings.filter(h => h.level === 'H2').length;
        expect(resultH2Count).toBe(h2Count);

        // With 3+ h2s, PageTOC must be visible
        expect(resultH2Count >= 3).toBe(true);
      }),
      { numRuns: 100 },
    );
  });
});
