import React from 'react';
import { LAYER_LABELS } from '../../shared/tokenData';

export default function TechnicalDetails({ enriched, generatedAt }) {
  const fields = [
    { label: 'Nome Figma', value: enriched.path || '—' },
    { label: 'Token ID', value: enriched.name || '—' },
    { label: 'Tipo', value: enriched.category || '—' },
    { label: 'Coleção', value: LAYER_LABELS[enriched.layer] || enriched.layer || '—' },
    { label: 'Última Atualização', value: generatedAt ? new Date(generatedAt).toLocaleDateString('pt-BR') : '—' },
  ];

  return (
    <div className="td-technical">
      <h2>Detalhes Técnicos</h2>
      <table>
        <tbody>
          {fields.map((f, i) => (
            <tr key={i}>
              <td style={{ fontWeight: 600, width: 180 }}>{f.label}</td>
              <td><code>{f.value}</code></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
