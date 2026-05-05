import React from 'react';
import LfHeading from '@lift/ds-web/components/LfHeading/';
import LfParagraph from '@lift/ds-web/components/LfParagraph/';
import DecisionWizard from '../components/decision-wizard/DecisionWizard';
import tokenDecisionTree from '../data/tokenDecisionTree';
import { validateTree } from '../components/decision-wizard/validateTree';

var treeValidation = validateTree(tokenDecisionTree);

export default function DecisionTreeSection() {
  if (!treeValidation.valid) {
    return (
      <div>
        <LfHeading as="h1">Árvore de Decisão</LfHeading>
        <p className="subtitle">
          Fluxo interativo para determinar o grupo de tokens correto para cada elemento.
        </p>
        <LfParagraph>
          A árvore de decisão contém erros estruturais e não pode ser exibida. Verifique a
          configuração dos dados.
        </LfParagraph>
      </div>
    );
  }

  return (
    <div>
      <LfHeading as="h1">Árvore de Decisão</LfHeading>
      <p className="subtitle">
        Fluxo interativo para determinar o grupo de tokens correto para cada elemento.
      </p>

      <LfParagraph>
        Responda às perguntas abaixo para descobrir qual categoria de token usar no seu elemento de
        interface.
      </LfParagraph>

      <DecisionWizard tree={tokenDecisionTree} />
    </div>
  );
}
