import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

/**
 * **Validates: Requirements 1.2, 1.3**
 *
 * Property 1: Filtragem de collections selecionadas
 *
 * For any set of collection IDs and any subset of selected IDs,
 * the filtering function returns exactly the selected IDs —
 * no non-selected IDs are included.
 *
 * This tests the core filtering logic used by generateDocsSelective
 * to determine which collections to process. The function mirrors
 * the filtering pattern in code.js: iterating all collections and
 * skipping those whose ID is not in selectedIds (via indexOf).
 */

// ── Function under test ─────────────────────────────────────────────────────
// This mirrors the filtering logic from generateDocsSelective in code.js.
// It is defined here so the property tests can run independently
// of the Figma sandbox environment.

/**
 * filterSelectedCollections(allCollections, selectedIds)
 *
 * Filters an array of collection objects, returning only those whose
 * id is present in the selectedIds array. Uses indexOf for ES5 compatibility.
 *
 * @param {Array<Object>} allCollections - Array of { id: string, name: string }.
 * @param {Array<string>} selectedIds - Array of collection IDs to include.
 * @returns {Array<Object>} Filtered array containing only selected collections.
 */
function filterSelectedCollections(allCollections, selectedIds) {
  var result = [];
  for (var i = 0; i < allCollections.length; i++) {
    if (selectedIds.indexOf(allCollections[i].id) !== -1) {
      result.push(allCollections[i]);
    }
  }
  return result;
}

// ── Arbitraries ─────────────────────────────────────────────────────────────

/**
 * Arbitrary: generates a collection ID string (e.g. "VariableCollectionId:55:150").
 */
var collectionIdArb = fc
  .tuple(fc.integer({ min: 1, max: 999 }), fc.integer({ min: 1, max: 999 }))
  .map(function (pair) {
    return 'VariableCollectionId:' + pair[0] + ':' + pair[1];
  });

/**
 * Arbitrary: generates a collection object with unique id and name.
 */
var collectionArb = fc
  .tuple(
    collectionIdArb,
    fc.constantFrom('Brand', 'Usage', 'Core', 'Elevation', 'Feedback', 'Typography', 'Spacing', 'Shadows')
  )
  .map(function (pair) {
    return { id: pair[0], name: pair[1] + ' Collection' };
  });

/**
 * Arbitrary: generates a list of collections with unique IDs,
 * and a subset of those IDs as selectedIds.
 */
var collectionsAndSelectionArb = fc
  .array(collectionArb, { minLength: 1, maxLength: 20 })
  .chain(function (collections) {
    // Ensure unique IDs
    var seen = {};
    var unique = [];
    for (var i = 0; i < collections.length; i++) {
      if (!seen[collections[i].id]) {
        seen[collections[i].id] = true;
        unique.push(collections[i]);
      }
    }
    var allIds = unique.map(function (c) { return c.id; });
    // Generate a random subset of the IDs
    return fc.subarray(allIds, { minLength: 0, maxLength: allIds.length }).map(function (subset) {
      return { collections: unique, selectedIds: subset };
    });
  });

// ── Tests ───────────────────────────────────────────────────────────────────

describe('Collection Filtering - Property-Based Tests', function () {
  /**
   * **Validates: Requirements 1.2, 1.3**
   *
   * Property 1.1: Filtering returns exactly the collections whose IDs
   * are in selectedIds — no more, no less.
   */
  it('FILTER.1: filtered result contains exactly the selected collection IDs', function () {
    fc.assert(
      fc.property(collectionsAndSelectionArb, function (input) {
        var result = filterSelectedCollections(input.collections, input.selectedIds);

        // Build set of result IDs
        var resultIds = {};
        for (var i = 0; i < result.length; i++) {
          resultIds[result[i].id] = true;
        }

        // Build set of selected IDs
        var selectedSet = {};
        for (var j = 0; j < input.selectedIds.length; j++) {
          selectedSet[input.selectedIds[j]] = true;
        }

        // Every result ID must be in selectedIds
        for (var k = 0; k < result.length; k++) {
          expect(selectedSet[result[k].id]).toBe(true);
        }

        // Every selectedId that exists in collections must be in result
        for (var m = 0; m < input.selectedIds.length; m++) {
          var existsInCollections = false;
          for (var n = 0; n < input.collections.length; n++) {
            if (input.collections[n].id === input.selectedIds[m]) {
              existsInCollections = true;
              break;
            }
          }
          if (existsInCollections) {
            expect(resultIds[input.selectedIds[m]]).toBe(true);
          }
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Validates: Requirements 1.2, 1.3**
   *
   * Property 1.2: No non-selected collection IDs appear in the result.
   */
  it('FILTER.2: no non-selected collection IDs are included in the result', function () {
    fc.assert(
      fc.property(collectionsAndSelectionArb, function (input) {
        var result = filterSelectedCollections(input.collections, input.selectedIds);

        var selectedSet = {};
        for (var j = 0; j < input.selectedIds.length; j++) {
          selectedSet[input.selectedIds[j]] = true;
        }

        // No result item should have an ID not in selectedIds
        for (var i = 0; i < result.length; i++) {
          expect(selectedSet[result[i].id]).toBe(true);
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Validates: Requirements 1.2, 1.3**
   *
   * Property 1.3: The count of filtered results equals the number of
   * selected IDs that actually exist in the collections array.
   */
  it('FILTER.3: result count equals the number of selected IDs present in collections', function () {
    fc.assert(
      fc.property(collectionsAndSelectionArb, function (input) {
        var result = filterSelectedCollections(input.collections, input.selectedIds);

        // Count how many selectedIds actually exist in collections
        var collIdSet = {};
        for (var i = 0; i < input.collections.length; i++) {
          collIdSet[input.collections[i].id] = true;
        }
        var expectedCount = 0;
        for (var j = 0; j < input.selectedIds.length; j++) {
          if (collIdSet[input.selectedIds[j]]) {
            expectedCount++;
          }
        }

        expect(result.length).toBe(expectedCount);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Validates: Requirements 1.2, 1.3**
   *
   * Property 1.4: Selecting all IDs returns all collections;
   * selecting none returns empty.
   */
  it('FILTER.4: selecting all IDs returns all collections, selecting none returns empty', function () {
    fc.assert(
      fc.property(
        fc.array(collectionArb, { minLength: 1, maxLength: 15 }).map(function (colls) {
          var seen = {};
          var unique = [];
          for (var i = 0; i < colls.length; i++) {
            if (!seen[colls[i].id]) {
              seen[colls[i].id] = true;
              unique.push(colls[i]);
            }
          }
          return unique;
        }),
        function (collections) {
          // Select all
          var allIds = collections.map(function (c) { return c.id; });
          var allResult = filterSelectedCollections(collections, allIds);
          expect(allResult.length).toBe(collections.length);

          // Select none
          var noneResult = filterSelectedCollections(collections, []);
          expect(noneResult.length).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});
