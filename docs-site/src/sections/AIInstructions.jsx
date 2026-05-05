import React, { useState, useCallback } from 'react';
import LfHeading from '@lift/ds-web/components/LfHeading/';
import LfParagraph from '@lift/ds-web/components/LfParagraph/';
import aiInstructionsMd from '../../../ai-instructions.md?raw';

export default function AIInstructions() {
  var [copied, setCopied] = useState(false);

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
    a.download = 'ai-instructions.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  return (
    <div>
      <LfHeading as="h1">Instruções para IA</LfHeading>
      <p className="subtitle">Arquivo .md completo com todas as regras determinísticas para consumo de tokens por IA.</p>

      <LfParagraph>
        Este arquivo contém todas as regras do Decision Engine, a árvore de decisão, referência rápida,
        combinações proibidas e formato de resposta JSON. Copie ou faça download para usar como contexto
        em qualquer agente de IA (ChatGPT, Claude, Copilot, Cursor, etc.).
      </LfParagraph>

      <div className="ai-instructions-actions">
        <button
          className="ai-instructions-btn ai-instructions-btn--copy"
          onClick={handleCopy}
          type="button"
        >
          {copied ? 'Copiado!' : 'Copiar Markdown'}
        </button>
        <button
          className="ai-instructions-btn ai-instructions-btn--download"
          onClick={handleDownload}
          type="button"
        >
          Download .md
        </button>
      </div>

      <div className="ai-instructions-stats">
        <span>{aiInstructionsMd.split('\n').length} linhas</span>
        <span>•</span>
        <span>{Math.round(aiInstructionsMd.length / 1024 * 10) / 10} KB</span>
        <span>•</span>
        <span>10 regras + árvore de decisão + referência rápida</span>
      </div>

      <LfHeading as="h2">Preview</LfHeading>

      <div className="ai-instructions-preview">
        <pre className="ai-instructions-code">{aiInstructionsMd}</pre>
      </div>
    </div>
  );
}
