import React from 'react';
import LfHeading from '@lift/ds-web/components/LfHeading/';
import LfParagraph from '@lift/ds-web/components/LfParagraph/';

export default function QuickReference() {
  return (
    <div>
      <LfHeading as="h1">Referência Rápida</LfHeading>
      <p className="subtitle">Tabela de consulta rápida — encontre o token certo para cada necessidade. v2.1.1</p>

      {/* ── Token Naming ── */}
      <LfHeading as="h2">Naming Convention</LfHeading>
      <pre>{`[Group] / [Hierarchy] / [Role] / [Modifier?] / [State]`}</pre>
      <table>
        <thead>
          <tr><th>Formato</th><th>Exemplo</th></tr>
        </thead>
        <tbody>
          <tr><td>Figma</td><td><code>Dynamic/Primary/Surface/Default</code></td></tr>
          <tr><td>JS</td><td><code>LfThmDynamicPrimarySurfaceDefault</code></td></tr>
          <tr><td>CSS</td><td><code>--lf-thm-dynamic-primary-surface-default</code></td></tr>
        </tbody>
      </table>

      {/* ── Quick Reference Table ── */}
      <LfHeading as="h2">Tokens por Necessidade</LfHeading>

      <table>
        <thead>
          <tr><th>Necessidade</th><th>Token</th></tr>
        </thead>
        <tbody>
          {/* ── Dynamic ── */}
          <tr><td colSpan="2" style={{ background: '#F0F4FF', fontWeight: 700 }}>Dynamic — Ações de navegação</td></tr>
          <tr><td>Botão primário (bg)</td><td><code>Dynamic/Primary/Surface/Default</code></td></tr>
          <tr><td>Botão primário (text)</td><td><code>Dynamic/Primary/On Surface/Default</code></td></tr>
          <tr><td>Botão primário (hover)</td><td><code>Dynamic/Primary/Surface/Hover</code></td></tr>
          <tr><td>Botão primário (pressed)</td><td><code>Dynamic/Primary/Surface/Pressed</code></td></tr>
          <tr><td>Botão secundário (text)</td><td><code>Dynamic/Secondary/On Surface/Default</code></td></tr>
          <tr><td>Botão secundário (border)</td><td><code>Dynamic/Secondary/On Surface/Border/Default</code></td></tr>
          <tr><td>Botão destrutivo (bg)</td><td><code>Dynamic/Critical/Surface/Default</code></td></tr>
          <tr><td>Botão destrutivo (text)</td><td><code>Dynamic/Critical/On Surface/Default</code></td></tr>
          <tr><td>Botão ghost (text)</td><td><code>Dynamic/Ghost/On Surface/Default</code></td></tr>
          <tr><td>Botão em loading</td><td><code>Dynamic/Primary/Surface/Loading</code></td></tr>

          {/* ── Interactive ── */}
          <tr><td colSpan="2" style={{ background: '#F0FFF0', fontWeight: 700 }}>Interactive — Interação local</td></tr>
          <tr><td>Tab ativa (bg)</td><td><code>Interactive/Primary/Surface/Active</code></td></tr>
          <tr><td>Tab ativa (text)</td><td><code>Interactive/Primary/On Surface/Active</code></td></tr>
          <tr><td>Accordion (bg)</td><td><code>Interactive/Neutral/Surface/Default</code></td></tr>
          <tr><td>Accordion (text)</td><td><code>Interactive/Neutral/On Surface/Default</code></td></tr>
          <tr><td>Dropdown (bg)</td><td><code>Interactive/Neutral/Surface/Default</code></td></tr>
          <tr><td>Dropdown (border)</td><td><code>Interactive/Neutral/On Surface/Border/Default</code></td></tr>
          <tr><td>Dropdown item (hover)</td><td><code>Interactive/Neutral/Surface/Hover</code></td></tr>
          <tr><td>Alert warning (bg)</td><td><code>Interactive/Warning/Surface/Pure/Default</code></td></tr>

          {/* ── Static ── */}
          <tr><td colSpan="2" style={{ background: '#FFF8F0', fontWeight: 700 }}>Static — Composição visual</td></tr>
          <tr><td>Card (bg)</td><td><code>Static/Primary/Container/Default</code></td></tr>
          <tr><td>Card (text)</td><td><code>Static/Primary/On Container/Default</code></td></tr>
          <tr><td>Card surface claro</td><td><code>Static/Primary/Surface/Highest</code></td></tr>
          <tr><td>Card surface escuro</td><td><code>Static/Primary/Surface/Lowest</code></td></tr>
          <tr><td>Badge/Tag (bg)</td><td><code>Static/Primary/Container/Default</code></td></tr>
          <tr><td>Alert erro (bg)</td><td><code>Static/Critical/Surface/Highest</code></td></tr>
          <tr><td>Alert sucesso (bg)</td><td><code>Static/Success/Surface/Highest</code></td></tr>
          <tr><td>Alert info (bg)</td><td><code>Static/Info/Surface/Highest</code></td></tr>

          {/* ── Inputable ── */}
          <tr><td colSpan="2" style={{ background: '#FFF0F8', fontWeight: 700 }}>Inputable — Entrada de dados</td></tr>
          <tr><td>Input (bg)</td><td><code>Inputable/Field/Neutral/Surface/Default</code></td></tr>
          <tr><td>Input (border)</td><td><code>Inputable/Field/Neutral/On Surface/Border/Default</code></td></tr>
          <tr><td>Input (border active)</td><td><code>Inputable/Field/Neutral/On Surface/Border/Active</code></td></tr>
          <tr><td>Input erro (border)</td><td><code>Inputable/Field/Critical/On Surface/Border/Default</code></td></tr>
          <tr><td>Input sucesso (border)</td><td><code>Inputable/Field/Success/On Surface/Border/Default</code></td></tr>
          <tr><td>Checkbox checked (bg)</td><td><code>Inputable/Selectable/Neutral/Surface/Default</code></td></tr>
          <tr><td>Checkbox (border)</td><td><code>Inputable/Selectable/Neutral/On Surface/Border/Default</code></td></tr>

          {/* ── Core ── */}
          <tr><td colSpan="2" style={{ background: '#F5F5F5', fontWeight: 700 }}>Core — Primitivos de página</td></tr>
          <tr><td>Texto principal</td><td><code>Core/On Surface/Text/Primary</code></td></tr>
          <tr><td>Texto secundário</td><td><code>Core/On Surface/Text/Secondary</code></td></tr>
          <tr><td>Texto de erro</td><td><code>Core/On Surface/Text/Critical</code></td></tr>
          <tr><td>Texto de sucesso</td><td><code>Core/On Surface/Text/Success</code></td></tr>
          <tr><td>Link</td><td><code>Core/On Surface/Link/Default</code></td></tr>
          <tr><td>Link hover</td><td><code>Core/On Surface/Link/Hover</code></td></tr>
          <tr><td>Divisor</td><td><code>Core/On Surface/Border/Divider</code></td></tr>
          <tr><td>Focus ring</td><td><code>Core/On Surface/Border/Focus</code></td></tr>
          <tr><td>Fundo da página</td><td><code>Core/Surface/Default</code></td></tr>
          <tr><td>Fundo invertido</td><td><code>Core/Surface/Inverse</code></td></tr>

          {/* ── Elevation ── */}
          <tr><td colSpan="2" style={{ background: '#F0F0FF', fontWeight: 700 }}>Elevation — Sombras</td></tr>
          <tr><td>Sombra card / dropdown</td><td><code>Elevation/Surface/Level1/Default</code></td></tr>
          <tr><td>Sombra popover / tooltip</td><td><code>Elevation/Surface/Level2/Default</code></td></tr>
          <tr><td>Sombra modal / dialog</td><td><code>Elevation/Surface/Level3/Default</code></td></tr>
          <tr><td>Sombra overlay crítico</td><td><code>Elevation/Surface/Level4/Default</code></td></tr>
        </tbody>
      </table>

      {/* ── Golden Rules ── */}
      <LfHeading as="h2">Golden Rules</LfHeading>
      <LfParagraph>Regras de ouro para nunca errar:</LfParagraph>
      <ol>
        <li>PREFERIR componentes <code>@lift/ds-web</code> sobre tokens manuais</li>
        <li>NUNCA usar Base ou Brand tokens em UI</li>
        <li>Cada Surface tem um On Surface correspondente — MESMO grupo + hierarquia</li>
        <li>Container/On Container existem APENAS no grupo Static</li>
        <li>Máximo 1 Primary por área visível</li>
        <li>Ações destrutivas SEMPRE usam Critical</li>
        <li>Para UI manual, SEMPRE preferir Usage sobre Component tokens</li>
        <li>"Muda página?" → Dynamic. "Fica na tela?" → Interactive</li>
        <li>Inputable é para coleta de dados — botão submit é Dynamic</li>
        <li>Static é visual sem interação — nunca usar em elementos clicáveis</li>
        <li>Contexto escuro (luminance &lt; 0.18) → usar variante Inverse</li>
      </ol>
    </div>
  );
}
