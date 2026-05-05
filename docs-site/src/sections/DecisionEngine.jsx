import React from 'react';
import LfAlert from '@lift/ds-web/components/LfAlert/';
import LfHeading from '@lift/ds-web/components/LfHeading/';
import LfParagraph from '@lift/ds-web/components/LfParagraph/';

export default function DecisionEngine() {
  return (
    <div>
      <LfHeading as="h1">AI Decision Engine</LfHeading>
      <p className="subtitle">Regras determinísticas para consumo de tokens por IA — v2.</p>

      <LfParagraph>
        Estas regras são projetadas para que uma IA (ou qualquer sistema automatizado) consiga
        selecionar o token correto de forma determinística, sem ambiguidade. Siga as regras em
        ordem — cada regra depende da anterior.
      </LfParagraph>

      <LfAlert variant="info">
        <strong>Regra zero:</strong> Nunca adivinhe. Sempre siga regras determinísticas. Nunca use Base ou Brand tokens diretamente em UI.
      </LfAlert>

      {/* ── Regra 1 ── */}
      <LfHeading as="h2">Regra 1 — Verificar camada do token</LfHeading>
      <pre>{`SE token.camada === "Base" → REJEITAR (nunca usar em UI)
SE token.camada === "Brand" → REJEITAR (apenas referência interna)
SE token.camada === "Component" E existe para o componente → PREFERIR
SE token.camada === "Usage" → USAR (camada principal)

Prefixos:
  Base      → LfBs / --lf-bs-       NUNCA em UI
  Brand     → LfThm + "Brand"       Apenas referência
  Usage     → LfThm (sem "Brand")   SEMPRE em UI
  Component → LfThm + "Component"   Quando disponível`}</pre>

      {/* ── Regra 2 ── */}
      <LfHeading as="h2">Regra 2 — Classificar o grupo (comportamento)</LfHeading>
      <LfParagraph>
        Avalie as condições em ordem. A primeira condição verdadeira define o grupo.
      </LfParagraph>
      <pre>{`PASSO 1: É componente de UI?
  SE NÃO → verificar se é elemento de página global
    SE texto/link/ícone/borda/fundo de página → grupo = "Core"
    SE sombra/elevação (box-shadow)           → grupo = "Elevation"
    SENÃO → ERRO: não é elemento de interface

PASSO 2: É componente de UI — classificar por comportamento
  SE elemento.coletaDados === true
    → grupo = "Inputable"
  SE elemento.alteraNavegacao === true OU elemento.submeteFormulario === true
    → grupo = "Dynamic"
  SE elemento.respondeInteracao === true E elemento.alteraNavegacao === false
    → grupo = "Interactive"
  SE elemento.ehVisualSemInteracao === true
    → grupo = "Static"
  SENÃO → ERRO: rever classificação

REGRA DE DESEMPATE:
  "Muda de página ou submete dados?" → Dynamic
  "Fica na mesma tela?"              → Interactive`}</pre>

      {/* ── Regra 3 ── */}
      <LfHeading as="h2">Regra 3 — Selecionar hierarquia</LfHeading>
      <pre>{`SE grupo === "Dynamic":
  acaoPrincipal (máx 1 por área)  → "Primary"
  acaoAlternativa                 → "Secondary"
  acaoDestrutiva                  → "Critical"
  semFundoVisivel                 → "Ghost"
  destaqueEspecial                → "Highlight"

SE grupo === "Interactive":
  destaquePrincipal               → "Primary"
  destaqueSecundario              → "Secondary"
  terceiroNivel                   → "Tertiary"
  padrao                          → "Neutral"
  destaqueEspecial                → "Highlight"
  feedbackErro                    → "Critical"
  feedbackAviso                   → "Warning"
  feedbackSucesso                 → "Success"
  feedbackInfo                    → "Info"

SE grupo === "Static":
  conteudoGenerico                → "Primary"
  conteudoSecundario              → "Secondary"
  estruturaNeutra                 → "Neutral"
  alertaErro                      → "Critical"
  alertaSucesso                   → "Success"
  alertaAviso                     → "Warning"
  informativo                     → "Info"
  conteudoIA                      → "AI"

SE grupo === "Inputable":
  campoNormal                     → "Neutral"
  campoComErro                    → "Critical"
  campoValidado                   → "Success"

SE grupo === "Elevation":
  elevacaoSutil (card, dropdown)  → "Level1"
  elevacaoMedia (popover, tooltip)→ "Level2"
  elevacaoAlta (modal, dialog)    → "Level3"
  elevacaoMaxima (overlay critico)→ "Level4"`}</pre>

      {/* ── Regra 4 ── */}
      <LfHeading as="h2">Regra 4 — Selecionar papel (role) pela propriedade CSS</LfHeading>
      <pre>{`propriedadeCSS → papel (role)
─────────────────────────────────────────────────
background-color  → "Surface"
background-color  → "Container" (apenas Static, camada acima do Surface)
color (texto)     → "On Surface" ou "On Surface/Text"
color (ícone)     → "On Surface/Icon" ou "Icon"
border-color      → "On Surface/Border" ou "Border"
fill (SVG)        → "Icon"
box-shadow        → "Elevation" (grupo Elevation)

REGRA CONTAINER (apenas grupo Static):
  SE é fundo de um GRUPO de elementos (card, bloco) → "Container"
  SE é conteúdo SOBRE esse grupo                    → "On Container"
  SE é fundo de seção/página                        → "Surface"
  SE é conteúdo sobre seção/página                  → "On Surface"`}</pre>

      {/* ── Regra 5 ── */}
      <LfHeading as="h2">Regra 5 — Selecionar estado</LfHeading>
      <pre>{`semInteracao       → "Default"
cursorSobre        → "Hover"
pressionado        → "Pressed"
ativoSelecionado   → "Active"
processando        → "Loading"
desabilitado       → "Disabled"`}</pre>

      {/* ── Regra 6 ── */}
      <LfHeading as="h2">Regra 6 — Selecionar modificador (quando aplicável)</LfHeading>
      <pre>{`SE contextoEscuro (luminance < 0.18) → modificador = "Inverse"
SE contextoClaro (luminance > 0.5)  → modificador = nenhum (Normal)

NUNCA misturar Normal e Inverse no mesmo componente

SE grupo === "Static" E papel === "Surface":
  intensidadeAlta   → "Highest" / "Higher" / "High"
  intensidadeBaixa  → "Low" / "Lower" / "Lowest"

SE grupo === "Interactive" E tem intensidade:
  → "Low" / "Pure" / "High"`}</pre>

      {/* ── Regra 7 ── */}
      <LfHeading as="h2">Regra 7 — Montar o token</LfHeading>
      <pre>{`token = [Grupo] / [Hierarquia] / [Papel] / [Modificador?] / [Estado]

Exemplos:
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

Conversão para código:
  Figma: Dynamic/Primary/Surface/Default
  JS:    LfThmDynamicPrimarySurfaceDefault
  CSS:   --lf-thm-dynamic-primary-surface-default`}</pre>

      {/* ── Regra 8 ── */}
      <LfHeading as="h2">Regra 8 — Validar pareamento Surface ↔ On Surface</LfHeading>
      <pre>{`PARA CADA Surface aplicado:
  OBRIGATÓRIO ter On Surface do MESMO grupo + MESMA hierarquia + MESMO estado
  SE on-surface.grupo !== surface.grupo           → ERRO
  SE on-surface.hierarquia !== surface.hierarquia → ERRO

PARA CADA Container aplicado (apenas Static):
  OBRIGATÓRIO ter On Container do MESMO grupo + MESMA hierarquia
  SE usa on-surface sobre container               → ERRO
  SE usa on-container sobre surface               → ERRO

Exemplos válidos:
  bg: Dynamic/Primary/Surface/Default
  fg: Dynamic/Primary/On Surface/Default          [OK]

  bg: Static/Primary/Container/Default
  fg: Static/Primary/On Container/Default         ✅

Exemplos inválidos:
  bg: Static/Primary/Surface/Highest
  fg: Dynamic/Primary/On Surface/Default          [X] (grupos diferentes)

  bg: Static/Primary/Container/Default
  fg: Static/Primary/On Surface/Default           [X] (On Surface sobre Container)`}</pre>

      {/* ── Regra 9 ── */}
      <LfHeading as="h2">Regra 9 — Validar contraste WCAG</LfHeading>
      <pre>{`SE texto normal (< 18px ou < 14px bold):
  ratio(surface, on-surface) >= 4.5  (WCAG AA)

SE texto grande (>= 18px bold ou >= 24px):
  ratio(surface, on-surface) >= 3.0  (WCAG AA Large)

SE componente UI ou gráfico:
  ratio(surface, on-surface) >= 3.0`}</pre>

      {/* ── Regra 10 ── */}
      <LfHeading as="h2">Regra 10 — Checklist final</LfHeading>
      <pre>{`Antes de aplicar qualquer token, verificar:
  [ ] Token é da camada Usage ou Component (não Base, não Brand)
  [ ] Papel (role) corresponde à propriedade CSS
  [ ] Grupo corresponde ao comportamento do elemento
  [ ] Par surface/on-surface é do mesmo grupo e hierarquia
  [ ] Contraste atende WCAG AA mínimo
  [ ] Máximo 1 Primary por área de ação visível
  [ ] Variante (normal/inverse) corresponde ao contexto de luminosidade
  [ ] Estado do token corresponde ao estado do elemento
  [ ] Não está na lista de combinações proibidas`}</pre>

      {/* ── Formato de resposta ── */}
      <LfHeading as="h2">Formato de resposta JSON para IA</LfHeading>
      <LfParagraph>
        Quando uma IA responde com sugestão de token, deve usar este formato:
      </LfParagraph>

      <pre>{`{
  "elemento": "Botão de confirmar",
  "grupo": "Dynamic",
  "hierarquia": "Primary",
  "tokens": {
    "background": {
      "token": "Dynamic/Primary/Surface/Default",
      "js": "LfThmDynamicPrimarySurfaceDefault",
      "css": "--lf-thm-dynamic-primary-surface-default",
      "papel": "Surface",
      "estado": "Default"
    },
    "color": {
      "token": "Dynamic/Primary/On Surface/Default",
      "js": "LfThmDynamicPrimaryOnSurfaceDefault",
      "css": "--lf-thm-dynamic-primary-on-surface-default",
      "papel": "On Surface",
      "estado": "Default"
    }
  },
  "estados": {
    "hover": {
      "background": "Dynamic/Primary/Surface/Hover",
      "color": "Dynamic/Primary/On Surface/Hover"
    },
    "pressed": {
      "background": "Dynamic/Primary/Surface/Pressed"
    }
  },
  "regrasAplicadas": [
    "R2: grupo=Dynamic (altera navegação)",
    "R3: hierarquia=Primary (ação principal)",
    "R4: papel=Surface (background-color)",
    "R8: pareamento Surface+On Surface validado",
    "R9: contraste 8.1:1 (AAA)"
  ],
  "avisos": [],
  "contraste": { "ratio": "8.1:1", "nivel": "AAA" }
}`}</pre>
    </div>
  );
}
