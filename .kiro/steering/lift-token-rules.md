---
title: Lift Design System - Token Consumption Rules
version: 2.1.1
inclusion: always
scope: token-selection, component-recommendation, validation
priority: always
key-concepts:
  - hierarchy: Component > Usage > Brand > Base
  - consumption: DS-component > Usage-tokens > Component-tokens
  - pairing: Surface + On Surface = same group + same hierarchy
  - forbidden: Base/Brand tokens in runtime UI
---

# Lift Design System — Token Rules (Compact)

## TL;DR (resolve 80% dos casos)

1. Existe LfButton/LfInput/LfCard/LfAccordion/etc? → **Use o componente `@lift/ds-web`**
2. Não existe componente? → Use token Usage: `--lf-thm-{group}-{hierarchy}-{role}-{state}`
3. Pairing: bg = Surface → fg = On Surface (**MESMO grupo + MESMO hierarquia**)
4. Proibido: `LfBs*`, `LfThmBrand*`, `#hex` hardcoded
5. Máximo 1 Primary por área visível
6. Destructive = Critical (sempre)
7. Input/Select/Textarea = Inputable (nunca Dynamic)
8. Container/On Container = **somente grupo Static**

---

## Hierarquia de Consumo (ordem obrigatória)

| Prioridade | Camada | Quando usar |
|-----------|--------|-------------|
| 🥇 | Componente `@lift/ds-web` | Sempre que existir (tokens automáticos) |
| 🥈 | Usage tokens (`--lf-thm-*`) | UI manual sem componente DS |
| 🥉 | Component tokens | Customizar componente DS existente (último recurso) |
| ❌ | Base (`LfBs*`) / Brand (`LfThmBrand*`) | NUNCA em runtime UI |

---

## Group Classification (first match wins)

| Condição | Group | Exemplos |
|----------|-------|----------|
| Coleta dados (input, select, textarea) | **Inputable** | LfInput, LfCheckbox, LfSelect |
| Submete form OU muda navegação | **Dynamic** | LfButton, LfLink |
| Responde a interação local (sem navegar) | **Interactive** | LfAccordion, LfTab, LfDropdown |
| Visual puro, sem interação | **Static** | LfCard, LfBadge, LfAlert |
| Background de página, texto, link, ícone, border | **Core** | body, LfParagraph, LfHeading |
| Sombra/elevação (box-shadow) | **Elevation** | card shadow, modal shadow |

---

## Hierarchy Selection

| Group | Hierarquias disponíveis |
|-------|------------------------|
| Dynamic | Primary, Secondary, Critical, Ghost, Highlight |
| Interactive | Primary, Secondary, Tertiary, Neutral, Highlight, Critical, Warning, Success, Info |
| Static | Primary, Secondary, Neutral, Critical, Success, Warning, Info, AI |
| Inputable | Neutral, Critical, Success |
| Elevation | Level1, Level2, Level3, Level4 |

---

## Role → CSS Property

| CSS property | Token role |
|-------------|-----------|
| `background-color` | Surface (ou Container no Static) |
| `color` (texto) | On Surface (ou On Container no Static) |
| `color` (ícone) | On Surface/Icon |
| `border-color` | On Surface/Border |
| `fill` (SVG) | Icon |
| `box-shadow` | Elevation/Surface/Level* |

---

## Container vs Surface (Static only)

| Elemento | Role | Foreground |
|----------|------|-----------|
| Fundo de página/seção | Surface | On Surface |
| Card/banner/modal (bloco sobre o fundo) | Container | On Container |

⚠️ **Nunca:** On Surface sobre Container. **Nunca:** On Container sobre Surface.

---

## Pairing Rules (obrigatório)

```
bg: {Group}/{Hierarchy}/Surface/{State}
fg: {Group}/{Hierarchy}/On Surface/{State}   ← MESMO group + hierarchy

bg: Static/{Hierarchy}/Container/{State}
fg: Static/{Hierarchy}/On Container/{State}  ← MESMO hierarchy
```

---

## States

| Condição | State |
|----------|-------|
| Sem interação | Default |
| Cursor sobre | Hover |
| Clicado/pressionado | Pressed |
| Selecionado/ativo | Active |
| Processando | Loading |
| Desabilitado | Disabled |

---

## Modifiers

| Contexto | Modifier |
|----------|----------|
| Fundo escuro (luminance < 0.18) | Inverse |
| Fundo claro | (nenhum) |
| Intensidade alta (Static Surface) | Highest / Higher / High |
| Intensidade baixa (Static Surface) | Low / Lower / Lowest |

---

## Quick Reference

| Preciso de... | Token |
|---------------|-------|
| Botão primário (bg) | `Dynamic/Primary/Surface/Default` |
| Botão primário (text) | `Dynamic/Primary/On Surface/Default` |
| Botão destructive (bg) | `Dynamic/Critical/Surface/Default` |
| Botão secundário (text) | `Dynamic/Secondary/On Surface/Default` |
| Accordion/Tab (bg) | `Interactive/Primary/Surface/Default` |
| Dropdown/Menu (bg) | `Interactive/Neutral/Surface/Default` |
| Card (bg) | `Static/Primary/Container/Default` |
| Card (text) | `Static/Primary/On Container/Default` |
| Badge/Tag (bg) | `Static/Primary/Container/Default` |
| Alert erro (bg) | `Static/Critical/Surface/Highest` |
| Input (bg) | `Inputable/Field/Neutral/Surface/Default` |
| Input (border) | `Inputable/Field/Neutral/On Surface/Border/Default` |
| Input erro (border) | `Inputable/Field/Critical/On Surface/Border/Default` |
| Checkbox checked (bg) | `Inputable/Selectable/Neutral/Surface/Default` |
| Texto principal | `Core/On Surface/Text/Primary` |
| Link | `Core/On Surface/Link/Default` |
| Fundo da página | `Core/Surface/Default` |
| Divider | `Core/On Surface/Border/Divider` |
| Focus ring | `Core/On Surface/Border/Focus` |
| Sombra card | `Elevation/Surface/Level1/Default` |
| Sombra modal | `Elevation/Surface/Level3/Default` |

---

## Token Naming Convention

| Formato | Exemplo |
|---------|---------|
| Figma path | `Dynamic/Primary/Surface/Default` |
| JS name | `LfThmDynamicPrimarySurfaceDefault` |
| CSS variable | `--lf-thm-dynamic-primary-surface-default` |

---

## Forbidden (NUNCA fazer)

- ❌ `LfBs*` ou `--lf-bs-*` em UI
- ❌ `LfThmBrand*` ou `--lf-thm-brand-*` em UI
- ❌ `#hex` hardcoded quando existe token semântico
- ❌ Surface de um grupo + On Surface de outro grupo
- ❌ On Surface sobre Container (usar On Container)
- ❌ On Container sobre Surface (usar On Surface)
- ❌ Múltiplos Primary na mesma área visível
- ❌ Dynamic tokens em elementos não-interativos
- ❌ Static tokens em elementos clicáveis
- ❌ Inputable tokens em botões de submit
- ❌ Misturar Normal e Inverse no mesmo componente

---

## WCAG Contrast (mínimos)

| Tipo | Ratio mínimo |
|------|-------------|
| Texto normal (< 18px) | ≥ 4.5:1 |
| Texto grande (≥ 18px bold ou ≥ 24px) | ≥ 3.0:1 |
| UI component/gráfico | ≥ 3.0:1 |

---

## Referências Completas

Para detalhes, algoritmos, e exemplos extensos, consulte:
- `#[[file:docs/tokens-figma-enriched.json]]` — 1,494 tokens com metadata
- `#[[file:docs/tokens-all-brands.json]]` — Valores por brand/mode
- `#[[file:docs/lift-tokens.css]]` — CSS custom properties
- Steering manual: `lift-token-reference.md` — Documento completo v2.1.1
- Steering manual: `lift-token-automation.md` — ESLint, testes, scripts
- Steering manual: `lift-component-registry.md` — Component Mapping
