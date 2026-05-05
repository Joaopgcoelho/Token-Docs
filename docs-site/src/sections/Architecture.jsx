import React from 'react';
import LfAlert from '@lift/ds-web/components/LfAlert/';
import LfHeading from '@lift/ds-web/components/LfHeading/';
import LfParagraph from '@lift/ds-web/components/LfParagraph/';

export default function Architecture() {
  return (
    <div>
      <LfHeading as="h1">Camadas</LfHeading>
      <p className="subtitle">Para facilitar a gestão e direcionar o consumo, os tokens do Lift DS são divididos em diferentes camadas que se alimentam.</p>

      <LfHeading as="h2">Visão geral</LfHeading>
      <LfParagraph>
        Cada camada de token é aplicada em um momento específico do processo e armazena um tipo distinto de valor ou decisão de design.
        A estrutura vai do genérico ao específico:
      </LfParagraph>
      <pre>{`  Genérico ────────────────────────────────────────── Específico

  ┌──────────┐   ┌─────────────────────────┐   ┌────────────────┐
  │          │   │      Theme Tokens        │   │                │
  │   Base   │   │  ┌───────┐  ┌─────────┐ │   │   Component    │
  │  Tokens  │──▶│  │ Brand │─▶│  Usage  │ │──▶│    Tokens      │
  │          │   │  └───────┘  └─────────┘ │   │                │
  └──────────┘   └─────────────────────────┘   └────────────────┘
   #0046F8        blue-500 → color-primary     color-background
                                                → button-bg-color`}</pre>


      <LfHeading as="h2">Base Tokens (Foundations)</LfHeading>
      <LfParagraph>
        Os Base Tokens são os mais básicos do design system — também chamados de <strong>Foundations</strong>. Essa camada não é nomeada de forma
        semântica, ou seja, os tokens são genéricos, não refletindo situações específicas.
      </LfParagraph>
      <LfParagraph>
        São responsáveis por armazenar todos os valores brutos. São utilizados somente em projetos com casos muito específicos, como ilustrações.
      </LfParagraph>
      <table>
        <thead><tr><th>Camada</th><th>Usar em UI?</th><th>Papel</th></tr></thead>
        <tbody>
          <tr><td><strong>Base Tokens</strong></td><td>Nunca</td><td>Valores brutos de referência interna (cores puras, sizings)</td></tr>
        </tbody>
      </table>


      <LfHeading as="h2">Theme Tokens</LfHeading>
      <LfParagraph>
        Os <strong>Brand Tokens</strong> e os <strong>Usage Tokens</strong>, juntos, compõem os <strong>Theme Tokens</strong>. Trabalhar com essa
        estrutura torna mais claras as condições de uso, o direcionamento e a interpretação dos tokens por quem os consome.
      </LfParagraph>

      <LfHeading as="h3">Brand Tokens</LfHeading>
      <LfParagraph>
        Os Brand Tokens servem como um filtro dos Base Tokens. Eles filtram os dados brutos considerando as características de cada marca.
        Essa camada serve de alimentação para os Usage Tokens, mas não é consumida pelo usuário final.
      </LfParagraph>
      <table>
        <thead><tr><th>Camada</th><th>Usar em UI?</th><th>Papel</th></tr></thead>
        <tbody>
          <tr><td><strong>Brand Tokens</strong></td><td>Evitar</td><td>Paleta de marca — filtro dos Base Tokens, alimenta Usage</td></tr>
        </tbody>
      </table>

      <LfHeading as="h3">Usage Tokens</LfHeading>
      <LfParagraph>
        A camada de Usage Tokens é construída a partir dos Base Tokens e Brand Tokens, e seus nomes refletem sua responsabilidade, escopo e função.
        Essa camada é a <strong>principal fonte de consumo</strong> de tokens no Lift DS, pois já está adaptada diretamente aos contextos de uso dos produtos.
      </LfParagraph>
      <table>
        <thead><tr><th>Camada</th><th>Usar em UI?</th><th>Papel</th></tr></thead>
        <tbody>
          <tr><td><strong>Usage Tokens</strong></td><td>Sempre</td><td>Tokens semânticos — camada principal para UI</td></tr>
        </tbody>
      </table>


      <LfHeading as="h2">Component Tokens</LfHeading>
      <LfParagraph>
        Os Component Tokens são tokens específicos para um componente da interface ou conjunto deles, definindo estilos necessários para a sua
        aparência e comportamento. Aplicam as fundações de forma contextualizada e estruturada, resultando em um produto dinâmico e escalável.
      </LfParagraph>
      <LfParagraph>
        Os Component Tokens permitem que os componentes tenham formatos específicos, considerando as características de cada marca.
        A utilização desses tokens se restringe ao time de <strong>System Ops</strong>. No contexto dos produtos, as características das marcas
        são herdadas através dos componentes e dos Base Tokens.
      </LfParagraph>
      <table>
        <thead><tr><th>Camada</th><th>Usar em UI?</th><th>Papel</th></tr></thead>
        <tbody>
          <tr><td><strong>Component Tokens</strong></td><td>System Ops</td><td>Mapeamentos específicos por componente</td></tr>
        </tbody>
      </table>


      <LfHeading as="h2">Resumo das camadas</LfHeading>
      <table>
        <thead><tr><th>Camada</th><th>Usar em UI?</th><th>Papel</th><th>Exemplo</th></tr></thead>
        <tbody>
          <tr><td><strong>Base</strong></td><td>Nunca</td><td>Valores brutos</td><td><code>#0046F8</code> → <code>blue-500</code></td></tr>
          <tr><td><strong>Brand</strong></td><td>Evitar</td><td>Filtro de marca</td><td><code>blue-500</code> → <code>color-primary-100</code></td></tr>
          <tr><td><strong>Usage</strong></td><td>Sempre</td><td>Semântico de uso</td><td><code>color-primary-100</code> → <code>color-background</code></td></tr>
          <tr><td><strong>Component</strong></td><td>System Ops</td><td>Específico por componente</td><td><code>color-background</code> → <code>button-background-color</code></td></tr>
        </tbody>
      </table>


      <LfHeading as="h2">5 Grupos semânticos (Usage Collection)</LfHeading>
      <LfParagraph>A Usage Collection organiza tokens em 5 grupos baseados no comportamento do elemento. Core faz parte da Usage Collection.</LfParagraph>
      <table>
        <thead><tr><th>Grupo</th><th>Altera navegação?</th><th>Exemplos</th></tr></thead>
        <tbody>
          <tr><td><strong>Dynamic</strong></td><td>Sim</td><td>Botão submit, CTA, ação destrutiva</td></tr>
          <tr><td><strong>Interactive</strong></td><td>Não</td><td>Accordion, tabs, tooltip, dropdown</td></tr>
          <tr><td><strong>Static</strong></td><td>Não</td><td>Card, banner, divisor, alerta</td></tr>
          <tr><td><strong>Inputable</strong></td><td>Não</td><td>Input, checkbox, select, switch</td></tr>
          <tr><td><strong>Core</strong></td><td>—</td><td>Texto, ícone, borda, link, fundo de página</td></tr>
        </tbody>
      </table>

      <LfHeading as="h2">Papéis (roles)</LfHeading>
      <table>
        <thead><tr><th>Papel</th><th>Aplicação</th><th>CSS</th></tr></thead>
        <tbody>
          <tr><td><code>surface</code></td><td>Background do componente</td><td><code>background-color</code></td></tr>
          <tr><td><code>on-surface</code></td><td>Conteúdo sobre o surface</td><td><code>color</code></td></tr>
          <tr><td><code>container</code></td><td>Camada acima do surface (só Static)</td><td><code>background-color</code></td></tr>
          <tr><td><code>on-container</code></td><td>Conteúdo sobre o container</td><td><code>color</code></td></tr>
          <tr><td><code>border</code></td><td>Contorno do componente</td><td><code>border-color</code></td></tr>
        </tbody>
      </table>
      <LfAlert variant="info">Regra: cada <code>surface</code> tem um <code>on-surface</code> correspondente. Nunca misture pares de grupos diferentes.</LfAlert>

      <LfHeading as="h2">Nomenclatura</LfHeading>
      <pre>{`[Grupo] / [Hierarquia] / [Papel] / [Estado]

Dynamic/Primary/Surface/Default     → LfThmDynamicPrimarySurfaceDefault
Brand/Color/Primary/500             → LfThmBrandColorPrimary500
Core/On Surface/Text/Primary        → LfThmCoreOnSurfaceTextPrimary`}</pre>

      <LfHeading as="h2">Estados</LfHeading>
      <table>
        <thead><tr><th>Estado</th><th>Quando</th><th>Disponível em</th></tr></thead>
        <tbody>
          <tr><td><code>default</code></td><td>Sem interação</td><td>Todos</td></tr>
          <tr><td><code>hover</code></td><td>Cursor sobre</td><td>Dynamic, Interactive, Inputable</td></tr>
          <tr><td><code>pressed</code></td><td>Pressionado</td><td>Dynamic</td></tr>
          <tr><td><code>active</code></td><td>Ativo/selecionado</td><td>Interactive, Inputable</td></tr>
          <tr><td><code>loading</code></td><td>Processando</td><td>Dynamic</td></tr>
        </tbody>
      </table>

      <LfHeading as="h2">Cadeia de aliases</LfHeading>
      <pre>{`Dynamic/Primary/Surface/Default
  → Brand/Color/Primary/500
    → #076AEA`}</pre>
      <LfParagraph>Uma mudança na paleta de marca se propaga automaticamente para todos os tokens semânticos.</LfParagraph>

      <LfHeading as="h2">W3C Design Tokens</LfHeading>
      <LfParagraph>
        Os materiais do Lift DS são desenvolvidos com base na documentação da W3C, buscando seguir o mais fielmente possível as boas práticas recomendadas.
      </LfParagraph>
      <LfAlert variant="info">
        Design tokens are a methodology for expressing design decisions in a platform-agnostic way so that they can be shared across different
        disciplines, tools, and technologies. They help establish a common vocabulary across organisations.
        — <a href="https://tr.designtokens.org/format/#design-token" target="_blank" rel="noreferrer">W3C Design Tokens Format</a>
      </LfAlert>
    </div>
  );
}
