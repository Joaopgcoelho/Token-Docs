import React from 'react';
import LfButton from '@lift/ds-web/components/LfButton/';
import LfButtonGroup from '@lift/ds-web/components/LfButtonGroup/';
import LfHeading from '@lift/ds-web/components/LfHeading/';
import LfParagraph from '@lift/ds-web/components/LfParagraph/';

export default function Dynamic() {
  return (
    <div>
      <LfHeading as="h1">Dynamic</LfHeading>
      <p className="subtitle">Elementos que disparam ações e alteram o fluxo de navegação.</p>

      <div className="do-dont">
        <div className="do-box">
          <div className="do-box-t">Quando usar</div>
          <ul>
            <li>Botões que submetem formulários ou navegam para outra tela</li>
            <li>CTAs principais (Salvar, Confirmar, Continuar)</li>
            <li>Ações destrutivas que exigem confirmação</li>
          </ul>
        </div>
        <div className="dont-box">
          <div className="dont-box-t">Quando NÃO usar</div>
          <ul>
            <li>Accordions, tabs → use <strong>Interactive</strong></li>
            <li>Cards ou banners → use <strong>Static</strong></li>
            <li>Campos de formulário → use <strong>Inputable</strong></li>
          </ul>
        </div>
      </div>

      <LfHeading as="h3">Hierarquias</LfHeading>
      <table>
        <thead><tr><th>Hierarquia</th><th>Uso</th><th>Exemplo</th></tr></thead>
        <tbody>
          <tr><td><strong>Primary</strong></td><td>Ação principal. Máx 1 por área</td><td>Botão "Confirmar"</td></tr>
          <tr><td><strong>Secondary</strong></td><td>Ação alternativa</td><td>Botão "Cancelar"</td></tr>
          <tr><td><strong>Critical</strong></td><td>Ação destrutiva</td><td>Botão "Excluir"</td></tr>
          <tr><td><strong>Ghost</strong></td><td>Sem fundo visível</td><td>Link "Saiba mais"</td></tr>
          <tr><td><strong>CTA</strong></td><td>Destaque especial</td><td>Botão "Oferta"</td></tr>
        </tbody>
      </table>

      <LfHeading as="h3">Componentes Lift — Preview ao vivo</LfHeading>
      <div className="preview-area">
        <LfButton appearance="primary">Confirmar</LfButton>
        <LfButton appearance="secondary">Cancelar</LfButton>
        <LfButton appearance="critical">Excluir</LfButton>
        <LfButton appearance="ghost">Saiba mais</LfButton>
        <LfButton appearance="cta">Oferta especial</LfButton>
      </div>

      <LfHeading as="h3">Botões com loading</LfHeading>
      <div className="preview-area">
        <LfButton appearance="primary" loading>Salvando...</LfButton>
        <LfButton appearance="secondary" loading>Processando</LfButton>
      </div>

      <LfHeading as="h3">Tamanhos</LfHeading>
      <div className="preview-area">
        <LfButton appearance="primary" size="sm">Small</LfButton>
        <LfButton appearance="primary" size="md">Medium</LfButton>
        <LfButton appearance="primary" size="lg">Large</LfButton>
      </div>

      <LfHeading as="h3">Variante Inverse (fundo escuro)</LfHeading>
      <div className="preview-area" style={{ background: '#171717', border: 'none' }}>
        <LfButton appearance="primary" color="inverse">Primary Inverse</LfButton>
        <LfButton appearance="secondary" color="inverse">Secondary Inverse</LfButton>
        <LfButton appearance="ghost" color="inverse">Ghost Inverse</LfButton>
      </div>

      <LfHeading as="h3">Button Group</LfHeading>
      <div className="preview-area">
        <LfButtonGroup
          startButton={{ text: 'Confirmar' }}
          endButton={{ text: 'Cancelar' }}
          size="md"
        />
      </div>


      <LfHeading as="h3">Valores de referência (Light)</LfHeading>
      <table>
        <thead><tr><th>Token</th><th>Valor</th><th>Uso</th></tr></thead>
        <tbody>
          <tr><td><code>Dynamic/Primary/Surface/Default</code></td><td><code>#076AEA</code></td><td>Fundo botão primário</td></tr>
          <tr><td><code>Dynamic/Primary/On Surface/Default</code></td><td><code>#FFFFFF</code></td><td>Texto sobre botão primário</td></tr>
          <tr><td><code>Dynamic/Critical/Surface/Default</code></td><td><code>#C42A27</code></td><td>Fundo botão destrutivo</td></tr>
          <tr><td><code>Dynamic/Ghost/On Surface/Default</code></td><td><code>#076AEA</code></td><td>Texto botão ghost</td></tr>
        </tbody>
      </table>
    </div>
  );
}
