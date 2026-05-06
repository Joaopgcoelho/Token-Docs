import React, { useState } from 'react';

export default function Collapsible({ title, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="td-collapsible" style={{ borderBottom: '1px solid #f0f0f0' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          width: '100%', padding: '16px 0', background: 'none', border: 'none',
          cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 14,
          fontWeight: 600, color: '#171717', textAlign: 'left',
        }}
      >
        {title}
        <span style={{
          fontSize: 18, color: '#a3a3a3', transition: 'transform 200ms ease',
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
        }}>
          ▾
        </span>
      </button>
      {open && (
        <div style={{ paddingBottom: '24px' }}>
          {children}
        </div>
      )}
    </div>
  );
}
