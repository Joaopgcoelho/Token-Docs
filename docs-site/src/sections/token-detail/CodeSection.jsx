import React, { useState, useMemo } from 'react';
import CopyButton from '../../components/CopyButton';

// Convert camelCase to kebab-case for CSS custom properties
function camelToKebab(name) {
  return name
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/([A-Za-z])(\d)/g, '$1-$2')
    .replace(/(\d)([A-Z])/g, '$1-$2')
    .toLowerCase();
}

export { camelToKebab };

export default function CodeSection({ enriched, brand, resolvedValue }) {
  const [activeTab, setActiveTab] = useState('css');

  const snippets = useMemo(() => {
    const cssVar = `var(--${camelToKebab(enriched.name)})`;
    const jsImport = `import { ${enriched.name} } from '@lift/ds-tokens/brands/${brand}/ts/default.js';`;
    const figmaPath = enriched.path || enriched.name;
    const jsonSnippet = JSON.stringify({ [enriched.name]: resolvedValue || '' }, null, 2);

    return {
      css: { label: 'CSS', code: cssVar },
      js: { label: 'JS', code: jsImport },
      figma: { label: 'Figma Variables', code: figmaPath },
      json: { label: 'JSON', code: jsonSnippet },
    };
  }, [enriched, brand, resolvedValue]);

  const tabs = ['css', 'js', 'figma', 'json'];
  const current = snippets[activeTab];

  return (
    <div className="td-code">
      <h2>Código</h2>
      <div className="td-code-tabs">
        {tabs.map(t => (
          <button
            key={t}
            className={`td-code-tab ${activeTab === t ? 'td-code-tab-active' : ''}`}
            onClick={() => setActiveTab(t)}
          >
            {snippets[t].label}
          </button>
        ))}
      </div>
      <div className="td-code-block">
        <pre><code>{current.code}</code></pre>
        <CopyButton text={current.code} />
      </div>
    </div>
  );
}
