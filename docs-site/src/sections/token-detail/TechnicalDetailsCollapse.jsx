import React, { useState } from 'react';

export default function TechnicalDetailsCollapse({ children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="td-tech-collapse" style={{ marginBottom: '32px', borderTop: '1px solid #f0f0f0' }}>
      <button
        className="td-collapse-header"
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          width: '100%', padding: '20px 0', background: 'none', border: 'none',
          cursor: 'pointer', fontFamily: 'Inter, sans-serif',
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 600, color: '#171717' }}>
          Detalhes técnicos
        </span>
        <span style={{
          fontSize: 12, color: '#076AEA', fontWeight: 500,
          display: 'flex', alignItems: 'center', gap: '4px',
        }}>
          {open ? 'Ocultar' : 'Ver detalhes'}
          <span style={{
            transition: 'transform 200ms ease',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            fontSize: 16,
          }}>
            ▾
          </span>
        </span>
      </button>
      {open && (
        <div className="td-collapse-content" style={{
          paddingBottom: '24px',
          display: 'flex', flexDirection: 'column', gap: '32px',
        }}>
          {children}
        </div>
      )}
    </div>
  );
}
