import React from 'react';
import LfHeading from '@lift/ds-web/components/LfHeading/';
import LfAlert from '@lift/ds-web/components/LfAlert/';

export default function CommonErrors() {
  return (
    <div>
      <LfHeading as="h1">Erros Comuns</LfHeading>
      <p className="subtitle">Erros frequentes no uso de tokens e como corrigi-los.</p>

      {/* ── Erro 1: Usar Core em componentes ── */}
      <LfHeading as="h2">1. Usar Core diretamente em componentes</LfHeading>
      <LfAlert appearance="error" heading={{ text: 'Core tokens são apenas referência interna' }}>
        Nunca aplique tokens Core em componentes de UI. Eles existem para alimentar os tokens semânticos.
      </LfAlert>

      <pre>{`ERRADO — Core em botão
background-color: var(--core-surface-default);        /* #FFFFFF */
color: var(--core-on-surface-text-primary);            /* #171717 */

CERTO — Dynamic para botão
background-color: var(--dynamic-primary-surface-default);     /* #076AEA */
color: var(--dynamic-primary-on-surface-default);             /* #FFFFFF */`}</pre>

      {/* ── Erro 2: Usar Brand diretamente ── */}
      <LfHeading as="h2">2. Usar Brand diretamente em componentes</LfHeading>
      <LfAlert appearance="error" heading={{ text: 'Brand tokens são paleta de referência' }}>
        Brand define a paleta de cores da marca. Use tokens semânticos que referenciam Brand internamente.
      </LfAlert>

      <pre>{`ERRADO — Brand hardcoded
background-color: var(--brand-color-primary-500);     /* #076AEA */
color: var(--brand-color-neutral-100);                /* #FFFFFF */

CERTO — Token semântico
background-color: var(--dynamic-primary-surface-default);     /* → Brand/Primary/500 → #076AEA */
color: var(--dynamic-primary-on-surface-default);             /* → Brand/Neutral/100 → #FFFFFF */`}</pre>

      {/* ── Erro 3: Misturar pares surface/on-surface ── */}
      <LfHeading as="h2">3. Misturar pares surface / on-surface</LfHeading>
      <LfAlert appearance="error" heading={{ text: 'Cada surface tem seu on-surface correspondente' }}>
        Nunca combine surface de um grupo com on-surface de outro. Isso quebra o contraste e a acessibilidade.
      </LfAlert>

      <pre>{`ERRADO — Surface de Static com on-surface de Dynamic
background-color: var(--static-primary-surface-highest);      /* #E0ECFC */
color: var(--dynamic-primary-on-surface-default);             /* #FFFFFF ← sem contraste! */

CERTO — Par do mesmo grupo
background-color: var(--static-primary-surface-highest);      /* #E0ECFC */
color: var(--static-primary-on-surface-highest);              /* #171717 ← contraste OK */`}</pre>

      {/* ── Erro 4: Grupo errado para o componente ── */}
      <LfHeading as="h2">4. Usar grupo errado para o tipo de componente</LfHeading>
      <LfAlert appearance="error" heading={{ text: 'Cada tipo de componente tem seu grupo' }}>
        Botões usam Dynamic, accordions usam Interactive, cards usam Static, inputs usam Inputable.
      </LfAlert>

      <pre>{`ERRADO — Static em botão de ação
<button style={{ background: 'var(--static-primary-surface-highest)' }}>
  Confirmar
</button>

CERTO — Dynamic em botão de ação
<button style={{ background: 'var(--dynamic-primary-surface-default)' }}>
  Confirmar
</button>`}</pre>

      {/* ── Erro 5: Hex hardcoded ── */}
      <LfHeading as="h2">5. Usar valores hex hardcoded</LfHeading>
      <LfAlert appearance="error" heading={{ text: 'Nunca use hex direto — sempre use tokens' }}>
        Valores hardcoded não se adaptam a temas, modos (Light/Dark) ou troca de marca.
      </LfAlert>

      <pre>{`ERRADO — Hex hardcoded
background-color: #076AEA;
color: #FFFFFF;
border: 1px solid #D4D4D4;

CERTO — Tokens semânticos
background-color: var(--dynamic-primary-surface-default);
color: var(--dynamic-primary-on-surface-default);
border: 1px solid var(--core-on-surface-border-default);`}</pre>

      {/* ── Erro 6: Múltiplos Primary na mesma área ── */}
      <LfHeading as="h2">6. Múltiplos botões Primary na mesma área</LfHeading>
      <LfAlert appearance="error" heading={{ text: 'Máximo 1 botão Primary por área visível' }}>
        Ter múltiplos botões Primary confunde o usuário sobre qual é a ação principal.
      </LfAlert>

      <pre>{`ERRADO — Dois Primary
<LfButton appearance="primary">Salvar</LfButton>
<LfButton appearance="primary">Continuar</LfButton>

CERTO — Primary + Secondary
<LfButton appearance="primary">Salvar</LfButton>
<LfButton appearance="secondary">Continuar</LfButton>`}</pre>

      {/* ── Erro 7: Ignorar estados ── */}
      <LfHeading as="h2">7. Ignorar estados de interação</LfHeading>
      <LfAlert appearance="error" heading={{ text: 'Tokens têm variantes para cada estado' }}>
        Não use apenas Default — implemente Hover, Pressed e Active quando aplicável.
      </LfAlert>

      <pre>{`ERRADO — Só Default
.btn {
  background: var(--dynamic-primary-surface-default);
}

CERTO — Todos os estados
.btn {
  background: var(--dynamic-primary-surface-default);
}
.btn:hover {
  background: var(--dynamic-primary-surface-hover);
}
.btn:active {
  background: var(--dynamic-primary-surface-pressed);
}`}</pre>
    </div>
  );
}
