import React from 'react';
import LfAlert from '@lift/ds-web/components/LfAlert/';
import LfHeading from '@lift/ds-web/components/LfHeading/';
import LfParagraph from '@lift/ds-web/components/LfParagraph/';

export default function Anatomy() {
  return (
    <div>
      <LfHeading as="h1">Anatomia de um Design Token</LfHeading>
      <p className="subtitle">Estrutura, propriedades e conceitos fundamentais dos Design Tokens do Lift DS.</p>

      <LfHeading as="h2">O que são Design Tokens</LfHeading>
      <LfParagraph>
        Os Design Tokens são os fundamentos que representam as propriedades de design do Lift DS, como cores, espaçamentos, tipografia e sombras.
        Eles servem como uma linguagem única compartilhada entre design e código, permitindo que designers e desenvolvedores utilizem as mesmas
        referências de estilo de forma consistente e escalável em diferentes plataformas (iOS, Android e Web).
      </LfParagraph>


      <LfHeading as="h2">Estrutura de um token</LfHeading>
      <LfParagraph>
        Um Design Token possui um <strong>nome único</strong>, que o identifica, e um <strong>valor</strong> que é a informação associada.
        O nome do token é o que o identifica e nunca deve ser modificado. O valor é uma variável, e pode ser alterado se necessário.
      </LfParagraph>

      <table>
        <thead>
          <tr><th>Propriedade</th><th>Exemplo</th><th>Descrição</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Nome</strong></td>
            <td><code>primary-color-low</code></td>
            <td>Chave única que identifica o token</td>
          </tr>
          <tr>
            <td><strong>Valor</strong></td>
            <td>
              <span className="sw" style={{ background: '#0046F8', display: 'inline-block', width: 16, height: 16, verticalAlign: 'middle', borderRadius: 3 }} />{' '}
              <code>#0046F8</code>
            </td>
            <td>Informação variável associada ao token</td>
          </tr>
          <tr>
            <td><strong>Tipo</strong></td>
            <td><code>color</code></td>
            <td>Categoria lógica que define propósito e função</td>
          </tr>
          <tr>
            <td><strong>Descrição</strong></td>
            <td><em>"cor da marca, usar apenas para consumo dos Semantic Tokens"</em></td>
            <td>Contexto de uso, casos e limitações</td>
          </tr>
        </tbody>
      </table>


      <LfHeading as="h2">Nome</LfHeading>
      <LfParagraph>
        O nome é a chave que identifica o token. Ele deve ser descritivo e fácil de identificar tanto por designers quanto por desenvolvedores.
      </LfParagraph>
      <pre>{`Estrutura do nome:
[camada]-[categoria]-[variante]-[intensidade]

Exemplos:
  primary-color-low       → cor primária, intensidade baixa
  brand-color-primary-500 → cor de marca, primária, tom 500
  border-width-200        → espessura de borda, nível 200`}</pre>


      <LfHeading as="h2">Tipo</LfHeading>
      <LfParagraph>
        Os tipos de token estabelecem o propósito e função de um token, agrupando-os em categorias lógicas:
      </LfParagraph>
      <table>
        <thead><tr><th>Tipo</th><th>Descrição</th><th>Exemplos de valor</th></tr></thead>
        <tbody>
          <tr><td><strong>Color</strong></td><td>Cores em formato hex ou com nome</td><td><code>#076AEA</code>, <code>#FFFFFF</code></td></tr>
          <tr><td><strong>Font Family</strong></td><td>Famílias de fonte</td><td><code>Inter</code>, <code>Montserrat</code></td></tr>
          <tr><td><strong>Font Weight</strong></td><td>Peso da fonte</td><td><code>400</code> (regular), <code>700</code> (bold)</td></tr>
          <tr><td><strong>Font Size</strong></td><td>Tamanho da fonte</td><td><code>14px</code>, <code>16px</code></td></tr>
          <tr><td><strong>Spacing</strong></td><td>Espaçamentos (padding, margin, gap)</td><td><code>8px</code>, <code>16px</code>, <code>24px</code></td></tr>
          <tr><td><strong>Border</strong></td><td>Espessura e raio de borda</td><td><code>1px</code>, <code>4px</code>, <code>8px</code></td></tr>
          <tr><td><strong>Shadow</strong></td><td>Sombras de elevação</td><td><code>0 2px 4px rgba(0,0,0,0.1)</code></td></tr>
          <tr><td><strong>Opacity</strong></td><td>Opacidade</td><td><code>0.5</code>, <code>0.8</code></td></tr>
        </tbody>
      </table>


      <LfHeading as="h2">Valor</LfHeading>
      <LfParagraph>
        É a informação variável associada a um token. O valor pode ser um dado bruto (como um hex de cor) ou uma referência a outro token (alias).
      </LfParagraph>
      <pre>{`Valor bruto:    #0046F8
Alias:          Brand/Color/Primary/500 → referencia outro token
Cadeia:         Dynamic/Primary/Surface → Brand/Color/Primary/500 → #076AEA`}</pre>


      <LfHeading as="h2">Descrição</LfHeading>
      <LfParagraph>
        A descrição de um token fornece ao designer e ao desenvolvedor uma informação específica sobre como e quando utilizar aquele token.
        Através da descrição, conseguimos fornecer o contexto, mostrar casos de uso, trazer informações relevantes e especificar limitações de uso.
      </LfParagraph>

      <LfHeading as="h2">W3C Design Tokens</LfHeading>
      <LfParagraph>
        Os materiais do Lift DS são construídos com base na documentação da W3C, buscando estar o mais próximo das boas práticas descritas.
      </LfParagraph>
      <LfAlert variant="info">
        Design tokens are a methodology for expressing design decisions in a platform-agnostic way so that they can be shared across different
        disciplines, tools, and technologies. They help establish a common vocabulary across organisations.
        — <a href="https://tr.designtokens.org/format/#design-token" target="_blank" rel="noreferrer">W3C Design Tokens Format</a>
      </LfAlert>
    </div>
  );
}
