import React from 'react';
import LfAlert from '@lift/ds-web/components/LfAlert/';
import LfHeading from '@lift/ds-web/components/LfHeading/';
import LfParagraph from '@lift/ds-web/components/LfParagraph/';

export default function DecisionEngine() {
  return (
    <div>
      <LfHeading as="h1">AI Decision Engine</LfHeading>
      <p className="subtitle">Regras determinísticas para consumo de tokens por IA — v2.1.1</p>

      <LfParagraph>
        Estas regras são projetadas para que uma IA (ou qualquer sistema automatizado) consiga
        selecionar o token correto de forma determinística, sem ambiguidade. Siga as regras em
        ordem — cada regra depende da anterior.
      </LfParagraph>

      <LfAlert variant="info">
        <strong>Regra Zero — Hierarquia de Consumo:</strong> 🥇 Componente @lift/ds-web → 🥈 Usage tokens → 🥉 Component tokens (último recurso). Nunca use Base ou Brand tokens em UI.
      </LfAlert>

      {/* ── Hierarquia de Consumo ── */}
      <LfHeading as="h2">Hierarquia de Consumo</LfHeading>
      <table>
        <thead>
          <tr><th>#</th><th>Camada</th><th>Quando</th><th>Quem</th></tr>
        </thead>
        <tbody>
          <tr><td>🥇</td><td>Componente <code>@lift/ds-web</code></td><td>Sempre que existir</td><td>Todos</td></tr>
          <tr><td>🥈</td><td>Usage tokens (<code>--lf-thm-*</code>)</td><td>UI manual sem componente DS</td><td>Todos</td></tr>
          <tr><td>🥉</td><td>Component tokens (<code>--lf-thm-component-*</code>)</td><td>Customizar componente DS existente</td><td>System Ops</td></tr>
          <tr><td>❌</td><td>Base (<code>LfBs*</code>) / Brand (<code>LfThmBrand*</code>)</td><td>NUNCA em runtime UI</td><td>—</td></tr>
        </tbody>
      </table>

      {/* ── Token Architecture ── */}
      <LfHeading as="h2">Token Architecture</LfHeading>
      <table>
        <thead>
          <tr><th>Layer</th><th>Prefix</th><th>UI</th><th>Purpose</th></tr>
        </thead>
        <tbody>
          <tr><td>Base</td><td><code>LfBs</code> / <code>--lf-bs-</code></td><td>❌</td><td>Raw primitives</td></tr>
          <tr><td>Brand</td><td><code>LfThmBrand</code> / <code>--lf-thm-brand-</code></td><td>❌</td><td>Brand palette (build-time)</td></tr>
          <tr><td>Usage</td><td><code>LfThm</code> / <code>--lf-thm-</code></td><td>✅</td><td>Semantic tokens</td></tr>
          <tr><td>Component</td><td><code>LfThm&#123;Comp&#125;</code> / <code>--lf-thm-component-</code></td><td>⚠️</td><td>Overrides (last resort)</td></tr>
        </tbody>
      </table>

      {/* ── Group Classification ── */}
      <LfHeading as="h2">Regra 2 — Classificação de Grupo</LfHeading>
      <LfParagraph>
        Avalie na ordem — primeira condição verdadeira define o grupo:
      </LfParagraph>
      <table>
        <thead>
          <tr><th>#</th><th>Condição</th><th>Group</th></tr>
        </thead>
        <tbody>
          <tr><td>1</td><td>Coleta dados (input, select, textarea, checkbox, radio)</td><td><strong>Inputable</strong></td></tr>
          <tr><td>2</td><td>Submete form OU muda navegação (button[submit], a[href], router)</td><td><strong>Dynamic</strong></td></tr>
          <tr><td>3</td><td>Responde a interação local sem navegar (accordion, tab, dropdown)</td><td><strong>Interactive</strong></td></tr>
          <tr><td>4</td><td>Visual puro, sem interação (card, alert, badge, divider)</td><td><strong>Static</strong></td></tr>
          <tr><td>5</td><td>Background de página, texto, link, ícone, border global</td><td><strong>Core</strong></td></tr>
          <tr><td>6</td><td>Sombra / box-shadow</td><td><strong>Elevation</strong></td></tr>
        </tbody>
      </table>
      <LfParagraph>
        <strong>Tiebreaker:</strong> "Muda página ou submete?" → Dynamic. "Fica na mesma tela?" → Interactive.
      </LfParagraph>

      {/* ── Hierarchy Selection ── */}
      <LfHeading as="h2">Regra 3 — Seleção de Hierarquia</LfHeading>
      <table>
        <thead>
          <tr><th>Group</th><th>Condição → Hierarquia</th></tr>
        </thead>
        <tbody>
          <tr><td rowSpan="5"><strong>Dynamic</strong></td><td>Ação principal (max 1/área) → Primary</td></tr>
          <tr><td>Alternativa → Secondary</td></tr>
          <tr><td>Destrutiva → Critical</td></tr>
          <tr><td>Sem fundo → Ghost</td></tr>
          <tr><td>Especial → Highlight</td></tr>
          <tr><td rowSpan="4"><strong>Interactive</strong></td><td>Principal → Primary</td></tr>
          <tr><td>Padrão → Neutral</td></tr>
          <tr><td>Alt → Secondary / Tertiary</td></tr>
          <tr><td>Feedback → Critical / Warning / Success / Info</td></tr>
          <tr><td rowSpan="3"><strong>Static</strong></td><td>Genérico → Primary</td></tr>
          <tr><td>Alt → Secondary / Neutral</td></tr>
          <tr><td>Feedback → Critical / Success / Warning / Info / AI</td></tr>
          <tr><td rowSpan="3"><strong>Inputable</strong></td><td>Normal → Neutral</td></tr>
          <tr><td>Erro → Critical</td></tr>
          <tr><td>Válido → Success</td></tr>
          <tr><td rowSpan="4"><strong>Elevation</strong></td><td>Card/dropdown → Level1</td></tr>
          <tr><td>Popover/tooltip → Level2</td></tr>
          <tr><td>Modal/dialog → Level3</td></tr>
          <tr><td>Overlay crítico → Level4</td></tr>
        </tbody>
      </table>

      {/* ── Role ↔ CSS ── */}
      <LfHeading as="h2">Regra 4 — Role ↔ CSS Property</LfHeading>
      <table>
        <thead>
          <tr><th>CSS property</th><th>Token role</th><th>Notas</th></tr>
        </thead>
        <tbody>
          <tr><td><code>background-color</code></td><td>Surface</td><td>Ou Container (Static, bloco sobre bg)</td></tr>
          <tr><td><code>color</code> (texto)</td><td>On Surface</td><td>Ou On Container (Static)</td></tr>
          <tr><td><code>color</code> (ícone)</td><td>On Surface/Icon</td><td></td></tr>
          <tr><td><code>border-color</code></td><td>On Surface/Border</td><td></td></tr>
          <tr><td><code>fill</code> (SVG)</td><td>Icon</td><td></td></tr>
          <tr><td><code>box-shadow</code></td><td>Elevation/Surface/Level*</td><td></td></tr>
        </tbody>
      </table>

      <LfAlert variant="warning">
        <strong>Container vs Surface (Static only):</strong> Page/section bg = Surface → On Surface. Card/banner/modal = Container → On Container. Nunca misturar.
      </LfAlert>

      {/* ── States ── */}
      <LfHeading as="h2">Regra 5 — Estados</LfHeading>
      <table>
        <thead>
          <tr><th>Condição</th><th>State</th></tr>
        </thead>
        <tbody>
          <tr><td>Sem interação</td><td>Default</td></tr>
          <tr><td>Cursor sobre</td><td>Hover</td></tr>
          <tr><td>Clicado</td><td>Pressed</td></tr>
          <tr><td>Selecionado/ativo</td><td>Active</td></tr>
          <tr><td>Processando</td><td>Loading</td></tr>
          <tr><td>Desabilitado</td><td>Disabled</td></tr>
        </tbody>
      </table>

      {/* ── Modifiers ── */}
      <LfHeading as="h2">Regra 6 — Modificadores</LfHeading>
      <table>
        <thead>
          <tr><th>Contexto</th><th>Modifier</th></tr>
        </thead>
        <tbody>
          <tr><td>Fundo escuro (luminance &lt; 0.18)</td><td>Inverse</td></tr>
          <tr><td>Fundo claro</td><td>(nenhum)</td></tr>
          <tr><td>Static Surface alta intensidade</td><td>Highest / Higher / High</td></tr>
          <tr><td>Static Surface baixa intensidade</td><td>Low / Lower / Lowest</td></tr>
          <tr><td>Interactive intensidade</td><td>Low / Pure / High</td></tr>
        </tbody>
      </table>
      <LfParagraph>
        <strong>Regra:</strong> High/Higher/Highest bg → texto Normal. Low/Lower/Lowest bg → texto Inverse. Sempre validar contraste.
      </LfParagraph>

      {/* ── Token Assembly ── */}
      <LfHeading as="h2">Regra 7 — Montar o Token</LfHeading>
      <pre>{`token = [Group] / [Hierarchy] / [Role] / [Modifier?] / [State]

Conversão:
  Figma: Dynamic/Primary/Surface/Default
  JS:    LfThmDynamicPrimarySurfaceDefault
  CSS:   --lf-thm-dynamic-primary-surface-default`}</pre>

      {/* ── Pairing ── */}
      <LfHeading as="h2">Regra 8 — Pareamento Surface ↔ On Surface</LfHeading>
      <pre>{`bg: {Group}/{Hierarchy}/Surface/{State}
fg: {Group}/{Hierarchy}/On Surface/{State}     ← MESMO grupo + hierarquia

bg: Static/{Hierarchy}/Container/{State}
fg: Static/{Hierarchy}/On Container/{State}    ← MESMA hierarquia`}</pre>
      <table>
        <thead>
          <tr><th>Background</th><th>Foreground obrigatório</th><th>Proibido</th></tr>
        </thead>
        <tbody>
          <tr><td>Dynamic/Primary/Surface</td><td>Dynamic/Primary/On Surface</td><td>Qualquer outro grupo</td></tr>
          <tr><td>Static/Primary/Surface/Highest</td><td>Static/Primary/On Surface/High</td><td>Core ou Dynamic</td></tr>
          <tr><td>Static/*/Container/*</td><td>Static/*/On Container/*</td><td>On Surface tokens</td></tr>
          <tr><td>Core/Surface/Default</td><td>Core/On Surface/Text/Primary</td><td>Brand ou Dynamic</td></tr>
          <tr><td>Inputable/Field/*/Surface</td><td>Inputable/Field/*/On Surface</td><td>Outros grupos</td></tr>
        </tbody>
      </table>

      {/* ── WCAG ── */}
      <LfHeading as="h2">Regra 9 — Contraste WCAG</LfHeading>
      <table>
        <thead>
          <tr><th>Tipo</th><th>Ratio mínimo</th></tr>
        </thead>
        <tbody>
          <tr><td>Texto normal (&lt; 18px)</td><td>≥ 4.5:1</td></tr>
          <tr><td>Texto grande (≥ 18px bold ou ≥ 24px)</td><td>≥ 3.0:1</td></tr>
          <tr><td>Componente UI / gráfico</td><td>≥ 3.0:1</td></tr>
        </tbody>
      </table>

      {/* ── Checklist ── */}
      <LfHeading as="h2">Regra 10 — Checklist Final</LfHeading>
      <pre>{`Antes de aplicar qualquer token:
  [ ] Token da camada Usage (ou Component como último recurso)
  [ ] Role corresponde à propriedade CSS
  [ ] Group corresponde ao comportamento do elemento
  [ ] Surface/On Surface = mesmo grupo + hierarquia
  [ ] Contraste ≥ WCAG AA
  [ ] Max 1 Primary por área visível
  [ ] Variante (Normal/Inverse) corresponde ao contexto
  [ ] State corresponde ao estado do elemento
  [ ] Não está nas combinações proibidas`}</pre>

      {/* ── Forbidden ── */}
      <LfHeading as="h2">Combinações Proibidas</LfHeading>
      <table>
        <thead>
          <tr><th>❌ Nunca fazer</th><th>Por quê</th></tr>
        </thead>
        <tbody>
          <tr><td><code>LfBs*</code> ou <code>--lf-bs-*</code> em UI</td><td>Base = raw primitives</td></tr>
          <tr><td><code>LfThmBrand*</code> ou <code>--lf-thm-brand-*</code> em UI</td><td>Brand = build-time only</td></tr>
          <tr><td><code>#hex</code> hardcoded quando existe token</td><td>Quebra theming</td></tr>
          <tr><td>Surface grupo A + On Surface grupo B</td><td>Mismatch semântico</td></tr>
          <tr><td>On Surface sobre Container</td><td>Deve usar On Container</td></tr>
          <tr><td>On Container sobre Surface</td><td>Deve usar On Surface</td></tr>
          <tr><td>Múltiplos Primary na mesma área</td><td>Confusão UX</td></tr>
          <tr><td>Dynamic em elementos não-interativos</td><td>Semântica errada</td></tr>
          <tr><td>Static em elementos clicáveis</td><td>Semântica errada</td></tr>
          <tr><td>Inputable em botões de submit</td><td>Grupo errado</td></tr>
          <tr><td>Misturar Normal + Inverse no mesmo componente</td><td>Inconsistência visual</td></tr>
        </tbody>
      </table>

      {/* ── Design Smells ── */}
      <LfHeading as="h2">Design Smells</LfHeading>
      <LfParagraph>
        Anti-patterns detectáveis automaticamente:
      </LfParagraph>
      <table>
        <thead>
          <tr><th>ID</th><th>Severidade</th><th>Descrição</th><th>Fix</th></tr>
        </thead>
        <tbody>
          <tr><td><code>multiple-primary-actions</code></td><td>Warning</td><td>&gt;1 Primary no viewport</td><td>Downgrade para Secondary</td></tr>
          <tr><td><code>clickable-static</code></td><td>Error</td><td>Static em elemento interativo</td><td>Usar Dynamic/Interactive</td></tr>
          <tr><td><code>missing-hover-state</code></td><td>Warning</td><td>Sem hover em interativo</td><td>Adicionar token hover</td></tr>
          <tr><td><code>missing-focus-ring</code></td><td>Error</td><td>Sem focus em focusable</td><td>Core/On Surface/Border/Focus</td></tr>
          <tr><td><code>hardcoded-hex</code></td><td>Error</td><td>#hex ao invés de token</td><td>Substituir por token semântico</td></tr>
          <tr><td><code>mixed-semantic-groups</code></td><td>Error</td><td>Surface ≠ On Surface grupo</td><td>Alinhar grupos</td></tr>
          <tr><td><code>low-contrast</code></td><td>Error</td><td>&lt; 4.5:1 para texto</td><td>Ajustar par de tokens</td></tr>
          <tr><td><code>surface-without-onsurface</code></td><td>Error</td><td>bg sem fg</td><td>Adicionar foreground</td></tr>
          <tr><td><code>inputable-on-button</code></td><td>Error</td><td>Input tokens em submit</td><td>Usar Dynamic</td></tr>
          <tr><td><code>static-on-link</code></td><td>Error</td><td>Static em navegação</td><td>Usar Dynamic</td></tr>
        </tbody>
      </table>

      {/* ── Confidence Scoring ── */}
      <LfHeading as="h2">AI Confidence Scoring</LfHeading>
      <table>
        <thead>
          <tr><th>Score</th><th>Ação</th><th>Descrição</th></tr>
        </thead>
        <tbody>
          <tr><td>0.90+</td><td>✅ Auto-apply</td><td>Alta confiança — aplicar automaticamente</td></tr>
          <tr><td>0.75–0.89</td><td>⚠️ Apply + warn</td><td>Média-alta — aplicar com aviso</td></tr>
          <tr><td>0.50–0.74</td><td>🔍 Validação</td><td>Média — não auto-aplicar</td></tr>
          <tr><td>&lt; 0.50</td><td>❌ Rejeitar</td><td>Baixa — falhar com explicação</td></tr>
        </tbody>
      </table>
      <LfParagraph>
        <strong>Aumenta:</strong> HTML semântico, props claras, match no registry, interpretação única.
        <br />
        <strong>Diminui:</strong> Elemento genérico (div/span), onClick ambíguo, múltiplas interpretações, sinais conflitantes.
      </LfParagraph>

      {/* ── Component Registry ── */}
      <LfHeading as="h2">Component Registry</LfHeading>
      <LfParagraph>
        Componentes <code>@lift/ds-web</code> disponíveis — sempre preferir sobre tokens manuais:
      </LfParagraph>
      <table>
        <thead>
          <tr><th>Component</th><th>Group</th><th>Props principais</th></tr>
        </thead>
        <tbody>
          <tr><td><code>LfButton</code></td><td>Dynamic</td><td>appearance: primary, secondary, critical, ghost</td></tr>
          <tr><td><code>LfLink</code></td><td>Dynamic</td><td>—</td></tr>
          <tr><td><code>LfAccordion</code></td><td>Interactive</td><td>appearance: primary, neutral, secondary</td></tr>
          <tr><td><code>LfTab</code></td><td>Interactive</td><td>active, disabled</td></tr>
          <tr><td><code>LfMenu</code></td><td>Interactive</td><td>—</td></tr>
          <tr><td><code>LfDropdown</code></td><td>Interactive</td><td>—</td></tr>
          <tr><td><code>LfTooltip</code></td><td>Interactive</td><td>—</td></tr>
          <tr><td><code>LfInput</code></td><td>Inputable</td><td>variant: neutral, error, success</td></tr>
          <tr><td><code>LfSelect</code></td><td>Inputable</td><td>variant: neutral, error, success</td></tr>
          <tr><td><code>LfCheckbox</code></td><td>Inputable</td><td>checked, indeterminate, disabled</td></tr>
          <tr><td><code>LfRadio</code></td><td>Inputable</td><td>checked, disabled</td></tr>
          <tr><td><code>LfSwitch</code></td><td>Inputable</td><td>checked, disabled</td></tr>
          <tr><td><code>LfCard</code></td><td>Static</td><td>elevation: none, low, medium, high</td></tr>
          <tr><td><code>LfAlert</code></td><td>Static</td><td>severity: error, warning, success, info</td></tr>
          <tr><td><code>LfBadge</code></td><td>Static</td><td>appearance: primary, secondary, neutral</td></tr>
          <tr><td><code>LfDivider</code></td><td>Core</td><td>—</td></tr>
        </tbody>
      </table>

      {/* ── Intent → Component ── */}
      <LfHeading as="h2">Intent → Componente Recomendado</LfHeading>
      <table>
        <thead>
          <tr><th>Intent</th><th>Componente</th><th>Group</th></tr>
        </thead>
        <tbody>
          <tr><td>Submit form</td><td>LfButton (primary)</td><td>Dynamic</td></tr>
          <tr><td>Navegar</td><td>LfButton (primary) / LfLink</td><td>Dynamic</td></tr>
          <tr><td>Cancelar</td><td>LfButton (secondary)</td><td>Dynamic</td></tr>
          <tr><td>Deletar</td><td>LfButton (critical)</td><td>Dynamic</td></tr>
          <tr><td>Expandir conteúdo</td><td>LfAccordion</td><td>Interactive</td></tr>
          <tr><td>Trocar aba</td><td>LfTab</td><td>Interactive</td></tr>
          <tr><td>Selecionar de lista</td><td>LfDropdown / LfMenu</td><td>Interactive</td></tr>
          <tr><td>Digitar texto</td><td>LfInput</td><td>Inputable</td></tr>
          <tr><td>Selecionar opção</td><td>LfSelect</td><td>Inputable</td></tr>
          <tr><td>Toggle on/off</td><td>LfCheckbox / LfSwitch</td><td>Inputable</td></tr>
          <tr><td>Mostrar info</td><td>LfCard</td><td>Static</td></tr>
          <tr><td>Mostrar erro</td><td>LfAlert (error)</td><td>Static</td></tr>
          <tr><td>Mostrar sucesso</td><td>LfAlert (success)</td><td>Static</td></tr>
        </tbody>
      </table>

      {/* ── AI Response Format ── */}
      <LfHeading as="h2">Formato de Resposta JSON</LfHeading>
      <LfParagraph>
        Quando uma IA responde com sugestão de token, deve usar este formato:
      </LfParagraph>
      <pre>{`{
  "element": "submit button",
  "recommendedApproach": "component",
  "confidence": 0.95,
  "component": { "name": "LfButton", "props": { "appearance": "primary" } },
  "fallbackTokens": {
    "background": { "token": "Dynamic/Primary/Surface/Default", "css": "--lf-thm-dynamic-primary-surface-default" },
    "color": { "token": "Dynamic/Primary/On Surface/Default", "css": "--lf-thm-dynamic-primary-on-surface-default" }
  },
  "states": {
    "hover": { "background": "Dynamic/Primary/Surface/Hover" },
    "pressed": { "background": "Dynamic/Primary/Surface/Pressed" }
  },
  "rulesApplied": ["R0: Component available", "R8: Pairing OK", "R9: Contrast 8.1:1 AAA"],
  "warnings": [],
  "contrast": { "ratio": "8.1:1", "level": "AAA" }
}`}</pre>
    </div>
  );
}
