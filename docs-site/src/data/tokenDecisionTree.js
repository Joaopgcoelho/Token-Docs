/**
 * Token Decision Tree — Árvore de Decisão de Tokens (v2)
 *
 * Fluxo refinado baseado nas regras do ai-instructions.md e Decision Engine.
 * Organizado em duas fases:
 *   Fase 1 — Escolher o GRUPO semântico (comportamento do elemento)
 *   Fase 2 — Escolher o PAPEL (role) do token (propriedade CSS alvo)
 *
 * Fonte de verdade: ai-instructions.md seções 4 e 6
 *
 * @type {import('../components/decision-wizard/validateTree').TreeDefinition}
 */
const tokenDecisionTree = {
  id: 'token-decision-tree',
  title: 'Árvore de Decisão de Tokens',
  rootId: 'q-start',
  nodes: {

    // ═══════════════════════════════════════════════════════════════════
    // FASE 1 — CLASSIFICAÇÃO DO GRUPO (comportamento do elemento)
    // ═══════════════════════════════════════════════════════════════════

    'q-start': {
      type: 'decision',
      id: 'q-start',
      question: 'O elemento que você está estilizando é um componente de UI (botão, card, input, tab, etc.)?',
      yes: 'q-coleta-dados',
      no: 'q-texto-pagina',
    },

    // ─── Caminho NÃO é componente de UI ──────────────────────────────
    'q-texto-pagina': {
      type: 'decision',
      id: 'q-texto-pagina',
      question: 'É um elemento de página global (texto do body, link inline, ícone decorativo, borda divisória ou fundo da aplicação)?',
      yes: 'result-core',
      no: 'q-elevation',
    },

    'q-elevation': {
      type: 'decision',
      id: 'q-elevation',
      question: 'É uma sombra ou elevação (box-shadow para dropdown, modal, popover, tooltip)?',
      yes: 'result-elevation',
      no: 'error-not-component',
    },

    // ─── Caminho É componente de UI ──────────────────────────────────
    'q-coleta-dados': {
      type: 'decision',
      id: 'q-coleta-dados',
      question: 'O elemento coleta dados do usuário (input, textarea, select, checkbox, radio, switch, date picker)?',
      yes: 'result-inputable',
      no: 'q-altera-navegacao',
    },

    'q-altera-navegacao': {
      type: 'decision',
      id: 'q-altera-navegacao',
      question: 'O elemento dispara uma ação que altera a navegação (submit, link para outra página, CTA, ação destrutiva)?',
      yes: 'result-dynamic',
      no: 'q-interacao-local',
    },

    'q-interacao-local': {
      type: 'decision',
      id: 'q-interacao-local',
      question: 'O elemento responde a interação do usuário sem mudar de página (accordion, tab, tooltip, dropdown, toggle)?',
      yes: 'result-interactive',
      no: 'q-visual-sem-interacao',
    },

    'q-visual-sem-interacao': {
      type: 'decision',
      id: 'q-visual-sem-interacao',
      question: 'O elemento é visual/informativo sem interação direta (card, banner, alerta, tag, divisor, seção informativa)?',
      yes: 'result-static',
      no: 'error-review-group',
    },

    // ═══════════════════════════════════════════════════════════════════
    // RESULTADOS — GRUPO + orientação de Role
    // ═══════════════════════════════════════════════════════════════════

    'result-core': {
      type: 'result',
      id: 'result-core',
      category: 'Core',
      description:
        'Tokens fundamentais do sistema visual. Use para fundo da aplicação (Core/Surface/Default), texto do body (Core/On Surface/Text/Primary), links inline (Core/On Surface/Link/Default), ícones decorativos (Core/On Surface/Icon/Primary) e bordas divisórias (Core/On Surface/Border/Divider). Nunca use Core diretamente em componentes de UI — prefira os grupos semânticos (Dynamic, Interactive, Static, Inputable).',
      subCategories: [
        'Surface/Default — fundo da página',
        'Surface/Inverse — fundo escuro',
        'On Surface/Text/Primary — texto principal',
        'On Surface/Text/Secondary — texto secundário',
        'On Surface/Text/Brand — texto de marca',
        'On Surface/Link/Default — link',
        'On Surface/Icon/Primary — ícone',
        'On Surface/Border/Divider — divisor',
        'On Surface/Border/Focus — anel de foco',
      ],
    },

    'result-elevation': {
      type: 'result',
      id: 'result-elevation',
      category: 'Elevation',
      description:
        'Tokens de sombra e elevação para superfícies flutuantes. Cada nível aumenta a elevação visual. Use Level1 para cards e dropdowns, Level2 para popovers e tooltips, Level3 para modais e diálogos, Level4 para overlays críticos.',
      subCategories: [
        'Level1 — sutil (cards, dropdowns)',
        'Level2 — médio (popovers, tooltips)',
        'Level3 — alto (modais, diálogos)',
        'Level4 — máximo (overlays críticos)',
      ],
    },

    'result-inputable': {
      type: 'result',
      id: 'result-inputable',
      category: 'Inputable',
      description:
        'Tokens para elementos de coleta de dados. Subdivide-se em Field (campos de texto/valor) e Selectable (checkbox, radio, switch). Cada subtipo tem roles Surface, On Surface e Border, com feedbacks Neutral, Critical e Success. Nunca use Inputable para botões de submit — use Dynamic.',
      subCategories: [
        'Field/Neutral — campo padrão',
        'Field/Critical — campo com erro',
        'Field/Success — campo validado',
        'Selectable/Neutral — checkbox/radio padrão',
        'Selectable/Critical — seleção com erro',
      ],
    },

    'result-dynamic': {
      type: 'result',
      id: 'result-dynamic',
      category: 'Dynamic',
      description:
        'Tokens para ações que alteram a navegação ou submetem dados. Cada hierarquia tem Surface (fundo) e On Surface (texto/ícone) com estados Default, Hover, Pressed e Loading. Regra: máximo 1 Primary por área visível. Ações destrutivas sempre usam Critical.',
      subCategories: [
        'Primary — ação principal (CTA, submit)',
        'Secondary — ação alternativa (cancelar)',
        'Critical — ação destrutiva (excluir)',
        'Ghost — sem fundo visível (link-button)',
        'Highlight — destaque especial (promoção)',
        'Disabled — estado desabilitado',
      ],
    },

    'result-interactive': {
      type: 'result',
      id: 'result-interactive',
      category: 'Interactive',
      description:
        'Tokens para interações locais que não mudam de página. Tem Surface, On Surface e Border com estados Default, Hover e Active. Feedbacks (Critical, Warning, Success, Info) são usados para indicar status dentro do componente.',
      subCategories: [
        'Primary — destaque principal (tab ativa)',
        'Secondary — destaque secundário',
        'Tertiary — terceiro nível',
        'Neutral — padrão (accordion, dropdown)',
        'Highlight — destaque especial',
        'Critical — feedback de erro',
        'Warning — feedback de aviso',
        'Success — feedback de sucesso',
        'Info — feedback informativo',
      ],
    },

    'result-static': {
      type: 'result',
      id: 'result-static',
      category: 'Static',
      description:
        'Tokens para composição visual sem interação. Único grupo que usa Container/On Container além de Surface/On Surface. Surface tem intensidades (Highest → Lowest). Container tem tipos (Neutral, Highlight-High, Highlight-Low, Outline-High, Outline-Low). Nunca use Static em elementos clicáveis.',
      subCategories: [
        'Primary — conteúdo genérico (card)',
        'Secondary — conteúdo secundário',
        'Neutral — estrutura neutra',
        'Critical — alerta de erro',
        'Success — alerta de sucesso',
        'Warning — alerta de aviso',
        'Info — informativo',
        'AI — conteúdo de IA',
      ],
    },

    // ═══════════════════════════════════════════════════════════════════
    // ERROR NODES
    // ═══════════════════════════════════════════════════════════════════

    'error-not-component': {
      type: 'error',
      id: 'error-not-component',
      message:
        'O elemento não se encaixa em nenhuma categoria conhecida. Verifique se é realmente um elemento de interface. Se for um token de marca (Brand), lembre-se que Brand tokens são apenas referência — use sempre Usage tokens na UI.',
    },

    'error-review-group': {
      type: 'error',
      id: 'error-review-group',
      message:
        'Não foi possível classificar o elemento. Dica: todo componente de UI se encaixa em uma destas categorias — coleta dados (Inputable), altera navegação (Dynamic), responde a interação local (Interactive) ou é visual sem interação (Static). Tente recomeçar analisando o comportamento principal do elemento.',
    },
  },
};

export default tokenDecisionTree;
