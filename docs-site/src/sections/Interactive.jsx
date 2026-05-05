import React, { useState } from 'react';
import LfAccordion from '@lift/ds-web/components/LfAccordion/';
import LfTabGroupHorizontal from '@lift/ds-web/components/LfTabGroupHorizontal/';
import LfTabItem from '@lift/ds-web/components/LfTabItem/';
import LfHeading from '@lift/ds-web/components/LfHeading/';
import LfParagraph from '@lift/ds-web/components/LfParagraph/';

export default function Interactive() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div>
      <LfHeading as="h1">Interactive</LfHeading>
      <p className="subtitle">Elementos que respondem ao usuário sem alterar o fluxo de navegação.</p>

      <div className="do-dont">
        <div className="do-box">
          <div className="do-box-t">Quando usar</div>
          <ul>
            <li>Accordions que expandem/colapsam seções</li>
            <li>Tabs que alternam painéis na mesma página</li>
            <li>Dropdowns, popovers e tooltips</li>
          </ul>
        </div>
        <div className="dont-box">
          <div className="dont-box-t">Quando NÃO usar</div>
          <ul>
            <li>Botões de ação principal → use <strong>Dynamic</strong></li>
            <li>Elementos visuais sem clique → use <strong>Static</strong></li>
            <li>Campos de entrada → use <strong>Inputable</strong></li>
          </ul>
        </div>
      </div>

      <LfHeading as="h3">Accordion — Componente Lift ao vivo</LfHeading>
      <div className="preview-area" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
        <LfAccordion heading="O que são tokens Dynamic?" appearance="primary">
          <LfParagraph>Tokens Dynamic são usados em elementos que disparam ações e alteram o fluxo de navegação, como botões de submit e CTAs.</LfParagraph>
        </LfAccordion>
        <LfAccordion heading="Quando usar Interactive?" appearance="secondary">
          <LfParagraph>Use Interactive para elementos que respondem ao usuário sem mudar de rota: accordions, tabs, tooltips e dropdowns.</LfParagraph>
        </LfAccordion>
        <LfAccordion heading="Diferença entre Static e Interactive" appearance="neutral">
          <LfParagraph>Static é para elementos visuais sem interação (cards, banners). Interactive é para elementos que respondem a clique/hover.</LfParagraph>
        </LfAccordion>
      </div>

      <LfHeading as="h3">Tabs — Componente Lift ao vivo</LfHeading>
      <div className="preview-area" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
        <LfTabGroupHorizontal>
          <LfTabItem label={{ text: 'Dynamic' }} selected={activeTab === 0} onClick={() => setActiveTab(0)} />
          <LfTabItem label={{ text: 'Interactive' }} selected={activeTab === 1} onClick={() => setActiveTab(1)} />
          <LfTabItem label={{ text: 'Static' }} selected={activeTab === 2} onClick={() => setActiveTab(2)} />
        </LfTabGroupHorizontal>
        <div style={{ padding: '16px 0' }}>
          {activeTab === 0 && <LfParagraph>Conteúdo da aba Dynamic — botões, CTAs, ações de navegação.</LfParagraph>}
          {activeTab === 1 && <LfParagraph>Conteúdo da aba Interactive — accordions, tabs, tooltips.</LfParagraph>}
          {activeTab === 2 && <LfParagraph>Conteúdo da aba Static — cards, banners, alertas.</LfParagraph>}
        </div>
      </div>


      <LfHeading as="h3">Valores de referência (Light)</LfHeading>
      <table>
        <thead><tr><th>Token</th><th>Valor</th><th>Uso</th></tr></thead>
        <tbody>
          <tr><td><code>Interactive/Primary/Surface/Default</code></td><td><code>#E0ECFC</code></td><td>Fundo tab ativa</td></tr>
          <tr><td><code>Interactive/Primary/On Surface/Default</code></td><td><code>#171717</code></td><td>Texto tab ativa</td></tr>
          <tr><td><code>Interactive/Neutral/Surface/Default</code></td><td><code>#F5F5F5</code></td><td>Fundo toggle neutro</td></tr>
        </tbody>
      </table>
    </div>
  );
}
