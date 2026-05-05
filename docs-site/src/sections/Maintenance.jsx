import React from 'react';
import LfAlert from '@lift/ds-web/components/LfAlert/';
import LfHeading from '@lift/ds-web/components/LfHeading/';
import LfParagraph from '@lift/ds-web/components/LfParagraph/';

export default function Maintenance() {
  return (
    <div>
      <LfHeading as="h1">Manutenção do Projeto</LfHeading>
      <p className="subtitle">Como manter a documentação atualizada e adicionar novos conteúdos.</p>

      <LfHeading as="h2">Fluxo de atualização</LfHeading>
      <LfParagraph>Sempre que precisar atualizar a documentação de tokens, siga este fluxo:</LfParagraph>
      <pre>{`  1. Edite o token-schema.json
     (adicione exemplos, atualize descrições, novas regras)
                    │
                    ▼
  2. Rode o pipeline:
     npm run generate-docs
                    │
                    ▼
  3. Verifique a saída:
     ✓ scripts/generated-es5-constants.js  (atualizado)
     ✓ docs/token-docs-data.json           (atualizado)
     ✓ docs/token-docs-ai.md              (atualizado)
                    │
                    ▼
  4. Copie as constantes para code.js
     (se GROUP_META/GROUP_GUIDELINES mudaram)
                    │
                    ▼
  5. Teste no Figma e no site`}</pre>


      <LfHeading as="h2">Editando o token-schema.json</LfHeading>
      <LfParagraph>
        O <code>token-schema.json</code> é a fonte única de verdade. Aqui estão as edições mais comuns:
      </LfParagraph>

      <LfHeading as="h3">Adicionar um exemplo de componente</LfHeading>
      <LfParagraph>Dentro do grupo desejado, adicione um objeto em <code>componentExamples</code>:</LfParagraph>
      <pre>{`{
  "component": "Nome do Componente",
  "tokens": {
    "surface": "Grupo/Hierarquia/Surface/Default",
    "on-surface": "Grupo/Hierarquia/On Surface/Default"
  },
  "states": {
    "hover": {
      "surface": "Grupo/Hierarquia/Surface/Hover"
    }
  }
}`}</pre>
      <LfAlert variant="warning">
        Os roles usados em <code>tokens</code> devem existir no campo <code>roles</code> do mesmo grupo. O pipeline valida isso automaticamente.
      </LfAlert>

      <LfHeading as="h3">Adicionar uma regra para IA</LfHeading>
      <LfParagraph>No array <code>aiRules</code>, adicione um objeto:</LfParagraph>
      <pre>{`{
  "id": "R13",
  "rule": "Descrição da regra com mais de 10 caracteres",
  "severity": "error"   // ou "warning"
}`}</pre>
      <LfParagraph>O ID deve seguir o formato <code>R</code> + 2 dígitos (R01, R02, ..., R99).</LfParagraph>

      <LfHeading as="h3">Atualizar descrições de grupos</LfHeading>
      <LfParagraph>
        Edite os campos <code>description</code>, <code>whenUse</code> ou <code>whenNotUse</code> do grupo desejado.
        Cada item de <code>whenUse</code> e <code>whenNotUse</code> deve ter mais de 5 caracteres.
      </LfParagraph>


      <LfHeading as="h2">Rodando o pipeline</LfHeading>
      <pre>{`# Gera todos os artefatos e valida consistência
npm run generate-docs`}</pre>
      <LfParagraph>O script faz automaticamente:</LfParagraph>
      <ol>
        <li>Lê e valida o <code>token-schema.json</code></li>
        <li>Gera constantes ES5 para o plugin (GROUP_META, GROUP_GUIDELINES, DECISION_TREE, ROLE_MAPPING)</li>
        <li>Gera <code>token-docs-data.json</code> para este site</li>
        <li>Gera <code>token-docs-ai.md</code> para agentes de IA</li>
        <li>Valida que as 3 saídas são consistentes entre si</li>
      </ol>
      <LfParagraph>Se algo estiver errado, o script aborta com uma mensagem clara indicando o problema.</LfParagraph>


      <LfHeading as="h2">Erros comuns e soluções</LfHeading>
      <table>
        <thead>
          <tr><th>Erro</th><th>Causa</th><th>Solução</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><code>Invalid JSON in token-schema.json</code></td>
            <td>JSON mal formatado (vírgula extra, aspas faltando)</td>
            <td>Use um validador JSON online para encontrar o erro</td>
          </tr>
          <tr>
            <td><code>Missing required field: &quot;whenUse&quot;</code></td>
            <td>Um grupo não tem o campo obrigatório</td>
            <td>Adicione o campo ao grupo indicado na mensagem</td>
          </tr>
          <tr>
            <td><code>Invalid color.r value</code></td>
            <td>Valor de cor fora do intervalo 0-1</td>
            <td>Corrija para um valor entre 0 e 1 (ex: 0.5)</td>
          </tr>
          <tr>
            <td><code>References role &quot;X&quot; which does not exist</code></td>
            <td>Um exemplo usa um role que não está definido no grupo</td>
            <td>Adicione o role ao campo <code>roles</code> do grupo, ou corrija o nome</td>
          </tr>
          <tr>
            <td><code>ES5 violations found</code></td>
            <td>O código gerado tem sintaxe proibida</td>
            <td>Isso é um bug no gerador — reporte ao desenvolvedor</td>
          </tr>
          <tr>
            <td><code>Outputs are inconsistent</code></td>
            <td>As 3 saídas divergem entre si</td>
            <td>Rode <code>npm run generate-docs</code> novamente. Se persistir, verifique o gerador</td>
          </tr>
        </tbody>
      </table>


      <LfHeading as="h2">Restrições do plugin Figma (code.js)</LfHeading>
      <LfParagraph>
        O arquivo <code>code.js</code> roda no sandbox do Figma, que tem restrições severas de JavaScript. <strong>Nunca use</strong> no code.js:
      </LfParagraph>
      <div className="do-dont">
        <div className="dont-box">
          <div className="dont-box-t">🚫 Proibido no code.js</div>
          <ul>
            <li><code>{'=>'}</code> (arrow functions)</li>
            <li><code>const</code> ou <code>let</code> (use <code>var</code>)</li>
            <li><code>{`\`template literals\``}</code> (use concatenação com <code>+</code>)</li>
            <li><code>.includes()</code> (use <code>{`.indexOf() !== -1`}</code>)</li>
            <li><code>Object.assign</code> (use loop manual)</li>
            <li><code>Array.from</code></li>
          </ul>
        </div>
        <div className="do-box">
          <div className="do-box-t">Use no code.js</div>
          <ul>
            <li><code>var</code> para declarações</li>
            <li><code>{'function() {}'}</code> para funções</li>
            <li><code>{'"string" + "concatenação"'}</code></li>
            <li><code>{'.indexOf() !== -1'}</code> para buscas</li>
            <li><code>{'for (var i = 0; ...)'}</code> para loops</li>
            <li><code>async function</code> com <code>await</code></li>
          </ul>
        </div>
      </div>


      <LfHeading as="h2">Atualizando tokens do pacote npm</LfHeading>
      <pre>{`# 1. Autenticar no Azure Artifacts (se token expirou)
npx better-vsts-npm-auth

# 2. Atualizar pacotes
npm update @lift/ds-tokens @lift/ds-web @lift/ds-assets

# 3. Regenerar dados enriquecidos
node scripts/generate-enriched-tokens.js

# 4. Regenerar documentação
npm run generate-docs`}</pre>

      <LfHeading as="h2">Checklist de manutenção</LfHeading>
      <table>
        <thead>
          <tr><th>Quando</th><th>O que fazer</th><th>Comando</th></tr>
        </thead>
        <tbody>
          <tr>
            <td>Novo grupo semântico</td>
            <td>Adicionar ao <code>token-schema.json</code> e rodar pipeline</td>
            <td><code>npm run generate-docs</code></td>
          </tr>
          <tr>
            <td>Novo exemplo de componente</td>
            <td>Adicionar em <code>componentExamples</code> e rodar pipeline</td>
            <td><code>npm run generate-docs</code></td>
          </tr>
          <tr>
            <td>Nova regra para IA</td>
            <td>Adicionar em <code>aiRules</code> e rodar pipeline</td>
            <td><code>npm run generate-docs</code></td>
          </tr>
          <tr>
            <td>Atualização de tokens npm</td>
            <td>Atualizar pacotes e regenerar dados</td>
            <td><code>npm update</code> + <code>npm run generate-docs</code></td>
          </tr>
          <tr>
            <td>Mudança no plugin</td>
            <td>Editar <code>code.js</code> (respeitando ES5) e testar no Figma</td>
            <td>Recarregar plugin no Figma</td>
          </tr>
          <tr>
            <td>Mudança no site HTML</td>
            <td>Editar <code>docs/index.html</code> e servir localmente</td>
            <td><code>python3 -m http.server 3001 --directory docs</code></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
