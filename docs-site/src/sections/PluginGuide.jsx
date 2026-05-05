import React, { useState } from 'react';
import LfHeading from '@lift/ds-web/components/LfHeading/';
import LfParagraph from '@lift/ds-web/components/LfParagraph/';
import LfAlert from '@lift/ds-web/components/LfAlert/';
import manifestJson from '../../../manifest.json?raw';
import codeJs from '../../../code.js?raw';
import uiHtml from '../../../ui.html?raw';

function downloadFile(content, filename) {
  var blob = new Blob([content], { type: 'application/octet-stream' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function downloadAllFiles() {
  downloadFile(manifestJson, 'manifest.json');
  setTimeout(function () { downloadFile(codeJs, 'code.js'); }, 200);
  setTimeout(function () { downloadFile(uiHtml, 'ui.html'); }, 400);
}

function CopyButton({ text, label }) {
  var _useState = useState(false);
  var copied = _useState[0];
  var setCopied = _useState[1];

  function handleCopy() {
    navigator.clipboard.writeText(text).then(function () {
      setCopied(true);
      setTimeout(function () { setCopied(false); }, 2000);
    });
  }

  return (
    <button
      onClick={handleCopy}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        padding: '8px 16px', borderRadius: '8px', border: '1px solid #e5e5e5',
        background: copied ? '#E5F8DF' : '#f5f5f5', color: copied ? '#176600' : '#525252',
        fontSize: '13px', fontWeight: 600, fontFamily: '"Inter", sans-serif',
        cursor: 'pointer', transition: 'all .15s',
      }}
    >
      {copied ? '✓ Copiado!' : label}
    </button>
  );
}

export default function PluginGuide() {
  return (
    <div>
      <LfHeading as="h1">Plugin Figma — Token Docs</LfHeading>
      <p className="subtitle">Documentação completa do plugin Token Docs para Figma.</p>

      {/* ── O que é ── */}
      <LfHeading as="h2">O que é o Token Docs</LfHeading>
      <LfParagraph>
        O <strong>Token Docs</strong> é um plugin para o Figma Desktop que lê as variáveis (tokens) locais
        do seu arquivo e gera documentação visual automaticamente. Ele funciona como um mini Storybook
        dentro do próprio Figma, permitindo visualizar, auditar e comparar tokens sem sair da ferramenta.
      </LfParagraph>
      <LfParagraph>
        O plugin foi criado para o <strong>Lift Design System</strong> da YDUQS e suporta as 8 marcas
        do ecossistema, cada uma com modo Default e High Contrast.
      </LfParagraph>

      {/* ── Funcionalidades ── */}
      <LfHeading as="h2">Funcionalidades</LfHeading>

      <LfHeading as="h3">Leitura de variáveis</LfHeading>
      <LfParagraph>
        O plugin lê todas as variáveis (tokens) locais do arquivo Figma, incluindo collections de Brand,
        Usage, Component e Web/APP Screen. Resolve cadeias de aliases automaticamente, mesmo de bibliotecas externas.
      </LfParagraph>

      <LfHeading as="h3">Visualização tipo mini Storybook</LfHeading>
      <LfParagraph>
        A interface do plugin exibe os tokens em uma UI organizada com sidebar de collections,
        chips de modo (Light/Dark/High Contrast) e cards visuais de cor com badges WCAG.
      </LfParagraph>

      <LfHeading as="h3">Aba Tokens</LfHeading>
      <ul>
        <li>Agrupamento por grupo semântico (Dynamic, Interactive, Static, Inputable, Core, Elevation)</li>
        <li>Subgrupos pelo segundo segmento do nome do token</li>
        <li>Cards de cor com bloco visual, nome, cadeia de alias e valor hex</li>
        <li>Tabela para tokens não-cor (tipografia, espaçamento, etc.)</li>
        <li>Busca em tempo real por nome de token</li>
      </ul>

      <LfHeading as="h3">Aba Auditoria</LfHeading>
      <ul>
        <li>Escaneia a página inteira ou apenas a seleção atual</li>
        <li>Detecta: fills sem token vinculado, tokens Core usados em UI, tipo incompatível</li>
        <li>Mostra severidade, token atual → recomendado, razão do erro e modo educacional</li>
        <li>Botões &quot;Aplicar fix&quot; (individual) e &quot;Corrigir todos&quot; para correção automática</li>
      </ul>

      <LfHeading as="h3">Aba Validar Storybook</LfHeading>
      <ul>
        <li>Compara tokens do Figma com o pacote npm <code>@lift/ds-tokens</code></li>
        <li>Opções: buscar do Storybook online, carregar JSON local ou colar JSON manualmente</li>
        <li>Resultado: tokens ok, divergentes, ausentes no npm e novos no npm</li>
      </ul>

      <LfHeading as="h3">Geração de boards no canvas</LfHeading>
      <LfParagraph>
        O botão &quot;Gerar&quot; cria um frame <code>Token Docs</code> no canvas com auto-layout horizontal.
        Cada collection gera um board com título, documentação textual (quando usar/não usar) e cards de tokens.
        Collections grandes (como Usage) são divididas por grupo semântico em boards paralelos.
      </LfParagraph>

      <LfHeading as="h3">Exportação Markdown</LfHeading>
      <LfParagraph>
        O botão &quot;MD&quot; exporta um arquivo <code>tokens-docs.md</code> com documentação completa dos tokens,
        guidelines Do/Don&apos;t e uma seção especial com instruções determinísticas para consumo por IA.
      </LfParagraph>

      <LfHeading as="h3">Sugestão de tokens</LfHeading>
      <LfParagraph>
        Ao selecionar um nó no Figma, o plugin analisa a composição do elemento (fills, strokes, efeitos)
        e sugere os tokens mais adequados com base no contexto semântico.
      </LfParagraph>

      <LfHeading as="h3">Auto-update</LfHeading>
      <LfParagraph>
        O plugin faz polling a cada 2 segundos para detectar mudanças nas variáveis. Quando detecta alterações,
        atualiza automaticamente apenas os cards afetados nos boards do canvas, sem precisar regenerar tudo.
      </LfParagraph>

      {/* ── Instalação ── */}
      <LfHeading as="h2">Instalação</LfHeading>

      <LfAlert variant="info">
        Pré-requisitos: <strong>Figma Desktop</strong> instalado e um arquivo Figma com <strong>variáveis locais</strong> (tokens).
        O plugin não funciona no Figma web.
      </LfAlert>

      <LfHeading as="h3">Passo 1 — Baixar os arquivos do plugin</LfHeading>
      <LfParagraph>
        Baixe os 3 arquivos necessários usando os botões abaixo. Salve todos na <strong>mesma pasta</strong>.
      </LfParagraph>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '14px' }}>
        <button
          onClick={function () { downloadFile(manifestJson, 'manifest.json'); }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '10px 20px', borderRadius: '10px', border: 'none',
            background: '#603DA2', color: '#fff', fontSize: '13px', fontWeight: 600,
            fontFamily: '"Inter", sans-serif', cursor: 'pointer', transition: 'all .15s',
          }}
        >
          manifest.json
        </button>
        <button
          onClick={function () { downloadFile(codeJs, 'code.js'); }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '10px 20px', borderRadius: '10px', border: 'none',
            background: '#603DA2', color: '#fff', fontSize: '13px', fontWeight: 600,
            fontFamily: '"Inter", sans-serif', cursor: 'pointer', transition: 'all .15s',
          }}
        >
          code.js
        </button>
        <button
          onClick={function () { downloadFile(uiHtml, 'ui.html'); }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '10px 20px', borderRadius: '10px', border: 'none',
            background: '#603DA2', color: '#fff', fontSize: '13px', fontWeight: 600,
            fontFamily: '"Inter", sans-serif', cursor: 'pointer', transition: 'all .15s',
          }}
        >
          ui.html
        </button>
      </div>

      <LfHeading as="h3">Passo 2 — Abrir o Figma Desktop</LfHeading>
      <LfParagraph>
        Abra o aplicativo Figma Desktop no seu computador. O plugin precisa ser importado pelo app desktop.
      </LfParagraph>

      <LfHeading as="h3">Passo 3 — Importar o plugin</LfHeading>
      <LfParagraph>
        No menu do Figma, vá em: <strong>Plugins → Development → Import plugin from manifest...</strong>
      </LfParagraph>

      <LfHeading as="h3">Passo 4 — Selecionar o manifest.json</LfHeading>
      <LfParagraph>
        Na janela que abrir, navegue até a pasta onde salvou os arquivos e selecione o <code>manifest.json</code>.
      </LfParagraph>

      <LfHeading as="h3">Passo 5 — Abrir um arquivo com variáveis</LfHeading>
      <LfParagraph>
        Abra qualquer arquivo Figma que contenha variáveis locais (tokens). O plugin precisa de variáveis
        para funcionar corretamente.
      </LfParagraph>

      <LfHeading as="h3">Passo 6 — Executar o plugin</LfHeading>
      <LfParagraph>
        Vá em: <strong>Plugins → Development → Token Docs</strong>. A interface do plugin vai abrir e
        carregar automaticamente todas as variáveis do arquivo.
      </LfParagraph>

      {/* ── Como usar cada aba ── */}
      <LfHeading as="h2">Como usar cada aba</LfHeading>

      <LfHeading as="h3">Aba Tokens</LfHeading>
      <ol>
        <li>Selecione uma collection na sidebar esquerda (Brand, Usage, Component, etc.)</li>
        <li>Use os chips de modo para alternar entre Light, Dark ou High Contrast</li>
        <li>Os tokens aparecem agrupados por grupo semântico</li>
        <li>Use a busca para filtrar tokens por nome</li>
        <li>Clique em um card de cor para ver detalhes</li>
      </ol>

      <LfHeading as="h3">Aba Auditoria</LfHeading>
      <ol>
        <li>Clique em &quot;Escanear página&quot; para auditar toda a página, ou selecione elementos específicos</li>
        <li>O plugin lista todos os problemas encontrados com severidade e descrição</li>
        <li>Clique em &quot;Aplicar fix&quot; para corrigir um problema individual</li>
        <li>Use &quot;Corrigir todos&quot; para aplicar todas as correções de uma vez</li>
      </ol>

      <LfHeading as="h3">Aba Validar Storybook</LfHeading>
      <ol>
        <li>Escolha uma das opções: buscar online, carregar JSON ou colar JSON</li>
        <li>Para carregar JSON local, gere o arquivo com: <code>node extract-tokens.js &gt; tokens-storybook.json</code></li>
        <li>O plugin compara os tokens e mostra: ok, divergentes, ausentes e novos</li>
      </ol>

      <LfHeading as="h3">Gerar boards</LfHeading>
      <ol>
        <li>Selecione as collections desejadas na sidebar (checkbox)</li>
        <li>Clique no botão &quot;Gerar&quot; na topbar do plugin</li>
        <li>O frame <code>Token Docs</code> será criado no canvas</li>
        <li>O auto-update mantém os boards sincronizados com as variáveis</li>
      </ol>

      {/* ── Download ── */}
      <LfHeading as="h2">Download do Plugin</LfHeading>
      <LfParagraph>
        Baixe todos os arquivos necessários para instalar o plugin no Figma Desktop.
        Os 3 arquivos devem ficar na mesma pasta.
      </LfParagraph>

      <table>
        <thead>
          <tr><th>Arquivo</th><th>Descrição</th><th>Ação</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><code>manifest.json</code></td>
            <td>Configuração do plugin (nome, permissões, entry points)</td>
            <td>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={function () { downloadFile(manifestJson, 'manifest.json'); }}
                  style={{
                    padding: '4px 12px', borderRadius: '6px', border: '1px solid #e5e5e5',
                    background: '#f5f5f5', color: '#525252', fontSize: '12px', fontWeight: 600,
                    fontFamily: '"Inter", sans-serif', cursor: 'pointer',
                  }}
                >
                  Download
                </button>
                <CopyButton text={manifestJson} label="Copiar" />
              </div>
            </td>
          </tr>
          <tr>
            <td><code>code.js</code></td>
            <td>Lógica principal do plugin (sandbox do Figma)</td>
            <td>
              <button
                onClick={function () { downloadFile(codeJs, 'code.js'); }}
                style={{
                  padding: '4px 12px', borderRadius: '6px', border: '1px solid #e5e5e5',
                  background: '#f5f5f5', color: '#525252', fontSize: '12px', fontWeight: 600,
                  fontFamily: '"Inter", sans-serif', cursor: 'pointer',
                }}
              >
                Download
              </button>
            </td>
          </tr>
          <tr>
            <td><code>ui.html</code></td>
            <td>Interface visual do plugin (HTML/CSS/JS)</td>
            <td>
              <button
                onClick={function () { downloadFile(uiHtml, 'ui.html'); }}
                style={{
                  padding: '4px 12px', borderRadius: '6px', border: '1px solid #e5e5e5',
                  background: '#f5f5f5', color: '#525252', fontSize: '12px', fontWeight: 600,
                  fontFamily: '"Inter", sans-serif', cursor: 'pointer',
                }}
              >
                Download
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div style={{ marginTop: '16px' }}>
        <button
          onClick={downloadAllFiles}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '12px 28px', borderRadius: '10px', border: 'none',
            background: '#076AEA', color: '#fff', fontSize: '14px', fontWeight: 700,
            fontFamily: '"Inter", sans-serif', cursor: 'pointer', transition: 'all .15s',
          }}
        >
          Baixar todos os arquivos
        </button>
      </div>

      <LfAlert variant="info" style={{ marginTop: '16px' }}>
        Após baixar, coloque os 3 arquivos na mesma pasta e siga os passos de instalação acima.
      </LfAlert>
    </div>
  );
}
