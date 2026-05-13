---
title: Lift Design System - Full AI Instructions
version: 2.1.1
inclusion: manual
scope: token-selection, component-recommendation, validation, automation
key-concepts:
  - consumption-order: DS-component → Usage-tokens → Component-tokens
  - pairing-rule: Surface + On Surface must share same group + hierarchy
  - forbidden: Base/Brand tokens never in runtime UI
  - container: Container/On Container only in Static group
  - max-primary: 1 Primary action per visible area
---

# Lift Design System — AI Token Instructions v2.1.1

> Regras determinísticas para seleção, aplicação e validação de design tokens.

---

## TL;DR

1. Existe componente `@lift/ds-web`? → **Use o componente**
2. Não existe? → Use token Usage: `--lf-thm-{group}-{hierarchy}-{role}-{state}`
3. Pairing: bg = Surface → fg = On Surface (**MESMO grupo + hierarquia**)
4. Proibido: `LfBs*`, `LfThmBrand*`, `#hex` hardcoded
5. Max 1 Primary por área visível
6. Destructive = Critical (sempre)
7. Input/Select/Textarea = Inputable (nunca Dynamic)
8. Container/On Container = somente grupo Static

---

## Hierarquia de Consumo

| # | Camada | Quando | Quem |
|---|--------|--------|------|
| 🥇 | Componente `@lift/ds-web` | Sempre que existir | Todos |
| 🥈 | Usage tokens (`--lf-thm-*`) | UI manual sem componente DS | Todos |
| 🥉 | Component tokens (`--lf-thm-component-*`) | Customizar componente DS existente | System Ops |
| ❌ | Base (`LfBs*`) / Brand (`LfThmBrand*`) | NUNCA em runtime UI | — |

---

## Token Architecture

| Layer | Prefix | UI | Purpose |
|-------|--------|----|---------|
| Base | `LfBs` / `--lf-bs-` | ❌ | Raw primitives |
| Brand | `LfThmBrand` / `--lf-thm-brand-` | ❌ | Brand palette (build-time) |
| Usage | `LfThm` / `--lf-thm-` | ✅ | Semantic tokens |
| Component | `LfThm{Comp}` / `--lf-thm-component-` | ⚠️ | Overrides (last resort) |

---

## Token Naming

```
[Group] / [Hierarchy] / [Role] / [Modifier?] / [State]
```

| Segment | Values |
|---------|--------|
| Group | Dynamic, Interactive, Static, Inputable, Core, Elevation |
| Hierarchy | Primary, Secondary, Critical, Neutral, Ghost, Highlight, Warning, Success, Info, AI, Tertiary |
| Role | Surface, On Surface, Container, On Container, Border, Icon, Text, Link |
| Modifier | Inverse, Highest, Higher, High, Low, Lower, Lowest, Pure |
| State | Default, Hover, Pressed, Active, Loading, Disabled |

| Format | Example |
|--------|---------|
| Figma | `Dynamic/Primary/Surface/Default` |
| JS | `LfThmDynamicPrimarySurfaceDefault` |
| CSS | `--lf-thm-dynamic-primary-surface-default` |

---

## Group Classification

Avalie na ordem — primeira condição verdadeira define o grupo:

| # | Condição | Group |
|---|----------|-------|
| 1 | Coleta dados (input, select, textarea, checkbox, radio) | **Inputable** |
| 2 | Submete form OU muda navegação (button[submit], a[href], router) | **Dynamic** |
| 3 | Responde a interação local sem navegar (accordion, tab, dropdown) | **Interactive** |
| 4 | Visual puro, sem interação (card, alert, badge, divider) | **Static** |
| 5 | Background de página, texto, link, ícone, border global | **Core** |
| 6 | Sombra / box-shadow | **Elevation** |

**Tiebreaker:** "Muda página ou submete?" → Dynamic. "Fica na mesma tela?" → Interactive.

### Heurísticas JSX/DOM

```typescript
function inferFlags(el) {
  const { type, props = {} } = el;
  return {
    collectsData: ['input','textarea','select'].includes(type) || props.role === 'textbox' || Boolean(props.name),
    submitsForm: (type === 'button' && props.type === 'submit') || Boolean(props.onSubmit),
    changesNavigation: (type === 'a' && Boolean(props.href)) || Boolean(props.to),
    respondsToInteraction: Boolean(props.onClick || props.onKeyDown) || props['aria-expanded'] !== undefined,
    isVisual: /* none of the above */
  };
}
```

---

## Hierarchy Selection

| Group | Condition → Hierarchy |
|-------|----------------------|
| **Dynamic** | Primary action (max 1/area) → Primary |
| | Alternative → Secondary |
| | Destructive → Critical |
| | No background → Ghost |
| | Special → Highlight |
| **Interactive** | Main → Primary |
| | Default → Neutral |
| | Alt → Secondary / Tertiary |
| | Feedback → Critical / Warning / Success / Info |
| **Static** | Generic → Primary |
| | Alt → Secondary / Neutral |
| | Feedback → Critical / Success / Warning / Info / AI |
| **Inputable** | Normal → Neutral |
| | Error → Critical |
| | Valid → Success |
| **Elevation** | Card/dropdown → Level1 |
| | Popover/tooltip → Level2 |
| | Modal/dialog → Level3 |
| | Critical overlay → Level4 |

---

## Role ↔ CSS Property

| CSS property | Token role | Notes |
|-------------|-----------|-------|
| `background-color` | Surface | Or Container (Static group, block over bg) |
| `color` (text) | On Surface | Or On Container (Static group) |
| `color` (icon) | On Surface/Icon | |
| `border-color` | On Surface/Border | |
| `fill` (SVG) | Icon | |
| `box-shadow` | Elevation/Surface/Level* | |

### Container vs Surface (Static only)

| Element | Role | Foreground role |
|---------|------|----------------|
| Page/section background | Surface | On Surface |
| Card/banner/modal (block over bg) | Container | On Container |

⚠️ **Never:** On Surface over Container. **Never:** On Container over Surface.

---

## States

| Condition | State |
|-----------|-------|
| No interaction | Default |
| Cursor over | Hover |
| Clicked | Pressed |
| Selected/active | Active |
| Processing | Loading |
| Disabled | Disabled |

---

## Modifiers

| Context | Modifier |
|---------|----------|
| Dark bg (luminance < 0.18) | Inverse |
| Light bg | (none) |
| Static Surface high intensity | Highest / Higher / High |
| Static Surface low intensity | Low / Lower / Lowest |
| Interactive intensity | Low / Pure / High |

**Rule:** High/Higher/Highest bg → Normal text. Low/Lower/Lowest bg → Inverse text. Always validate contrast.

---

## Pairing Rules

```
bg: {Group}/{Hierarchy}/Surface/{State}
fg: {Group}/{Hierarchy}/On Surface/{State}     ← SAME group + hierarchy

bg: Static/{Hierarchy}/Container/{State}
fg: Static/{Hierarchy}/On Container/{State}    ← SAME hierarchy
```

| Background | Required Foreground | Forbidden |
|-----------|--------------------:|-----------|
| Dynamic/Primary/Surface | Dynamic/Primary/On Surface | Any other group |
| Static/Primary/Surface/Highest | Static/Primary/On Surface/High | Core or Dynamic |
| Static/*/Container/* | Static/*/On Container/* | On Surface tokens |
| Core/Surface/Default | Core/On Surface/Text/Primary | Brand or Dynamic |
| Inputable/Field/*/Surface | Inputable/Field/*/On Surface | Other groups |

---

## WCAG Contrast

| Type | Min ratio |
|------|-----------|
| Normal text (< 18px) | ≥ 4.5:1 |
| Large text (≥ 18px bold or ≥ 24px) | ≥ 3.0:1 |
| UI component/graphic | ≥ 3.0:1 |

```typescript
function channelToLinear(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}
function relativeLuminance(hex: string): number {
  const [r, g, b] = [hex.slice(1,3), hex.slice(3,5), hex.slice(5,7)].map(h => channelToLinear(parseInt(h, 16)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrastRatio(a: string, b: string): number {
  const [L1, L2] = [relativeLuminance(a), relativeLuminance(b)].sort((x,y) => y-x);
  return (L1 + 0.05) / (L2 + 0.05);
}
```

---

## Forbidden Combinations

| ❌ Never do this | Why |
|-----------------|-----|
| `LfBs*` or `--lf-bs-*` in UI | Base = raw primitives |
| `LfThmBrand*` or `--lf-thm-brand-*` in UI | Brand = build-time only |
| `#hex` hardcoded when token exists | Breaks theming |
| Surface group A + On Surface group B | Semantic mismatch |
| On Surface over Container | Must use On Container |
| On Container over Surface | Must use On Surface |
| Multiple Primary in same area | UX confusion |
| Dynamic tokens on non-interactive elements | Wrong semantics |
| Static tokens on clickable elements | Wrong semantics |
| Inputable tokens on submit buttons | Wrong group |
| Mix Normal + Inverse in same component | Visual inconsistency |

### Cross-Group Pairing Violations

| Source | Cannot pair with | Severity |
|--------|-----------------|----------|
| Dynamic | Static, Inputable | ERROR |
| Interactive | Dynamic | ERROR |
| Static | Dynamic | ERROR |
| Inputable | Dynamic, Static | ERROR |
| Container | On Surface | ERROR |
| Surface | On Container | ERROR |
| Base/Brand | Any runtime UI | ERROR |

---

## Quick Reference

| Need | Token |
|------|-------|
| Button primary bg | `Dynamic/Primary/Surface/Default` |
| Button primary text | `Dynamic/Primary/On Surface/Default` |
| Button destructive bg | `Dynamic/Critical/Surface/Default` |
| Button secondary text | `Dynamic/Secondary/On Surface/Default` |
| Button secondary border | `Dynamic/Secondary/On Surface/Border/Default` |
| Button ghost text | `Dynamic/Ghost/On Surface/Default` |
| Tab active bg | `Interactive/Primary/Surface/Active` |
| Accordion bg | `Interactive/Neutral/Surface/Default` |
| Dropdown bg | `Interactive/Neutral/Surface/Default` |
| Card bg | `Static/Primary/Container/Default` |
| Card text | `Static/Primary/On Container/Default` |
| Badge bg | `Static/Primary/Container/Default` |
| Alert error bg | `Static/Critical/Surface/Highest` |
| Alert success bg | `Static/Success/Surface/Highest` |
| Alert warning bg | `Interactive/Warning/Surface/Pure/Default` |
| Input bg | `Inputable/Field/Neutral/Surface/Default` |
| Input border | `Inputable/Field/Neutral/On Surface/Border/Default` |
| Input error border | `Inputable/Field/Critical/On Surface/Border/Default` |
| Checkbox checked bg | `Inputable/Selectable/Neutral/Surface/Default` |
| Text main | `Core/On Surface/Text/Primary` |
| Text secondary | `Core/On Surface/Text/Secondary` |
| Text error | `Core/On Surface/Text/Critical` |
| Link | `Core/On Surface/Link/Default` |
| Link hover | `Core/On Surface/Link/Hover` |
| Page bg | `Core/Surface/Default` |
| Page bg dark | `Core/Surface/Inverse` |
| Divider | `Core/On Surface/Border/Divider` |
| Focus ring | `Core/On Surface/Border/Focus` |
| Shadow card | `Elevation/Surface/Level1/Default` |
| Shadow popover | `Elevation/Surface/Level2/Default` |
| Shadow modal | `Elevation/Surface/Level3/Default` |
| Shadow critical | `Elevation/Surface/Level4/Default` |

---

## Component Registry

| Component | Group | Props | Import |
|-----------|-------|-------|--------|
| LfButton | Dynamic | `appearance`: primary, secondary, critical, ghost | `@lift/ds-web/components/LfButton/` |
| LfLink | Dynamic | — | `@lift/ds-web/components/LfLink/` |
| LfAccordion | Interactive | `appearance`: primary, neutral, secondary | `@lift/ds-web/components/LfAccordion/` |
| LfTab | Interactive | `active`, `disabled` | `@lift/ds-web/components/LfTab/` |
| LfMenu | Interactive | — | `@lift/ds-web/components/LfMenu/` |
| LfDropdown | Interactive | — | `@lift/ds-web/components/LfDropdown/` |
| LfTooltip | Interactive | — | `@lift/ds-web/components/LfTooltip/` |
| LfInput | Inputable | `variant`: neutral, error, success | `@lift/ds-web/components/LfInput/` |
| LfSelect | Inputable | `variant`: neutral, error, success | `@lift/ds-web/components/LfSelect/` |
| LfCheckbox | Inputable | `checked`, `indeterminate`, `disabled` | `@lift/ds-web/components/LfCheckbox/` |
| LfRadio | Inputable | `checked`, `disabled` | `@lift/ds-web/components/LfRadio/` |
| LfSwitch | Inputable | `checked`, `disabled` | `@lift/ds-web/components/LfSwitch/` |
| LfCard | Static | `elevation`: none, low, medium, high | `@lift/ds-web/components/LfCard/` |
| LfAlert | Static | `severity`: error, warning, success, info | `@lift/ds-web/components/LfAlert/` |
| LfBadge | Static | `appearance`: primary, secondary, neutral | `@lift/ds-web/components/LfBadge/` |
| LfDivider | Core | — | `@lift/ds-web/components/LfDivider/` |

---

## Intent → Component

| Intent | Component | Group |
|--------|-----------|-------|
| Submit form | LfButton (primary) | Dynamic |
| Navigate | LfButton (primary) / LfLink | Dynamic |
| Cancel | LfButton (secondary) | Dynamic |
| Delete | LfButton (critical) | Dynamic |
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

## Examples

### ✅ Correct — DS Component

```tsx
import LfButton from "@lift/ds-web/components/LfButton/";
<LfButton appearance="primary">Salvar</LfButton>
<LfButton appearance="critical">Deletar</LfButton>
```

### ✅ Correct — Usage Tokens (no component available)

```css
.custom-element {
  background-color: var(--lf-thm-dynamic-primary-surface-default);
  color: var(--lf-thm-dynamic-primary-on-surface-default);
}
.custom-element:hover {
  background-color: var(--lf-thm-dynamic-primary-surface-hover);
}
```

### ✅ Correct — Card with Container

```tsx
<div style={{ background: 'var(--lf-thm-core-surface-default)' }}>
  <section style={{
    background: 'var(--lf-thm-static-primary-container-default)',
    boxShadow: 'var(--lf-thm-elevation-surface-level1-default)'
  }}>
    <p style={{ color: 'var(--lf-thm-static-primary-on-container-default)' }}>
      Card content
    </p>
  </section>
</div>
```

### ❌ Wrong

```tsx
// ❌ Hardcoded hex
<button style={{ backgroundColor: '#076AEA' }}>

// ❌ Base token
<button style={{ backgroundColor: LfBsColorPrimary500 }}>

// ❌ Brand token
<button style={{ backgroundColor: 'var(--lf-thm-brand-color-primary-500)' }}>

// ❌ Mixed groups
<div style={{
  backgroundColor: 'var(--lf-thm-dynamic-primary-surface-default)',
  color: 'var(--lf-thm-static-primary-on-surface-default)' // WRONG GROUP
}}>
```

---

## Validation Checklist

Before applying any token:

- [ ] Token from Usage layer (or Component as last resort with justification)
- [ ] Role matches CSS property (Surface → background, On Surface → color)
- [ ] Group matches element behavior
- [ ] Surface/On Surface pair = same group + same hierarchy
- [ ] Contrast ≥ WCAG AA
- [ ] Max 1 Primary per visible area
- [ ] Variant (Normal/Inverse) matches luminosity context
- [ ] State matches element state
- [ ] Not in forbidden combinations

---

## Design Smells

| ID | Severity | What | Fix |
|----|----------|------|-----|
| `multiple-primary-actions` | Warning | >1 Primary in viewport | Downgrade to Secondary |
| `clickable-static` | Error | Static on interactive | Use Dynamic/Interactive |
| `missing-hover-state` | Warning | No hover on interactive | Add hover token |
| `missing-focus-ring` | Error | No focus on focusable | Add Core/On Surface/Border/Focus |
| `hardcoded-hex` | Error | #hex instead of token | Replace with semantic token |
| `mixed-semantic-groups` | Error | Surface ≠ On Surface group | Match groups |
| `container-without-on-container` | Error | Wrong pairing | Use On Container |
| `dynamic-without-action` | Warning | Dynamic on non-action | Review classification |
| `low-contrast` | Error | < 4.5:1 for text | Adjust token pair |
| `excessive-critical-actions` | Warning | >2 destructive visible | Progressive disclosure |
| `surface-without-onsurface` | Error | bg without fg | Add foreground token |
| `inputable-on-button` | Error | Input tokens on submit | Use Dynamic |
| `static-on-link` | Error | Static on navigation | Use Dynamic |

---

## AI Confidence Scoring

| Score | Action |
|-------|--------|
| 0.90+ | ✅ Auto-apply |
| 0.75–0.89 | ⚠️ Apply + warn |
| 0.50–0.74 | 🔍 Require validation |
| < 0.50 | ❌ Reject |

**Increases:** semantic HTML, clear props, registry match, single interpretation
**Decreases:** generic element (div/span), ambiguous onClick, multiple interpretations, conflicting signals

---

## AI Response Format

```json
{
  "element": "submit button",
  "recommendedApproach": "component",
  "confidence": 0.95,
  "component": { "name": "LfButton", "props": { "appearance": "primary" } },
  "fallbackTokens": {
    "background": { "token": "Dynamic/Primary/Surface/Default", "css": "--lf-thm-dynamic-primary-surface-default" },
    "color": { "token": "Dynamic/Primary/On Surface/Default", "css": "--lf-thm-dynamic-primary-on-surface-default" }
  },
  "states": {
    "hover": { "background": "Dynamic/Primary/Surface/Hover" },
    "pressed": { "background": "Dynamic/Primary/Surface/Pressed" }
  },
  "rulesApplied": ["R0: Component available", "R8: Pairing OK", "R9: Contrast 8.1:1 AAA"],
  "warnings": [],
  "contrast": { "ratio": "8.1:1", "level": "AAA" }
}
```

---

## Automation

### Regex Patterns

```javascript
const usageToken = /\bLfThm([A-Z][a-z0-9]+){3,}\b/g;
const cssVar = /--lf-thm-[a-z]+(?:-[a-z0-9]+)+/g;
const forbiddenBase = /\bLfBs[A-Z][A-Za-z0-9]*\b/g;
const forbiddenBrand = /\bLfThmBrand[A-Z][A-Za-z0-9]*\b/g;
```

### Pairing Validation

```typescript
function validatePairing(bg: Token, fg: Token): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (bg.group !== fg.group) errors.push(`Group mismatch: ${bg.group} ≠ ${fg.group}`);
  if (bg.hierarchy !== fg.hierarchy) errors.push(`Hierarchy mismatch: ${bg.hierarchy} ≠ ${fg.hierarchy}`);
  if (bg.role === 'Container' && fg.role !== 'On Container') errors.push('Container requires On Container');
  if (bg.role === 'Surface' && fg.role === 'On Container') errors.push('Surface requires On Surface');
  if (['base','brand'].includes(bg.layer) || ['base','brand'].includes(fg.layer)) errors.push('Base/Brand forbidden');
  return { valid: errors.length === 0, errors };
}
```

---

## Brands & Modes

- **8 Brands:** Estácio, Wyden, YDUQS, Ibmec, Idomed, Damásio, Ensine.me, Estácio Curso Técnico
- **2 Modes:** Default (light), High Contrast (accessibility)
- Code references token name → system resolves correct value per brand/mode
- Theme switch changes values only; names stay the same

---

## Data Files

| File | Content |
|------|---------|
| `docs/tokens-figma-enriched.json` | 1,494 tokens with context, alias chains, roles, CSS properties |
| `docs/tokens-all-brands.json` | Token values across 8 brands × 2 modes |
| `docs/lift-tokens.css` | CSS custom properties |

---

## Changelog

### v2.1.1 (2026-05-12)

**Mudanças Críticas:**
- Clarified precedence: Usage tokens preferidos sobre Component tokens (último recurso)
- Ajustada "Regra Zero" para ordem 🥇 componentes → 🥈 Usage → 🥉 Component
- Atualizada Rule 1 para refletir a mesma hierarquia

**Conteúdo Aprimorado:**
- Índice completo e seção de linguagem recomendada
- Container vs Surface explicado com exemplos de código (Static group)
- Regra de tema + intensidade (High/Low, Normal/Inverse) com validação de contraste
- Algoritmo de contraste WCAG 2.1 implementável (TypeScript)
- Heurística para classificação automática (`inferFlags()`) em JSX/AST

**Automação e Ferramentas:**
- ESLint rule completo (`no-forbidden-tokens`) com detecção de Base/Brand
- Regexes robustas para tokens e forbidden patterns
- JSON Schema e exemplos de testes Jest

**Novas Seções:**
- Intent Classification — Pre-requisite para seleção de tokens com algoritmo
- Forbidden Token Matrix — Tabela completa com severidade e auto-fix
- Design Smells — 13 anti-patterns detectáveis
- AI Confidence Scoring — Sistema 0.0–1.0 com thresholds e automação
- Component Mapping Registry — 16 componentes `@lift/ds-web`

**IA e Automação:**
- Confidence thresholds: 0.90+ auto-apply, 0.75–0.89 warning, 0.50–0.74 validation, <0.50 reject
- Intent classification: 10 tipos (submit, navigate, toggle, expand, etc.)
- Component registry: LfButton, LfAccordion, LfInput, LfCard, LfAlert, LfCheckbox, LfTab, +9

---

### v2.1.0 (2026-04-28)

- Added "Regra Zero: Hierarquia de Consumo"
- Added "Quick Decision" one-question tree
- Added "Exemplos Práticos" section with code
- Added "Atalhos por Caso de Uso" table
- Added "Troubleshooting Comum" section
- Added "Validação Automatizada" section
- Added component references to semantic groups
- Improved AI Response Format with component recommendation
- Reorganized document for better scanning

---

### v2.0.0 (2026-03-15)

- Initial deterministic rules document
- 10 Rules Decision Engine
- Token Architecture (4 Layers)
- Semantic Groups definition (Dynamic, Interactive, Static, Inputable, Core, Elevation)
- Token Naming Convention
- Pairing Rules and WCAG validation
- Quick Reference table
- AI Response Format (JSON)
- Fallback Strategy
- Enriched Data Reference

---

*Lift Design System © 2026 — v2.1.1*  
