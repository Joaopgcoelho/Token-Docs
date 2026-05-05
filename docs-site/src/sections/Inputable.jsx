import React from 'react';
import LfInputText from '@lift/ds-web/components/LfInputText/';
import LfCheckbox from '@lift/ds-web/components/LfCheckbox/';
import LfHeading from '@lift/ds-web/components/LfHeading/';
import LfParagraph from '@lift/ds-web/components/LfParagraph/';

export default function Inputable() {
  return (
    <div>
      <LfHeading as="h1">Inputable</LfHeading>
      <p className="subtitle">Elementos de coleta de dados do usuário.</p>

      <div className="do-dont">
        <div className="do-box">
          <div className="do-box-t">Quando usar</div>
          <ul>
            <li>Campos de texto, senha, busca, textarea</li>
            <li>Checkboxes, radio buttons, switches</li>
            <li>Selects, comboboxes, date pickers</li>
          </ul>
        </div>
        <div className="dont-box">
          <div className="dont-box-t">Quando NÃO usar</div>
          <ul>
            <li>Botões de submit → use <strong>Dynamic</strong></li>
            <li>Labels informativos → use <strong>Core</strong></li>
          </ul>
        </div>
      </div>

      <LfHeading as="h3">Input Text — Componente Lift ao vivo</LfHeading>
      <div className="preview-area" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '16px' }}>
        <LfInputText label={{ text: 'E-mail' }} placeholder="usuario@email.com" />
        <LfInputText label={{ text: 'Senha' }} appearance="error" helper={{ text: 'Senha muito curta' }} />
        <LfInputText label={{ text: 'Nome completo' }} appearance="success" helper={{ text: 'Nome válido' }} />
      </div>

      <LfHeading as="h3">Checkbox — Componente Lift ao vivo</LfHeading>
      <div className="preview-area" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '12px' }}>
        <LfCheckbox label={{ text: 'Aceito os termos de uso' }} />
        <LfCheckbox label={{ text: 'Receber notificações por e-mail' }} checked />
        <LfCheckbox label={{ text: 'Opção desabilitada' }} disabled />
        <LfCheckbox label={{ text: 'Checkbox com erro' }} appearance="error" />
      </div>


      <LfHeading as="h3">Subtipos</LfHeading>
      <table>
        <thead><tr><th>Subtipo</th><th>Uso</th></tr></thead>
        <tbody>
          <tr><td><strong>Field</strong></td><td>Campos de texto (input, textarea, select)</td></tr>
          <tr><td><strong>Selectable</strong></td><td>Controles de seleção (checkbox, radio, switch)</td></tr>
        </tbody>
      </table>

      <LfHeading as="h3">Valores de referência (Light)</LfHeading>
      <table>
        <thead><tr><th>Token</th><th>Valor</th><th>Uso</th></tr></thead>
        <tbody>
          <tr><td><code>Inputable/Field/Neutral/Surface/Default</code></td><td><code>#FFFFFF</code></td><td>Fundo do input</td></tr>
          <tr><td><code>Inputable/Field/Neutral/On Surface/Border/Default</code></td><td><code>#A3A3A3</code></td><td>Borda do input</td></tr>
          <tr><td><code>Inputable/Field/Critical/On Surface/Border/Default</code></td><td><code>#EA706E</code></td><td>Borda com erro</td></tr>
          <tr><td><code>Inputable/Field/Success/On Surface/Border/Default</code></td><td><code>#27B200</code></td><td>Borda válido</td></tr>
        </tbody>
      </table>
    </div>
  );
}
