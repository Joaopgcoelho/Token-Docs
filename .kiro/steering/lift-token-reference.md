---
title: Lift Design System - Complete Token Reference
version: 2.1.1
inclusion: manual
scope: token-architecture, decision-engine, semantic-groups, pairing-validation
---

# Lift Design System — Complete Token Reference v2.1.1

> Documento completo com todas as regras, exemplos, e algoritmos.
> Para a versão compacta (always-on), veja `lift-token-rules.md`.

---

## 1. Token Architecture (4 Layers)

```
┌─────────────────────────────────────────────────────────────────┐
│                         🥉 COMPONENT                            │
│                      (Last Resort Only)                         │
├─────────────────────────────────────────────────────────────────┤
│  Purpose:  Component-specific overrides                         │
│  Prefix:   LfThm{Component}  |  --lf-thm-{component}-          │
│  Use in:   ⚠️  Customizar componentes DS existentes            │
│  Who:      System Ops only (com justificativa)                 │
└─────────────────────────────────────────────────────────────────┘
                              ▲ references
┌─────────────────────────────────────────────────────────────────┐
│                          🥈 USAGE                               │
│                   (PRIMARY SEMANTIC LAYER)                      │
├─────────────────────────────────────────────────────────────────┤
│  Purpose:  Semantic tokens para UI                             │
│  Prefix:   LfThm  |  --lf-thm-                                 │
│  Use in:   ✅ SEMPRE para UI manual                            │
│  Who:      Todos os desenvolvedores                            │
└─────────────────────────────────────────────────────────────────┘
                              ▲ references
┌─────────────────────────────────────────────────────────────────┐
│                          BRAND                                  │
│                  (Build-time Reference Only)                    │
├─────────────────────────────────────────────────────────────────┤
│  Purpose:  Brand palette filter (Estácio, Wyden, etc)          │
│  Prefix:   LfThmBrand  |  --lf-thm-brand-                      │
│  Use in:   ⚠️  Build pipeline only (NEVER runtime UI)          │
└─────────────────────────────────────────────────────────────────┘
                              ▲ references
┌─────────────────────────────────────────────────────────────────┐
│                          BASE                                   │
│                     (Raw Primitives)                            │
├─────────────────────────────────────────────────────────────────┤
│  Purpose:  Raw color/spacing/typography values                  │
│  Prefix:   LfBs  |  --lf-bs-                                   │
│  Use in:   ❌ NEVER in UI                                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Brands and Modes

- **8 Brands:** Estácio, Wyden, YDUQS, Ibmec, Idomed, Damásio, Ensine.me, Estácio Curso Técnico
- **2 Modes:** Default (light), High Contrast (accessibility)
- Tokens adapt automatically por brand e mode
- A troca de tema muda apenas os valores; os nomes permanecem

---

## 3. Intent Classification (Pre-Requisite)

Antes de selecionar tokens, classifique o intent do elemento:

| Intent | Description | Expected Group | Confidence Threshold |
|--------|-------------|----------------|---------------------|
| `submit` | Submit data/form | Dynamic | 0.85+ |
| `navigate` | Change route/page | Dynamic | 0.85+ |
| `toggle` | Local state change | Interactive | 0.80+ |
| `expand` | Reveal hidden content | Interactive | 0.80+ |
| `inform` | Display information | Static | 0.75+ |
| `decorate` | Visual composition only | Static | 0.75+ |
| `collect-input` | Receive user data | Inputable | 0.85+ |
| `validate-input` | Show field feedback | Inputable | 0.80+ |
| `structure-page` | Layout/background | Core | 0.90+ |
| `elevate-layer` | Visual depth/shadow | Elevation | 0.85+ |

---

## 4. Decision Engine — 10 Rules (Expanded)

### Rule 1: Verify token layer and consumption hierarchy

```
IF existe componente @lift/ds-web → USE COMPONENT (preferred)
ELSE IF token.layer === "Usage"   → USE (primary semantic layer)
ELSE IF token.layer === "Component" AND customização justificada → ALLOW (last resort)
IF token.layer === "Base"         → REJECT
IF token.layer === "Brand"        → REJECT
```

### Rule 2: Classify the group

```
collectsData === true                                    → Inputable
changesNavigation === true OR submitsForm === true        → Dynamic
respondsToInteraction === true AND !changesNavigation     → Interactive
isVisualWithNoInteraction === true                        → Static
text/link/icon/border/page background                    → Core
shadow/elevation                                         → Elevation
```

**Heurísticas para inferir flags em JSX/DOM:**

```typescript
function inferFlags(element) {
  const type = element.type;
  const props = element.props || {};

  return {
    collectsData: ['input', 'textarea', 'select'].includes(type) ||
                  props.role === 'textbox' || Boolean(props.name),
    submitsForm: (type === 'button' && props.type === 'submit') ||
                 type === 'form' || Boolean(props.onSubmit),
    changesNavigation: (type === 'a' && Boolean(props.href)) ||
                       Boolean(props.to),
    respondsToInteraction: Boolean(props.onClick || props.onKeyDown) ||
                           props['aria-expanded'] !== undefined,
    isVisualWithNoInteraction: /* none of the above */
  };
}
```

### Rule 3: Select hierarchy

| Group | Condition → Hierarchy |
|-------|----------------------|
| Dynamic | Primary action (max 1/area) → Primary |
| Dynamic | Alternative action → Secondary |
| Dynamic | Destructive action → Critical |
| Dynamic | No visible background → Ghost |
| Interactive | Main highlight → Primary |
| Interactive | Default → Neutral |
| Interactive | Error feedback → Critical |
| Static | Generic content → Primary |
| Static | Error alert → Critical |
| Static | Success alert → Success |
| Inputable | Normal field → Neutral |
| Inputable | Field with error → Critical |
| Elevation | Card/dropdown → Level1 |
| Elevation | Modal/dialog → Level3 |

### Rule 4: Select role

| CSS property | Token role | Notes |
|-------------|-----------|-------|
| background-color | Surface | Ou Container (Static, bloco sobre fundo) |
| color (text) | On Surface | Ou On Container (Static) |
| color (icon) | On Surface/Icon | |
| border-color | On Surface/Border | |
| fill (SVG) | Icon | |
| box-shadow | Elevation/Surface/Level* | |

**Container vs Surface (Static only):**
- Surface = fundo de página/seção
- Container = card/banner/modal (bloco sobre o Surface)
- On Surface = texto sobre Surface
- On Container = texto sobre Container

### Rule 5: Select state

| Condition | State |
|-----------|-------|
| No interaction | Default |
| Cursor over | Hover |
| Pressed/clicked | Pressed |
| Active/selected | Active |
| Processing | Loading |
| Disabled | Disabled |

### Rule 6: Select modifier

| Context | Modifier |
|---------|----------|
| Dark background (luminance < 0.18) | Inverse |
| Light background | (none) |
| High intensity (Static Surface) | Highest / Higher / High |
| Low intensity (Static Surface) | Low / Lower / Lowest |

**Regra de cor por intensidade:**
- Token includes "High/Higher/Highest" → text = Normal
- Token includes "Low/Lower/Lowest" → text = Inverse
- Sempre validar contraste (Rule 9)

### Rule 7: Assemble the token

```
token = [Group] / [Hierarchy] / [Role] / [Modifier?] / [State]

Conversion:
  Figma: Dynamic/Primary/Surface/Default
  JS:    LfThmDynamicPrimarySurfaceDefault
  CSS:   --lf-thm-dynamic-primary-surface-default
```

### Rule 8: Validate Surface ↔ On Surface pairing

```
Surface applied → On Surface from SAME group + SAME hierarchy + SAME state
Container applied (Static only) → On Container from SAME hierarchy

❌ on-surface.group !== surface.group → ERROR
❌ on-surface over container → ERROR
❌ on-container over surface → ERROR
```

### Rule 9: Validate WCAG contrast

| Type | Minimum ratio |
|------|--------------|
| Normal text (< 18px) | ≥ 4.5:1 (WCAG AA) |
| Large text (≥ 18px bold or ≥ 24px) | ≥ 3.0:1 |
| UI component/graphic | ≥ 3.0:1 |

### Rule 10: Final checklist

- [ ] Token from Usage layer (or Component as last resort)
- [ ] Role matches CSS property
- [ ] Group matches element behavior
- [ ] Surface/On Surface pair = same group + hierarchy
- [ ] Contrast ≥ WCAG AA
- [ ] Max 1 Primary per visible area
- [ ] Variant matches luminosity context
- [ ] State matches element state
- [ ] Not in forbidden combinations

---

## 5. Semantic Groups (Detailed)

### Dynamic — Navigation Actions
- **DO:** Submit, CTA, destructive action, navigation link
- **DON'T:** Accordions, tabs, form fields, decorative elements
- **Components:** LfButton, LfLink

### Interactive — Local Interactions
- **DO:** Accordion, tabs, tooltip, dropdown, popover
- **DON'T:** Primary navigation actions
- **Components:** LfAccordion, LfTab, LfMenu, LfDropdown, LfTooltip

### Static — Visual Composition
- **DO:** Cards, banners, dividers, alerts, informational sections
- **DON'T:** Clickable elements
- **Components:** LfCard, LfBadge, LfAlert, LfDivider

### Inputable — Data Collection
- **DO:** Text inputs, checkboxes, selects, switches, radios
- **DON'T:** Submit buttons (use Dynamic)
- **Components:** LfInput, LfSelect, LfCheckbox, LfRadio, LfSwitch

### Core — Fundamental Tokens
- **Elements:** Page background, body text, inline links, icons, dividers
- **Components:** LfParagraph, LfHeading, LfIcon

### Elevation — Shadow Levels
- Level1 (cards), Level2 (popovers), Level3 (modals), Level4 (critical overlays)

---

## 6. Forbidden Token Matrix

| Source Group | Cannot Pair With | Reason | Severity |
|--------------|------------------|--------|----------|
| Dynamic | Static | Different behavioral semantics | ERROR |
| Dynamic | Inputable | Navigation vs data collection | ERROR |
| Interactive | Dynamic | Local interaction vs navigation | ERROR |
| Static | Dynamic | Non-interactive vs actionable | ERROR |
| Inputable | Dynamic | Form field ≠ submit action | ERROR |
| Container | On Surface | Must use On Container | ERROR |
| Surface | On Container | Must use On Surface | ERROR |
| Brand | Runtime UI | Build-time only | ERROR |
| Base | Runtime UI | Primitive token forbidden | ERROR |

---

## 7. Token Pairing Rules

| Background Token | Required Foreground | Forbidden |
|-----------------|---------------------|-----------|
| Dynamic/Primary/Surface | Dynamic/Primary/On Surface | Any other group |
| Static/Primary/Surface/Highest | Static/Primary/On Surface/High | Core or Dynamic |
| Static/*/Container/* | Static/*/On Container/* | On Surface tokens |
| Core/Surface/Default | Core/On Surface/Text/Primary | Brand or Dynamic |
| Inputable/Field/*/Surface | Inputable/Field/*/On Surface | Other groups |

---

## 8. AI Confidence Scoring

| Range | Action | Description |
|-------|--------|-------------|
| 0.90 - 1.00 | ✅ Auto-apply | High confidence |
| 0.75 - 0.89 | ⚠️ Apply with warning | Medium-high |
| 0.50 - 0.74 | 🔍 Require human validation | Medium |
| 0.00 - 0.49 | ❌ Reject | Low confidence |

**Factors that increase confidence:**
- Semantic HTML element (button, a, input)
- Clear props (type="submit", href, onChange)
- Standard component name
- Single valid interpretation

**Factors that decrease confidence:**
- Generic element (div, span)
- Ambiguous onClick without context
- Multiple valid interpretations
- Conflicting signals

---

## 9. AI Response Format

```json
{
  "element": "submit button",
  "recommendedApproach": "component",
  "confidence": 0.95,
  "component": {
    "name": "LfButton",
    "props": { "appearance": "primary" },
    "justification": "Componente DS disponível"
  },
  "fallbackTokens": {
    "background": {
      "token": "Dynamic/Primary/Surface/Default",
      "js": "LfThmDynamicPrimarySurfaceDefault",
      "css": "--lf-thm-dynamic-primary-surface-default"
    },
    "color": {
      "token": "Dynamic/Primary/On Surface/Default",
      "js": "LfThmDynamicPrimaryOnSurfaceDefault",
      "css": "--lf-thm-dynamic-primary-on-surface-default"
    }
  },
  "states": {
    "hover": { "background": "Dynamic/Primary/Surface/Hover" },
    "pressed": { "background": "Dynamic/Primary/Surface/Pressed" }
  },
  "rulesApplied": ["R0: Component available", "R8: Pairing validated", "R9: Contrast OK"],
  "warnings": [],
  "contrast": { "ratio": "8.1:1", "level": "AAA" }
}
```

---

## 10. Fallback Strategy

1. Check if @lift/ds-web component exists → USE IT
2. Find closest semantic token by group + role + hierarchy (Usage layer)
3. Check contrast compliance (WCAG)
4. NEVER return Base or Brand token as fallback
5. NEVER return undefined — always provide safe fallback

---

## 11. Troubleshooting

| Problema | Causa | Solução |
|----------|-------|---------|
| "Usei Primary mas não funciona" | Cada grupo tem seu Primary | Botão→Dynamic, Tab→Interactive, Card→Static |
| "Contraste falhou" | Surface e On Surface de grupos diferentes | Mesmo grupo + mesma hierarquia |
| "Token não existe" | Base/Brand direto ou typo | Validar no enriched JSON |
| "Não sei qual grupo" | Classificação ambígua | Muda página?→Dynamic. Coleta dados?→Inputable. Clique local?→Interactive. Visual?→Static |

---

## 12. Data Files Reference

| File | Content |
|------|---------|
| `docs/tokens-figma-enriched.json` | 1,494 tokens com context, alias chains, roles |
| `docs/tokens-all-brands.json` | Valores por brand × mode |
| `docs/lift-tokens.css` | CSS custom properties |

---

*Lift Design System © 2026 — v2.1.1*
