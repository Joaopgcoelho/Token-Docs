import React from 'react';
import { KNOWN_STATES } from '../../shared/tokenData';

export default function MetadataPanel({ enriched }) {
  const safeField = (v) => v || '—';

  // Derive state from last segment if it's a known state
  const lastSeg = enriched.segments && enriched.segments.length > 0
    ? enriched.segments[enriched.segments.length - 1]
    : null;
  const state = lastSeg && KNOWN_STATES.includes(lastSeg) ? lastSeg : null;

  // Derive semantic group from first segment
  const semanticGroup = enriched.segments && enriched.segments.length > 0
    ? enriched.segments[0]
    : null;

  // Derive type from cssProperty
  const typeMap = {
    'background-color': 'Cor de Fundo',
    'color': 'Cor de Texto',
    'border-color': 'Cor de Borda',
    'border-width': 'Espessura de Borda',
    'border-radius': 'Raio de Borda',
    'box-shadow': 'Sombra',
    'font-family': 'Família Tipográfica',
    'font-size': 'Tamanho de Fonte',
    'font-weight': 'Peso de Fonte',
    'line-height': 'Altura de Linha',
    'opacity': 'Opacidade',
    'gap': 'Espaçamento',
    'padding': 'Preenchimento',
  };
  const type = enriched.cssProperty ? (typeMap[enriched.cssProperty] || enriched.cssProperty) : null;

  const fields = [
    { label: 'Camada', value: safeField(enriched.layer) },
    { label: 'Categoria', value: safeField(enriched.category) },
    { label: 'Tipo', value: safeField(type) },
    { label: 'Papel', value: safeField(enriched.role) },
    { label: 'Grupo Semântico', value: safeField(semanticGroup) },
    { label: 'Estado', value: safeField(state) },
  ];

  return (
    <div className="td-metadata">
      {fields.map((f, i) => (
        <div key={i} className="td-meta-item">
          <span className="td-meta-label">{f.label}</span>
          <span className="td-meta-value">{f.value}</span>
        </div>
      ))}
    </div>
  );
}
