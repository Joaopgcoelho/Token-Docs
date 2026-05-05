# 🤖 AI Token Consumption Instructions — Lift Design System v2

> **Purpose:** Deterministic rules for AI agents and LLMs to correctly select, apply, and validate design tokens from the Lift Design System.
> **Rule zero:** Never guess. Always follow deterministic rules. Never use Base or Brand tokens directly in UI.

---

## 1. Token Architecture (4 Layers)

```
┌─────────────────────────────────────────────────┐
│  Component     Component-specific tokens         │
│  (restricted)  Ex: Button/Primary/Surface         │
├─────────────────────────────────────────────────┤
│  Usage         Semantic tokens (THE UI layer)     │
│  (MANDATORY)   Ex: Dynamic/Primary/Surface        │
├─────────────────────────────────────────────────┤
│  Brand         Brand palette filter over Base     │
│  (reference)   Ex: Brand/Color/Primary/500        │
├─────────────────────────────────────────────────┤
│  Base          Raw primitive values (Foundations)  │
│  (foundation)  Ex: saphire/500 → #076AEA          │
└─────────────────────────────────────────────────┘
```

| Layer | Prefix | Use in UI | Role |
|-------|--------|:---------:|------|
| **Base** | `LfBs` / `--lf-bs-` | ❌ NEVER | Raw primitive values |
| **Brand** | `LfThm` + `Brand` / `--lf-thm-brand-` | ⚠️ Avoid | Brand-filtered subset |
| **Usage** | `LfThm` / `--lf-thm-` | ✅ ALWAYS | Semantic tokens — primary UI layer |
| **Component** | `LfThm` + `Component` / `--lf-thm-component-` | ✅ When available | Component-specific (System Ops only) |

---

## 2. Token Naming Convention

```
[Group] / [Hierarchy] / [Role] / [Modifier?] / [State]
```

| Segment | Examples |
|---------|----------|
| **Group** | Dynamic, Interactive, Static, Inputable, Core, Elevation |
| **Hierarchy** | Primary, Secondary, Critical, Neutral, Highlight, Ghost |
| **Role** | Surface, On Surface, Container, On Container, Border, Icon, Text, Link |
| **Modifier** | Inverse, Low, High, Pure, Highest, Lowest |
| **State** | Default, Hover, Pressed, Active, Loading, Disabled |

### Conversion Rules

| Format | Example |
|--------|---------|
| **Figma path** | `Dynamic/Primary/Surface/Default` |
| **JS name** | `LfThmDynamicPrimarySurfaceDefault` |
| **CSS variable** | `--lf-thm-dynamic-primary-surface-default` |

---

## 3. Brands and Modes

**8 Brands:** Estácio, Wyden, YDUQS, Ibmec, Idomed, Damásio, Ensine.me, Estácio Curso Técnico
**2 Modes:** Default (light), High Contrast (accessibility)

Tokens adapt automatically per brand and mode. Code references the token name — the system resolves the correct value.

---

## 4. Decision Engine — 10 Rules

### Rule 1: Verify token layer

```
IF token.layer === "Base"      → REJECT (never use in UI)
IF token.layer === "Brand"     → REJECT (internal reference only)
IF token.layer === "Component" AND exists for component → PREFER
IF token.layer === "Usage"     → USE (primary layer)
```

### Rule 2: Classify the group (by element behavior)

Evaluate conditions in order. First true condition defines the group.

```
STEP 1: Is it a UI component?
  IF NO → check if it's a global page element
    IF text/link/icon/border/page background → group = "Core"
    IF shadow/elevation (box-shadow)         → group = "Elevation"
    ELSE → ERROR: not a UI element

STEP 2: It IS a UI component — classify by behavior
  IF element.collectsData === true
    → group = "Inputable"
  IF element.changesNavigation === true OR element.submitsForm === true
    → group = "Dynamic"
  IF element.respondsToInteraction === true AND element.changesNavigation === false
    → group = "Interactive"
  IF element.isVisualWithNoInteraction === true
    → group = "Static"
  ELSE → ERROR: review classification

TIEBREAKER:
  "Changes page or submits data?" → Dynamic
  "Stays on same screen?"         → Interactive
```

### Rule 3: Select hierarchy

```
IF group === "Dynamic":
  primaryAction (max 1 per area)  → "Primary"
  alternativeAction               → "Secondary"
  destructiveAction               → "Critical"
  noVisibleBackground             → "Ghost"
  specialHighlight                → "Highlight"

IF group === "Interactive":
  primaryHighlight                → "Primary"
  secondaryHighlight              → "Secondary"
  thirdLevel                      → "Tertiary"
  default                         → "Neutral"
  specialHighlight                → "Highlight"
  errorFeedback                   → "Critical"
  warningFeedback                 → "Warning"
  successFeedback                 → "Success"
  infoFeedback                    → "Info"

IF group === "Static":
  genericContent                  → "Primary"
  secondaryContent                → "Secondary"
  neutralStructure                → "Neutral"
  errorAlert                      → "Critical"
  successAlert                    → "Success"
  warningAlert                    → "Warning"
  informational                   → "Info"
  aiContent                       → "AI"

IF group === "Inputable":
  normalField                     → "Neutral"
  fieldWithError                  → "Critical"
  validatedField                  → "Success"

IF group === "Elevation":
  subtle (card, dropdown)         → "Level1"
  medium (popover, tooltip)       → "Level2"
  high (modal, dialog)            → "Level3"
  maximum (critical overlay)      → "Level4"
```

### Rule 4: Select role (by CSS property)

```
CSS property      → token role
─────────────────────────────────────────────────
background-color  → "Surface"
background-color  → "Container" (Static only, layer above Surface)
color (text)      → "On Surface" or "On Surface/Text"
color (icon)      → "On Surface/Icon" or "Icon"
border-color      → "On Surface/Border" or "Border"
fill (SVG)        → "Icon"
box-shadow        → "Elevation" (Elevation group)

CONTAINER RULE (Static group only):
  IF background for a GROUP of elements (card, block) → "Container"
  IF content ON that group                            → "On Container"
  IF background for section/page                      → "Surface"
  IF content on section/page                          → "On Surface"
```

### Rule 5: Select state

```
noInteraction      → "Default"
cursorOver         → "Hover"
pressed            → "Pressed"
activeSelected     → "Active"
processing         → "Loading"
disabled           → "Disabled"
```

### Rule 6: Select modifier (when applicable)

```
IF darkContext (luminance < 0.18) → modifier = "Inverse"
IF lightContext (luminance > 0.5) → modifier = none (Normal)

NEVER mix Normal and Inverse in the same component

IF group === "Static" AND role === "Surface":
  highIntensity   → "Highest" / "Higher" / "High"
  lowIntensity    → "Low" / "Lower" / "Lowest"

IF group === "Interactive" AND has intensity:
  → "Low" / "Pure" / "High"
```

### Rule 7: Assemble the token

```
token = [Group] / [Hierarchy] / [Role] / [Modifier?] / [State]

Examples:
  Dynamic/Primary/Surface/Default
  Dynamic/Primary/On Surface/Default
  Dynamic/Primary/Surface/Hover
  Dynamic/Critical/Surface/Default
  Static/Primary/Surface/Highest
  Static/Primary/On Surface/High
  Static/Primary/Container/Default
  Static/Primary/On Container/Default
  Interactive/Primary/Surface/Active
  Interactive/Warning/Surface/Pure/Default
  Inputable/Field/Neutral/Surface/Default
  Inputable/Field/Critical/On Surface/Border/Default
  Core/Surface/Default
  Core/Surface/Inverse
  Core/On Surface/Text/Primary
  Core/On Surface/Link/Default
  Elevation/Surface/Level1/Default

Conversion to code:
  Figma: Dynamic/Primary/Surface/Default
  JS:    LfThmDynamicPrimarySurfaceDefault
  CSS:   --lf-thm-dynamic-primary-surface-default
```

### Rule 8: Validate Surface ↔ On Surface pairing

```
FOR EACH Surface applied:
  MUST have On Surface from SAME group + SAME hierarchy + SAME state
  IF on-surface.group !== surface.group           → ERROR
  IF on-surface.hierarchy !== surface.hierarchy   → ERROR

FOR EACH Container applied (Static only):
  MUST have On Container from SAME group + SAME hierarchy
  IF uses on-surface over container               → ERROR
  IF uses on-container over surface               → ERROR

Valid examples:
  bg: Dynamic/Primary/Surface/Default
  fg: Dynamic/Primary/On Surface/Default          ✅

  bg: Static/Primary/Container/Default
  fg: Static/Primary/On Container/Default         ✅

Invalid examples:
  bg: Static/Primary/Surface/Highest
  fg: Dynamic/Primary/On Surface/Default          ❌ (different groups)

  bg: Static/Primary/Container/Default
  fg: Static/Primary/On Surface/Default           ❌ (On Surface over Container)
```

### Rule 9: Validate WCAG contrast

```
IF normal text (< 18px or < 14px bold):
  ratio(surface, on-surface) >= 4.5  (WCAG AA)

IF large text (>= 18px bold or >= 24px):
  ratio(surface, on-surface) >= 3.0  (WCAG AA Large)

IF UI component or graphic:
  ratio(surface, on-surface) >= 3.0
```

### Rule 10: Final checklist

```
Before applying any token, verify:
  [ ] Token is from Usage or Component layer (not Base, not Brand)
  [ ] Role matches CSS property (surface → background, on-surface → color)
  [ ] Group matches element behavior (dynamic/interactive/static/inputable/core)
  [ ] Surface/on-surface pair is from the same group and hierarchy
  [ ] Contrast ratio meets WCAG AA minimum
  [ ] Maximum 1 Primary per visible action area
  [ ] Variant (normal/inverse) matches luminosity context
  [ ] State token matches element state
  [ ] Not in the forbidden combinations list
```

---

## 5. Decision Tree (visual flow)

```
Is the element a UI component?
│
├─ NO → Is it a global page element (text, link, icon, border, page bg)?
│        ├─ YES → Core
│        └─ NO → Is it a shadow/elevation (box-shadow)?
│                 ├─ YES → Elevation
│                 └─ NO → Review — may be Brand (reference only)
│
└─ YES → Does the element collect user data?
          │
          ├─ YES → Inputable
          │         ├─ Text/value field → Inputable/Field
          │         └─ Checkbox/radio/switch → Inputable/Selectable
          │
          └─ NO → Does the element change navigation (submit, link, CTA)?
                   │
                   ├─ YES → Dynamic
                   │
                   └─ NO → Does the element respond to local interaction?
                            │
                            ├─ YES → Interactive
                            │
                            └─ NO → Is it visual with no interaction?
                                     │
                                     ├─ YES → Static
                                     └─ NO → Review the behavior
```

---

## 6. Semantic Groups

### Dynamic — Navigation Actions
- **Triggers:** Submit, CTA, destructive action, navigation link
- **Hierarchies:** Primary, Secondary, Critical, Ghost, Highlight, Disabled
- **Roles:** Surface, On Surface
- **States:** Default, Hover, Pressed, Loading
- **DO:** Primary page actions, form submissions, navigation triggers
- **DON'T:** Accordions, tabs, form fields, decorative elements

### Interactive — Local Interactions
- **Triggers:** Accordion, tabs, tooltip, dropdown, popover
- **Hierarchies:** Primary, Secondary, Tertiary, Neutral, Highlight, Critical, Warning, Success, Info
- **Roles:** Surface, On Surface, Border
- **States:** Default, Hover, Active
- **DO:** Local interactions that keep user on same screen
- **DON'T:** Primary navigation actions (use Dynamic)

### Static — Visual Composition
- **Elements:** Cards, banners, dividers, alerts, informational sections
- **Hierarchies:** Primary, Secondary, Neutral, Critical, Success, Warning, Info, AI
- **Surface intensity:** Highest → Higher → High → Low → Lower → Lowest
- **Container types:** Neutral, Highlight-High, Highlight-Low, Outline-High, Outline-Low
- **Roles:** Surface, On Surface, Container, On Container
- **DO:** Layout structure, informational content, grouping
- **DON'T:** Clickable elements

### Inputable — Data Collection
- **Elements:** Text inputs, checkboxes, selects, switches, radios, date pickers
- **Subtypes:** Field (text/value), Selectable (checkbox/radio/switch)
- **Feedback:** Neutral, Critical, Success
- **Roles:** Surface, On Surface, Border, Icon
- **States:** Default, Hover, Active
- **DO:** All form controls
- **DON'T:** Submit buttons (use Dynamic)

### Core — Fundamental Tokens
- **Elements:** Page background, body text, inline links, decorative icons, dividers
- **Roles:** Surface, On Surface (Text, Icon, Border, Link)
- **Variants:** Normal, Inverse
- **Use in components:** ❌ Never directly

### Elevation — Shadow Levels
- **Levels:** Level1 (cards), Level2 (popovers), Level3 (modals), Level4 (critical overlays)
- **Roles:** Surface, On Surface, Border

---

## 7. Forbidden Combinations

```
❌ Base tokens directly in UI components
❌ Brand tokens directly in UI components
❌ Mixing surface/on-surface from different groups
❌ On-surface over container (use on-container)
❌ On-container over surface (use on-surface)
❌ Multiple primary elements in same action area
❌ Dynamic tokens on non-interactive elements
❌ Inputable tokens on submit buttons
❌ Static tokens on clickable elements
❌ Hardcoded values (#hex) when a semantic token exists
❌ Mixing normal and inverse variants in the same component
❌ Neutral tokens on brand backgrounds (contrast violation)
```

---

## 8. Token Pairing Rules

| Background Token | Required Text Token | Forbidden |
|-----------------|---------------------|-----------|
| `Dynamic/Primary/Surface` | `Dynamic/Primary/On Surface` | Any other group's on-surface |
| `Static/Primary/Surface/Highest` | `Static/Primary/On Surface/High` | Core or Dynamic on-surface |
| `Static/*/Container/*` | `Static/*/On Container/*` | on-surface tokens |
| `Core/Surface/Default` | `Core/On Surface/Text/Primary` | Brand or Dynamic on-surface |
| `Inputable/Field/*/Surface` | `Inputable/Field/*/On Surface` | Other group's on-surface |

---

## 9. Golden Rules

```
1. NEVER use Base or Brand tokens directly in UI
2. Each Surface has a corresponding On Surface — SAME group + SAME hierarchy
3. Container/On Container exist ONLY in the Static group
4. Maximum 1 Primary button per visible area
5. Destructive actions ALWAYS use Critical
6. If the Lift component has a Component token, prefer Component over Usage
7. When in doubt between Interactive and Dynamic: "changes page?" → Dynamic
8. Inputable is for data collection — submit button is Dynamic
9. Static is for visual without interaction — never use on clickable elements
10. Dark context (luminance < 0.18) → use Inverse variant
```

---

## 10. Quick Reference

```
TEXT — MAIN                  → Core/On Surface/Text/Primary
TEXT — SECONDARY             → Core/On Surface/Text/Secondary
TEXT — BRAND                 → Core/On Surface/Text/Brand
TEXT — ERROR                 → Core/On Surface/Text/Critical
TEXT — SUCCESS               → Core/On Surface/Text/Success
PAGE BACKGROUND              → Core/Surface/Default
PAGE BG INVERTED             → Core/Surface/Inverse
BUTTON PRIMARY (bg)          → Dynamic/Primary/Surface/Default
BUTTON PRIMARY (text)        → Dynamic/Primary/On Surface/Default
BUTTON SECONDARY (text)      → Dynamic/Secondary/On Surface/Default
BUTTON SECONDARY (border)    → Dynamic/Secondary/On Surface/Border/Default
BUTTON DESTRUCTIVE (bg)      → Dynamic/Critical/Surface/Default
BUTTON GHOST (text)          → Dynamic/Ghost/On Surface/Default
TAB ACTIVE (bg)              → Interactive/Primary/Surface/Default
TAB ACTIVE (text)            → Interactive/Primary/On Surface/Default
ACCORDION (bg)               → Interactive/Neutral/Surface/Default
CARD (bg light)              → Static/Primary/Surface/Highest
CARD (bg dark)               → Static/Primary/Surface/Lowest
ALERT ERROR (bg)             → Static/Critical/Surface/Highest
ALERT SUCCESS (bg)           → Static/Success/Surface/Highest
ALERT WARNING (bg)           → Interactive/Warning/Surface/Pure/Default
TAG (bg)                     → Static/Primary/Container/Default
INPUT (bg)                   → Inputable/Field/Neutral/Surface/Default
INPUT (border)               → Inputable/Field/Neutral/On Surface/Border/Default
INPUT ERROR (border)         → Inputable/Field/Critical/On Surface/Border/Default
CHECKBOX (bg checked)        → Inputable/Selectable/Neutral/Surface/Default
LINK                         → Core/On Surface/Link/Default
LINK HOVER                   → Core/On Surface/Link/Hover
DIVIDER                      → Core/On Surface/Border/Divider
FOCUS RING                   → Core/On Surface/Border/Focus
ELEVATION LEVEL 1            → Elevation/Surface/Level1/Default
ELEVATION LEVEL 2            → Elevation/Surface/Level2/Default
ELEVATION LEVEL 3            → Elevation/Surface/Level3/Default
ELEVATION LEVEL 4            → Elevation/Surface/Level4/Default
```

---

## 11. AI Response Format

When suggesting tokens, return this JSON structure:

```json
{
  "element": "submit button",
  "group": "Dynamic",
  "hierarchy": "Primary",
  "tokens": {
    "background": {
      "token": "Dynamic/Primary/Surface/Default",
      "js": "LfThmDynamicPrimarySurfaceDefault",
      "css": "--lf-thm-dynamic-primary-surface-default",
      "role": "Surface",
      "state": "Default"
    },
    "color": {
      "token": "Dynamic/Primary/On Surface/Default",
      "js": "LfThmDynamicPrimaryOnSurfaceDefault",
      "css": "--lf-thm-dynamic-primary-on-surface-default",
      "role": "On Surface",
      "state": "Default"
    }
  },
  "states": {
    "hover": {
      "background": "Dynamic/Primary/Surface/Hover",
      "color": "Dynamic/Primary/On Surface/Hover"
    },
    "pressed": {
      "background": "Dynamic/Primary/Surface/Pressed"
    }
  },
  "rulesApplied": [
    "R2: group=Dynamic (changes navigation)",
    "R3: hierarchy=Primary (primary action)",
    "R4: role=Surface (background-color)",
    "R8: Surface+On Surface pairing validated",
    "R9: contrast 8.1:1 (AAA)"
  ],
  "warnings": [],
  "contrast": { "ratio": "8.1:1", "level": "AAA" }
}
```

---

## 12. Fallback Strategy

```
1. Find closest semantic token by group + role + hierarchy
2. Check contrast compliance
3. Return with explanation:
   - Why exact match doesn't exist
   - What the closest valid token is
   - Any constraints or warnings
4. NEVER return a Base or Brand token as fallback
5. NEVER return undefined or null — always provide a safe fallback
```

---

## 13. Enriched Data Reference

| File | Content |
|------|---------|
| `docs/tokens-figma-enriched.json` | 1,494 tokens with context, alias chains, roles, CSS properties |
| `docs/tokens-comparison.json` | Figma vs npm token coverage comparison |
| `docs/tokens-all-brands.json` | Token values across all 8 brands × 2 modes |
| `docs/lift-tokens.css` | CSS custom properties for all tokens |

### Enriched Token Schema

```json
{
  "name": "LfThmDynamicPrimarySurfaceDefault",
  "path": "Dynamic / Primary / Surface / Default",
  "segments": ["Dynamic", "Primary", "Surface", "Default"],
  "category": "Dynamic",
  "layer": "usage",
  "value": "#076AEA",
  "isColor": true,
  "context": "Navigation actions. Component background → background-color. Default state.",
  "aliasChain": ["Brand/Color/Primary/500", "saphire/500"],
  "role": "surface",
  "cssProperty": "background-color"
}
```

---

*This document is optimized for AI consumption — v2.*
*For human documentation, see the docs-site at localhost:5173.*
