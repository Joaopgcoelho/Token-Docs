import React from 'react';
import LfHeading from '@lift/ds-web/components/LfHeading/';

export default function QuickReference() {
  return (
    <div>
      <LfHeading as="h1">Referência Rápida</LfHeading>
      <p className="subtitle">Tabela de consulta rápida — encontre o token certo para cada necessidade.</p>

      <table>
        <thead>
          <tr><th>Necessidade</th><th>Token</th></tr>
        </thead>
        <tbody>
          {/* ── Dynamic ── */}
          <tr><td colSpan="2" style={{ background: '#F0F4FF', fontWeight: 700 }}>Dynamic — Ações de navegação</td></tr>
          <tr><td>Fundo do botão principal</td><td><code>Dynamic/Primary/Surface/Default</code></td></tr>
          <tr><td>Texto do botão principal</td><td><code>Dynamic/Primary/On Surface/Default</code></td></tr>
          <tr><td>Fundo do botão principal (hover)</td><td><code>Dynamic/Primary/Surface/Hover</code></td></tr>
          <tr><td>Fundo do botão principal (pressed)</td><td><code>Dynamic/Primary/Surface/Pressed</code></td></tr>
          <tr><td>Fundo do botão secundário</td><td><code>Dynamic/Secondary/Surface/Default</code></td></tr>
          <tr><td>Texto do botão secundário</td><td><code>Dynamic/Secondary/On Surface/Default</code></td></tr>
          <tr><td>Fundo do botão destrutivo</td><td><code>Dynamic/Critical/Surface/Default</code></td></tr>
          <tr><td>Texto do botão destrutivo</td><td><code>Dynamic/Critical/On Surface/Default</code></td></tr>
          <tr><td>Texto do botão ghost</td><td><code>Dynamic/Ghost/On Surface/Default</code></td></tr>
          <tr><td>Fundo do botão CTA</td><td><code>Dynamic/CTA/Surface/Default</code></td></tr>
          <tr><td>Botão em loading</td><td><code>Dynamic/Primary/Surface/Loading</code></td></tr>

          {/* ── Interactive ── */}
          <tr><td colSpan="2" style={{ background: '#F0FFF0', fontWeight: 700 }}>Interactive — Interação local</td></tr>
          <tr><td>Fundo do accordion (primary)</td><td><code>Interactive/Primary/Surface/Default</code></td></tr>
          <tr><td>Texto do accordion (primary)</td><td><code>Interactive/Primary/On Surface/Default</code></td></tr>
          <tr><td>Fundo da tab ativa</td><td><code>Interactive/Primary/Surface/Active</code></td></tr>
          <tr><td>Texto da tab ativa</td><td><code>Interactive/Primary/On Surface/Active</code></td></tr>
          <tr><td>Fundo do dropdown</td><td><code>Interactive/Neutral/Surface/Default</code></td></tr>
          <tr><td>Borda do dropdown</td><td><code>Interactive/Neutral/On Surface/Border/Default</code></td></tr>
          <tr><td>Item do dropdown (hover)</td><td><code>Interactive/Neutral/Surface/Hover</code></td></tr>

          {/* ── Static ── */}
          <tr><td colSpan="2" style={{ background: '#FFF8F0', fontWeight: 700 }}>Static — Composição visual</td></tr>
          <tr><td>Fundo do card (claro)</td><td><code>Static/Primary/Surface/Highest</code></td></tr>
          <tr><td>Texto sobre card</td><td><code>Static/Primary/On Surface/Highest</code></td></tr>
          <tr><td>Fundo do card (forte)</td><td><code>Static/Primary/Surface/Lowest</code></td></tr>
          <tr><td>Fundo do alerta de info</td><td><code>Static/Info/Surface/Highest</code></td></tr>
          <tr><td>Borda do alerta de info</td><td><code>Static/Info/On Surface/Border/Default</code></td></tr>
          <tr><td>Fundo do alerta de sucesso</td><td><code>Static/Success/Surface/Highest</code></td></tr>
          <tr><td>Borda do alerta de sucesso</td><td><code>Static/Success/On Surface/Border/Default</code></td></tr>
          <tr><td>Fundo do alerta de aviso</td><td><code>Static/Warning/Surface/Highest</code></td></tr>
          <tr><td>Borda do alerta de aviso</td><td><code>Static/Warning/On Surface/Border/Default</code></td></tr>
          <tr><td>Fundo do alerta de erro</td><td><code>Static/Critical/Surface/Highest</code></td></tr>
          <tr><td>Borda do alerta de erro</td><td><code>Static/Critical/On Surface/Border/Default</code></td></tr>
          <tr><td>Container da tag</td><td><code>Static/Primary/Container/Default</code></td></tr>
          <tr><td>Texto da tag</td><td><code>Static/Primary/On Container/Default</code></td></tr>

          {/* ── Inputable ── */}
          <tr><td colSpan="2" style={{ background: '#FFF0F8', fontWeight: 700 }}>Inputable — Entrada de dados</td></tr>
          <tr><td>Fundo do input</td><td><code>Inputable/Field/Neutral/Surface/Default</code></td></tr>
          <tr><td>Borda do input</td><td><code>Inputable/Field/Neutral/On Surface/Border/Default</code></td></tr>
          <tr><td>Borda do input (focus)</td><td><code>Inputable/Field/Neutral/On Surface/Border/Active</code></td></tr>
          <tr><td>Borda do input com erro</td><td><code>Inputable/Field/Critical/On Surface/Border/Default</code></td></tr>
          <tr><td>Texto de helper com erro</td><td><code>Inputable/Field/Critical/On Surface/Text/Default</code></td></tr>
          <tr><td>Borda do input válido</td><td><code>Inputable/Field/Success/On Surface/Border/Default</code></td></tr>
          <tr><td>Borda do checkbox</td><td><code>Inputable/Selectable/Neutral/On Surface/Border/Default</code></td></tr>
          <tr><td>Fundo do checkbox marcado</td><td><code>Inputable/Selectable/Neutral/Surface/Active</code></td></tr>
          <tr><td>Ícone do checkbox marcado</td><td><code>Inputable/Selectable/Neutral/On Surface/Active</code></td></tr>
          <tr><td>Checkbox desabilitado</td><td><code>Inputable/Selectable/Neutral/Surface/Disabled</code></td></tr>

          {/* ── Core ── */}
          <tr><td colSpan="2" style={{ background: '#F5F5F5', fontWeight: 700 }}>Core — Primitivos de página</td></tr>
          <tr><td>Texto principal da página</td><td><code>Core/On Surface/Text/Primary</code></td></tr>
          <tr><td>Texto secundário</td><td><code>Core/On Surface/Text/Secondary</code></td></tr>
          <tr><td>Texto desabilitado</td><td><code>Core/On Surface/Text/Disabled</code></td></tr>
          <tr><td>Ícone principal</td><td><code>Core/On Surface/Icon/Primary</code></td></tr>
          <tr><td>Ícone secundário</td><td><code>Core/On Surface/Icon/Secondary</code></td></tr>
          <tr><td>Borda genérica / divisor</td><td><code>Core/On Surface/Border/Default</code></td></tr>
          <tr><td>Link padrão</td><td><code>Core/On Surface/Link/Default</code></td></tr>
          <tr><td>Link visitado</td><td><code>Core/On Surface/Link/Visited</code></td></tr>
          <tr><td>Fundo da página</td><td><code>Core/Surface/Default</code></td></tr>
          <tr><td>Fundo invertido</td><td><code>Core/Surface/Inverse</code></td></tr>
        </tbody>
      </table>
    </div>
  );
}
