import { describe, it, expect } from 'vitest';
import { wizardReducer, createInitialState } from './wizardReducer';

/**
 * A minimal valid tree for testing the reducer.
 *
 *   root (decision) --yes--> resultA (result)
 *                   --no---> q2 (decision) --yes--> resultB (result)
 *                                           --no---> resultC (result)
 */
const testTree = {
  id: 'test-tree',
  title: 'Test Tree',
  rootId: 'root',
  nodes: {
    root: { id: 'root', type: 'decision', question: 'Is it core?', yes: 'resultA', no: 'q2' },
    q2: { id: 'q2', type: 'decision', question: 'Is it static?', yes: 'resultB', no: 'resultC' },
    resultA: { id: 'resultA', type: 'result', category: 'Core', description: 'Core tokens' },
    resultB: { id: 'resultB', type: 'result', category: 'Static', description: 'Static tokens' },
    resultC: { id: 'resultC', type: 'result', category: 'Dynamic', description: 'Dynamic tokens' },
  },
};

describe('createInitialState', () => {
  it('returns state with rootId as currentNodeId, empty history, and tree reference', () => {
    const state = createInitialState(testTree);
    expect(state.currentNodeId).toBe('root');
    expect(state.history).toEqual([]);
    expect(state.tree).toBe(testTree);
  });
});

describe('wizardReducer', () => {
  describe('ANSWER action', () => {
    it('advances to the yes target and appends to history', () => {
      const state = createInitialState(testTree);
      const next = wizardReducer(state, { type: 'ANSWER', answer: 'yes' });

      expect(next.currentNodeId).toBe('resultA');
      expect(next.history).toEqual([
        { nodeId: 'root', question: 'Is it core?', answer: 'yes' },
      ]);
    });

    it('advances to the no target and appends to history', () => {
      const state = createInitialState(testTree);
      const next = wizardReducer(state, { type: 'ANSWER', answer: 'no' });

      expect(next.currentNodeId).toBe('q2');
      expect(next.history).toEqual([
        { nodeId: 'root', question: 'Is it core?', answer: 'no' },
      ]);
    });

    it('ignores ANSWER when current node is a result node', () => {
      const state = {
        ...createInitialState(testTree),
        currentNodeId: 'resultA',
        history: [{ nodeId: 'root', question: 'Is it core?', answer: 'yes' }],
      };
      const next = wizardReducer(state, { type: 'ANSWER', answer: 'yes' });

      expect(next).toBe(state); // same reference — unchanged
    });

    it('ignores ANSWER when current node is an error node', () => {
      const treeWithError = {
        ...testTree,
        nodes: {
          ...testTree.nodes,
          errNode: { id: 'errNode', type: 'error', message: 'Unknown path' },
        },
      };
      const state = {
        currentNodeId: 'errNode',
        history: [],
        tree: treeWithError,
      };
      const next = wizardReducer(state, { type: 'ANSWER', answer: 'no' });

      expect(next).toBe(state);
    });
  });

  describe('BACK action', () => {
    it('pops the last history entry and restores currentNodeId', () => {
      const state = {
        ...createInitialState(testTree),
        currentNodeId: 'q2',
        history: [{ nodeId: 'root', question: 'Is it core?', answer: 'no' }],
      };
      const next = wizardReducer(state, { type: 'BACK' });

      expect(next.currentNodeId).toBe('root');
      expect(next.history).toEqual([]);
    });

    it('ignores BACK when history is empty', () => {
      const state = createInitialState(testTree);
      const next = wizardReducer(state, { type: 'BACK' });

      expect(next).toBe(state);
    });

    it('pops only the last entry when history has multiple entries', () => {
      const state = {
        ...createInitialState(testTree),
        currentNodeId: 'resultC',
        history: [
          { nodeId: 'root', question: 'Is it core?', answer: 'no' },
          { nodeId: 'q2', question: 'Is it static?', answer: 'no' },
        ],
      };
      const next = wizardReducer(state, { type: 'BACK' });

      expect(next.currentNodeId).toBe('q2');
      expect(next.history).toEqual([
        { nodeId: 'root', question: 'Is it core?', answer: 'no' },
      ]);
    });
  });

  describe('RESTART action', () => {
    it('resets to initial state from a mid-flow position', () => {
      const state = {
        ...createInitialState(testTree),
        currentNodeId: 'resultC',
        history: [
          { nodeId: 'root', question: 'Is it core?', answer: 'no' },
          { nodeId: 'q2', question: 'Is it static?', answer: 'no' },
        ],
      };
      const next = wizardReducer(state, { type: 'RESTART' });

      expect(next.currentNodeId).toBe('root');
      expect(next.history).toEqual([]);
      expect(next.tree).toBe(testTree);
    });

    it('is a no-op when already at initial state', () => {
      const state = createInitialState(testTree);
      const next = wizardReducer(state, { type: 'RESTART' });

      expect(next.currentNodeId).toBe('root');
      expect(next.history).toEqual([]);
    });
  });

  describe('JUMP_TO action', () => {
    it('truncates history and sets currentNodeId to the target of the step', () => {
      const state = {
        ...createInitialState(testTree),
        currentNodeId: 'resultC',
        history: [
          { nodeId: 'root', question: 'Is it core?', answer: 'no' },
          { nodeId: 'q2', question: 'Is it static?', answer: 'no' },
        ],
      };
      // Jump to step 0: the answer at step 0 was 'no' on 'root', which leads to 'q2'
      const next = wizardReducer(state, { type: 'JUMP_TO', stepIndex: 0 });

      expect(next.currentNodeId).toBe('q2');
      expect(next.history).toEqual([]);
    });

    it('truncates to the correct position for middle steps', () => {
      // Build a deeper tree for this test
      const deepTree = {
        id: 'deep',
        title: 'Deep Tree',
        rootId: 'n1',
        nodes: {
          n1: { id: 'n1', type: 'decision', question: 'Q1?', yes: 'n2', no: 'r1' },
          n2: { id: 'n2', type: 'decision', question: 'Q2?', yes: 'n3', no: 'r2' },
          n3: { id: 'n3', type: 'decision', question: 'Q3?', yes: 'r3', no: 'r4' },
          r1: { id: 'r1', type: 'result', category: 'R1', description: '' },
          r2: { id: 'r2', type: 'result', category: 'R2', description: '' },
          r3: { id: 'r3', type: 'result', category: 'R3', description: '' },
          r4: { id: 'r4', type: 'result', category: 'R4', description: '' },
        },
      };

      const state = {
        ...createInitialState(deepTree),
        currentNodeId: 'r3',
        history: [
          { nodeId: 'n1', question: 'Q1?', answer: 'yes' },
          { nodeId: 'n2', question: 'Q2?', answer: 'yes' },
          { nodeId: 'n3', question: 'Q3?', answer: 'yes' },
        ],
      };

      // Jump to step 1: answer at step 1 was 'yes' on 'n2', target is 'n3'
      const next = wizardReducer(state, { type: 'JUMP_TO', stepIndex: 1 });

      expect(next.currentNodeId).toBe('n3');
      expect(next.history).toEqual([
        { nodeId: 'n1', question: 'Q1?', answer: 'yes' },
      ]);
    });

    it('ignores JUMP_TO with negative stepIndex', () => {
      const state = {
        ...createInitialState(testTree),
        currentNodeId: 'q2',
        history: [{ nodeId: 'root', question: 'Is it core?', answer: 'no' }],
      };
      const next = wizardReducer(state, { type: 'JUMP_TO', stepIndex: -1 });

      expect(next).toBe(state);
    });

    it('ignores JUMP_TO with stepIndex >= history.length', () => {
      const state = {
        ...createInitialState(testTree),
        currentNodeId: 'q2',
        history: [{ nodeId: 'root', question: 'Is it core?', answer: 'no' }],
      };
      const next = wizardReducer(state, { type: 'JUMP_TO', stepIndex: 1 });

      expect(next).toBe(state);
    });

    it('ignores JUMP_TO when history is empty', () => {
      const state = createInitialState(testTree);
      const next = wizardReducer(state, { type: 'JUMP_TO', stepIndex: 0 });

      expect(next).toBe(state);
    });
  });

  describe('unknown action', () => {
    it('returns state unchanged for unknown action types', () => {
      const state = createInitialState(testTree);
      const next = wizardReducer(state, { type: 'UNKNOWN_ACTION' });

      expect(next).toBe(state);
    });
  });
});
