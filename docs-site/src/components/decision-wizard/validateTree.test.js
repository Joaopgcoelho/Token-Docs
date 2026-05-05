import { describe, it, expect } from 'vitest';
import { validateTree } from './validateTree.js';

describe('validateTree', () => {
  /** A minimal valid tree: one decision node leading to two result nodes */
  const validTree = {
    id: 'test-tree',
    title: 'Test Tree',
    rootId: 'q1',
    nodes: {
      q1: { type: 'decision', id: 'q1', question: 'Is it core?', yes: 'r1', no: 'r2' },
      r1: { type: 'result', id: 'r1', category: 'Core', description: 'Core tokens' },
      r2: { type: 'result', id: 'r2', category: 'Static', description: 'Static tokens' },
    },
  };

  it('returns valid for a well-formed tree', () => {
    const result = validateTree(validTree);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('rejects null or non-object input', () => {
    expect(validateTree(null).valid).toBe(false);
    expect(validateTree(undefined).valid).toBe(false);
    expect(validateTree('string').valid).toBe(false);
  });

  it('rejects tree without rootId', () => {
    const tree = { ...validTree, rootId: '' };
    const result = validateTree(tree);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('rejects tree without nodes object', () => {
    const result = validateTree({ rootId: 'q1', nodes: null });
    expect(result.valid).toBe(false);
  });

  it('detects node.id mismatch with key', () => {
    const tree = {
      ...validTree,
      nodes: {
        ...validTree.nodes,
        q1: { ...validTree.nodes.q1, id: 'wrong-id' },
      },
    };
    const result = validateTree(tree);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('does not match'))).toBe(true);
  });

  it('detects missing yes edge on decision node', () => {
    const tree = {
      ...validTree,
      nodes: {
        ...validTree.nodes,
        q1: { type: 'decision', id: 'q1', question: 'Q?', no: 'r2' },
      },
    };
    const result = validateTree(tree);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('missing a "yes" edge'))).toBe(true);
  });

  it('detects missing no edge on decision node', () => {
    const tree = {
      ...validTree,
      nodes: {
        ...validTree.nodes,
        q1: { type: 'decision', id: 'q1', question: 'Q?', yes: 'r1' },
      },
    };
    const result = validateTree(tree);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('missing a "no" edge'))).toBe(true);
  });

  it('detects edge referencing non-existent node', () => {
    const tree = {
      ...validTree,
      nodes: {
        ...validTree.nodes,
        q1: { type: 'decision', id: 'q1', question: 'Q?', yes: 'nonexistent', no: 'r2' },
      },
    };
    const result = validateTree(tree);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('non-existent node'))).toBe(true);
  });

  it('detects rootId referencing non-existent node', () => {
    const tree = { ...validTree, rootId: 'nonexistent' };
    const result = validateTree(tree);
    expect(result.valid).toBe(false);
  });

  it('detects multiple root nodes', () => {
    const tree = {
      id: 'test',
      title: 'Test',
      rootId: 'q1',
      nodes: {
        q1: { type: 'decision', id: 'q1', question: 'Q1?', yes: 'r1', no: 'r2' },
        q2: { type: 'decision', id: 'q2', question: 'Q2?', yes: 'r1', no: 'r2' },
        r1: { type: 'result', id: 'r1', category: 'A', description: 'A' },
        r2: { type: 'result', id: 'r2', category: 'B', description: 'B' },
      },
    };
    const result = validateTree(tree);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('Multiple root nodes'))).toBe(true);
  });

  it('detects cycles', () => {
    const tree = {
      id: 'test',
      title: 'Test',
      rootId: 'q1',
      nodes: {
        q1: { type: 'decision', id: 'q1', question: 'Q1?', yes: 'q2', no: 'r1' },
        q2: { type: 'decision', id: 'q2', question: 'Q2?', yes: 'q1', no: 'r1' },
        r1: { type: 'result', id: 'r1', category: 'A', description: 'A' },
      },
    };
    const result = validateTree(tree);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('Cycle detected'))).toBe(true);
  });

  it('validates a deeper tree with multiple decision levels', () => {
    const tree = {
      id: 'deep',
      title: 'Deep Tree',
      rootId: 'q1',
      nodes: {
        q1: { type: 'decision', id: 'q1', question: 'Level 1?', yes: 'q2', no: 'r1' },
        q2: { type: 'decision', id: 'q2', question: 'Level 2?', yes: 'r2', no: 'r3' },
        r1: { type: 'result', id: 'r1', category: 'A', description: 'A' },
        r2: { type: 'result', id: 'r2', category: 'B', description: 'B' },
        r3: { type: 'error', id: 'r3', message: 'No match' },
      },
    };
    const result = validateTree(tree);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('accepts trees with error nodes as terminal nodes', () => {
    const tree = {
      id: 'test',
      title: 'Test',
      rootId: 'q1',
      nodes: {
        q1: { type: 'decision', id: 'q1', question: 'Q?', yes: 'r1', no: 'e1' },
        r1: { type: 'result', id: 'r1', category: 'A', description: 'A' },
        e1: { type: 'error', id: 'e1', message: 'Error' },
      },
    };
    const result = validateTree(tree);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });
});
