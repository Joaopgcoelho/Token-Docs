import React from 'react';
import VisualPreview from './VisualPreview';
import UsageExamples from './UsageExamples';
import GuidelinesPanel from './GuidelinesPanel';

export default function UsageBlock({ enriched, resolvedValue, brand, mode, guidelines }) {
  return (
    <div className="td-usage-block" style={{ marginBottom: '32px' }}>
      {/* Preview — prominent */}
      <VisualPreview enriched={enriched} resolvedValue={resolvedValue} />

      {/* Usage examples */}
      <div style={{ marginTop: '24px' }}>
        <UsageExamples enriched={enriched} resolvedValue={resolvedValue} brand={brand} mode={mode} />
      </div>

      {/* Guidelines — do/don't */}
      {guidelines && guidelines.length > 0 && (
        <div style={{ marginTop: '24px' }}>
          <GuidelinesPanel guidelines={guidelines} />
        </div>
      )}
    </div>
  );
}
