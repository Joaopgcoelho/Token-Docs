import React from 'react';
import LfAlert from '@lift/ds-web/components/LfAlert/';
import LfHeading from '@lift/ds-web/components/LfHeading/';
import LfParagraph from '@lift/ds-web/components/LfParagraph/';

export default function HowToChoose() {
  return (
    <div>
      <LfHeading as="h1">Como Escolher o Token Certo</LfHeading>
      <p className="subtitle">Guia completo para selecionar o grupo, hierarquia e papel correto de cada token.</p>

      {/* ═══ FASE 1 ═══ */}
      <LfHeading as="h2">Fase 1 — Escolher o Grupo (comportamento do elemento)</LfHeading>
      <LfParagraph>
        O grupo semântico é determinado pelo <strong>comportamento</strong> do elemento, não pela sua aparência.
        Siga este fluxo de cima para baixo — a primeira condição verdadeira define o grupo.
      </LfParagraph>

      <pre>{`O elemento é um componente de UI?
│
├─ NÃO → É texto/link/ícone/borda de página ou fundo da aplicação?
│         ├─ SIM → Core
│         └─ NÃO → É sombra/elevação (box-shadow)?
│                   ├─ SIM → Elevation
│                   └─ NÃO → Revise — pode ser Brand (apenas referência)
│
└─ SIM → O elemento coleta dados do usuário?
          │
          ├─ SIM → Inputable
          │         ├─ Campo de texto/valor → Inputable/Field
          │         └─ Checkbox/radio/switch → Inputable/Selectable
          │
          └─ NÃO → O elemento altera a navegação (submit, link, CTA)?
                    │
                    ├─ SIM → Dynamic
                    │
                    └─ NÃO → O elemento responde a interação local?
                              │
                              ├─ SIM → Interactive
                              │
                              └─ NÃO → É visual sem interação?
                                        │
                                        ├─ SIM → Static
                                        └─ NÃO → Revise o comportamento`}</pre>

      <LfAlert variant="info">
        <strong>Regra de ouro:</strong> Na dúvida entre Interactive e Dynamic, pergunte: "muda de página ou submete dados?" → Dynamic. "Fica na mesma tela?" → Interactive.
      </LfAlert>

      {/* ═══ FASE 2 ═══ */}
      <LfHeading as="h2">Fase 2 — Escolher o Papel (role) do token</LfHeading>
      <LfParagraph>
        Depois de definir o grupo, escolha o papel baseado na <strong>propriedade CSS</strong> que você está aplicando.
      </LfParagraph>

      <table>
        <thead>
          <tr><th>Propriedade CSS</th><th>Papel (Role)</th><th>Quando usar</th></tr>
        </thead>
        <tbody>
          <tr><td><code>background-color</code></td><td><strong>Surface</strong></td><td>Fundo do componente ou da página/seção</td></tr>
          <tr><td><code>background-color</code></td><td><strong>Container</strong></td><td>Fundo de grupo de elementos (card, bloco) — apenas Static</td></tr>
          <tr><td><code>color</code> (texto)</td><td><strong>On Surface</strong></td><td>Texto ou ícone sobre um Surface</td></tr>
          <tr><td><code>color</code> (texto)</td><td><strong>On Container</strong></td><td>Texto ou ícone sobre um Container — apenas Static</td></tr>
          <tr><td><code>border-color</code></td><td><strong>Border</strong></td><td>Contorno do componente</td></tr>
          <tr><td><code>fill</code> (SVG)</td><td><strong>Icon</strong></td><td>Preenchimento de ícone SVG</td></tr>
          <tr><td><code>box-shadow</code></td><td><strong>Elevation</strong></td><td>Sombra de superfície flutuante</td></tr>
        </tbody>
      </table>

      <div className="do-dont">
        <div className="do-box">
          <div className="do-box-t">Correto</div>
          <ul>
            <li>Surface + On Surface do <strong>mesmo grupo e hierarquia</strong></li>
            <li>Container + On Container do <strong>mesmo grupo</strong> (só Static)</li>
          </ul>
        </div>
        <div className="dont-box">
          <div className="dont-box-t">Proibido</div>
          <ul>
            <li>Surface de um grupo + On Surface de outro grupo</li>
            <li>On Surface sobre Container (use On Container)</li>
            <li>On Container sobre Surface (use On Surface)</li>
          </ul>
        </div>
      </div>

      {/* ═══ FASE 3 ═══ */}
      <LfHeading as="h2">Fase 3 — Escolher a Hierarquia</LfHeading>

      <table>
        <thead>
          <tr><th>Grupo</th><th>Hierarquia</th><th>Quando usar</th></tr>
        </thead>
        <tbody>
          <tr><td rowSpan="6"><strong>Dynamic</strong></td><td>Primary</td><td>Ação principal da área (máx. 1 por área visível)</td></tr>
          <tr><td>Secondary</td><td>Ação alternativa (cancelar, voltar)</td></tr>
          <tr><td>Critical</td><td>Ação destrutiva ou de risco (excluir, remover)</td></tr>
          <tr><td>Ghost</td><td>Sem fundo visível (link-button)</td></tr>
          <tr><td>Highlight</td><td>Destaque especial (promoção)</td></tr>
          <tr><td>Disabled</td><td>Estado desabilitado</td></tr>

          <tr><td rowSpan="9"><strong>Interactive</strong></td><td>Primary</td><td>Destaque principal (tab ativa)</td></tr>
          <tr><td>Secondary</td><td>Destaque secundário</td></tr>
          <tr><td>Tertiary</td><td>Terceiro nível</td></tr>
          <tr><td>Neutral</td><td>Padrão (accordion, dropdown)</td></tr>
          <tr><td>Highlight</td><td>Destaque especial</td></tr>
          <tr><td>Critical</td><td>Feedback de erro</td></tr>
          <tr><td>Warning</td><td>Feedback de aviso</td></tr>
          <tr><td>Success</td><td>Feedback de sucesso</td></tr>
          <tr><td>Info</td><td>Feedback informativo</td></tr>

          <tr><td rowSpan="8"><strong>Static</strong></td><td>Primary</td><td>Conteúdo genérico (card)</td></tr>
          <tr><td>Secondary</td><td>Conteúdo secundário</td></tr>
          <tr><td>Neutral</td><td>Estrutura neutra</td></tr>
          <tr><td>Critical</td><td>Alerta de erro</td></tr>
          <tr><td>Success</td><td>Alerta de sucesso</td></tr>
          <tr><td>Warning</td><td>Alerta de aviso</td></tr>
          <tr><td>Info</td><td>Informativo</td></tr>
          <tr><td>AI</td><td>Conteúdo de IA</td></tr>

          <tr><td rowSpan="3"><strong>Inputable</strong></td><td>Neutral</td><td>Campo padrão</td></tr>
          <tr><td>Critical</td><td>Campo com erro</td></tr>
          <tr><td>Success</td><td>Campo validado</td></tr>
        </tbody>
      </table>

      {/* ═══ FASE 4 ═══ */}
      <LfHeading as="h2">Fase 4 — Montar o token</LfHeading>
      <LfParagraph>
        Combine grupo + hierarquia + papel + estado para formar o caminho do token:
      </LfParagraph>

      <pre>{`[Grupo] / [Hierarquia] / [Papel] / [Estado]

Exemplos:
  Dynamic/Primary/Surface/Default        → fundo do botão principal
  Dynamic/Primary/On Surface/Default     → texto do botão principal
  Dynamic/Primary/Surface/Hover          → fundo no hover
  Static/Critical/Surface/Highest        → fundo do alerta de erro
  Static/Critical/On Surface/High        → texto do alerta de erro
  Inputable/Field/Neutral/Surface/Default → fundo do input
  Inputable/Field/Critical/On Surface/Border/Default → borda do input com erro
  Interactive/Primary/Surface/Active      → fundo da tab ativa
  Core/On Surface/Text/Primary           → texto principal da página
  Core/Surface/Default                   → fundo da aplicação`}</pre>

      {/* ═══ REFERÊNCIA RÁPIDA ═══ */}
      <LfHeading as="h2">Referência rápida</LfHeading>

      <table>
        <thead>
          <tr><th>Elemento</th><th>Grupo</th><th>Token</th></tr>
        </thead>
        <tbody>
          <tr><td>Botão submit (fundo)</td><td><strong>Dynamic</strong></td><td><code>Dynamic/Primary/Surface/Default</code></td></tr>
          <tr><td>Botão submit (texto)</td><td><strong>Dynamic</strong></td><td><code>Dynamic/Primary/On Surface/Default</code></td></tr>
          <tr><td>Botão cancelar</td><td><strong>Dynamic</strong></td><td><code>Dynamic/Secondary/Surface/Default</code></td></tr>
          <tr><td>Botão excluir</td><td><strong>Dynamic</strong></td><td><code>Dynamic/Critical/Surface/Default</code></td></tr>
          <tr><td>Link-button (ghost)</td><td><strong>Dynamic</strong></td><td><code>Dynamic/Ghost/On Surface/Default</code></td></tr>
          <tr><td>Tab ativa (fundo)</td><td><strong>Interactive</strong></td><td><code>Interactive/Primary/Surface/Default</code></td></tr>
          <tr><td>Accordion (fundo)</td><td><strong>Interactive</strong></td><td><code>Interactive/Neutral/Surface/Default</code></td></tr>
          <tr><td>Tooltip / Dropdown</td><td><strong>Interactive</strong></td><td><code>Interactive/Neutral/Surface/Default</code></td></tr>
          <tr><td>Card (fundo claro)</td><td><strong>Static</strong></td><td><code>Static/Primary/Surface/Highest</code></td></tr>
          <tr><td>Card (fundo escuro)</td><td><strong>Static</strong></td><td><code>Static/Primary/Surface/Lowest</code></td></tr>
          <tr><td>Alerta de erro</td><td><strong>Static</strong></td><td><code>Static/Critical/Surface/Highest</code></td></tr>
          <tr><td>Alerta de sucesso</td><td><strong>Static</strong></td><td><code>Static/Success/Surface/Highest</code></td></tr>
          <tr><td>Tag estática</td><td><strong>Static</strong></td><td><code>Static/Primary/Container/Default</code></td></tr>
          <tr><td>Input (fundo)</td><td><strong>Inputable</strong></td><td><code>Inputable/Field/Neutral/Surface/Default</code></td></tr>
          <tr><td>Input (borda)</td><td><strong>Inputable</strong></td><td><code>Inputable/Field/Neutral/On Surface/Border/Default</code></td></tr>
          <tr><td>Input erro (borda)</td><td><strong>Inputable</strong></td><td><code>Inputable/Field/Critical/On Surface/Border/Default</code></td></tr>
          <tr><td>Checkbox marcado</td><td><strong>Inputable</strong></td><td><code>Inputable/Selectable/Neutral/Surface/Default</code></td></tr>
          <tr><td>Texto da página</td><td><strong>Core</strong></td><td><code>Core/On Surface/Text/Primary</code></td></tr>
          <tr><td>Link inline</td><td><strong>Core</strong></td><td><code>Core/On Surface/Link/Default</code></td></tr>
          <tr><td>Fundo da aplicação</td><td><strong>Core</strong></td><td><code>Core/Surface/Default</code></td></tr>
          <tr><td>Divisor</td><td><strong>Core</strong></td><td><code>Core/On Surface/Border/Divider</code></td></tr>
          <tr><td>Sombra de card</td><td><strong>Elevation</strong></td><td><code>Elevation/Surface/Level1/Default</code></td></tr>
          <tr><td>Sombra de modal</td><td><strong>Elevation</strong></td><td><code>Elevation/Surface/Level3/Default</code></td></tr>
        </tbody>
      </table>

      {/* ═══ REGRAS DE OURO ═══ */}
      <LfHeading as="h2">Regras de ouro</LfHeading>

      <pre>{`1. NUNCA use Base ou Brand tokens diretamente em UI
2. Cada Surface tem um On Surface correspondente — MESMO grupo + MESMA hierarquia
3. Container/On Container existem APENAS no grupo Static
4. Máximo 1 botão Primary por área visível
5. Ações destrutivas SEMPRE usam Critical
6. Se o componente Lift tem token Component, prefira Component sobre Usage
7. Na dúvida entre Interactive e Dynamic: "muda de página?" → Dynamic
8. Inputable é para coleta de dados — botão de submit é Dynamic
9. Static é para visual sem interação — nunca use em elementos clicáveis
10. Contexto escuro (luminance < 0.18) → use variante Inverse`}</pre>

      {/* ═══ COMBINAÇÕES PROIBIDAS ═══ */}
      <LfHeading as="h2">Combinações proibidas</LfHeading>

      <div className="dont-box" style={{ marginBottom: 14 }}>
        <div className="dont-box-t">Nunca faça</div>
        <ul>
          <li>Base tokens diretamente em componentes de UI</li>
          <li>Brand tokens diretamente em componentes de UI</li>
          <li>Surface de um grupo + On Surface de outro grupo</li>
          <li>On Surface sobre Container (use On Container)</li>
          <li>On Container sobre Surface (use On Surface)</li>
          <li>Múltiplos Primary na mesma área de ação</li>
          <li>Dynamic tokens em elementos não-interativos</li>
          <li>Inputable tokens em botões de submit</li>
          <li>Static tokens em elementos clicáveis</li>
          <li>Valores hardcoded (#hex) quando existe token semântico</li>
          <li>Misturar variantes Normal e Inverse no mesmo componente</li>
        </ul>
      </div>
    </div>
  );
}
