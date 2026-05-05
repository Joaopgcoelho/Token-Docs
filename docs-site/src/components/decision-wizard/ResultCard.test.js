import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import ResultCard from './ResultCard.jsx';

/**
 * ResultCard is a presentational React component. Since the test environment
 * is node (no DOM), we test the returned React element tree directly.
 */

const sampleResultNode = {
  id: 'result-dynamic',
  type: 'result',
  category: 'Tokens Dinâmicos',
  description: 'Tokens para ações que alteram a navegação.',
  subCategories: ['Primary', 'Secondary', 'Ghost'],
};

const sampleResultNodeNoSubs = {
  id: 'result-core',
  type: 'result',
  category: 'Tokens Core',
  description: 'Tokens fundamentais que definem o sistema visual base.',
};

const sampleErrorNode = {
  id: 'error-review',
  type: 'error',
  message: 'Talvez você deveria rever o entendimento de aplicação do seu token.',
};

const samplePath = [
  { nodeId: 'q1', question: 'Pergunta 1?', answer: 'yes' },
  { nodeId: 'q2', question: 'Pergunta 2?', answer: 'no' },
];

describe('ResultCard — result type', () => {
  it('returns a React element with className "result-card"', () => {
    const rendered = ResultCard({
      node: sampleResultNode,
      path: samplePath,
      onRestart: () => {},
      type: 'result',
    });

    expect(rendered.props.className).toBe('result-card');
  });

  it('displays the category name with LfHeading as="h2" (Req 5.1)', () => {
    const rendered = ResultCard({
      node: sampleResultNode,
      path: samplePath,
      onRestart: () => {},
      type: 'result',
    });

    const categoryDiv = rendered.props.children[0];
    expect(categoryDiv.props.className).toBe('result-card__category');
    const heading = categoryDiv.props.children;
    expect(heading.props.as).toBe('h2');
    expect(heading.props.children).toBe('Tokens Dinâmicos');
  });

  it('displays the category description with LfParagraph (Req 5.2)', () => {
    const rendered = ResultCard({
      node: sampleResultNode,
      path: samplePath,
      onRestart: () => {},
      type: 'result',
    });

    const descDiv = rendered.props.children[1];
    expect(descDiv.props.className).toBe('result-card__description');
    const paragraph = descDiv.props.children;
    expect(paragraph.props.children).toBe('Tokens para ações que alteram a navegação.');
  });

  it('displays sub-categories as badges when present (Req 5.5)', () => {
    const rendered = ResultCard({
      node: sampleResultNode,
      path: samplePath,
      onRestart: () => {},
      type: 'result',
    });

    const subCatsDiv = rendered.props.children[2];
    expect(subCatsDiv.props.className).toBe('result-card__subcategories');

    const badgeList = subCatsDiv.props.children[1];
    expect(badgeList.props.className).toBe('result-card__subcategories-list');

    const badges = badgeList.props.children;
    expect(badges).toHaveLength(3);
    expect(badges[0].props.children).toBe('Primary');
    expect(badges[1].props.children).toBe('Secondary');
    expect(badges[2].props.children).toBe('Ghost');
    badges.forEach(function (badge) {
      expect(badge.props.className).toBe('result-card__subcategory-badge');
    });
  });

  it('does not render sub-categories section when none present', () => {
    const rendered = ResultCard({
      node: sampleResultNodeNoSubs,
      path: samplePath,
      onRestart: () => {},
      type: 'result',
    });

    // children: [category, description, false (no subcats), path, restart]
    const subCatsSlot = rendered.props.children[2];
    expect(subCatsSlot).toBeFalsy();
  });

  it('displays the path summary with questions and answers (Req 5.3)', () => {
    const rendered = ResultCard({
      node: sampleResultNodeNoSubs,
      path: samplePath,
      onRestart: () => {},
      type: 'result',
    });

    const pathDiv = rendered.props.children[3];
    expect(pathDiv.props.className).toBe('result-card__path');

    const pathList = pathDiv.props.children[1];
    expect(pathList.props.className).toBe('result-card__path-list');

    const steps = pathList.props.children;
    expect(steps).toHaveLength(2);

    // First step: "Pergunta 1?" → "Sim"
    const step1Children = steps[0].props.children;
    expect(step1Children[0].props.children).toBe('Pergunta 1?');
    expect(step1Children[1].props.children).toBe(' → ');
    expect(step1Children[2].props.children).toBe('Sim');

    // Second step: "Pergunta 2?" → "Não"
    const step2Children = steps[1].props.children;
    expect(step2Children[0].props.children).toBe('Pergunta 2?');
    expect(step2Children[2].props.children).toBe('Não');
  });

  it('displays a restart button with text "↺ Recomeçar" (Req 5.4)', () => {
    const rendered = ResultCard({
      node: sampleResultNodeNoSubs,
      path: samplePath,
      onRestart: () => {},
      type: 'result',
    });

    const restartBtn = rendered.props.children[4];
    expect(restartBtn.props.className).toBe('result-card__restart');
    expect(restartBtn.props.children).toBe('↺ Recomeçar');
    expect(restartBtn.props['aria-label']).toBe('Recomeçar');
  });

  it('calls onRestart when restart button onClick fires', () => {
    const onRestart = vi.fn();
    const rendered = ResultCard({
      node: sampleResultNodeNoSubs,
      path: samplePath,
      onRestart,
      type: 'result',
    });

    const restartBtn = rendered.props.children[4];
    restartBtn.props.onClick();

    expect(onRestart).toHaveBeenCalled();
  });
});

describe('ResultCard — error type (Req 2.5)', () => {
  it('returns a React element with error modifier class', () => {
    const rendered = ResultCard({
      node: sampleErrorNode,
      path: [],
      onRestart: () => {},
      type: 'error',
    });

    expect(rendered.props.className).toBe('result-card result-card--error');
  });

  it('displays a warning heading', () => {
    const rendered = ResultCard({
      node: sampleErrorNode,
      path: [],
      onRestart: () => {},
      type: 'error',
    });

    const categoryDiv = rendered.props.children[0];
    expect(categoryDiv.props.className).toBe('result-card__category');
    const heading = categoryDiv.props.children;
    expect(heading.props.as).toBe('h2');
    expect(heading.props.children).toBe('Caminho não reconhecido');
  });

  it('displays the error message', () => {
    const rendered = ResultCard({
      node: sampleErrorNode,
      path: [],
      onRestart: () => {},
      type: 'error',
    });

    const descDiv = rendered.props.children[1];
    expect(descDiv.props.className).toBe('result-card__description');
    const paragraph = descDiv.props.children;
    expect(paragraph.props.children).toBe(
      'Talvez você deveria rever o entendimento de aplicação do seu token.'
    );
  });

  it('displays a restart button', () => {
    const rendered = ResultCard({
      node: sampleErrorNode,
      path: [],
      onRestart: () => {},
      type: 'error',
    });

    const restartBtn = rendered.props.children[2];
    expect(restartBtn.props.className).toBe('result-card__restart');
    expect(restartBtn.props.children).toBe('↺ Recomeçar');
  });

  it('calls onRestart when error restart button onClick fires', () => {
    const onRestart = vi.fn();
    const rendered = ResultCard({
      node: sampleErrorNode,
      path: [],
      onRestart,
      type: 'error',
    });

    const restartBtn = rendered.props.children[2];
    restartBtn.props.onClick();

    expect(onRestart).toHaveBeenCalled();
  });
});
