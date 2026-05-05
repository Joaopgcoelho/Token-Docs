import React, { useState, useMemo } from 'react';
import { getResolvedValue } from '../../shared/tokenData';
import { hexToRgbString, hexToHslString, hexToOklchString } from '../../shared/colorUtils';
import BrandModeSelector from '../../components/BrandModeSelector';

export default function ValueSection({ tokenName, brand, mode, onBrandChange, onModeChange, enriched }) {
  const [activeMode, setActiveMode] = useState(mode);

  const resolvedValue = useMemo(() => {
    return getResolvedValue(tokenName, brand, activeMode);
  }, [tokenName, brand, activeMode]);

  const handleModeChange = (m) => {
    setActiveMode(m);
    if (onModeChange) onModeChange(m);
  };

  const isColorToken = enriched && enriched.isColor && resolvedValue && resolvedValue.startsWith('#');

  const formats = useMemo(() => {
    if (!isColorToken) return null;
    return [
      { label: 'HEX', value: resolvedValue },
      { label: 'RGB', value: hexToRgbString(resolvedValue) },
      { label: 'HSL', value: hexToHslString(resolvedValue) },
      { label: 'OKLCH', value: hexToOklchString(resolvedValue) },
    ].filter(f => f.value);
  }, [isColorToken, resolvedValue]);

  return (
    <div className="td-value">
      <h2>Valores</h2>
      <BrandModeSelector
        brand={brand}
        mode={activeMode}
        onBrandChange={onBrandChange}
        onModeChange={handleModeChange}
      />
      {isColorToken && formats ? (
        <div className="td-format-grid">
          {formats.map((f, i) => (
            <div key={i} className="td-format-item">
              <span className="td-format-label">{f.label}</span>
              <code className="td-format-value">{f.value}</code>
            </div>
          ))}
        </div>
      ) : (
        <div className="td-format-grid">
          <div className="td-format-item">
            <span className="td-format-label">Valor</span>
            <code className="td-format-value">{resolvedValue || '—'}</code>
          </div>
        </div>
      )}
    </div>
  );
}
