import React from 'react';

/**
 * Breadcrumb-style progress trail showing the sequence of answered questions.
 * Each step is clickable to jump back to that point in the decision flow.
 *
 * @param {Object} props
 * @param {Array<{nodeId: string, question: string, answer: 'yes' | 'no'}>} props.path - History of visited nodes with answers
 * @param {function} props.onJumpTo - Callback: (stepIndex: number) => void
 */
export default function ProgressIndicator({ path, onJumpTo }) {
  if (!path || path.length === 0) {
    return null;
  }

  return (
    <nav className="progress-indicator" aria-label="Progresso da árvore de decisão">
      {path.map(function (entry, index) {
        var truncatedQuestion =
          entry.question.length > 40
            ? entry.question.substring(0, 40) + '…'
            : entry.question;
        var answerLabel = entry.answer === 'yes' ? 'Sim' : 'Não';
        var stepNumber = index + 1;

        return (
          <React.Fragment key={entry.nodeId + '-' + index}>
            {index > 0 && (
              <span className="progress-indicator__separator" aria-hidden="true">
                →
              </span>
            )}
            <button
              className="progress-indicator__step"
              type="button"
              onClick={function () {
                onJumpTo(index);
              }}
              aria-label={'Voltar ao passo ' + stepNumber + ': ' + entry.question}
            >
              <span className="progress-indicator__step-question">
                {truncatedQuestion}
              </span>
              <span className="progress-indicator__step-answer">{answerLabel}</span>
            </button>
          </React.Fragment>
        );
      })}
    </nav>
  );
}
