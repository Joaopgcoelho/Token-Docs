import React from 'react';
import LfHeading from '@lift/ds-web/components/LfHeading/';
import LfParagraph from '@lift/ds-web/components/LfParagraph/';
import LfAlert from '@lift/ds-web/components/LfAlert/';
import LfLink from '@lift/ds-web/components/LfLink/';

export default function CoreSection() {
  return (
    <div>
      <LfHeading as="h1">Core</LfHeading>
      <p className="subtitle">Tokens primitivos que definem o sistema visual base — parte da Usage Collection.</p>

      <LfParagraph>
        Core tokens definem os valores fundamentais do sistema visual: texto, bordas, links, ícones e superfícies de página.
        Eles são a base sobre a qual todos os outros tokens semânticos são construídos.
      </LfParagraph>

      <LfAlert variant="warning">
        Core tokens <strong>nunca</strong> devem ser usados diretamente em componentes de UI.
        Sempre prefira tokens semânticos (Dynamic, Interactive, Static, Inputable) que referenciam Core internamente.
      </LfAlert>


      <LfHeading as="h2">O que Core define</LfHeading>
      <LfParagraph>
        Core é responsável pelos elementos visuais que não pertencem a nenhum componente específico:
        cor de texto da página, cor de fundo da aplicação, bordas genéricas, links e ícones globais.
      </LfParagraph>

      <table>
        <thead>
          <tr><th>Categoria</th><th>Descrição</th><th>Exemplo de uso</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>Text</strong></td><td>Cores de texto da página</td><td>Parágrafos, headings fora de componentes</td></tr>
          <tr><td><strong>Border</strong></td><td>Bordas genéricas</td><td>Divisores, separadores de seção</td></tr>
          <tr><td><strong>Link</strong></td><td>Cores de links</td><td>Links inline em texto corrido</td></tr>
          <tr><td><strong>Icon</strong></td><td>Cores de ícones globais</td><td>Ícones decorativos fora de botões</td></tr>
          <tr><td><strong>Surface</strong></td><td>Fundo da aplicação</td><td>Background da página principal</td></tr>
        </tbody>
      </table>


      <LfHeading as="h2">Valores de referência (Light)</LfHeading>
      <table>
        <thead>
          <tr><th>Token</th><th>Valor</th><th>Uso</th></tr>
        </thead>
        <tbody>
          <tr><td><code>Core/On Surface/Text/Primary</code></td><td><code>#171717</code></td><td>Texto principal da página</td></tr>
          <tr><td><code>Core/On Surface/Text/Secondary</code></td><td><code>#525252</code></td><td>Texto secundário / descrições</td></tr>
          <tr><td><code>Core/On Surface/Text/Disabled</code></td><td><code>#A3A3A3</code></td><td>Texto desabilitado</td></tr>
          <tr><td><code>Core/On Surface/Icon/Primary</code></td><td><code>#171717</code></td><td>Ícone principal</td></tr>
          <tr><td><code>Core/On Surface/Icon/Secondary</code></td><td><code>#525252</code></td><td>Ícone secundário</td></tr>
          <tr><td><code>Core/On Surface/Border/Default</code></td><td><code>#D4D4D4</code></td><td>Borda padrão</td></tr>
          <tr><td><code>Core/On Surface/Link/Default</code></td><td><code>#076AEA</code></td><td>Link padrão</td></tr>
          <tr><td><code>Core/On Surface/Link/Visited</code></td><td><code>#6B21A8</code></td><td>Link visitado</td></tr>
          <tr><td><code>Core/Surface/Default</code></td><td><code>#FFFFFF</code></td><td>Fundo da página</td></tr>
          <tr><td><code>Core/Surface/Inverse</code></td><td><code>#171717</code></td><td>Fundo invertido (dark sections)</td></tr>
        </tbody>
      </table>


      <LfHeading as="h2">Cadeia de aliases</LfHeading>
      <pre>{`Core/On Surface/Text/Primary
  → Brand/Color/Neutral/900
    → #171717

Core/On Surface/Link/Default
  → Brand/Color/Primary/500
    → #076AEA

Core/Surface/Default
  → Brand/Color/Neutral/100
    → #FFFFFF`}</pre>

      <LfParagraph>
        Core tokens são aliases de <LfLink href="#brand">Brand tokens</LfLink>. Quando a paleta de marca muda,
        os valores de Core se atualizam automaticamente.
      </LfParagraph>

      <LfHeading as="h2">Quando usar Core (indiretamente)</LfHeading>
      <table>
        <thead>
          <tr><th>Cenário</th><th>Token recomendado</th></tr>
        </thead>
        <tbody>
          <tr><td>Texto de parágrafo na página</td><td><code>Core/On Surface/Text/Primary</code></td></tr>
          <tr><td>Link inline no texto</td><td><code>Core/On Surface/Link/Default</code></td></tr>
          <tr><td>Ícone decorativo global</td><td><code>Core/On Surface/Icon/Primary</code></td></tr>
          <tr><td>Borda de divisor genérico</td><td><code>Core/On Surface/Border/Default</code></td></tr>
          <tr><td>Fundo da aplicação</td><td><code>Core/Surface/Default</code></td></tr>
        </tbody>
      </table>

      <LfAlert variant="info">
        <strong>Regra de ouro:</strong> Se o elemento pertence a um componente (botão, card, input, accordion),
        use o token do grupo correspondente (Dynamic, Static, Inputable, Interactive) — nunca Core diretamente.
      </LfAlert>
    </div>
  );
}
