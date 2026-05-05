import React from 'react';
import LfHeading from '@lift/ds-web/components/LfHeading/';
import LfParagraph from '@lift/ds-web/components/LfParagraph/';

/**
 * Renders the terminal node of the decision wizard — either a result
 * (token category recommendation) or an error (unrecognised path).
 *
 * @param {Object} props
 * @param {import('./validateTree').ResultNode | import('./validateTree').ErrorNode} props.node - The terminal node
 * @param {Array<{nodeId: string, question: string, answer: 'yes' | 'no'}>} props.path - History of questions and answers
 * @param {function} props.onRestart - Callback to restart the flow
 * @param {'result' | 'error'} props.type - Node type
 */
export default function ResultCard({ node, path, onRestart, type }) {
  if (type === 'error') {
    return (
      <div className="result-card result-card--error">
        <div className="result-card__category">
          <LfHeading as="h2">Caminho não reconhecido</LfHeading>
        </div>

        <div className="result-card__description">
          <LfParagraph>{node.message}</LfParagraph>
        </div>

        <button
          className="result-card__restart"
          type="button"
          onClick={onRestart}
          aria-label="Recomeçar"
        >
          ↺ Recomeçar
        </button>
      </div>
    );
  }

  return (
    <div className="result-card">
      <div className="result-card__category">
        <LfHeading as="h2">{node.category}</LfHeading>
      </div>

      <div className="result-card__description">
        <LfParagraph>{node.description}</LfParagraph>
      </div>

      {node.subCategories && node.subCategories.length > 0 && (
        <div className="result-card__subcategories">
          <LfHeading as="h3">Sub-categorias</LfHeading>
          <div className="result-card__subcategories-list">
            {node.subCategories.map(function (sub) {
              return (
                <span key={sub} className="result-card__subcategory-badge">
                  {sub}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {path && path.length > 0 && (
        <div className="result-card__path">
          <LfHeading as="h3">Caminho percorrido</LfHeading>
          <ol className="result-card__path-list">
            {path.map(function (entry, index) {
              return (
                <li key={entry.nodeId + '-' + index} className="result-card__path-step">
                  <span className="result-card__path-question">{entry.question}</span>
                  <span className="result-card__path-separator"> → </span>
                  <span className="result-card__path-answer">
                    {entry.answer === 'yes' ? 'Sim' : 'Não'}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      )}

      <button
        className="result-card__restart"
        type="button"
        onClick={onRestart}
        aria-label="Recomeçar"
      >
        ↺ Recomeçar
      </button>
    </div>
  );
}
