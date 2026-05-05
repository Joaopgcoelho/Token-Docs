import React from 'react';
import LfAlert from '@lift/ds-web/components/LfAlert/';
import LfHeading from '@lift/ds-web/components/LfHeading/';
import LfParagraph from '@lift/ds-web/components/LfParagraph/';

export default function HowToUse() {
  return (
    <div>
      <LfHeading as="h1">Como Usar o Token Docs</LfHeading>
      <p className="subtitle">Passo a passo para cada tipo de usuário.</p>

      <LfHeading as="h2">Para Designers (no Figma)</LfHeading>

      <LfHeading as="h3">1. Instalar o plugin</LfHeading>
      <ol>
        <li>Abra o Figma Desktop</li>
        <li>Vá em <strong>Plugins → Development → Import plugin from manifest</strong></li>
        <li>Selecione o arquivo <code>manifest.json</code> da pasta do projeto</li>
        <li>Abra qualquer arquivo que tenha variáveis locais (tokens)</li>
        <li>Vá em <strong>Plugins → Development → Token Docs</strong></li>
      </ol>

      <LfHeading as="h3">2. Gerar documentação no canvas</LfHeading>
      <ol>
        <li>Com o plugin aberto, clique no botão <strong>&quot;Gerar&quot;</strong></li>
        <li>O plugin cria um frame <code>Token Docs</code> no canvas</li>
        <li>Cada grupo semântico tem seu próprio board com:
          <ul>
            <li>Descrição do grupo</li>
            <li>Quando usar / Quando NÃO usar</li>
            <li>Tabela de roles (surface, on-surface, border...)</li>
            <li>Exemplos de componentes com tokens aplicados</li>
            <li>Cards de cor com valores por modo</li>
          </ul>
        </li>
        <li>No final, há um board com a <strong>Árvore de Decisão</strong> e o <strong>Mapeamento de Roles</strong></li>
      </ol>

      <LfHeading as="h3">3. Auditar uso de tokens</LfHeading>
      <ol>
        <li>Na aba <strong>&quot;Auditoria&quot;</strong> do plugin, clique em <strong>&quot;Escanear página&quot;</strong></li>
        <li>O plugin detecta: fills sem token, tokens Core em UI, tipos incompatíveis</li>
        <li>Para cada problema, mostra o token recomendado</li>
        <li>Clique em <strong>&quot;Aplicar fix&quot;</strong> para corrigir individualmente, ou <strong>&quot;Corrigir todos&quot;</strong></li>
      </ol>


      <LfHeading as="h2">Para Desenvolvedores (no código)</LfHeading>

      <LfHeading as="h3">Nomes de tokens em 3 formatos</LfHeading>
      <LfParagraph>Cada token tem 3 representações equivalentes:</LfParagraph>
      <table>
        <thead>
          <tr><th>Formato</th><th>Exemplo</th><th>Onde usar</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>Figma Path</strong></td><td><code>Dynamic/Primary/Surface/Default</code></td><td>Figma, documentação</td></tr>
          <tr><td><strong>JavaScript</strong></td><td><code>LfThmDynamicPrimarySurfaceDefault</code></td><td>Imports JS, Storybook</td></tr>
          <tr><td><strong>CSS Custom Property</strong></td><td><code>--lf-thm-dynamic-primary-surface-default</code></td><td>Stylesheets CSS</td></tr>
        </tbody>
      </table>

      <LfHeading as="h3">Mapeamento Role → CSS</LfHeading>
      <LfParagraph>Cada &quot;papel&quot; (role) de um token corresponde a uma propriedade CSS:</LfParagraph>
      <table>
        <thead>
          <tr><th>Role</th><th>Propriedade CSS</th><th>Uso</th></tr>
        </thead>
        <tbody>
          <tr><td><code>surface</code></td><td><code>background-color</code></td><td>Fundo do componente</td></tr>
          <tr><td><code>on-surface</code></td><td><code>color</code></td><td>Texto e ícones sobre o fundo</td></tr>
          <tr><td><code>container</code></td><td><code>background-color</code></td><td>Camada acima do surface</td></tr>
          <tr><td><code>on-container</code></td><td><code>color</code></td><td>Texto sobre o container</td></tr>
          <tr><td><code>border</code></td><td><code>border-color</code></td><td>Contorno do componente</td></tr>
          <tr><td><code>shadow</code></td><td><code>box-shadow</code></td><td>Sombra de elevação</td></tr>
        </tbody>
      </table>

      <LfHeading as="h3">Exemplo prático: Botão Primary</LfHeading>
      <pre>{`/* CSS usando tokens do Lift DS */
.btn-primary {
  background-color: var(--lf-thm-dynamic-primary-surface-default);
  color: var(--lf-thm-dynamic-primary-on-surface-default);
  border-color: var(--lf-thm-dynamic-primary-on-surface-border-default);
}

.btn-primary:hover {
  background-color: var(--lf-thm-dynamic-primary-surface-hover);
  color: var(--lf-thm-dynamic-primary-on-surface-hover);
}`}</pre>


      <LfHeading as="h2">Para Agentes de IA</LfHeading>
      <LfParagraph>
        O arquivo <code>docs/token-docs-ai.md</code> contém toda a documentação em formato estruturado. As regras principais:
      </LfParagraph>
      <div className="do-dont">
        <div className="do-box">
          <div className="do-box-t">Faça</div>
          <ul>
            <li>Use Usage Tokens (camada principal)</li>
            <li>text/ícone → tokens <code>on-surface</code></li>
            <li>background → tokens <code>surface</code></li>
            <li>border → tokens <code>border</code></li>
            <li>Siga a árvore de decisão para escolher o grupo</li>
          </ul>
        </div>
        <div className="dont-box">
          <div className="dont-box-t">Não faça</div>
          <ul>
            <li>Nunca use Base Tokens em UI</li>
            <li>Nunca use Core diretamente em componentes</li>
            <li>Nunca use Dynamic para accordions (use Interactive)</li>
            <li>Nunca use Dynamic para cards (use Static)</li>
            <li>Nunca use Dynamic para inputs (use Inputable)</li>
          </ul>
        </div>
      </div>

      <LfHeading as="h2">Para servir este site localmente</LfHeading>
      <pre>{`# Opção 1: Python (mais simples)
python3 -m http.server 3001 --directory docs

# Opção 2: Node.js
npx serve docs -p 3001

# Depois abra no navegador:
# http://localhost:3001`}</pre>
      <LfAlert variant="warning">
        O site precisa ser servido por um servidor HTTP (não funciona abrindo o arquivo direto no navegador) porque carrega dados via <code>fetch()</code>.
      </LfAlert>
    </div>
  );
}
