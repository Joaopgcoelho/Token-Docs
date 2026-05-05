import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

/**
 * **Validates: Requirements 2.3, 2.4, 2.5**
 *
 * Property 2: Corretude do diff de tokens
 *
 * For any two token snapshots (old and new), diffTokenSnapshots must return:
 * - added: exactly the tokens present in new but absent in old
 * - removed: exactly the tokens present in old but absent in new
 * - changed: exactly the tokens present in both but with different values
 * - The union of added + removed + changed + unchanged covers all tokens
 *   from both snapshots without overlap
 */

// ── Functions under test ────────────────────────────────────────────────────
// These mirror the implementations from code.js section 8 (task 12).
// They are defined here so the property tests can run independently
// of the Figma sandbox environment.

/**
 * tokenValueHash(token)
 * Generates a deterministic string hash of a token's values across all modes.
 * Used for quick equality comparison.
 *
 * @param {Object} token - Token object with values map { modeName: value }.
 * @returns {string} Deterministic hash string.
 */
function tokenValueHash(token) {
  var parts = [];
  var modeNames = Object.keys(token.values);
  modeNames.sort();
  for (var i = 0; i < modeNames.length; i++) {
    var val = token.values[modeNames[i]];
    if (val && val.hex) parts.push(modeNames[i] + ":" + val.hex);
    else if (val && val.alias) parts.push(modeNames[i] + ":" + val.alias);
    else parts.push(modeNames[i] + ":" + String(val));
  }
  return parts.join("|");
}

/**
 * diffTokenSnapshots(oldSnapshot, newTokens)
 * Compares an old snapshot (map of tokenName → valueHash) with current tokens.
 *
 * @param {Object} oldSnapshot - Map { tokenName: valueHash }
 * @param {Array} newTokens - Array of token objects with name and values
 * @returns {Object} { added: [], removed: [], changed: [] }
 */
function diffTokenSnapshots(oldSnapshot, newTokens) {
  var result = { added: [], removed: [], changed: [] };
  var newMap = {};

  for (var i = 0; i < newTokens.length; i++) {
    var tok = newTokens[i];
    var valHash = tokenValueHash(tok);
    newMap[tok.name] = valHash;

    if (!oldSnapshot[tok.name]) {
      result.added.push(tok);
    } else if (oldSnapshot[tok.name] !== valHash) {
      result.changed.push(tok);
    }
  }

  var oldKeys = Object.keys(oldSnapshot);
  for (var j = 0; j < oldKeys.length; j++) {
    if (!newMap[oldKeys[j]]) {
      result.removed.push(oldKeys[j]);
    }
  }

  return result;
}

// ── Arbitraries ─────────────────────────────────────────────────────────────

/**
 * Arbitrary: generates a valid token name (path-like string).
 */
const tokenNameArb = fc
  .tuple(
    fc.constantFrom('Dynamic', 'Interactive', 'Static', 'Inputable', 'Core', 'Elevation'),
    fc.constantFrom('Primary', 'Secondary', 'Tertiary', 'Neutral', 'Brand'),
    fc.constantFrom('Surface', 'On Surface', 'Border', 'Container'),
    fc.constantFrom('Default', 'Hover', 'Active', 'Focus', 'Disabled')
  )
  .map(function (parts) { return parts.join('/'); });

/**
 * Arbitrary: generates a hex color string.
 */
const hexColorArb = fc
  .tuple(
    fc.integer({ min: 0, max: 255 }),
    fc.integer({ min: 0, max: 255 }),
    fc.integer({ min: 0, max: 255 })
  )
  .map(function (rgb) {
    return '#' +
      rgb[0].toString(16).padStart(2, '0') +
      rgb[1].toString(16).padStart(2, '0') +
      rgb[2].toString(16).padStart(2, '0');
  });

/**
 * Arbitrary: generates a token value for a single mode (hex-based).
 */
const tokenModeValueArb = fc.oneof(
  hexColorArb.map(function (hex) { return { hex: hex }; }),
  fc.constant(null)
);

/**
 * Arbitrary: generates a token object with name and values across 1-3 modes.
 */
const tokenArb = fc
  .tuple(
    tokenNameArb,
    fc.dictionary(
      fc.constantFrom('Default', 'Dark', 'High Contrast'),
      tokenModeValueArb,
      { minKeys: 1, maxKeys: 3 }
    )
  )
  .map(function (pair) {
    return { name: pair[0], values: pair[1] };
  });

/**
 * Arbitrary: generates a list of tokens with unique names.
 */
const uniqueTokenListArb = fc
  .array(tokenArb, { minLength: 0, maxLength: 20 })
  .map(function (tokens) {
    var seen = {};
    var unique = [];
    for (var i = 0; i < tokens.length; i++) {
      if (!seen[tokens[i].name]) {
        seen[tokens[i].name] = true;
        unique.push(tokens[i]);
      }
    }
    return unique;
  });

/**
 * Arbitrary: generates an old snapshot (map of tokenName → valueHash)
 * from a list of tokens.
 */
function buildSnapshotFromTokens(tokens) {
  var snapshot = {};
  for (var i = 0; i < tokens.length; i++) {
    snapshot[tokens[i].name] = tokenValueHash(tokens[i]);
  }
  return snapshot;
}

// ── Tests ───────────────────────────────────────────────────────────────────

describe('Token Diff - Property-Based Tests', function () {
  /**
   * **Validates: Requirements 2.3, 2.4, 2.5**
   *
   * Property 2.1: added contains exactly tokens in new but not in old.
   */
  it('DIFF.1: added contains exactly tokens present in new but absent in old', function () {
    fc.assert(
      fc.property(uniqueTokenListArb, uniqueTokenListArb, function (oldTokens, newTokens) {
        var oldSnapshot = buildSnapshotFromTokens(oldTokens);
        var result = diffTokenSnapshots(oldSnapshot, newTokens);

        var oldNames = {};
        for (var i = 0; i < oldTokens.length; i++) {
          oldNames[oldTokens[i].name] = true;
        }

        // Every added token must NOT be in old snapshot
        for (var a = 0; a < result.added.length; a++) {
          expect(oldNames[result.added[a].name]).toBeUndefined();
        }

        // Every new token not in old must be in added
        var addedNames = {};
        for (var b = 0; b < result.added.length; b++) {
          addedNames[result.added[b].name] = true;
        }
        for (var c = 0; c < newTokens.length; c++) {
          if (!oldNames[newTokens[c].name]) {
            expect(addedNames[newTokens[c].name]).toBe(true);
          }
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Validates: Requirements 2.3, 2.4, 2.5**
   *
   * Property 2.2: removed contains exactly tokens in old but not in new.
   */
  it('DIFF.2: removed contains exactly tokens present in old but absent in new', function () {
    fc.assert(
      fc.property(uniqueTokenListArb, uniqueTokenListArb, function (oldTokens, newTokens) {
        var oldSnapshot = buildSnapshotFromTokens(oldTokens);
        var result = diffTokenSnapshots(oldSnapshot, newTokens);

        var newNames = {};
        for (var i = 0; i < newTokens.length; i++) {
          newNames[newTokens[i].name] = true;
        }

        // Every removed token name must NOT be in new tokens
        for (var a = 0; a < result.removed.length; a++) {
          expect(newNames[result.removed[a]]).toBeUndefined();
        }

        // Every old token not in new must be in removed
        var removedSet = {};
        for (var b = 0; b < result.removed.length; b++) {
          removedSet[result.removed[b]] = true;
        }
        for (var c = 0; c < oldTokens.length; c++) {
          if (!newNames[oldTokens[c].name]) {
            expect(removedSet[oldTokens[c].name]).toBe(true);
          }
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Validates: Requirements 2.3, 2.4, 2.5**
   *
   * Property 2.3: changed contains exactly tokens in both with different values.
   */
  it('DIFF.3: changed contains exactly tokens present in both but with different values', function () {
    fc.assert(
      fc.property(uniqueTokenListArb, uniqueTokenListArb, function (oldTokens, newTokens) {
        var oldSnapshot = buildSnapshotFromTokens(oldTokens);
        var result = diffTokenSnapshots(oldSnapshot, newTokens);

        // Every changed token must exist in both old and new, with different hash
        for (var a = 0; a < result.changed.length; a++) {
          var changedName = result.changed[a].name;
          var newHash = tokenValueHash(result.changed[a]);
          expect(oldSnapshot[changedName]).toBeDefined();
          expect(oldSnapshot[changedName]).not.toBe(newHash);
        }

        // Every token in both with different hash must be in changed
        var changedNames = {};
        for (var b = 0; b < result.changed.length; b++) {
          changedNames[result.changed[b].name] = true;
        }
        for (var c = 0; c < newTokens.length; c++) {
          var name = newTokens[c].name;
          if (oldSnapshot[name] !== undefined) {
            var hash = tokenValueHash(newTokens[c]);
            if (oldSnapshot[name] !== hash) {
              expect(changedNames[name]).toBe(true);
            }
          }
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Validates: Requirements 2.3, 2.4, 2.5**
   *
   * Property 2.4: union of added + removed + changed + unchanged covers
   * all tokens without overlap.
   */
  it('DIFF.4: added + removed + changed + unchanged covers all tokens without overlap', function () {
    fc.assert(
      fc.property(uniqueTokenListArb, uniqueTokenListArb, function (oldTokens, newTokens) {
        var oldSnapshot = buildSnapshotFromTokens(oldTokens);
        var result = diffTokenSnapshots(oldSnapshot, newTokens);

        // Collect all names from each category
        var addedNames = {};
        for (var a = 0; a < result.added.length; a++) {
          addedNames[result.added[a].name] = true;
        }

        var removedNames = {};
        for (var b = 0; b < result.removed.length; b++) {
          removedNames[result.removed[b]] = true;
        }

        var changedNames = {};
        for (var c = 0; c < result.changed.length; c++) {
          changedNames[result.changed[c].name] = true;
        }

        // Unchanged: tokens in both old and new with same hash
        var unchangedNames = {};
        for (var d = 0; d < newTokens.length; d++) {
          var name = newTokens[d].name;
          if (oldSnapshot[name] !== undefined && oldSnapshot[name] === tokenValueHash(newTokens[d])) {
            unchangedNames[name] = true;
          }
        }

        // Check no overlap between categories
        var allCategories = [addedNames, removedNames, changedNames, unchangedNames];
        for (var i = 0; i < allCategories.length; i++) {
          for (var j = i + 1; j < allCategories.length; j++) {
            var keysI = Object.keys(allCategories[i]);
            for (var k = 0; k < keysI.length; k++) {
              expect(allCategories[j][keysI[k]]).toBeUndefined();
            }
          }
        }

        // All new token names must be in added, changed, or unchanged
        for (var e = 0; e < newTokens.length; e++) {
          var n = newTokens[e].name;
          var inSomeCategory = addedNames[n] || changedNames[n] || unchangedNames[n];
          expect(inSomeCategory).toBeTruthy();
        }

        // All old token names must be in removed, changed, or unchanged
        var oldKeys = Object.keys(oldSnapshot);
        for (var f = 0; f < oldKeys.length; f++) {
          var o = oldKeys[f];
          var inSomeCat = removedNames[o] || changedNames[o] || unchangedNames[o];
          expect(inSomeCat).toBeTruthy();
        }
      }),
      { numRuns: 100 }
    );
  });
});

describe('Token Diff - Example-Based Tests', function () {
  it('empty old snapshot + new tokens → all added', function () {
    var newTokens = [
      { name: 'Dynamic/Primary/Surface/Default', values: { Default: { hex: '#076AEA' } } },
      { name: 'Static/Neutral/Border/Default', values: { Default: { hex: '#CCCCCC' } } }
    ];
    var result = diffTokenSnapshots({}, newTokens);
    expect(result.added.length).toBe(2);
    expect(result.removed.length).toBe(0);
    expect(result.changed.length).toBe(0);
  });

  it('old snapshot + empty new tokens → all removed', function () {
    var oldSnapshot = {
      'Dynamic/Primary/Surface/Default': 'Default:#076AEA',
      'Static/Neutral/Border/Default': 'Default:#CCCCCC'
    };
    var result = diffTokenSnapshots(oldSnapshot, []);
    expect(result.added.length).toBe(0);
    expect(result.removed.length).toBe(2);
    expect(result.changed.length).toBe(0);
  });

  it('identical snapshots → no changes', function () {
    var tokens = [
      { name: 'Dynamic/Primary/Surface/Default', values: { Default: { hex: '#076AEA' } } }
    ];
    var oldSnapshot = buildSnapshotFromTokens(tokens);
    var result = diffTokenSnapshots(oldSnapshot, tokens);
    expect(result.added.length).toBe(0);
    expect(result.removed.length).toBe(0);
    expect(result.changed.length).toBe(0);
  });

  it('mixed additions, removals, and changes', function () {
    var oldTokens = [
      { name: 'Token/A', values: { Default: { hex: '#111111' } } },
      { name: 'Token/B', values: { Default: { hex: '#222222' } } },
      { name: 'Token/C', values: { Default: { hex: '#333333' } } }
    ];
    var oldSnapshot = buildSnapshotFromTokens(oldTokens);

    var newTokens = [
      { name: 'Token/A', values: { Default: { hex: '#111111' } } }, // unchanged
      { name: 'Token/B', values: { Default: { hex: '#999999' } } }, // changed
      { name: 'Token/D', values: { Default: { hex: '#444444' } } }  // added
    ];
    // Token/C is removed

    var result = diffTokenSnapshots(oldSnapshot, newTokens);
    expect(result.added.length).toBe(1);
    expect(result.added[0].name).toBe('Token/D');
    expect(result.removed.length).toBe(1);
    expect(result.removed[0]).toBe('Token/C');
    expect(result.changed.length).toBe(1);
    expect(result.changed[0].name).toBe('Token/B');
  });

  it('tokenValueHash produces deterministic output', function () {
    var token = { name: 'Test', values: { Dark: { hex: '#000000' }, Default: { hex: '#FFFFFF' } } };
    var hash1 = tokenValueHash(token);
    var hash2 = tokenValueHash(token);
    expect(hash1).toBe(hash2);
    // Modes should be sorted alphabetically: Dark before Default
    expect(hash1).toBe('Dark:#000000|Default:#FFFFFF');
  });
});
