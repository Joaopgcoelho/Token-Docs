import React from 'react';

export default function GuidelinesPanel({ guidelines }) {
  const dos = guidelines.filter(g => g.type === 'do');
  const donts = guidelines.filter(g => g.type === 'dont');

  return (
    <div>
      <h2>Diretrizes</h2>
      <div className="do-dont">
        <div className="do-box">
          <div className="do-box-t">✔ Faça</div>
          <ul>
            {dos.map((g, i) => <li key={i}>{g.text}</li>)}
          </ul>
        </div>
        <div className="dont-box">
          <div className="dont-box-t">✘ Não faça</div>
          <ul>
            {donts.map((g, i) => <li key={i}>{g.text}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
}
