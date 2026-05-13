import React, { useState, useCallback } from 'react';
import LfHeading from '@lift/ds-web/components/LfHeading/';
import LfParagraph from '@lift/ds-web/components/LfParagraph/';
import LfAlert from '@lift/ds-web/components/LfAlert/';
import aiInstructionsMd from '../../../ai-instructions.md?raw';

export default function AIInstructions() {
  var [copied, setCopied] = useState(false);
  var [showPreview, setShowPreview] = useState(false);

  var handleCopy = useCallback(function () {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(aiInstructionsMd).then(function () {
          setCopied(true);
          setTimeout(function () { setCopied(false); }, 2500);
        });
      } else {
        var textarea = document.createElement('textarea');
        textarea.value = aiInstructionsMd;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        setCopied(true);
        setTimeout(function () { setCopied(false); }, 2500);
      }
    } catch (err) {
      // silently fail
    }
  }, []);

  var handleDownload = useCallback(function () {
    var blob = new Blob([aiInstructionsMd], { type: 'text/markdown;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'ai-instructions-v2.1.1.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  return (
    <div>
      <LfHeading as="h1">Instruções para IA</LfHeading>
      <p className="subtitle">Arquivo .md otimizado para consumo por LLMs e agentes — v2.1.1</p>

      <LfAlert variant="info">
        <strong>v2.1.1</strong> — Usage tokens agora são preferidos sobre Component tokens. Hierarquia: Componente DS → Usage → Component (último recurso).
      </LfAlert>

      <LfParagraph>
        Este arquivo (<code>ai-instructions.md</code>) é gerado a partir do <code>lift-token-full.md</code> e contém
        todas as regras determinísticas para consumo de tokens por IA, otimizado para eficiência de contexto.
        Inclui: hierarquia de consumo, classificação de grupo, seleção de hierarquia, pairing rules,
        WCAG contrast, component registry, confidence scoring, design smells, e formato de resposta JSON.
      </LfParagraph>

      <LfHeading as="h2">O que contém</LfHeading>

      <table>
        <thead>
          <tr><th>Seção</th><th>Conteúdo</th></tr>
        </thead>
        <tbody>
          <tr><td>TL;DR</td><td>8 regras que resolvem 80% dos casos</td></tr>
          <tr><td>Hierarquia de Consumo</td><td>Ordem obrigatória: Componente → Usage → Component</td></tr>
          <tr><td>Token Architecture</td><td>4 layers com prefixos e permissões</td></tr>
          <tr><td>Group Classification</td><td>Tabela de classificação por comportamento</td></tr>
          <tr><td>Hierarchy Selection</td><td>Hierarquias por grupo</td></tr>
          <tr><td>Role ↔ CSS Property</td><td>Mapeamento role → propriedade CSS</td></tr>
          <tr><td>Pairing Rules</td><td>Surface ↔ On Surface (mesmo grupo + hierarquia)</td></tr>
          <tr><td>WCAG Contrast</td><td>Algoritmo de contraste implementável</td></tr>
          <tr><td>Forbidden Combinations</td><td>Matriz de combinações proibidas</td></tr>
          <tr><td>Quick Reference</td><td>30+ tokens mapeados por necessidade</td></tr>
          <tr><td>Component Registry</td><td>16 componentes @lift/ds-web com props</td></tr>
          <tr><td>Intent → Component</td><td>Mapeamento de intenção para componente</td></tr>
          <tr><td>Design Smells</td><td>13 anti-patterns detectáveis</td></tr>
          <tr><td>AI Confidence Scoring</td><td>Sistema 0.0–1.0 com thresholds</td></tr>
          <tr><td>AI Response Format</td><td>JSON padronizado para respostas</td></tr>
          <tr><td>Automation</td><td>Regex, ESLint, validação programática</td></tr>
        </tbody>
      </table>

      <LfHeading as="h2">Como usar</LfHeading>

      <table>
        <thead>
          <tr><th>Ferramenta</th><th>Instrução</th></tr>
        </thead>
        <tbody>
          <tr><td>ChatGPT / Claude</td><td>Cole o conteúdo como contexto no início da conversa</td></tr>
          <tr><td>Cursor / Kiro</td><td>Adicione como steering file ou rules file no projeto</td></tr>
          <tr><td>GitHub Copilot</td><td>Coloque na raiz como <code>ai-instructions.md</code></td></tr>
          <tr><td>Custom GPTs</td><td>Upload como knowledge file</td></tr>
          <tr><td>LangChain / RAG</td><td>Indexe como documento de referência</td></tr>
        </tbody>
      </table>

      <LfHeading as="h2">Ações</LfHeading>

      <div className="ai-instructions-actions">
        <button
          className="ai-instructions-btn ai-instructions-btn--copy"
          onClick={handleCopy}
          type="button"
        >
          {copied ? '✓ Copiado!' : 'Copiar Markdown'}
        </button>
        <button
          className="ai-instructions-btn ai-instructions-btn--download"
          onClick={handleDownload}
          type="button"
        >
          Download .md
        </button>
        <button
          className="ai-instructions-btn ai-instructions-btn--preview"
          onClick={function () { setShowPreview(!showPreview); }}
          type="button"
        >
          {showPreview ? 'Ocultar Preview' : 'Ver Preview'}
        </button>
      </div>

      <div className="ai-instructions-stats">
        <span><strong>v2.1.1</strong></span>
        <span>•</span>
        <span>{aiInstructionsMd.split('\n').length} linhas</span>
        <span>•</span>
        <span>{Math.round(aiInstructionsMd.length / 1024 * 10) / 10} KB</span>
        <span>•</span>
        <span>16 componentes • 13 design smells • 30+ tokens mapeados</span>
      </div>

      <LfHeading as="h2">Changelog</LfHeading>

      <table>
        <thead>
          <tr><th>Versão</th><th>Data</th><th>Mudanças principais</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>v2.1.1</strong></td>
            <td>2026-05-12</td>
            <td>Usage preferido sobre Component; Intent Classification; Forbidden Matrix; Design Smells; AI Confidence Scoring; Component Registry (16); Formato otimizado para LLM</td>
          </tr>
          <tr>
            <td>v2.1.0</td>
            <td>2026-04-28</td>
            <td>Regra Zero; Quick Decision tree; Exemplos práticos; Atalhos por caso de uso; Troubleshooting</td>
          </tr>
          <tr>
            <td>v2.0.0</td>
            <td>2026-03-15</td>
            <td>Documento inicial: 10 Rules, Decision Tree, Quick Reference, AI Response Format</td>
          </tr>
        </tbody>
      </table>

      {showPreview && (
        <>
          <LfHeading as="h2">Preview</LfHeading>
          <div className="ai-instructions-preview">
            <pre className="ai-instructions-code">{aiInstructionsMd}</pre>
          </div>
        </>
      )}
    </div>
  );
}
