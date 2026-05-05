import React from 'react';
import { BRANDS, MODES } from '../shared/tokenData';
import Icon from './Icon';

export default function BrandModeSelector({ brand, mode, onBrandChange, onModeChange }) {
  return (
    <div className="tb-header" style={{ marginBottom: 16 }}>
      <div className="tb-select-group">
        <label className="tb-label">Marca</label>
        <select className="tb-select" value={brand} onChange={(e) => onBrandChange(e.target.value)}>
          {Object.entries(BRANDS).map(([id, b]) => (
            <option key={id} value={id}>{b.label}</option>
          ))}
        </select>
      </div>
      <div className="tb-select-group">
        <label className="tb-label">Modo</label>
        <div className="tb-mode-toggle">
          {MODES.map((m) => (
            <button
              key={m.id}
              className={`tb-mode-btn ${mode === m.id ? 'tb-mode-active' : ''}`}
              onClick={() => onModeChange(m.id)}
            >
              <Icon name={m.id === 'default' ? 'Eye' : 'HighContrast'} size={14} /> {m.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
