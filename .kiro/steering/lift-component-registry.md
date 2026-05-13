---
title: Lift Design System - Component Mapping Registry
version: 2.1.1
inclusion: fileMatch
fileMatchPattern: "**/*.{tsx,jsx,ts,js,css,scss,html}"
scope: component-recommendation, token-mapping
---

# Lift Design System — Component Registry

> Registry de componentes `@lift/ds-web` com tokens, props, e exemplos.
> Carregado automaticamente ao editar arquivos de UI.

---

## Component → Token Mapping

| Component | Group | Hierarchies | Import |
|-----------|-------|-------------|--------|
| LfButton | Dynamic | Primary, Secondary, Critical, Ghost, Highlight | `@lift/ds-web/components/LfButton/` |
| LfAccordion | Interactive | Primary, Neutral, Secondary, Tertiary | `@lift/ds-web/components/LfAccordion/` |
| LfTab | Interactive | Primary, Secondary, Neutral | `@lift/ds-web/components/LfTab/` |
| LfInput | Inputable | Neutral, Critical, Success | `@lift/ds-web/components/LfInput/` |
| LfSelect | Inputable | Neutral, Critical, Success | `@lift/ds-web/components/LfSelect/` |
| LfCheckbox | Inputable | Neutral, Critical | `@lift/ds-web/components/LfCheckbox/` |
| LfRadio | Inputable | Neutral, Critical | `@lift/ds-web/components/LfRadio/` |
| LfSwitch | Inputable | Neutral | `@lift/ds-web/components/LfSwitch/` |
| LfCard | Static | Primary, Secondary, Neutral | `@lift/ds-web/components/LfCard/` |
| LfAlert | Static | Critical, Warning, Success, Info | `@lift/ds-web/components/LfAlert/` |
| LfBadge | Static | Primary, Secondary, Neutral | `@lift/ds-web/components/LfBadge/` |
| LfDivider | Core | — | `@lift/ds-web/components/LfDivider/` |
| LfLink | Dynamic | Primary | `@lift/ds-web/components/LfLink/` |
| LfMenu | Interactive | Neutral | `@lift/ds-web/components/LfMenu/` |
| LfDropdown | Interactive | Neutral | `@lift/ds-web/components/LfDropdown/` |
| LfTooltip | Interactive | Neutral | `@lift/ds-web/components/LfTooltip/` |

---

## Component Details

### LfButton

```tsx
import LfButton from '@lift/ds-web/components/LfButton/';

// Primary action (max 1 per area)
<LfButton appearance="primary">Salvar</LfButton>

// Secondary action
<LfButton appearance="secondary">Cancelar</LfButton>

// Destructive action
<LfButton appearance="critical">Deletar</LfButton>

// Ghost (no background)
<LfButton appearance="ghost">Mais opções</LfButton>
```

**Props:** `appearance` (primary|secondary|critical|ghost), `size` (small|medium|large), `disabled`, `loading`

**Fallback tokens:**
- bg: `--lf-thm-dynamic-primary-surface-default`
- fg: `--lf-thm-dynamic-primary-on-surface-default`
- hover: `--lf-thm-dynamic-primary-surface-hover`
- pressed: `--lf-thm-dynamic-primary-surface-pressed`

---

### LfAccordion

```tsx
import LfAccordion from '@lift/ds-web/components/LfAccordion/';

<LfAccordion heading="Detalhes" appearance="neutral">
  Conteúdo expandível
</LfAccordion>
```

**Props:** `appearance` (primary|neutral|secondary), `expanded`, `heading`

**Fallback tokens:**
- bg: `--lf-thm-interactive-neutral-surface-default`
- fg: `--lf-thm-interactive-neutral-on-surface-default`
- border: `--lf-thm-interactive-neutral-on-surface-border-default`
- active: `--lf-thm-interactive-neutral-surface-active`

---

### LfInput

```tsx
import LfInput from '@lift/ds-web/components/LfInput/';

// Normal
<LfInput placeholder="Nome" variant="neutral" />

// Error state
<LfInput placeholder="Email" variant="error" errorMessage="Email inválido" />

// Success state
<LfInput placeholder="CPF" variant="success" />
```

**Props:** `variant` (neutral|error|success), `disabled`, `type` (text|email|password|number), `errorMessage`

**Fallback tokens:**
- bg: `--lf-thm-inputable-field-neutral-surface-default`
- fg: `--lf-thm-inputable-field-neutral-on-surface-default`
- border: `--lf-thm-inputable-field-neutral-on-surface-border-default`
- error border: `--lf-thm-inputable-field-critical-on-surface-border-default`

---

### LfCard

```tsx
import LfCard from '@lift/ds-web/components/LfCard/';

<LfCard elevation="medium">
  <h3>Título do card</h3>
  <p>Conteúdo</p>
</LfCard>
```

**Props:** `elevation` (none|low|medium|high), `appearance` (primary|neutral)

**Fallback tokens:**
- bg: `--lf-thm-static-primary-container-default`
- fg: `--lf-thm-static-primary-on-container-default`
- shadow: `--lf-thm-elevation-surface-level1-default`

---

### LfAlert

```tsx
import LfAlert from '@lift/ds-web/components/LfAlert/';

<LfAlert severity="error">Erro ao salvar dados</LfAlert>
<LfAlert severity="warning">Atenção: dados incompletos</LfAlert>
<LfAlert severity="success">Salvo com sucesso</LfAlert>
<LfAlert severity="info">Informação importante</LfAlert>
```

**Props:** `severity` (error|warning|success|info), `variant` (standard|outlined|filled)

**Fallback tokens:**
- error bg: `--lf-thm-static-critical-surface-highest`
- warning bg: `--lf-thm-interactive-warning-surface-pure-default`
- success bg: `--lf-thm-static-success-surface-highest`
- info bg: `--lf-thm-static-info-surface-highest`

---

### LfCheckbox

```tsx
import LfCheckbox from '@lift/ds-web/components/LfCheckbox/';

<LfCheckbox checked={true}>Aceitar termos</LfCheckbox>
<LfCheckbox indeterminate={true}>Selecionar todos</LfCheckbox>
```

**Props:** `checked`, `disabled`, `indeterminate`

**Fallback tokens:**
- bg: `--lf-thm-inputable-selectable-neutral-surface-default`
- icon: `--lf-thm-inputable-selectable-neutral-on-surface-icon-default`

---

### LfTab

```tsx
import LfTab from '@lift/ds-web/components/LfTab/';

<LfTab active={true}>Perfil</LfTab>
<LfTab active={false}>Configurações</LfTab>
```

**Props:** `active`, `disabled`

**Fallback tokens:**
- active bg: `--lf-thm-interactive-primary-surface-active`
- active fg: `--lf-thm-interactive-primary-on-surface-active`
- default bg: `--lf-thm-interactive-primary-surface-default`

---

## Intent → Component Recommendation

| User Intent | Recommended Component | Fallback Group |
|-------------|----------------------|----------------|
| Submit form | LfButton (primary) | Dynamic |
| Navigate to page | LfButton (primary) or LfLink | Dynamic |
| Cancel action | LfButton (secondary) | Dynamic |
| Delete/remove | LfButton (critical) | Dynamic |
| Expand content | LfAccordion | Interactive |
| Switch tab | LfTab | Interactive |
| Select from list | LfDropdown / LfMenu | Interactive |
| Enter text | LfInput | Inputable |
| Select option | LfSelect | Inputable |
| Toggle on/off | LfCheckbox / LfSwitch | Inputable |
| Show info card | LfCard | Static |
| Show error | LfAlert (error) | Static |
| Show success | LfAlert (success) | Static |

---

*Lift Component Registry — v2.1.1*
