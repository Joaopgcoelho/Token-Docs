import React from 'react';
import LfButton from '@lift/ds-web/components/LfButton/';
import LfAccordion from '@lift/ds-web/components/LfAccordion/';
import LfAlert from '@lift/ds-web/components/LfAlert/';
import LfInputText from '@lift/ds-web/components/LfInputText/';
import LfCheckbox from '@lift/ds-web/components/LfCheckbox/';
import LfHeading from '@lift/ds-web/components/LfHeading/';
import LfParagraph from '@lift/ds-web/components/LfParagraph/';

export default function ComponentExamples() {
  return (
    <div>
      <LfHeading as="h1">Exemplos de Componentes</LfHeading>
      <p className="subtitle">Componentes Lift reais com seus mapeamentos de tokens.</p>

      {/* ── LfButton ── */}
      <LfHeading as="h2">LfButton</LfHeading>
      <LfParagraph>Botões de ação — grupo <strong>Dynamic</strong>.</LfParagraph>

      <LfHeading as="h3">Preview</LfHeading>
      <div className="preview-area">
        <LfButton appearance="primary">Confirmar</LfButton>
        <LfButton appearance="secondary">Cancelar</LfButton>
        <LfButton appearance="critical">Excluir</LfButton>
      </div>

      <LfHeading as="h3">Mapeamento de tokens</LfHeading>
      <table>
        <thead>
          <tr><th>Aparência</th><th>Propriedade CSS</th><th>Token</th><th>Valor (Light)</th></tr>
        </thead>
        <tbody>
          <tr><td>Primary</td><td><code>background-color</code></td><td><code>Dynamic/Primary/Surface/Default</code></td><td><code>#076AEA</code></td></tr>
          <tr><td>Primary</td><td><code>color</code></td><td><code>Dynamic/Primary/On Surface/Default</code></td><td><code>#FFFFFF</code></td></tr>
          <tr><td>Primary (hover)</td><td><code>background-color</code></td><td><code>Dynamic/Primary/Surface/Hover</code></td><td><code>#0555BB</code></td></tr>
          <tr><td>Secondary</td><td><code>background-color</code></td><td><code>Dynamic/Secondary/Surface/Default</code></td><td><code>#E0ECFC</code></td></tr>
          <tr><td>Secondary</td><td><code>color</code></td><td><code>Dynamic/Secondary/On Surface/Default</code></td><td><code>#076AEA</code></td></tr>
          <tr><td>Critical</td><td><code>background-color</code></td><td><code>Dynamic/Critical/Surface/Default</code></td><td><code>#C42A27</code></td></tr>
          <tr><td>Critical</td><td><code>color</code></td><td><code>Dynamic/Critical/On Surface/Default</code></td><td><code>#FFFFFF</code></td></tr>
        </tbody>
      </table>


      {/* ── LfAccordion ── */}
      <LfHeading as="h2">LfAccordion</LfHeading>
      <LfParagraph>Painéis expansíveis — grupo <strong>Interactive</strong>.</LfParagraph>

      <LfHeading as="h3">Preview</LfHeading>
      <div className="preview-area" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
        <LfAccordion heading="O que são tokens?" appearance="primary">
          Tokens são variáveis de design que armazenam decisões visuais de forma reutilizável.
        </LfAccordion>
        <LfAccordion heading="Quando usar Interactive?" appearance="secondary">
          Use Interactive para elementos que respondem ao usuário sem mudar de rota.
        </LfAccordion>
      </div>

      <LfHeading as="h3">Mapeamento de tokens</LfHeading>
      <table>
        <thead>
          <tr><th>Aparência</th><th>Propriedade CSS</th><th>Token</th><th>Valor (Light)</th></tr>
        </thead>
        <tbody>
          <tr><td>Primary</td><td><code>background-color</code></td><td><code>Interactive/Primary/Surface/Default</code></td><td><code>#E0ECFC</code></td></tr>
          <tr><td>Primary</td><td><code>color</code></td><td><code>Interactive/Primary/On Surface/Default</code></td><td><code>#171717</code></td></tr>
          <tr><td>Secondary</td><td><code>background-color</code></td><td><code>Interactive/Secondary/Surface/Default</code></td><td><code>#F5F5F5</code></td></tr>
          <tr><td>Neutral</td><td><code>background-color</code></td><td><code>Interactive/Neutral/Surface/Default</code></td><td><code>#F5F5F5</code></td></tr>
          <tr><td>Neutral</td><td><code>border-color</code></td><td><code>Interactive/Neutral/On Surface/Border/Default</code></td><td><code>#D4D4D4</code></td></tr>
        </tbody>
      </table>


      {/* ── LfAlert ── */}
      <LfHeading as="h2">LfAlert</LfHeading>
      <LfParagraph>Alertas de feedback — grupo <strong>Static</strong>.</LfParagraph>

      <LfHeading as="h3">Preview</LfHeading>
      <div className="preview-area" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '12px' }}>
        <LfAlert appearance="info" heading={{ text: 'Informação' }}>
          Mensagem informativa para o usuário.
        </LfAlert>
        <LfAlert appearance="success" heading={{ text: 'Sucesso' }}>
          Operação realizada com sucesso.
        </LfAlert>
        <LfAlert appearance="warning" heading={{ text: 'Atenção' }}>
          Verifique os dados antes de continuar.
        </LfAlert>
        <LfAlert appearance="error" heading={{ text: 'Erro' }}>
          Ocorreu um erro ao processar a solicitação.
        </LfAlert>
      </div>

      <LfHeading as="h3">Mapeamento de tokens</LfHeading>
      <table>
        <thead>
          <tr><th>Aparência</th><th>Propriedade CSS</th><th>Token</th><th>Valor (Light)</th></tr>
        </thead>
        <tbody>
          <tr><td>Info</td><td><code>background-color</code></td><td><code>Static/Info/Surface/Highest</code></td><td><code>#E0ECFC</code></td></tr>
          <tr><td>Info</td><td><code>border-color</code></td><td><code>Static/Info/On Surface/Border/Default</code></td><td><code>#076AEA</code></td></tr>
          <tr><td>Success</td><td><code>background-color</code></td><td><code>Static/Success/Surface/Highest</code></td><td><code>#BDEFAF</code></td></tr>
          <tr><td>Success</td><td><code>border-color</code></td><td><code>Static/Success/On Surface/Border/Default</code></td><td><code>#27B200</code></td></tr>
          <tr><td>Warning</td><td><code>background-color</code></td><td><code>Static/Warning/Surface/Highest</code></td><td><code>#FFF3D6</code></td></tr>
          <tr><td>Warning</td><td><code>border-color</code></td><td><code>Static/Warning/On Surface/Border/Default</code></td><td><code>#FFAD00</code></td></tr>
          <tr><td>Error</td><td><code>background-color</code></td><td><code>Static/Critical/Surface/Highest</code></td><td><code>#FBE5E5</code></td></tr>
          <tr><td>Error</td><td><code>border-color</code></td><td><code>Static/Critical/On Surface/Border/Default</code></td><td><code>#C42A27</code></td></tr>
        </tbody>
      </table>


      {/* ── LfInputText ── */}
      <LfHeading as="h2">LfInputText</LfHeading>
      <LfParagraph>Campos de entrada de texto — grupo <strong>Inputable</strong>.</LfParagraph>

      <LfHeading as="h3">Preview</LfHeading>
      <div className="preview-area" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '16px' }}>
        <LfInputText label={{ text: 'Nome completo' }} placeholder="Digite seu nome" />
        <LfInputText label={{ text: 'E-mail inválido' }} appearance="error" helper={{ text: 'Formato de e-mail inválido' }} />
      </div>

      <LfHeading as="h3">Mapeamento de tokens</LfHeading>
      <table>
        <thead>
          <tr><th>Estado</th><th>Propriedade CSS</th><th>Token</th><th>Valor (Light)</th></tr>
        </thead>
        <tbody>
          <tr><td>Neutral</td><td><code>background-color</code></td><td><code>Inputable/Field/Neutral/Surface/Default</code></td><td><code>#FFFFFF</code></td></tr>
          <tr><td>Neutral</td><td><code>border-color</code></td><td><code>Inputable/Field/Neutral/On Surface/Border/Default</code></td><td><code>#A3A3A3</code></td></tr>
          <tr><td>Neutral (focus)</td><td><code>border-color</code></td><td><code>Inputable/Field/Neutral/On Surface/Border/Active</code></td><td><code>#076AEA</code></td></tr>
          <tr><td>Error</td><td><code>border-color</code></td><td><code>Inputable/Field/Critical/On Surface/Border/Default</code></td><td><code>#EA706E</code></td></tr>
          <tr><td>Error</td><td><code>color (helper)</code></td><td><code>Inputable/Field/Critical/On Surface/Text/Default</code></td><td><code>#C42A27</code></td></tr>
        </tbody>
      </table>

      {/* ── LfCheckbox ── */}
      <LfHeading as="h2">LfCheckbox</LfHeading>
      <LfParagraph>Controles de seleção — grupo <strong>Inputable</strong>.</LfParagraph>

      <LfHeading as="h3">Preview</LfHeading>
      <div className="preview-area" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '12px' }}>
        <LfCheckbox label={{ text: 'Aceito os termos de uso' }} />
        <LfCheckbox label={{ text: 'Opção selecionada' }} checked />
        <LfCheckbox label={{ text: 'Opção desabilitada' }} disabled />
      </div>

      <LfHeading as="h3">Mapeamento de tokens</LfHeading>
      <table>
        <thead>
          <tr><th>Estado</th><th>Propriedade CSS</th><th>Token</th><th>Valor (Light)</th></tr>
        </thead>
        <tbody>
          <tr><td>Unchecked</td><td><code>border-color</code></td><td><code>Inputable/Selectable/Neutral/On Surface/Border/Default</code></td><td><code>#A3A3A3</code></td></tr>
          <tr><td>Checked</td><td><code>background-color</code></td><td><code>Inputable/Selectable/Neutral/Surface/Active</code></td><td><code>#076AEA</code></td></tr>
          <tr><td>Checked</td><td><code>color (icon)</code></td><td><code>Inputable/Selectable/Neutral/On Surface/Active</code></td><td><code>#FFFFFF</code></td></tr>
          <tr><td>Disabled</td><td><code>background-color</code></td><td><code>Inputable/Selectable/Neutral/Surface/Disabled</code></td><td><code>#F5F5F5</code></td></tr>
          <tr><td>Disabled</td><td><code>border-color</code></td><td><code>Inputable/Selectable/Neutral/On Surface/Border/Disabled</code></td><td><code>#D4D4D4</code></td></tr>
        </tbody>
      </table>
    </div>
  );
}
