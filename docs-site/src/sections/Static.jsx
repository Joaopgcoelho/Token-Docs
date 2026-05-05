import React from 'react';
import LfAlert from '@lift/ds-web/components/LfAlert/';
import LfCardBaseStatic from '@lift/ds-web/components/LfCardBaseStatic/';
import LfTagStatic from '@lift/ds-web/components/LfTagStatic/';
import LfHeading from '@lift/ds-web/components/LfHeading/';
import LfParagraph from '@lift/ds-web/components/LfParagraph/';

export default function Static() {
  return (
    <div>
      <LfHeading as="h1">Static</LfHeading>
      <p className="subtitle">Elementos de composição visual sem interação direta.</p>

      <div className="do-dont">
        <div className="do-box">
          <div className="do-box-t">Quando usar</div>
          <ul>
            <li>Cards de conteúdo sem ação clicável</li>
            <li>Banners informativos e editoriais</li>
            <li>Alertas de feedback (success, warning, critical)</li>
            <li>Tags estáticas de categorização</li>
          </ul>
        </div>
        <div className="dont-box">
          <div className="dont-box-t">Quando NÃO usar</div>
          <ul>
            <li>Elementos clicáveis → use <strong>Dynamic</strong> ou <strong>Interactive</strong></li>
            <li>Campos de formulário → use <strong>Inputable</strong></li>
          </ul>
        </div>
      </div>

      <LfHeading as="h3">Alert — Componente Lift ao vivo</LfHeading>
      <div className="preview-area" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '12px' }}>
        <LfAlert appearance="info" heading={{ text: 'Informação' }}>
          Use tokens Static para elementos visuais sem interação.
        </LfAlert>
        <LfAlert appearance="success" heading={{ text: 'Sucesso' }}>
          Dados salvos com sucesso.
        </LfAlert>
        <LfAlert appearance="warning" heading={{ text: 'Atenção' }}>
          Verifique os campos antes de continuar.
        </LfAlert>
        <LfAlert appearance="error" heading={{ text: 'Erro' }}>
          Ocorreu um erro ao processar a solicitação.
        </LfAlert>
      </div>

      <LfHeading as="h3">Tags estáticas — Componente Lift ao vivo</LfHeading>
      <div className="preview-area">
        <LfTagStatic>Default</LfTagStatic>
        <LfTagStatic>Ativo</LfTagStatic>
        <LfTagStatic>Pendente</LfTagStatic>
      </div>

      <LfHeading as="h3">Card estático — Componente Lift ao vivo</LfHeading>
      <div className="preview-area">
        <LfCardBaseStatic style={{ padding: '18px', maxWidth: '320px', width: '100%' }}>
          <LfHeading as="h4">Título do card</LfHeading>
          <LfParagraph>Conteúdo informativo sem ação associada. Use tokens Static/Primary/Surface.</LfParagraph>
        </LfCardBaseStatic>
      </div>


      <LfHeading as="h3">Sistema de intensidade</LfHeading>
      <table>
        <thead><tr><th>Intensidade</th><th>Luminosidade</th><th>Uso</th></tr></thead>
        <tbody>
          <tr><td><strong>Highest</strong></td><td>Mais clara</td><td>Fundo sutil</td></tr>
          <tr><td><strong>Higher</strong></td><td>Clara</td><td>Fundo leve</td></tr>
          <tr><td><strong>High</strong></td><td>Média-clara</td><td>Fundo moderado</td></tr>
          <tr><td><strong>Low</strong></td><td>Média-escura</td><td>Fundo com presença</td></tr>
          <tr><td><strong>Lower</strong></td><td>Escura</td><td>Fundo forte</td></tr>
          <tr><td><strong>Lowest</strong></td><td>Mais escura</td><td>Fundo máximo</td></tr>
        </tbody>
      </table>

      <LfHeading as="h3">Valores de referência (Light)</LfHeading>
      <table>
        <thead><tr><th>Token</th><th>Valor</th><th>Uso</th></tr></thead>
        <tbody>
          <tr><td><code>Static/Primary/Surface/Highest</code></td><td><code>#E0ECFC</code></td><td>Card claro</td></tr>
          <tr><td><code>Static/Critical/Surface/Highest</code></td><td><code>#FBE5E5</code></td><td>Alerta de erro</td></tr>
          <tr><td><code>Static/Success/Surface/Highest</code></td><td><code>#BDEFAF</code></td><td>Alerta de sucesso</td></tr>
        </tbody>
      </table>
    </div>
  );
}
