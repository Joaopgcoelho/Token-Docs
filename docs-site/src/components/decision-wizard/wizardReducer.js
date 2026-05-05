/**
 * Creates the initial FlowState for a given tree.
 *
 * @param {import('./types').TreeDefinition} tree
 * @returns {import('./types').FlowState}
 */
export function createInitialState(tree) {
  return {
    currentNodeId: tree.rootId,
    history: [],
    tree,
  };
}

/**
 * Pure reducer for the decision wizard state.
 *
 * Actions:
 * - { type: 'ANSWER', answer: 'yes' | 'no' }
 *     Advance to the next node via the selected edge. Appends the current
 *     decision node to history. Ignored if the current node is not a decision node.
 *
 * - { type: 'BACK' }
 *     Pop the last entry from history and restore currentNodeId to that entry's
 *     nodeId. Ignored if history is empty.
 *
 * - { type: 'RESTART' }
 *     Reset to initial state (currentNodeId = tree.rootId, history = []).
 *
 * - { type: 'JUMP_TO', stepIndex: number }
 *     Truncate history to stepIndex entries and set currentNodeId to the node
 *     that was navigated TO after that step's answer. Ignored if stepIndex is
 *     out of range.
 *
 * @param {import('./types').FlowState} state
 * @param {import('./types').WizardAction} action
 * @returns {import('./types').FlowState}
 */
export function wizardReducer(state, action) {
  switch (action.type) {
    case 'ANSWER': {
      const currentNode = state.tree.nodes[state.currentNodeId];

      // Ignore if current node is not a decision node
      if (!currentNode || currentNode.type !== 'decision') {
        return state;
      }

      const targetNodeId = currentNode[action.answer];

      return {
        ...state,
        currentNodeId: targetNodeId,
        history: [
          ...state.history,
          {
            nodeId: currentNode.id,
            question: currentNode.question,
            answer: action.answer,
          },
        ],
      };
    }

    case 'BACK': {
      // Ignore if history is empty
      if (state.history.length === 0) {
        return state;
      }

      const previousEntry = state.history[state.history.length - 1];

      return {
        ...state,
        currentNodeId: previousEntry.nodeId,
        history: state.history.slice(0, -1),
      };
    }

    case 'RESTART': {
      return {
        ...state,
        currentNodeId: state.tree.rootId,
        history: [],
      };
    }

    case 'JUMP_TO': {
      const { stepIndex } = action;

      // Ignore if stepIndex is out of range
      if (stepIndex < 0 || stepIndex >= state.history.length) {
        return state;
      }

      // The entry at stepIndex recorded which node was visited and what answer
      // was given. The target is the node that was navigated TO after that answer.
      const stepEntry = state.history[stepIndex];
      const stepNode = state.tree.nodes[stepEntry.nodeId];
      const targetNodeId = stepNode[stepEntry.answer];

      return {
        ...state,
        currentNodeId: targetNodeId,
        history: state.history.slice(0, stepIndex),
      };
    }

    default:
      return state;
  }
}
