import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import QuestionCard from './QuestionCard.jsx';

/**
 * QuestionCard is a presentational React component. Since the test environment
 * is node (no DOM), we test the returned React element tree directly.
 */

const sampleNode = {
  id: 'q1',
  type: 'decision',
  question: 'O elemento é um componente de UI?',
  yes: 'q2',
  no: 'r1',
};

describe('QuestionCard', () => {
  it('returns a React element with className "question-card"', () => {
    const el = React.createElement(QuestionCard, {
      node: sampleNode,
      onAnswer: () => {},
      onBack: () => {},
      canGoBack: false,
    });

    // QuestionCard is a function component — call it to get the vdom
    const rendered = QuestionCard({
      node: sampleNode,
      onAnswer: () => {},
      onBack: () => {},
      canGoBack: false,
    });

    expect(rendered.props.className).toBe('question-card');
  });

  it('renders the question text inside the question section', () => {
    const rendered = QuestionCard({
      node: sampleNode,
      onAnswer: () => {},
      onBack: () => {},
      canGoBack: false,
    });

    // The first child is the question div
    const questionDiv = rendered.props.children[0];
    expect(questionDiv.props.className).toBe('question-card__question');

    // Inside the question div is an LfHeading with the question text
    const heading = questionDiv.props.children;
    expect(heading.props.as).toBe('h3');
    expect(heading.props.children).toBe('O elemento é um componente de UI?');
  });

  it('renders Sim and Não buttons in the actions section', () => {
    const rendered = QuestionCard({
      node: sampleNode,
      onAnswer: () => {},
      onBack: () => {},
      canGoBack: false,
    });

    const actionsDiv = rendered.props.children[1];
    expect(actionsDiv.props.className).toBe('question-card__actions');

    const [simBtn, naoBtn] = actionsDiv.props.children;
    expect(simBtn.props.className).toBe('question-card__btn-yes');
    expect(simBtn.props.children).toBe('Sim');
    expect(naoBtn.props.className).toBe('question-card__btn-no');
    expect(naoBtn.props.children).toBe('Não');
  });

  it('calls onAnswer with "yes" when Sim button onClick fires', () => {
    const onAnswer = vi.fn();
    const rendered = QuestionCard({
      node: sampleNode,
      onAnswer,
      onBack: () => {},
      canGoBack: false,
    });

    const actionsDiv = rendered.props.children[1];
    const simBtn = actionsDiv.props.children[0];
    simBtn.props.onClick();

    expect(onAnswer).toHaveBeenCalledWith('yes');
  });

  it('calls onAnswer with "no" when Não button onClick fires', () => {
    const onAnswer = vi.fn();
    const rendered = QuestionCard({
      node: sampleNode,
      onAnswer,
      onBack: () => {},
      canGoBack: false,
    });

    const actionsDiv = rendered.props.children[1];
    const naoBtn = actionsDiv.props.children[1];
    naoBtn.props.onClick();

    expect(onAnswer).toHaveBeenCalledWith('no');
  });

  it('renders back button disabled when canGoBack is false', () => {
    const rendered = QuestionCard({
      node: sampleNode,
      onAnswer: () => {},
      onBack: () => {},
      canGoBack: false,
    });

    const backBtn = rendered.props.children[2];
    expect(backBtn.props.className).toBe('question-card__back');
    expect(backBtn.props.disabled).toBe(true);
    expect(backBtn.props.children).toBe('← Voltar');
  });

  it('renders back button enabled when canGoBack is true', () => {
    const rendered = QuestionCard({
      node: sampleNode,
      onAnswer: () => {},
      onBack: () => {},
      canGoBack: true,
    });

    const backBtn = rendered.props.children[2];
    expect(backBtn.props.disabled).toBe(false);
  });

  it('calls onBack when back button onClick fires', () => {
    const onBack = vi.fn();
    const rendered = QuestionCard({
      node: sampleNode,
      onAnswer: () => {},
      onBack,
      canGoBack: true,
    });

    const backBtn = rendered.props.children[2];
    backBtn.props.onClick();

    expect(onBack).toHaveBeenCalled();
  });

  it('has aria-label on answer buttons for accessibility', () => {
    const rendered = QuestionCard({
      node: sampleNode,
      onAnswer: () => {},
      onBack: () => {},
      canGoBack: false,
    });

    const actionsDiv = rendered.props.children[1];
    const [simBtn, naoBtn] = actionsDiv.props.children;
    expect(simBtn.props['aria-label']).toBe('Sim');
    expect(naoBtn.props['aria-label']).toBe('Não');
  });

  it('has aria-label on back button for accessibility', () => {
    const rendered = QuestionCard({
      node: sampleNode,
      onAnswer: () => {},
      onBack: () => {},
      canGoBack: false,
    });

    const backBtn = rendered.props.children[2];
    expect(backBtn.props['aria-label']).toBe('Voltar à pergunta anterior');
  });
});
