import React, { useReducer, useEffect } from 'react';
import { wizardReducer, createInitialState } from './wizardReducer';
import QuestionCard from './QuestionCard';
import ResultCard from './ResultCard';
import ProgressIndicator from './ProgressIndicator';

/**
 * Generic, reusable decision-tree wizard.
 * Renders any valid TreeDefinition — all domain knowledge lives in the tree,
 * not in this component.
 *
 * @param {Object} props
 * @param {import('./validateTree').TreeDefinition} props.tree - The decision tree data structure
 * @param {function} [props.onResult] - Callback when a Result_Node is reached: (resultNode, path) => void
 * @param {function} [props.onRestart] - Callback when the user restarts the flow: () => void
 */
export default function DecisionWizard({ tree, onResult, onRestart }) {
  // Handle null/undefined tree prop with a fallback error message
  if (!tree) {
    return (
      <div className="decision-wizard decision-wizard--error">
        <p>Nenhuma árvore de decisão foi fornecida. Verifique a configuração.</p>
      </div>
    );
  }

  var [state, dispatch] = useReducer(wizardReducer, tree, createInitialState);

  var currentNode = state.tree.nodes[state.currentNodeId];

  // Call onResult when a result node is reached
  useEffect(
    function () {
      if (currentNode && currentNode.type === 'result' && onResult) {
        onResult(currentNode, state.history);
      }
    },
    [state.currentNodeId]
  );

  function handleAnswer(answer) {
    dispatch({ type: 'ANSWER', answer: answer });
  }

  function handleBack() {
    dispatch({ type: 'BACK' });
  }

  function handleRestart() {
    dispatch({ type: 'RESTART' });
    if (onRestart) {
      onRestart();
    }
  }

  function handleJumpTo(stepIndex) {
    dispatch({ type: 'JUMP_TO', stepIndex: stepIndex });
  }

  return (
    <div className="decision-wizard">
      <ProgressIndicator path={state.history} onJumpTo={handleJumpTo} />

      {currentNode && currentNode.type === 'decision' && (
        <QuestionCard
          node={currentNode}
          onAnswer={handleAnswer}
          onBack={handleBack}
          canGoBack={state.history.length > 0}
        />
      )}

      {currentNode && currentNode.type === 'result' && (
        <ResultCard
          node={currentNode}
          path={state.history}
          onRestart={handleRestart}
          type="result"
        />
      )}

      {currentNode && currentNode.type === 'error' && (
        <ResultCard
          node={currentNode}
          path={state.history}
          onRestart={handleRestart}
          type="error"
        />
      )}
    </div>
  );
}
