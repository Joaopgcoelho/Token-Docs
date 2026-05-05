import React from 'react';

export default function BreadcrumbNavigator({ segments, onNavigate }) {
  return (
    <nav className="td-breadcrumb">
      <button className="td-breadcrumb-segment" onClick={() => onNavigate('browse')}>
        Tokens
      </button>
      {segments.map((seg, i) => (
        <React.Fragment key={i}>
          <span className="td-breadcrumb-separator">›</span>
          <button
            className="td-breadcrumb-segment"
            onClick={() => onNavigate('browse')}
          >
            {seg}
          </button>
        </React.Fragment>
      ))}
    </nav>
  );
}
