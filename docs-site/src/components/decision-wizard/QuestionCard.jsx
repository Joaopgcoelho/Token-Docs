import React from 'react';
import LfHeading from '@lift/ds-web/components/LfHeading/';
import LfParagraph from '@lift/ds-web/components/LfParagraph/';

/**
 * Renders a single decision node as a card with the question text,
 * "Sim" / "Não" answer buttons, and a back button.
 *
 * @param {Object} props
 * @param {import('./validateTree').DecisionNode} props.node - The current decision node
 * @param {function} props.onAnswer - Callback: (answer: 'yes' | 'no') => void
 * @param {function} props.onBack - Callback for back navigation
 * @param {boolean} props.canGoBack - Whether back button should be enabled
 */
export default function QuestionCard({ node, onAnswer, onBack, canGoBack }) {
  return (
    <div className="question-card">
      <div className="question-card__question">
        <LfHeading as="h3">{node.question}</LfHeading>
      </div>

      <div className="question-card__actions">
        <button
          className="question-card__btn-yes"
          type="button"
          onClick={() => onAnswer('yes')}
          aria-label="Sim"
        >
          Sim
        </button>
        <button
          className="question-card__btn-no"
          type="button"
          onClick={() => onAnswer('no')}
          aria-label="Não"
        >
          Não
        </button>
      </div>

      <button
        className="question-card__back"
        type="button"
        onClick={onBack}
        disabled={!canGoBack}
        aria-label="Voltar à pergunta anterior"
      >
        ← Voltar
      </button>
    </div>
  );
}
