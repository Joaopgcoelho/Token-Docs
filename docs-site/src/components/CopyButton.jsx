import React, { useState, useCallback } from 'react';

export default function CopyButton({ text, label = 'Copiar' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Silently fail
    }
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className="td-copy-btn"
      style={{
        cursor: 'pointer',
        background: copied ? '#E5F8DF' : '#f5f5f5',
        border: '1px solid ' + (copied ? '#BDEFAF' : '#e5e5e5'),
        borderRadius: 6,
        padding: '4px 12px',
        fontSize: 11,
        fontFamily: 'Inter, sans-serif',
        fontWeight: 500,
        color: copied ? '#176600' : '#525252',
        transition: 'all .15s',
      }}
    >
      {copied ? '✓ Copiado!' : label}
    </button>
  );
}
