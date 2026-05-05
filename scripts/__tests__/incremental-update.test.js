import { describe, it, expect } from 'vitest';

/**
 * **Validates: Requirements 2.1, 2.2, 2.6**
 *
 * Unit tests for incremental update edge cases.
 *
 * Since `updateDocsIncremental` depends on the Figma API (figma.getNodeById,
 * figma.variables, etc.), these tests validate the diff-based decision logic
 * that drives the incremental update: when to skip, when to regenerate, and
 * how position preservation works. Uses the already-tested `diffTokenSnapshots`
 * and `tokenValueHash` functions.
 */

// ── Functions under test (mirrored from code.js section 8) ──────────────

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

function buildSnapshotFromTokens(tokens) {
  var snapshot = {};
  for (var i = 0; i < tokens.length; i++) {
    snapshot[tokens[i].name] = tokenValueHash(tokens[i]);
  }
  return snapshot;
}

// ── Incremental update decision logic ───────────────────────────────────
// This mirrors the core decision logic inside updateDocsIncremental:
// 1. If board not found in registry → fallback to generation
// 2. If diff is empty → skip update
// 3. If diff has changes → regenerate preserving position

/**
 * Simulates the incremental update decision for a single collection.
 *
 * @param {Object|null} registryEntry - The board registry entry, or null if not found.
 * @param {Array} currentTokens - Current tokens for the collection.
 * @returns {Object} { action: 'skip'|'regenerate'|'fallback', savedPosition: {x,y}|null, diff: Object|null }
 */
function incrementalUpdateDecision(registryEntry, currentTokens) {
  // Step 1: Board not found → fallback
  if (!registryEntry || !registryEntry.nodeId) {
    return { action: 'fallback', savedPosition: null, diff: null };
  }

  // Step 2: Save position
  var savedPosition = { x: registryEntry.x, y: registryEntry.y };

  // Step 3: Get old snapshot
  var oldSnapshot = (registryEntry && registryEntry.tokenSnapshot) ? registryEntry.tokenSnapshot : {};

  // Step 4: Compute diff
  var diff = diffTokenSnapshots(oldSnapshot, currentTokens);

  // Step 5: If no changes → skip
  if (diff.added.length === 0 && diff.removed.length === 0 && diff.changed.length === 0) {
    return { action: 'skip', savedPosition: savedPosition, diff: diff };
  }

  // Step 6: Changes detected → regenerate
  return { action: 'regenerate', savedPosition: savedPosition, diff: diff };
}

// ── Tests ───────────────────────────────────────────────────────────────

describe('Incremental Update - Decision Logic', function () {

  /**
   * **Validates: Requirements 2.6**
   * Test: board not found → fallback to generation
   */
  it('should fallback to generation when board is not found in registry (null entry)', function () {
    var tokens = [
      { name: 'Dynamic/Primary/Surface/Default', values: { Default: { hex: '#076AEA' } } }
    ];

    var result = incrementalUpdateDecision(null, tokens);

    expect(result.action).toBe('fallback');
    expect(result.savedPosition).toBeNull();
    expect(result.diff).toBeNull();
  });

  it('should fallback to generation when registry entry has no nodeId', function () {
    var registryEntry = { name: 'Test Collection', nodeId: null, x: 100, y: 200, tokenSnapshot: null, lastUpdated: null };
    var tokens = [
      { name: 'Dynamic/Primary/Surface/Default', values: { Default: { hex: '#076AEA' } } }
    ];

    var result = incrementalUpdateDecision(registryEntry, tokens);

    expect(result.action).toBe('fallback');
    expect(result.savedPosition).toBeNull();
    expect(result.diff).toBeNull();
  });

  /**
   * **Validates: Requirements 2.1**
   * Test: no diff → skip update
   */
  it('should skip update when tokens have not changed', function () {
    var tokens = [
      { name: 'Dynamic/Primary/Surface/Default', values: { Default: { hex: '#076AEA' } } },
      { name: 'Static/Neutral/Border/Default', values: { Default: { hex: '#CCCCCC' } } }
    ];
    var snapshot = buildSnapshotFromTokens(tokens);

    var registryEntry = {
      name: 'Test Collection',
      nodeId: '123:456',
      x: 50,
      y: 100,
      tokenSnapshot: snapshot,
      lastUpdated: Date.now()
    };

    var result = incrementalUpdateDecision(registryEntry, tokens);

    expect(result.action).toBe('skip');
    expect(result.diff.added.length).toBe(0);
    expect(result.diff.removed.length).toBe(0);
    expect(result.diff.changed.length).toBe(0);
  });

  it('should skip update when registry has no snapshot and tokens are empty', function () {
    var registryEntry = {
      name: 'Empty Collection',
      nodeId: '123:789',
      x: 0,
      y: 0,
      tokenSnapshot: {},
      lastUpdated: Date.now()
    };

    var result = incrementalUpdateDecision(registryEntry, []);

    expect(result.action).toBe('skip');
  });

  /**
   * **Validates: Requirements 2.2**
   * Test: position preservation after update
   */
  it('should preserve position (x, y) when regenerating after changes', function () {
    var oldTokens = [
      { name: 'Dynamic/Primary/Surface/Default', values: { Default: { hex: '#076AEA' } } }
    ];
    var snapshot = buildSnapshotFromTokens(oldTokens);

    var savedX = 350;
    var savedY = 720;
    var registryEntry = {
      name: 'Brand Collection',
      nodeId: '456:789',
      x: savedX,
      y: savedY,
      tokenSnapshot: snapshot,
      lastUpdated: Date.now()
    };

    // Token value changed
    var newTokens = [
      { name: 'Dynamic/Primary/Surface/Default', values: { Default: { hex: '#FF0000' } } }
    ];

    var result = incrementalUpdateDecision(registryEntry, newTokens);

    expect(result.action).toBe('regenerate');
    expect(result.savedPosition).toEqual({ x: savedX, y: savedY });
    expect(result.diff.changed.length).toBe(1);
    expect(result.diff.changed[0].name).toBe('Dynamic/Primary/Surface/Default');
  });

  it('should preserve position when tokens are added', function () {
    var oldTokens = [
      { name: 'Token/A', values: { Default: { hex: '#111111' } } }
    ];
    var snapshot = buildSnapshotFromTokens(oldTokens);

    var registryEntry = {
      name: 'Usage Collection',
      nodeId: '100:200',
      x: 500,
      y: 250,
      tokenSnapshot: snapshot,
      lastUpdated: Date.now()
    };

    var newTokens = [
      { name: 'Token/A', values: { Default: { hex: '#111111' } } },
      { name: 'Token/B', values: { Default: { hex: '#222222' } } }
    ];

    var result = incrementalUpdateDecision(registryEntry, newTokens);

    expect(result.action).toBe('regenerate');
    expect(result.savedPosition).toEqual({ x: 500, y: 250 });
    expect(result.diff.added.length).toBe(1);
    expect(result.diff.added[0].name).toBe('Token/B');
  });

  it('should preserve position when tokens are removed', function () {
    var oldTokens = [
      { name: 'Token/A', values: { Default: { hex: '#111111' } } },
      { name: 'Token/B', values: { Default: { hex: '#222222' } } }
    ];
    var snapshot = buildSnapshotFromTokens(oldTokens);

    var registryEntry = {
      name: 'Usage Collection',
      nodeId: '100:200',
      x: 200,
      y: 400,
      tokenSnapshot: snapshot,
      lastUpdated: Date.now()
    };

    var newTokens = [
      { name: 'Token/A', values: { Default: { hex: '#111111' } } }
    ];

    var result = incrementalUpdateDecision(registryEntry, newTokens);

    expect(result.action).toBe('regenerate');
    expect(result.savedPosition).toEqual({ x: 200, y: 400 });
    expect(result.diff.removed.length).toBe(1);
    expect(result.diff.removed[0]).toBe('Token/B');
  });

  it('should regenerate when snapshot is null but tokens exist', function () {
    var registryEntry = {
      name: 'New Collection',
      nodeId: '300:400',
      x: 0,
      y: 0,
      tokenSnapshot: null,
      lastUpdated: Date.now()
    };

    var newTokens = [
      { name: 'Token/A', values: { Default: { hex: '#111111' } } }
    ];

    var result = incrementalUpdateDecision(registryEntry, newTokens);

    expect(result.action).toBe('regenerate');
    expect(result.savedPosition).toEqual({ x: 0, y: 0 });
    expect(result.diff.added.length).toBe(1);
  });
});
