import { describe, it, expect } from 'vitest';
import tokenDecisionTree from './tokenDecisionTree.js';
import { validateTree } from '../components/decision-wizard/validateTree.js';

describe('tokenDecisionTree', () => {
  it('passes validateTree structural integrity check', () => {
    const result = validateTree(tokenDecisionTree);
    expect(result).toEqual({ valid: true, errors: [] });
  });

  it('exports as a default export with required fields', () => {
    expect(tokenDecisionTree).toBeDefined();
    expect(tokenDecisionTree.id).toBe('token-decision-tree');
    expect(tokenDecisionTree.title).toBe('Árvore de Decisão de Tokens');
    expect(typeof tokenDecisionTree.rootId).toBe('string');
    expect(typeof tokenDecisionTree.nodes).toBe('object');
  });

  it('contains all expected token category result nodes', () => {
    const resultNodes = Object.values(tokenDecisionTree.nodes).filter(
      (n) => n.type === 'result'
    );
    const categories = resultNodes.map((n) => n.category);

    expect(categories).toContain('Core');
    expect(categories).toContain('Elevation');
    expect(categories).toContain('Inputable');
    expect(categories).toContain('Dynamic');
    expect(categories).toContain('Interactive');
    expect(categories).toContain('Static');
  });

  it('has sub-categories on all result nodes', () => {
    const resultNodes = Object.values(tokenDecisionTree.nodes).filter(
      (n) => n.type === 'result'
    );

    for (const node of resultNodes) {
      expect(node.subCategories).toBeDefined();
      expect(node.subCategories.length).toBeGreaterThan(0);
    }
  });

  it('all result nodes have a non-empty description', () => {
    const resultNodes = Object.values(tokenDecisionTree.nodes).filter(
      (n) => n.type === 'result'
    );

    for (const node of resultNodes) {
      expect(node.description).toBeTruthy();
      expect(typeof node.description).toBe('string');
      expect(node.description.length).toBeGreaterThan(0);
    }
  });

  it('all error nodes have a non-empty message', () => {
    const errorNodes = Object.values(tokenDecisionTree.nodes).filter(
      (n) => n.type === 'error'
    );

    expect(errorNodes.length).toBeGreaterThan(0);

    for (const node of errorNodes) {
      expect(node.message).toBeTruthy();
      expect(typeof node.message).toBe('string');
      expect(node.message.length).toBeGreaterThan(0);
    }
  });

  it('root node is a decision node', () => {
    const root = tokenDecisionTree.nodes[tokenDecisionTree.rootId];
    expect(root).toBeDefined();
    expect(root.type).toBe('decision');
  });

  it('follows the correct decision flow for a submit button (Dynamic)', () => {
    const nodes = tokenDecisionTree.nodes;
    // Start → "É componente de UI?" → Sim
    const start = nodes[tokenDecisionTree.rootId];
    expect(start.question).toContain('componente de UI');

    // → "Coleta dados?" → Não
    const coletaDados = nodes[start.yes];
    expect(coletaDados.question).toContain('coleta dados');

    // → "Altera navegação?" → Sim → Dynamic
    const alteraNav = nodes[coletaDados.no];
    expect(alteraNav.question).toContain('altera a navegação');

    const dynamic = nodes[alteraNav.yes];
    expect(dynamic.type).toBe('result');
    expect(dynamic.category).toBe('Dynamic');
  });

  it('follows the correct decision flow for page text (Core)', () => {
    const nodes = tokenDecisionTree.nodes;
    // Start → "É componente de UI?" → Não
    const start = nodes[tokenDecisionTree.rootId];
    const textoPagina = nodes[start.no];
    expect(textoPagina.question).toContain('elemento de página global');

    // → "É elemento de página global?" → Sim → Core
    const core = nodes[textoPagina.yes];
    expect(core.type).toBe('result');
    expect(core.category).toBe('Core');
  });

  it('follows the correct decision flow for a card (Static)', () => {
    const nodes = tokenDecisionTree.nodes;
    // Start → Sim → Coleta dados? → Não → Altera navegação? → Não → Interação local? → Não → Visual sem interação? → Sim → Static
    const start = nodes[tokenDecisionTree.rootId];
    const coletaDados = nodes[start.yes];
    const alteraNav = nodes[coletaDados.no];
    const interacao = nodes[alteraNav.no];
    expect(interacao.question).toContain('interação');

    const visual = nodes[interacao.no];
    expect(visual.question).toContain('visual');

    const staticResult = nodes[visual.yes];
    expect(staticResult.type).toBe('result');
    expect(staticResult.category).toBe('Static');
  });
});
