figma.showUI(__html__, { width: 960, height: 720, title: "Token Docs" });

// ╔═══ ÍNDICE DE SEÇÕES ═══╗
// ║ 1.  Estado Global e Constantes                    ~L 24
// ║ 2.  GROUP_META, GUIDELINES, DECISION_TREE, ROLE   ~L 44
// ║ 3.  Detecção Semântica                            ~L 555
// ║ 4.  Cálculos WCAG                                ~L 681
// ║ 5.  Mapa de Variáveis e Resolução de Aliases      ~L 751
// ║ 6.  Exportação de Tokens para UI                  ~L 849
// ║ 7.  Canvas: Construção de Boards                  ~L 953
// ║ 8.  Board Registry Manager                        ~L 2049
// ║ 9.  Polling e Auto-Update                         ~L 2699
// ║ 10. Exportação Markdown                           ~L 2801
// ║ 11. Token Engine / Registry                       ~L 2896
// ║ 12. Audit Engine                                  ~L 3514
// ║ 13. Storybook Validator                           ~L 3616
// ║ 14. Divergence Checker                            ~L 3747
// ║ 15. Token Watch                                   ~L 3939
// ║ 16. Handlers de Mensagem                          ~L 4116
// ╚═══════════════════════════════════════════════════╝

// ═══════════════════════════════════════════════════════════════════════════
// SEÇÃO 1: ESTADO GLOBAL E CONSTANTES
// Variáveis globais do plugin e cache persistido.
// ═══════════════════════════════════════════════════════════════════════════
var varById = {};
var externalVarCache = {};
var boardRegistry = {};
var varSnapshotMap = {};
var pollTimer = null;
var isAutoUpdating = false;
var enrichedTokenData = null;
var npmTokenCache = null;

// ── Load persisted npm cache on startup ──
figma.clientStorage.getAsync("npmTokenCache").then(function(cached) {
  if (cached) {
    npmTokenCache = cached;
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// SEÇÃO 2: GROUP_META, GROUP_GUIDELINES, DECISION_TREE, ROLE_MAPPING
// Metadados semânticos dos grupos de tokens, diretrizes de uso,
// árvore de decisão e mapeamento de roles. Gerados a partir de token-schema.json.
// ═══════════════════════════════════════════════════════════════════════════

// ── GROUP_META (generated from token-schema.json) ──
var GROUP_META = {
  dynamic: {
    label: "Dynamic",
    color: {
      r: 0.06,
      g: 0.4,
      b: 0.98
    },
    description: "Elementos que disparam ações e mudam o fluxo de navegação.",
    examples: "Botão Salvar, Botão Excluir, Link de navegação principal, CTA de página",
    whenUse: [
      "Botão que submete formulário ou navega para outra rota",
      "CTA principal de uma página",
      "Ação destrutiva que requer confirmação"
    ],
    whenNotUse: [
      "Accordion ou tab — use Interactive",
      "Card ou banner sem clique — use Static",
      "Campo de formulário — use Inputable"
    ],
    structure: [
      "surface",
      "on-surface",
      "border"
    ],
    states: [
      "default",
      "hover",
      "active",
      "focus",
      "disabled"
    ],
    roles: {
      surface: {
        cssProperty: "background-color",
        description: "Fundo do componente de ação",
        figmaProperty: "fills"
      },
      "on-surface": {
        cssProperty: "color",
        description: "Texto e ícones sobre o fundo do componente",
        figmaProperty: "fills (texto/ícone)"
      },
      border: {
        cssProperty: "border-color",
        description: "Contorno do componente",
        figmaProperty: "strokes"
      }
    },
    componentExamples: [
      {
        component: "Button Primary",
        tokens: {
          surface: "Dynamic/Primary/Surface/Default",
          "on-surface": "Dynamic/Primary/On Surface/Default",
          border: "Dynamic/Primary/On Surface/Border/Default"
        },
        states: {
          hover: {
            surface: "Dynamic/Primary/Surface/Hover",
            "on-surface": "Dynamic/Primary/On Surface/Hover"
          }
        }
      },
      {
        component: "Button Secondary",
        tokens: {
          surface: "Dynamic/Secondary/Surface/Default",
          "on-surface": "Dynamic/Secondary/On Surface/Default",
          border: "Dynamic/Secondary/On Surface/Border/Default"
        }
      },
      {
        component: "Button Critical",
        tokens: {
          surface: "Dynamic/Critical/Surface/Default",
          "on-surface": "Dynamic/Critical/On Surface/Default"
        }
      }
    ]
  },
  interactive: {
    label: "Interactive",
    color: {
      r: 0.42,
      g: 0.27,
      b: 0.9
    },
    description: "Elementos que respondem ao usuário sem mudar a rota. Cobrem expansão, colapso e revelação de conteúdo.",
    examples: "Accordion, Tabs, Tooltip, Dropdown",
    whenUse: [
      "Accordion que expande seções",
      "Tabs que alternam painéis",
      "Dropdown que revela opções localmente"
    ],
    whenNotUse: [
      "Botão de ação principal — use Dynamic",
      "Campo de entrada — use Inputable"
    ],
    structure: [
      "surface",
      "on-surface",
      "border"
    ],
    states: [
      "default",
      "hover",
      "active",
      "selected"
    ],
    roles: {
      surface: {
        cssProperty: "background-color",
        description: "Fundo do componente interativo",
        figmaProperty: "fills"
      },
      "on-surface": {
        cssProperty: "color",
        description: "Conteúdo sobre o fundo",
        figmaProperty: "fills (texto/ícone)"
      },
      border: {
        cssProperty: "border-color",
        description: "Contorno",
        figmaProperty: "strokes"
      }
    },
    componentExamples: [
      {
        component: "Accordion",
        tokens: {
          surface: "Interactive/Primary/Surface/Default",
          "on-surface": "Interactive/Primary/On Surface/Default"
        }
      },
      {
        component: "Tabs",
        tokens: {
          surface: "Interactive/Primary/Surface/Default",
          "on-surface": "Interactive/Primary/On Surface/Default"
        }
      }
    ]
  },
  static: {
    label: "Static",
    color: {
      r: 0.05,
      g: 0.6,
      b: 0.45
    },
    description: "Elementos de composição visual sem interação. Estruturam o layout sem oferecer ação.",
    examples: "Card de conteúdo, Banner informativo, Divisor de seção",
    whenUse: [
      "Card sem ação clicável",
      "Banner editorial",
      "Divisor visual entre seções"
    ],
    whenNotUse: [
      "Elemento clicável — use Dynamic ou Interactive",
      "Campo de formulário — use Inputable"
    ],
    structure: [
      "surface",
      "on-surface",
      "container",
      "on-container"
    ],
    states: [],
    roles: {
      surface: {
        cssProperty: "background-color",
        description: "Fundo do container visual",
        figmaProperty: "fills"
      },
      "on-surface": {
        cssProperty: "color",
        description: "Conteúdo sobre o surface",
        figmaProperty: "fills (texto/ícone)"
      },
      container: {
        cssProperty: "background-color",
        description: "Camada acima do surface para hierarquia",
        figmaProperty: "fills"
      },
      "on-container": {
        cssProperty: "color",
        description: "Conteúdo sobre o container",
        figmaProperty: "fills (texto/ícone)"
      }
    },
    componentExamples: [
      {
        component: "Card",
        tokens: {
          surface: "Static/Primary/Surface/Lowest",
          container: "Static/Primary/Container/Default",
          "on-container": "Static/Primary/On Container/Default"
        }
      },
      {
        component: "Alert Success",
        tokens: {
          surface: "Static/Success/Surface/Highest",
          "on-surface": "Static/Success/On Surface/High/Default"
        }
      }
    ]
  },
  inputable: {
    label: "Inputable",
    color: {
      r: 0.85,
      g: 0.45,
      b: 0.05
    },
    description: "Elementos de coleta de dados. Cobrem todos os controles de formulário.",
    examples: "Input de texto, Checkbox, Select, Switch",
    whenUse: [
      "Campo de texto, senha ou busca",
      "Checkbox, radio button ou switch",
      "Select, combobox ou date picker"
    ],
    whenNotUse: [
      "Botão de submit — use Dynamic",
      "Elemento de navegação — use Dynamic ou Interactive"
    ],
    structure: [
      "surface",
      "on-surface",
      "border"
    ],
    states: [
      "default",
      "focus",
      "error",
      "disabled"
    ],
    roles: {
      surface: {
        cssProperty: "background-color",
        description: "Fundo do campo",
        figmaProperty: "fills"
      },
      "on-surface": {
        cssProperty: "color",
        description: "Texto digitado e placeholder",
        figmaProperty: "fills (texto)"
      },
      border: {
        cssProperty: "border-color",
        description: "Contorno do campo",
        figmaProperty: "strokes"
      }
    },
    componentExamples: [
      {
        component: "Input Text",
        tokens: {
          surface: "Inputable/Field/Neutral/Surface/Default",
          "on-surface": "Inputable/Field/Neutral/On Surface/Default",
          border: "Inputable/Field/Neutral/On Surface/Border/Default"
        },
        states: {
          focus: {
            border: "Inputable/Field/Neutral/On Surface/Border/Focus"
          },
          error: {
            border: "Inputable/Field/Critical/On Surface/Border/Default"
          }
        }
      }
    ]
  },
  core: {
    label: "Core",
    color: {
      r: 0.3,
      g: 0.3,
      b: 0.3
    },
    description: "Tokens fundamentais do sistema — texto, ícones, bordas, links, fundo de página. Fazem parte da camada Usage mas não devem ser usados diretamente em componentes de UI.",
    examples: "Texto principal, Divisor, Link, Fundo da página",
    whenUse: [
      "Como referência (alias) em tokens de usage",
      "Para textos, ícones, bordas e links em contextos genéricos"
    ],
    whenNotUse: [
      "Diretamente em componentes de UI — prefira tokens semânticos (Dynamic, Interactive, Static, Inputable)"
    ],
    structure: [
      "surface",
      "on-surface",
      "border"
    ],
    states: [],
    roles: {
      surface: {
        cssProperty: "background-color",
        description: "Fundo de página ou área genérica",
        figmaProperty: "fills"
      },
      "on-surface": {
        cssProperty: "color",
        description: "Texto e ícones genéricos",
        figmaProperty: "fills (texto/ícone)"
      },
      border: {
        cssProperty: "border-color",
        description: "Divisores e bordas genéricas",
        figmaProperty: "strokes"
      }
    },
    componentExamples: []
  },
  elevation: {
    label: "Elevation",
    color: {
      r: 0.32,
      g: 0.32,
      b: 0.32
    },
    description: "Sombras e superfícies de elevação para criar hierarquia visual entre camadas sobrepostas.",
    examples: "Modal, Drawer, Card elevado, Popover, Dropdown",
    whenUse: [
      "Modais, drawers e dialogs",
      "Popovers, tooltips e menus flutuantes",
      "Cards elevados sobre o fundo"
    ],
    whenNotUse: [
      "Elementos planos sem necessidade de destaque",
      "Fundos de página principal"
    ],
    structure: [
      "surface",
      "shadow",
      "on-surface"
    ],
    states: [
      "default",
      "hover",
      "pressed"
    ],
    roles: {
      surface: {
        cssProperty: "background-color",
        description: "Fundo da camada elevada",
        figmaProperty: "fills"
      },
      shadow: {
        cssProperty: "box-shadow",
        description: "Sombra de elevação",
        figmaProperty: "effects"
      },
      "on-surface": {
        cssProperty: "color",
        description: "Conteúdo sobre a camada elevada",
        figmaProperty: "fills (texto/ícone)"
      }
    },
    componentExamples: [
      {
        component: "Modal",
        tokens: {
          surface: "Elevation/Surface/Default",
          shadow: "Elevation/Shadow/Level 3"
        }
      }
    ]
  }
};

// ── GROUP_GUIDELINES (generated from token-schema.json) ──
var GROUP_GUIDELINES = {
  dynamic: {
    do: [
      "Use em botão que submete formulário ou navega para outra rota",
      "Use em cta principal de uma página",
      "Use em ação destrutiva que requer confirmação"
    ],
    dont: [
      "Accordion ou tab — use Interactive",
      "Card ou banner sem clique — use Static",
      "Campo de formulário — use Inputable"
    ]
  },
  interactive: {
    do: [
      "Use em accordion que expande seções",
      "Use em tabs que alternam painéis",
      "Use em dropdown que revela opções localmente"
    ],
    dont: [
      "Botão de ação principal — use Dynamic",
      "Campo de entrada — use Inputable"
    ]
  },
  static: {
    do: [
      "Use em card sem ação clicável",
      "Use em banner editorial",
      "Use em divisor visual entre seções"
    ],
    dont: [
      "Elemento clicável — use Dynamic ou Interactive",
      "Campo de formulário — use Inputable"
    ]
  },
  inputable: {
    do: [
      "Use em campo de texto, senha ou busca",
      "Use em checkbox, radio button ou switch",
      "Use em select, combobox ou date picker"
    ],
    dont: [
      "Botão de submit — use Dynamic",
      "Elemento de navegação — use Dynamic ou Interactive"
    ]
  },
  core: {
    do: [
      "Use em como referência (alias) em tokens de usage",
      "Use em para textos, ícones, bordas e links em contextos genéricos"
    ],
    dont: [
      "Diretamente em componentes de UI — prefira tokens semânticos (Dynamic, Interactive, Static, Inputable)"
    ]
  },
  elevation: {
    do: [
      "Use em modais, drawers e dialogs",
      "Use em popovers, tooltips e menus flutuantes",
      "Use em cards elevados sobre o fundo"
    ],
    dont: [
      "Elementos planos sem necessidade de destaque",
      "Fundos de página principal"
    ]
  }
};

// ── DECISION_TREE (generated from token-schema.json) ──
var DECISION_TREE = {
  question: "O elemento dispara navegação ou ação?",
  yes: {
    result: "dynamic"
  },
  no: {
    question: "O elemento responde a interação local (expand/collapse)?",
    yes: {
      result: "interactive"
    },
    no: {
      question: "O elemento coleta dados do usuário?",
      yes: {
        result: "inputable"
      },
      no: {
        question: "O elemento é uma camada elevada (modal, popover)?",
        yes: {
          result: "elevation"
        },
        no: {
          result: "static"
        }
      }
    }
  }
};

// ── ROLE_MAPPING (generated from token-schema.json) ──
var ROLE_MAPPING = {
  surface: {
    css: "background-color",
    figma: "fills",
    description: "Fundo do componente"
  },
  "on-surface": {
    css: "color",
    figma: "fills (texto/ícone)",
    description: "Conteúdo sobre o fundo"
  },
  container: {
    css: "background-color",
    figma: "fills",
    description: "Camada acima do surface"
  },
  "on-container": {
    css: "color",
    figma: "fills (texto/ícone)",
    description: "Conteúdo sobre o container"
  },
  border: {
    css: "border-color",
    figma: "strokes",
    description: "Contorno do componente"
  },
  shadow: {
    css: "box-shadow",
    figma: "effects",
    description: "Sombra de elevação"
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// SEÇÃO 3: DETECÇÃO SEMÂNTICA
// Funções que analisam partes do nome de um token para detectar grupo,
// hierarquia, role, estado e feedback semântico.
// ═══════════════════════════════════════════════════════════════════════════

/**
 * detectGroup(parts)
 *
 * Detecta o grupo semântico (dynamic, interactive, static, inputable,
 * core, elevation) a partir das partes do nome de um token.
 *
 * @param {Array<string>} parts - Partes do nome do token em lowercase.
 * @returns {string|null} Nome do grupo encontrado, ou null se nenhum.
 */
function detectGroup(parts) {
  var groups = ["dynamic","interactive","static","inputable","core","elevation"];
  for (var i = 0; i < groups.length; i++) { if (parts.indexOf(groups[i]) !== -1) return groups[i]; }
  return null;
}
/**
 * detectHierarchy(parts)
 *
 * Detecta o nível de hierarquia (primary, secondary, tertiary, neutral,
 * brand) a partir das partes do nome de um token.
 *
 * @param {Array<string>} parts - Partes do nome do token em lowercase.
 * @returns {string|null} Nível de hierarquia encontrado, ou null se nenhum.
 */
function detectHierarchy(parts) {
  if (parts.indexOf("primary") !== -1) return "primary";
  if (parts.indexOf("secondary") !== -1) return "secondary";
  if (parts.indexOf("tertiary") !== -1) return "tertiary";
  if (parts.indexOf("neutral") !== -1) return "neutral";
  if (parts.indexOf("brand") !== -1) return "brand";
  return null;
}
/**
 * detectRole(parts)
 *
 * Detecta a role (surface, on-surface, on-container, container, border,
 * icon, text) a partir das partes do nome de um token.
 *
 * @param {Array<string>} parts - Partes do nome do token em lowercase.
 * @returns {string|null} Role encontrada, ou null se nenhuma.
 */
function detectRole(parts) {
  var joined = parts.join("-");
  if (joined.indexOf("on-surface") !== -1) return "on-surface";
  if (joined.indexOf("on-container") !== -1) return "on-container";
  if (parts.indexOf("surface") !== -1) return "surface";
  if (parts.indexOf("container") !== -1) return "container";
  if (parts.indexOf("border") !== -1 || parts.indexOf("stroke") !== -1) return "border";
  if (parts.indexOf("icon") !== -1) return "icon";
  if (parts.indexOf("text") !== -1) return "text";
  return null;
}
/**
 * detectState(parts)
 *
 * Detecta o estado (hover, active, focus, disabled, pressed, selected,
 * error) a partir das partes do nome de um token.
 *
 * @param {Array<string>} parts - Partes do nome do token em lowercase.
 * @returns {string} Estado encontrado, ou "default" se nenhum.
 */
function detectState(parts) {
  var states = ["hover","active","focus","disabled","pressed","selected","error"];
  for (var i = 0; i < states.length; i++) { if (parts.indexOf(states[i]) !== -1) return states[i]; }
  return "default";
}
/**
 * detectFeedback(parts)
 *
 * Detecta o tipo de feedback (success, warning, critical, info) a partir
 * das partes do nome de um token.
 *
 * @param {Array<string>} parts - Partes do nome do token em lowercase.
 * @returns {string|null} Tipo de feedback encontrado, ou null se nenhum.
 */
function detectFeedback(parts) {
  if (parts.indexOf("success") !== -1) return "success";
  if (parts.indexOf("warning") !== -1) return "warning";
  if (parts.indexOf("critical") !== -1 || parts.indexOf("error") !== -1 || parts.indexOf("danger") !== -1) return "critical";
  if (parts.indexOf("info") !== -1) return "info";
  return null;
}

/**
 * getTokenDescription(tokenName)
 *
 * Gera uma descrição legível em português para um token com base no seu nome,
 * combinando role, hierarquia, estado e feedback detectados.
 *
 * @param {string} tokenName - Nome completo do token (ex: "Dynamic/Primary/Surface/Hover").
 * @returns {string} Descrição textual do token.
 */
function getTokenDescription(tokenName) {
  var parts = tokenName.toLowerCase().split(/[\/\.\-_\s]+/);
  var role = detectRole(parts);
  var hierarchy = detectHierarchy(parts);
  var state = detectState(parts);
  var feedback = detectFeedback(parts);
  var roleMap = {
    "surface": ["Fundo do componente","Background aplicado ao componente"],
    "on-surface": ["Cor do conteúdo sobre o surface","Aplicado em texto e ícones sobre o fundo"],
    "container": ["Fundo de agrupamento acima do surface"],
    "on-container": ["Conteúdo sobre o container"],
    "border": ["Contorno do componente"],
    "icon": ["Cor de ícones internos"],
    "text": ["Cor de texto interno"]
  };
  var hierarchyMap = { "primary":"de maior hierarquia","secondary":"de hierarquia secundária","tertiary":"de menor hierarquia","neutral":"neutro","brand":"de identidade de marca" };
  var stateMap = { "hover":"no hover","active":"no estado ativo","focus":"em foco","disabled":"desabilitado","error":"em erro" };
  var feedbackMap = { "success":"Sinaliza conclusão ou estado válido.","warning":"Indica atenção ou risco.","critical":"Marca erro ou ação destrutiva.","info":"Informação complementar." };
  var base = "Token de estilo";
  if (role && roleMap[role]) {
    var opts = roleMap[role];
    base = opts[parts.join("").length % opts.length];
  }
  if (hierarchy && hierarchyMap[hierarchy]) base += " " + hierarchyMap[hierarchy];
  if (state && state !== "default" && stateMap[state]) base += " " + stateMap[state];
  if (feedback && feedbackMap[feedback]) base += ". " + feedbackMap[feedback];
  return base + ".";
}

// ═══════════════════════════════════════════════════════════════════════════
// SEÇÃO 4: CÁLCULOS WCAG
// Funções de conversão de cor e cálculo de contraste conforme WCAG 2.0.
// ═══════════════════════════════════════════════════════════════════════════

/**
 * toLinear(c)
 *
 * Converte um valor de canal sRGB (0-1) para RGB linear,
 * aplicando a curva de transferência inversa do sRGB.
 *
 * @param {number} c - Valor do canal sRGB entre 0 e 1.
 * @returns {number} Valor linear correspondente.
 */
function toLinear(c) { return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }

/**
 * relativeLuminance(r, g, b)
 *
 * Calcula a luminância relativa de uma cor conforme WCAG 2.0.
 *
 * @param {number} r - Canal vermelho sRGB (0-1).
 * @param {number} g - Canal verde sRGB (0-1).
 * @param {number} b - Canal azul sRGB (0-1).
 * @returns {number} Luminância relativa entre 0 e 1.
 */
function relativeLuminance(r, g, b) { return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b); }

/**
 * contrastRatio(l1, l2)
 *
 * Calcula a razão de contraste entre duas luminâncias conforme WCAG 2.0.
 *
 * @param {number} l1 - Luminância relativa da primeira cor.
 * @param {number} l2 - Luminância relativa da segunda cor.
 * @returns {number} Razão de contraste (>= 1).
 */
function contrastRatio(l1, l2) { return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05); }

/**
 * wcagLevel(ratio)
 *
 * Retorna o nível de conformidade WCAG com base na razão de contraste.
 *
 * @param {number} ratio - Razão de contraste.
 * @returns {string} "AAA", "AA", "AA Large" ou "Fail".
 */
function wcagLevel(ratio) {
  if (ratio >= 7) return "AAA";
  if (ratio >= 4.5) return "AA";
  if (ratio >= 3) return "AA Large";
  return "Fail";
}
/**
 * getContrastInfo(r, g, b)
 *
 * Calcula informações de contraste de uma cor contra branco e preto,
 * retornando razões e níveis WCAG.
 *
 * @param {number} r - Canal vermelho sRGB (0-1).
 * @param {number} g - Canal verde sRGB (0-1).
 * @param {number} b - Canal azul sRGB (0-1).
 * @returns {Object} { onWhite: string, onBlack: string, levelOnWhite: string, levelOnBlack: string }
 */
function getContrastInfo(r, g, b) {
  var lum = relativeLuminance(r, g, b);
  var rw = contrastRatio(lum, 1), rb = contrastRatio(lum, 0);
  return { onWhite: rw.toFixed(2), onBlack: rb.toFixed(2), levelOnWhite: wcagLevel(rw), levelOnBlack: wcagLevel(rb) };
}

// ═══════════════════════════════════════════════════════════════════════════
// SEÇÃO 5: MAPA DE VARIÁVEIS E RESOLUÇÃO DE ALIASES
// Construção do mapa global de variáveis do Figma e resolução de cadeias
// de alias para obter valores finais.
// ═══════════════════════════════════════════════════════════════════════════

/**
 * buildVarMap()
 *
 * Constrói o mapa global de variáveis (varById) a partir de todas as
 * variáveis locais do Figma. Indexa por ID completo, ID sem prefixo
 * "VariableID:" e sufixo após a barra.
 *
 * @returns {Promise<void>}
 * @sideeffect Modifica as globais varById e externalVarCache.
 */
async function buildVarMap() {
  varById = {};
  externalVarCache = {};
  var all = await figma.variables.getLocalVariablesAsync();
  for (var i = 0; i < all.length; i++) {
    var v = all[i];
    varById[v.id] = v;
    var stripped = v.id.replace(/^VariableID:/, "");
    varById[stripped] = v;
    var si = stripped.indexOf("/");
    if (si !== -1) varById[stripped.slice(si + 1)] = v;
  }
}

/**
 * getVarById(id)
 *
 * Busca uma variável pelo ID, tentando múltiplas variações do ID
 * (completo, sem prefixo, sufixo). Usa cache local e fallback para
 * a API assíncrona do Figma.
 *
 * @param {string} id - ID da variável (ex: "VariableID:55:152").
 * @returns {Promise<Object|null>} Objeto da variável Figma, ou null.
 * @sideeffect Pode adicionar entradas ao externalVarCache.
 */
async function getVarById(id) {
  var stripped = id.replace(/^VariableID:/, "");
  var si = stripped.indexOf("/");
  var suffix = si !== -1 ? stripped.slice(si + 1) : stripped;
  if (varById[id]) return varById[id];
  if (varById[stripped]) return varById[stripped];
  if (varById[suffix]) return varById[suffix];
  if (externalVarCache[id] !== undefined) return externalVarCache[id];
  try {
    var v = await figma.variables.getVariableByIdAsync(id);
    externalVarCache[id] = v || null;
    if (v) { externalVarCache[v.id] = v; externalVarCache[v.id.replace(/^VariableID:/, "")] = v; }
    return v || null;
  } catch(e) { externalVarCache[id] = null; return null; }
}

/**
 * resolveChain(value, type, modeId, depth)
 *
 * Resolve cadeias de alias de variáveis recursivamente até encontrar
 * o valor final. Para cores, retorna hex/alpha/rgb. Limita a profundidade
 * a 15 níveis para evitar loops infinitos.
 *
 * @param {*} value - Valor da variável (pode ser alias, cor ou primitivo).
 * @param {string} type - Tipo resolvido da variável (ex: "COLOR", "FLOAT").
 * @param {string} modeId - ID do modo ativo para resolução.
 * @param {number} [depth=0] - Profundidade atual da recursão.
 * @returns {Promise<Object>} { resolved: valor_final, chain: Array<string> }
 */
async function resolveChain(value, type, modeId, depth) {
  if (!depth) depth = 0;
  if (depth > 15 || value === null || value === undefined) return { resolved: null, chain: [] };
  if (typeof value === "object" && value.type === "VARIABLE_ALIAS") {
    var rawId = String(value.id || "");
    var target = await getVarById(rawId);
    if (!target) {
      var s = rawId.replace(/^VariableID:/, "");
      var si2 = s.indexOf("/");
      return { resolved: null, chain: [si2 !== -1 ? s.slice(si2 + 1) : s] };
    }
    var parts = target.name.split("/");
    var label = parts.slice(-2).join("/").toLowerCase().replace(/\s+/g, "-");
    var modeIds = Object.keys(target.valuesByMode);
    var useModeId = modeIds.indexOf(modeId) !== -1 ? modeId : modeIds[0];
    if (!useModeId) return { resolved: null, chain: [label] };
    var deeper = await resolveChain(target.valuesByMode[useModeId], target.resolvedType, useModeId, depth + 1);
    return { resolved: deeper.resolved, chain: [label].concat(deeper.chain) };
  }
  if (type === "COLOR" && typeof value === "object" && "r" in value) {
    var r = Math.round(value.r * 255), g = Math.round(value.g * 255), b = Math.round(value.b * 255);
    var a = value.a !== undefined ? parseFloat(value.a.toFixed(2)) : 1;
    var hex = "#" + r.toString(16).padStart(2,"0") + g.toString(16).padStart(2,"0") + b.toString(16).padStart(2,"0");
    return { resolved: { hex: hex, alpha: a, r: value.r, g: value.g, b: value.b }, chain: [] };
  }
  return { resolved: value, chain: [] };
}

// ═══════════════════════════════════════════════════════════════════════════
// SEÇÃO 6: EXPORTAÇÃO DE TOKENS PARA UI
// Exporta todas as collections de tokens com valores resolvidos para a UI,
// e funções auxiliares de agrupamento e formatação.
// ═══════════════════════════════════════════════════════════════════════════

/**
 * exportTokens()
 *
 * Exporta todas as collections de variáveis locais do Figma com valores
 * resolvidos (incluindo cadeias de alias) e envia para a UI via postMessage.
 *
 * @returns {Promise<void>}
 * @sideeffect Envia mensagem { type: "result", data } ou { type: "error" } para a UI.
 */
async function exportTokens() {
  try {
    await buildVarMap();
    var collections = await figma.variables.getLocalVariableCollectionsAsync();
    var result = [];
    for (var ci = 0; ci < collections.length; ci++) {
      var collection = collections[ci];
      var modes = collection.modes.map(function(m) { return { id: m.modeId, name: m.name }; });
      var collData = { id: collection.id, name: collection.name, modes: modes, tokens: [] };
      for (var vi = 0; vi < collection.variableIds.length; vi++) {
        var variable = await figma.variables.getVariableByIdAsync(collection.variableIds[vi]);
        if (!variable) continue;
        var token = { name: variable.name, type: variable.resolvedType, variableId: variable.id, values: {} };
        for (var mj = 0; mj < collection.modes.length; mj++) {
          var mode = collection.modes[mj];
          var r2 = await resolveChain(variable.valuesByMode[mode.modeId], variable.resolvedType, mode.modeId, 0);
          var val = r2.resolved;
          if (val && val.hex) token.values[mode.name] = { hex: val.hex, alpha: val.alpha, r: val.r, g: val.g, b: val.b, chain: r2.chain };
          else if (r2.chain.length > 0) token.values[mode.name] = { alias: r2.chain.join(" -> "), chain: r2.chain };
          else if (val !== null && val !== undefined) token.values[mode.name] = val;
          else token.values[mode.name] = null;
        }
        collData.tokens.push(token);
      }
      result.push(collData);
    }
    figma.ui.postMessage({ type: "result", data: result });
  } catch(e) {
    figma.ui.postMessage({ type: "error", message: String(e) });
  }
}

// ── Helpers de exportação ──

/**
 * groupByPrefix(tokens)
 *
 * Agrupa tokens pelo prefixo do caminho (tudo exceto o último segmento).
 * Tokens sem barra são agrupados sob "(raiz)".
 *
 * @param {Array<Object>} tokens - Array de tokens com propriedade name.
 * @returns {Object} Mapa de prefixo para array de tokens.
 */
function groupByPrefix(tokens) {
  var groups = {};
  for (var i = 0; i < tokens.length; i++) {
    var t = tokens[i];
    var parts = t.name.split("/");
    var group = parts.length > 1 ? parts.slice(0, -1).join(" / ") : "(raiz)";
    if (!groups[group]) groups[group] = [];
    groups[group].push(t);
  }
  return groups;
}

/**
 * buildChainLines(val)
 *
 * Constrói um array de linhas representando a cadeia de resolução de um
 * valor de token, incluindo setas entre cada nível e o valor final.
 *
 * @param {Object|null} val - Valor resolvido do token com propriedade chain.
 * @returns {Array<string>} Linhas da cadeia de resolução.
 */
function buildChainLines(val) {
  var lines = [];
  if (!val) return ["—"];
  var chain = Array.isArray(val.chain) ? val.chain : [];
  for (var i = 0; i < chain.length; i++) { lines.push(chain[i]); lines.push("->"); }
  if (val.hex) lines.push(val.hex.toUpperCase());
  else if (val.alias) lines.push("-> " + val.alias);
  if (lines.length === 0) lines.push("—");
  return lines;
}

/**
 * rgbToHex(color)
 *
 * Converte um objeto de cor Figma (r, g, b em 0-1) para string hexadecimal.
 *
 * @param {Object|null} color - Objeto com r, g, b (0-1), ou null.
 * @returns {string} Cor em formato "#RRGGBB", ou "—" se color for null.
 */
function rgbToHex(color) {
  if (!color) return "—";
  var r = Math.round((color.r || 0) * 255), g = Math.round((color.g || 0) * 255), b = Math.round((color.b || 0) * 255);
  return "#" + r.toString(16).padStart(2,"0") + g.toString(16).padStart(2,"0") + b.toString(16).padStart(2,"0");
}

// ═══════════════════════════════════════════════════════════════════════════
// SEÇÃO 7: CANVAS: CONSTRUÇÃO DE BOARDS
// Funções para construção de frames de documentação no canvas do Figma,
// incluindo split de collections, cards de token e documentação expandida.
// ═══════════════════════════════════════════════════════════════════════════

var SPLIT_THRESHOLD = 30;
var SEMANTIC_ORDER = ["dynamic","interactive","static","inputable","core","elevation"];

/**
 * shouldSplitCollection(collData)
 *
 * Determines if a collection should be split into sub-boards based on
 * token count and group diversity. Returns true when the collection has
 * more than one semantic group and exceeds the SPLIT_THRESHOLD.
 *
 * @param {Object} collData - Collection data object with a tokens array.
 * @returns {boolean} True if the collection should be split, false otherwise.
 */
function shouldSplitCollection(collData) {
  var groups = {};
  for (var i = 0; i < collData.tokens.length; i++) {
    var g = collData.tokens[i].name.split("/")[0].toLowerCase();
    groups[g] = (groups[g] || 0) + 1;
  }
  return Object.keys(groups).length > 1 && collData.tokens.length > SPLIT_THRESHOLD;
}

/**
 * splitCollectionByGroup(collData)
 *
 * Splits a collection's tokens into sub-collections grouped by semantic
 * prefix (dynamic, interactive, static, inputable, core, elevation, etc.).
 * Groups are sorted according to SEMANTIC_ORDER.
 *
 * @param {Object} collData - Collection data object with id, name, modes, and tokens.
 * @returns {Array} Array of sub-collection objects, each with id, parentId, groupKey, name, modes, and tokens.
 */
function splitCollectionByGroup(collData) {
  var groups = {}, groupOrder = [];
  for (var i = 0; i < collData.tokens.length; i++) {
    var tok = collData.tokens[i];
    var gKey = tok.name.split("/")[0].toLowerCase();
    if (!groups[gKey]) { groups[gKey] = []; groupOrder.push(gKey); }
    groups[gKey].push(tok);
  }
  groupOrder.sort(function(a, b) {
    var ia = SEMANTIC_ORDER.indexOf(a), ib = SEMANTIC_ORDER.indexOf(b);
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1; if (ib !== -1) return 1;
    return a.localeCompare(b);
  });
  return groupOrder.map(function(gKey) {
    var meta = GROUP_META[gKey];
    return { id: collData.id + "__" + gKey, parentId: collData.id, groupKey: gKey,
      name: collData.name + " / " + (meta ? meta.label : gKey.charAt(0).toUpperCase() + gKey.slice(1)),
      modes: collData.modes, tokens: groups[gKey] };
  });
}

/**
 * buildComponentExampleFrame(example, groupMeta)
 *
 * Builds a Figma frame showing a component example with its token mappings
 * and states. Displays the component name, associated tokens, and visual
 * state representations.
 *
 * @param {Object} example - Component example object with component name, tokens, and states.
 * @param {Object} groupMeta - Semantic group metadata containing label, description, and styling info.
 * @returns {FrameNode} A Figma frame node representing the component example.
 * @sideeffects Creates Figma nodes (frames, text nodes) on the canvas.
 */
function buildComponentExampleFrame(example, groupMeta) {
  var exFrame = figma.createFrame();
  exFrame.name = "Exemplo - " + example.component;
  exFrame.layoutMode = "VERTICAL";
  exFrame.primaryAxisSizingMode = "AUTO";
  exFrame.counterAxisSizingMode = "AUTO";
  exFrame.itemSpacing = 8;
  exFrame.paddingTop = 16;
  exFrame.paddingBottom = 16;
  exFrame.paddingLeft = 16;
  exFrame.paddingRight = 16;
  exFrame.fills = [{ type: "SOLID", color: { r: 0.98, g: 0.98, b: 1.0 } }];
  exFrame.cornerRadius = 8;
  exFrame.strokes = [{ type: "SOLID", color: { r: 0.88, g: 0.88, b: 0.92 } }];
  exFrame.strokeWeight = 1;

  // Component name
  var compName = figma.createText();
  compName.characters = example.component;
  compName.fontName = { family: "Inter", style: "Bold" };
  compName.fontSize = 12;
  compName.fills = [{ type: "SOLID", color: { r: 0.1, g: 0.1, b: 0.1 } }];
  exFrame.appendChild(compName);

  var exSep = figma.createRectangle();
  exSep.resize(400, 1);
  exSep.fills = [{ type: "SOLID", color: { r: 0.88, g: 0.88, b: 0.92 } }];
  exFrame.appendChild(exSep);

  // Default tokens
  var tokens = example.tokens || {};
  var roleKeys = Object.keys(tokens);
  for (var ri = 0; ri < roleKeys.length; ri++) {
    var role = roleKeys[ri];
    var tokenPath = tokens[role];
    var roleRow = figma.createText();
    if (tokenPath) {
      roleRow.characters = role + " -> " + tokenPath;
      roleRow.fontName = { family: "Inter", style: "Regular" };
      roleRow.fontSize = 11;
      roleRow.fills = [{ type: "SOLID", color: { r: 0.2, g: 0.2, b: 0.3 } }];
    } else {
      roleRow.characters = role + " -> Token nao encontrado";
      roleRow.fontName = { family: "Inter", style: "Regular" };
      roleRow.fontSize = 11;
      roleRow.fills = [{ type: "SOLID", color: { r: 0.6, g: 0.6, b: 0.6 } }];
    }
    roleRow.resize(400, roleRow.height);
    roleRow.textAutoResize = "HEIGHT";
    exFrame.appendChild(roleRow);
  }

  // States
  var states = example.states || {};
  var stateKeys = Object.keys(states);
  if (stateKeys.length > 0) {
    var statesLabel = figma.createText();
    statesLabel.characters = "States:";
    statesLabel.fontName = { family: "Inter", style: "Bold" };
    statesLabel.fontSize = 11;
    statesLabel.fills = [{ type: "SOLID", color: { r: 0.3, g: 0.3, b: 0.3 } }];
    exFrame.appendChild(statesLabel);

    for (var si = 0; si < stateKeys.length; si++) {
      var stateName = stateKeys[si];
      var stateTokens = states[stateName];
      var stateLabel = figma.createText();
      stateLabel.characters = "  " + stateName + ":";
      stateLabel.fontName = { family: "Inter", style: "Medium" };
      stateLabel.fontSize = 11;
      stateLabel.fills = [{ type: "SOLID", color: { r: 0.35, g: 0.35, b: 0.4 } }];
      exFrame.appendChild(stateLabel);

      var stRoleKeys = Object.keys(stateTokens);
      for (var sri = 0; sri < stRoleKeys.length; sri++) {
        var stRole = stRoleKeys[sri];
        var stPath = stateTokens[stRole];
        var stRow = figma.createText();
        if (stPath) {
          stRow.characters = "    " + stRole + " -> " + stPath;
          stRow.fontName = { family: "Inter", style: "Regular" };
          stRow.fontSize = 11;
          stRow.fills = [{ type: "SOLID", color: { r: 0.2, g: 0.2, b: 0.3 } }];
        } else {
          stRow.characters = "    " + stRole + " -> Token nao encontrado";
          stRow.fontName = { family: "Inter", style: "Regular" };
          stRow.fontSize = 11;
          stRow.fills = [{ type: "SOLID", color: { r: 0.6, g: 0.6, b: 0.6 } }];
        }
        stRow.resize(400, stRow.height);
        stRow.textAutoResize = "HEIGHT";
        exFrame.appendChild(stRow);
      }
    }
  }

  return exFrame;
}

/**
 * buildGroupDocFrame(groupMeta, groupKey)
 *
 * Builds a documentation frame for a semantic group showing description,
 * when-to-use/when-not-to-use guidelines, roles table, and component examples.
 *
 * @param {Object} groupMeta - Group metadata object with label, description, roles, and examples.
 * @param {string} groupKey - Semantic group key (e.g. "dynamic", "interactive", "static").
 * @returns {FrameNode} A Figma frame node with the group documentation.
 * @sideeffects Creates Figma nodes (frames, text nodes) on the canvas.
 */
function buildGroupDocFrame(groupMeta, groupKey) {
  var docFrame = figma.createFrame();
  docFrame.name = "Documentacao - " + groupMeta.label;
  docFrame.layoutMode = "VERTICAL";
  docFrame.primaryAxisSizingMode = "AUTO";
  docFrame.counterAxisSizingMode = "AUTO";
  docFrame.itemSpacing = 16;
  docFrame.paddingTop = 24;
  docFrame.paddingBottom = 24;
  docFrame.paddingLeft = 24;
  docFrame.paddingRight = 24;
  docFrame.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
  docFrame.cornerRadius = 12;
  docFrame.strokes = [{ type: "SOLID", color: { r: 0.9, g: 0.9, b: 0.92 } }];
  docFrame.strokeWeight = 1;

  // 1. Description
  var desc = figma.createText();
  desc.characters = groupMeta.description;
  desc.fontName = { family: "Inter", style: "Regular" };
  desc.fontSize = 13;
  desc.fills = [{ type: "SOLID", color: { r: 0.2, g: 0.2, b: 0.2 } }];
  desc.resize(860, desc.height);
  desc.textAutoResize = "HEIGHT";
  docFrame.appendChild(desc);

  // 2. When to use / When NOT to use grid
  var whenGrid = figma.createFrame();
  whenGrid.name = "quando-usar-grid";
  whenGrid.layoutMode = "HORIZONTAL";
  whenGrid.primaryAxisSizingMode = "AUTO";
  whenGrid.counterAxisSizingMode = "AUTO";
  whenGrid.itemSpacing = 16;
  whenGrid.fills = [];

  // Green useBox
  var useBox = figma.createFrame();
  useBox.name = "Quando usar";
  useBox.layoutMode = "VERTICAL";
  useBox.primaryAxisSizingMode = "AUTO";
  useBox.counterAxisSizingMode = "AUTO";
  useBox.itemSpacing = 5;
  useBox.paddingTop = 12;
  useBox.paddingBottom = 12;
  useBox.paddingLeft = 14;
  useBox.paddingRight = 14;
  useBox.fills = [{ type: "SOLID", color: { r: 0.94, g: 0.99, b: 0.96 } }];
  useBox.cornerRadius = 8;

  var useTitle = figma.createText();
  useTitle.characters = "Quando usar";
  useTitle.fontName = { family: "Inter", style: "Bold" };
  useTitle.fontSize = 11;
  useTitle.fills = [{ type: "SOLID", color: { r: 0.05, g: 0.50, b: 0.25 } }];
  useBox.appendChild(useTitle);

  var whenUseArr = groupMeta.whenUse || [];
  for (var wui = 0; wui < whenUseArr.length; wui++) {
    var wuItem = figma.createText();
    wuItem.characters = "- " + whenUseArr[wui];
    wuItem.fontName = { family: "Inter", style: "Regular" };
    wuItem.fontSize = 11;
    wuItem.fills = [{ type: "SOLID", color: { r: 0.15, g: 0.35, b: 0.20 } }];
    wuItem.resize(400, wuItem.height);
    wuItem.textAutoResize = "HEIGHT";
    useBox.appendChild(wuItem);
  }
  whenGrid.appendChild(useBox);

  // Red notBox
  var notBox = figma.createFrame();
  notBox.name = "Quando NAO usar";
  notBox.layoutMode = "VERTICAL";
  notBox.primaryAxisSizingMode = "AUTO";
  notBox.counterAxisSizingMode = "AUTO";
  notBox.itemSpacing = 5;
  notBox.paddingTop = 12;
  notBox.paddingBottom = 12;
  notBox.paddingLeft = 14;
  notBox.paddingRight = 14;
  notBox.fills = [{ type: "SOLID", color: { r: 1.0, g: 0.95, b: 0.95 } }];
  notBox.cornerRadius = 8;

  var notTitle = figma.createText();
  notTitle.characters = "Quando NAO usar";
  notTitle.fontName = { family: "Inter", style: "Bold" };
  notTitle.fontSize = 11;
  notTitle.fills = [{ type: "SOLID", color: { r: 0.70, g: 0.10, b: 0.10 } }];
  notBox.appendChild(notTitle);

  var whenNotUseArr = groupMeta.whenNotUse || [];
  for (var wni = 0; wni < whenNotUseArr.length; wni++) {
    var wnItem = figma.createText();
    wnItem.characters = "- " + whenNotUseArr[wni];
    wnItem.fontName = { family: "Inter", style: "Regular" };
    wnItem.fontSize = 11;
    wnItem.fills = [{ type: "SOLID", color: { r: 0.45, g: 0.10, b: 0.10 } }];
    wnItem.resize(400, wnItem.height);
    wnItem.textAutoResize = "HEIGHT";
    notBox.appendChild(wnItem);
  }
  whenGrid.appendChild(notBox);
  docFrame.appendChild(whenGrid);

  // 3. Roles table (if roles exist)
  var roles = groupMeta.roles || {};
  var roleKeys = Object.keys(roles);
  if (roleKeys.length > 0) {
    var rolesFrame = figma.createFrame();
    rolesFrame.name = "Roles";
    rolesFrame.layoutMode = "VERTICAL";
    rolesFrame.primaryAxisSizingMode = "AUTO";
    rolesFrame.counterAxisSizingMode = "AUTO";
    rolesFrame.itemSpacing = 4;
    rolesFrame.paddingTop = 12;
    rolesFrame.paddingBottom = 12;
    rolesFrame.paddingLeft = 14;
    rolesFrame.paddingRight = 14;
    rolesFrame.fills = [{ type: "SOLID", color: { r: 0.97, g: 0.97, b: 0.99 } }];
    rolesFrame.cornerRadius = 8;

    var rolesTitle = figma.createText();
    rolesTitle.characters = "Roles";
    rolesTitle.fontName = { family: "Inter", style: "Bold" };
    rolesTitle.fontSize = 11;
    rolesTitle.fills = [{ type: "SOLID", color: { r: 0.1, g: 0.1, b: 0.1 } }];
    rolesFrame.appendChild(rolesTitle);

    // Header row
    var headerRow = figma.createFrame();
    headerRow.name = "header";
    headerRow.layoutMode = "HORIZONTAL";
    headerRow.primaryAxisSizingMode = "AUTO";
    headerRow.counterAxisSizingMode = "AUTO";
    headerRow.itemSpacing = 16;
    headerRow.fills = [];

    var hRole = figma.createText();
    hRole.characters = "Role";
    hRole.fontName = { family: "Inter", style: "Bold" };
    hRole.fontSize = 10;
    hRole.fills = [{ type: "SOLID", color: { r: 0.3, g: 0.3, b: 0.3 } }];
    hRole.resize(120, hRole.height);
    headerRow.appendChild(hRole);

    var hCss = figma.createText();
    hCss.characters = "CSS";
    hCss.fontName = { family: "Inter", style: "Bold" };
    hCss.fontSize = 10;
    hCss.fills = [{ type: "SOLID", color: { r: 0.3, g: 0.3, b: 0.3 } }];
    hCss.resize(160, hCss.height);
    headerRow.appendChild(hCss);

    var hFigma = figma.createText();
    hFigma.characters = "Figma";
    hFigma.fontName = { family: "Inter", style: "Bold" };
    hFigma.fontSize = 10;
    hFigma.fills = [{ type: "SOLID", color: { r: 0.3, g: 0.3, b: 0.3 } }];
    hFigma.resize(160, hFigma.height);
    headerRow.appendChild(hFigma);

    rolesFrame.appendChild(headerRow);

    // Data rows
    for (var rki = 0; rki < roleKeys.length; rki++) {
      var rk = roleKeys[rki];
      var roleData = roles[rk];

      var dataRow = figma.createFrame();
      dataRow.name = rk;
      dataRow.layoutMode = "HORIZONTAL";
      dataRow.primaryAxisSizingMode = "AUTO";
      dataRow.counterAxisSizingMode = "AUTO";
      dataRow.itemSpacing = 16;
      dataRow.fills = [];

      var dRole = figma.createText();
      dRole.characters = rk;
      dRole.fontName = { family: "Inter", style: "Medium" };
      dRole.fontSize = 10;
      dRole.fills = [{ type: "SOLID", color: { r: 0.15, g: 0.15, b: 0.15 } }];
      dRole.resize(120, dRole.height);
      dataRow.appendChild(dRole);

      var dCss = figma.createText();
      dCss.characters = roleData.cssProperty || "—";
      dCss.fontName = { family: "Inter", style: "Regular" };
      dCss.fontSize = 10;
      dCss.fills = [{ type: "SOLID", color: { r: 0.35, g: 0.35, b: 0.35 } }];
      dCss.resize(160, dCss.height);
      dataRow.appendChild(dCss);

      var dFigma = figma.createText();
      dFigma.characters = roleData.figmaProperty || "—";
      dFigma.fontName = { family: "Inter", style: "Regular" };
      dFigma.fontSize = 10;
      dFigma.fills = [{ type: "SOLID", color: { r: 0.35, g: 0.35, b: 0.35 } }];
      dFigma.resize(160, dFigma.height);
      dataRow.appendChild(dFigma);

      rolesFrame.appendChild(dataRow);
    }

    docFrame.appendChild(rolesFrame);
  }

  // 4. Component examples (if any)
  var examples = groupMeta.componentExamples || [];
  if (examples.length > 0) {
    var examplesFrame = figma.createFrame();
    examplesFrame.name = "Exemplos de Componentes";
    examplesFrame.layoutMode = "VERTICAL";
    examplesFrame.primaryAxisSizingMode = "AUTO";
    examplesFrame.counterAxisSizingMode = "AUTO";
    examplesFrame.itemSpacing = 10;
    examplesFrame.fills = [];

    var exTitle = figma.createText();
    exTitle.characters = "Exemplos de Componentes";
    exTitle.fontName = { family: "Inter", style: "Bold" };
    exTitle.fontSize = 12;
    exTitle.fills = [{ type: "SOLID", color: { r: 0.1, g: 0.1, b: 0.1 } }];
    examplesFrame.appendChild(exTitle);

    for (var exi = 0; exi < examples.length; exi++) {
      var exampleFrame = buildComponentExampleFrame(examples[exi], groupMeta);
      examplesFrame.appendChild(exampleFrame);
    }

    docFrame.appendChild(examplesFrame);
  }

  return docFrame;
}

/**
 * buildDecisionTreeFrame(decisionTree)
 *
 * Builds a frame visualizing the token decision tree as numbered steps
 * with yes/no branches. Helps designers choose the correct token group.
 *
 * @param {Object} decisionTree - Decision tree object with steps array, each containing question and yes/no branches.
 * @returns {FrameNode} A Figma frame node with the decision tree visualization.
 * @sideeffects Creates Figma nodes (frames, text nodes) on the canvas.
 */
function buildDecisionTreeFrame(decisionTree) {
  var treeFrame = figma.createFrame();
  treeFrame.name = "Arvore de Decisao";
  treeFrame.layoutMode = "VERTICAL";
  treeFrame.primaryAxisSizingMode = "AUTO";
  treeFrame.counterAxisSizingMode = "AUTO";
  treeFrame.itemSpacing = 12;
  treeFrame.paddingTop = 24;
  treeFrame.paddingBottom = 24;
  treeFrame.paddingLeft = 24;
  treeFrame.paddingRight = 24;
  treeFrame.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
  treeFrame.cornerRadius = 12;
  treeFrame.strokes = [{ type: "SOLID", color: { r: 0.9, g: 0.9, b: 0.92 } }];
  treeFrame.strokeWeight = 1;

  // Title
  var title = figma.createText();
  title.characters = "Como escolher o token correto";
  title.fontName = { family: "Inter", style: "Bold" };
  title.fontSize = 16;
  title.fills = [{ type: "SOLID", color: { r: 0.06, g: 0.06, b: 0.06 } }];
  treeFrame.appendChild(title);

  var sep = figma.createRectangle();
  sep.resize(600, 1);
  sep.fills = [{ type: "SOLID", color: { r: 0.88, g: 0.88, b: 0.92 } }];
  treeFrame.appendChild(sep);

  // Flatten the decision tree into numbered steps
  var stepNum = 1;
  var node = decisionTree;

  function addStep(question, yesResult, noNode, indent, num) {
    var stepText = figma.createText();
    stepText.characters = num + ". " + question;
    stepText.fontName = { family: "Inter", style: "Bold" };
    stepText.fontSize = 12;
    stepText.fills = [{ type: "SOLID", color: { r: 0.1, g: 0.1, b: 0.2 } }];
    stepText.resize(560, stepText.height);
    stepText.textAutoResize = "HEIGHT";
    treeFrame.appendChild(stepText);

    // YES answer
    var yesText = figma.createText();
    if (yesResult.result) {
      var groupLabel = yesResult.result;
      if (GROUP_META[yesResult.result]) {
        groupLabel = GROUP_META[yesResult.result].label;
      }
      yesText.characters = "   SIM -> " + groupLabel;
      yesText.fontName = { family: "Inter", style: "Medium" };
      yesText.fontSize = 12;
      yesText.fills = [{ type: "SOLID", color: { r: 0.05, g: 0.50, b: 0.25 } }];
    } else {
      yesText.characters = "   SIM -> (ver sub-pergunta)";
      yesText.fontName = { family: "Inter", style: "Medium" };
      yesText.fontSize = 12;
      yesText.fills = [{ type: "SOLID", color: { r: 0.05, g: 0.50, b: 0.25 } }];
    }
    yesText.resize(560, yesText.height);
    yesText.textAutoResize = "HEIGHT";
    treeFrame.appendChild(yesText);

    // NO answer
    var noText = figma.createText();
    if (noNode.result) {
      var noGroupLabel = noNode.result;
      if (GROUP_META[noNode.result]) {
        noGroupLabel = GROUP_META[noNode.result].label;
      }
      noText.characters = "   NAO -> " + noGroupLabel;
      noText.fontName = { family: "Inter", style: "Medium" };
      noText.fontSize = 12;
      noText.fills = [{ type: "SOLID", color: { r: 0.70, g: 0.10, b: 0.10 } }];
    } else {
      noText.characters = "   NAO ↓";
      noText.fontName = { family: "Inter", style: "Medium" };
      noText.fontSize = 12;
      noText.fills = [{ type: "SOLID", color: { r: 0.5, g: 0.5, b: 0.5 } }];
    }
    noText.resize(560, noText.height);
    noText.textAutoResize = "HEIGHT";
    treeFrame.appendChild(noText);
  }

  // Walk the tree iteratively
  var current = decisionTree;
  var stepCounter = 1;
  while (current && current.question) {
    var yesNode = current.yes || {};
    var noNode = current.no || {};
    addStep(current.question, yesNode, noNode, 0, stepCounter);
    stepCounter++;
    // Continue down the "no" branch (the "yes" branch terminates with a result)
    if (noNode.question) {
      current = noNode;
    } else {
      break;
    }
  }

  return treeFrame;
}

/**
 * buildRoleMappingFrame(roleMapping)
 *
 * Builds a frame showing the role-to-CSS/Figma property mapping table.
 * Displays each role with its corresponding CSS property and Figma property.
 *
 * @param {Object} roleMapping - Role mapping object with entries mapping role names to CSS/Figma properties.
 * @returns {FrameNode} A Figma frame node with the role mapping table.
 * @sideeffects Creates Figma nodes (frames, text nodes) on the canvas.
 */
function buildRoleMappingFrame(roleMapping) {
  var mapFrame = figma.createFrame();
  mapFrame.name = "Mapeamento de Roles";
  mapFrame.layoutMode = "VERTICAL";
  mapFrame.primaryAxisSizingMode = "AUTO";
  mapFrame.counterAxisSizingMode = "AUTO";
  mapFrame.itemSpacing = 6;
  mapFrame.paddingTop = 24;
  mapFrame.paddingBottom = 24;
  mapFrame.paddingLeft = 24;
  mapFrame.paddingRight = 24;
  mapFrame.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
  mapFrame.cornerRadius = 12;
  mapFrame.strokes = [{ type: "SOLID", color: { r: 0.9, g: 0.9, b: 0.92 } }];
  mapFrame.strokeWeight = 1;

  // Title
  var title = figma.createText();
  title.characters = "Mapeamento de Roles";
  title.fontName = { family: "Inter", style: "Bold" };
  title.fontSize = 16;
  title.fills = [{ type: "SOLID", color: { r: 0.06, g: 0.06, b: 0.06 } }];
  mapFrame.appendChild(title);

  var sep = figma.createRectangle();
  sep.resize(600, 1);
  sep.fills = [{ type: "SOLID", color: { r: 0.88, g: 0.88, b: 0.92 } }];
  mapFrame.appendChild(sep);

  // Header row
  var headerRow = figma.createFrame();
  headerRow.name = "header";
  headerRow.layoutMode = "HORIZONTAL";
  headerRow.primaryAxisSizingMode = "AUTO";
  headerRow.counterAxisSizingMode = "AUTO";
  headerRow.itemSpacing = 16;
  headerRow.fills = [];
  headerRow.paddingTop = 4;
  headerRow.paddingBottom = 4;

  var hRole = figma.createText();
  hRole.characters = "Role";
  hRole.fontName = { family: "Inter", style: "Bold" };
  hRole.fontSize = 12;
  hRole.fills = [{ type: "SOLID", color: { r: 0.15, g: 0.15, b: 0.15 } }];
  hRole.resize(140, hRole.height);
  headerRow.appendChild(hRole);

  var hCss = figma.createText();
  hCss.characters = "CSS";
  hCss.fontName = { family: "Inter", style: "Bold" };
  hCss.fontSize = 12;
  hCss.fills = [{ type: "SOLID", color: { r: 0.15, g: 0.15, b: 0.15 } }];
  hCss.resize(180, hCss.height);
  headerRow.appendChild(hCss);

  var hFigma = figma.createText();
  hFigma.characters = "Figma";
  hFigma.fontName = { family: "Inter", style: "Bold" };
  hFigma.fontSize = 12;
  hFigma.fills = [{ type: "SOLID", color: { r: 0.15, g: 0.15, b: 0.15 } }];
  hFigma.resize(180, hFigma.height);
  headerRow.appendChild(hFigma);

  mapFrame.appendChild(headerRow);

  // Data rows
  var roleKeys = Object.keys(roleMapping);
  for (var i = 0; i < roleKeys.length; i++) {
    var rk = roleKeys[i];
    var rm = roleMapping[rk];

    var dataRow = figma.createFrame();
    dataRow.name = rk;
    dataRow.layoutMode = "HORIZONTAL";
    dataRow.primaryAxisSizingMode = "AUTO";
    dataRow.counterAxisSizingMode = "AUTO";
    dataRow.itemSpacing = 16;
    dataRow.fills = [];
    dataRow.paddingTop = 3;
    dataRow.paddingBottom = 3;

    var dRole = figma.createText();
    dRole.characters = rk;
    dRole.fontName = { family: "Inter", style: "Medium" };
    dRole.fontSize = 11;
    dRole.fills = [{ type: "SOLID", color: { r: 0.15, g: 0.15, b: 0.15 } }];
    dRole.resize(140, dRole.height);
    dataRow.appendChild(dRole);

    var dCss = figma.createText();
    dCss.characters = rm.css || "—";
    dCss.fontName = { family: "Inter", style: "Regular" };
    dCss.fontSize = 11;
    dCss.fills = [{ type: "SOLID", color: { r: 0.35, g: 0.35, b: 0.35 } }];
    dCss.resize(180, dCss.height);
    dataRow.appendChild(dCss);

    var dFigma = figma.createText();
    dFigma.characters = rm.figma || "—";
    dFigma.fontName = { family: "Inter", style: "Regular" };
    dFigma.fontSize = 11;
    dFigma.fills = [{ type: "SOLID", color: { r: 0.35, g: 0.35, b: 0.35 } }];
    dFigma.resize(180, dFigma.height);
    dataRow.appendChild(dFigma);

    mapFrame.appendChild(dataRow);
  }

  return mapFrame;
}

/**
 * buildCollectionFrame(coll)
 *
 * Main function that builds the complete documentation board for a single
 * collection, including group headers, token cards with color swatches,
 * chain resolution, and WCAG contrast info.
 *
 * @param {Object} coll - Collection data object with id, name, modes, and tokens arrays.
 * @returns {Promise<FrameNode>} A Figma frame node representing the full collection board.
 * @sideeffects Creates Figma nodes (frames, text nodes, rectangles) on the canvas.
 */
async function buildCollectionFrame(coll) {
  var CARD_W = 200, COLOR_H = 80, CARD_GAP = 12, PAD = 48;
  var modes = coll.modes;
  var modeCount = modes.length;
  var sliceW = modeCount > 1 ? Math.floor(CARD_W / modeCount) : CARD_W;

  var collFrame = figma.createFrame();
  collFrame.name = "📘 " + coll.name;
  collFrame.layoutMode = "VERTICAL";
  collFrame.primaryAxisSizingMode = "AUTO";
  collFrame.counterAxisSizingMode = "AUTO";
  collFrame.paddingTop = PAD; collFrame.paddingBottom = PAD;
  collFrame.paddingLeft = PAD; collFrame.paddingRight = PAD;
  collFrame.itemSpacing = 56;
  collFrame.fills = [{ type: "SOLID", color: { r: 0.96, g: 0.96, b: 0.97 } }];
  collFrame.cornerRadius = 16;

  // Título
  var collTitle = figma.createText();
  collTitle.characters = coll.name;
  collTitle.fontName = { family: "Inter", style: "Bold" };
  collTitle.fontSize = 32;
  collTitle.fills = [{ type: "SOLID", color: { r: 0.06, g: 0.06, b: 0.06 } }];
  collFrame.appendChild(collTitle);

  var titleLine = figma.createRectangle();
  titleLine.resize(1200, 1);
  titleLine.fills = [{ type: "SOLID", color: { r: 0.85, g: 0.85, b: 0.87 } }];
  collFrame.appendChild(titleLine);

  // Agrupa por grupo semântico
  var semanticGroups = {}, allGroupKeys = [];
  for (var ti = 0; ti < coll.tokens.length; ti++) {
    var gKey = coll.tokens[ti].name.split("/")[0].toLowerCase();
    if (!semanticGroups[gKey]) { semanticGroups[gKey] = []; allGroupKeys.push(gKey); }
    semanticGroups[gKey].push(coll.tokens[ti]);
  }
  allGroupKeys.sort(function(a, b) {
    var ia = SEMANTIC_ORDER.indexOf(a), ib = SEMANTIC_ORDER.indexOf(b);
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1; if (ib !== -1) return 1;
    return a.localeCompare(b);
  });

  for (var sgi = 0; sgi < allGroupKeys.length; sgi++) {
    var sgKey = allGroupKeys[sgi];
    var sgTokens = semanticGroups[sgKey];
    var meta = GROUP_META[sgKey];

    var sgFrame = figma.createFrame();
    sgFrame.name = meta ? meta.label : sgKey.charAt(0).toUpperCase() + sgKey.slice(1);
    sgFrame.layoutMode = "VERTICAL";
    sgFrame.primaryAxisSizingMode = "AUTO";
    sgFrame.counterAxisSizingMode = "AUTO";
    sgFrame.itemSpacing = 32;
    sgFrame.fills = [];

    // Título do grupo
    var sgTitle = figma.createText();
    sgTitle.characters = meta ? meta.label : sgKey.charAt(0).toUpperCase() + sgKey.slice(1);
    sgTitle.fontName = { family: "Inter", style: "Bold" };
    sgTitle.fontSize = 22;
    sgTitle.fills = [{ type: "SOLID", color: { r: 0.06, g: 0.06, b: 0.06 } }];
    sgFrame.appendChild(sgTitle);

    var sgLine = figma.createRectangle();
    sgLine.resize(1200, 1);
    sgLine.fills = [{ type: "SOLID", color: { r: 0.88, g: 0.88, b: 0.90 } }];
    sgFrame.appendChild(sgLine);

    // Frame de documentação expandida (buildGroupDocFrame)
    if (meta) {
      var groupDocFrame = buildGroupDocFrame(meta, sgKey);
      sgFrame.appendChild(groupDocFrame);
    }

    // Tokens de cor agrupados por subgrupo
    var colorTokens = [], otherTokens = [];
    for (var cti = 0; cti < sgTokens.length; cti++) {
      if (sgTokens[cti].type === "COLOR") colorTokens.push(sgTokens[cti]);
      else otherTokens.push(sgTokens[cti]);
    }

    if (colorTokens.length > 0) {
      var subGroups = {}, subOrder = [];
      for (var cti2 = 0; cti2 < colorTokens.length; cti2++) {
        var ctok = colorTokens[cti2];
        var nameParts = ctok.name.split("/");
        var subKey = nameParts.length > 2 ? nameParts.slice(1, -1).join(" / ") : (nameParts[1] || "raiz");
        if (!subGroups[subKey]) { subGroups[subKey] = []; subOrder.push(subKey); }
        subGroups[subKey].push(ctok);
      }

      for (var subgi = 0; subgi < subOrder.length; subgi++) {
        var subKey2 = subOrder[subgi];
        var subTokens = subGroups[subKey2];

        var subFrame = figma.createFrame();
        subFrame.name = subKey2;
        subFrame.layoutMode = "VERTICAL";
        subFrame.primaryAxisSizingMode = "AUTO";
        subFrame.counterAxisSizingMode = "AUTO";
        subFrame.itemSpacing = 10;
        subFrame.fills = [];

        var subLabel = figma.createText();
        subLabel.characters = subKey2;
        subLabel.fontName = { family: "Inter", style: "Bold" };
        subLabel.fontSize = 14;
        subLabel.fills = [{ type: "SOLID", color: { r: 0.1, g: 0.1, b: 0.1 } }];
        subFrame.appendChild(subLabel);

        var cardRow = figma.createFrame();
        cardRow.name = "cards";
        cardRow.layoutMode = "HORIZONTAL";
        cardRow.primaryAxisSizingMode = "AUTO";
        cardRow.counterAxisSizingMode = "AUTO";
        cardRow.itemSpacing = CARD_GAP;
        cardRow.fills = [];

        for (var sti = 0; sti < subTokens.length; sti++) {
          var token = subTokens[sti];
          var realVar = null;
          if (token.variableId) {
            try { realVar = await figma.variables.getVariableByIdAsync(token.variableId); } catch(e) {}
          }

          var card = figma.createFrame();
          card.name = token.name;
          card.layoutMode = "VERTICAL";
          card.primaryAxisSizingMode = "AUTO";
          card.counterAxisSizingMode = "FIXED";
          card.resize(CARD_W, 10);
          card.primaryAxisSizingMode = "AUTO";
          card.itemSpacing = 0;
          card.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
          card.cornerRadius = 10;
          card.clipsContent = true;
          card.strokes = [{ type: "SOLID", color: { r: 0.9, g: 0.9, b: 0.92 } }];
          card.strokeWeight = 1;

          // Bloco de cor: fatias por modo
          var colorRow = figma.createFrame();
          colorRow.name = "color-modes";
          colorRow.layoutMode = "HORIZONTAL";
          colorRow.primaryAxisSizingMode = "FIXED";
          colorRow.counterAxisSizingMode = "FIXED";
          colorRow.resize(CARD_W, COLOR_H);
          colorRow.itemSpacing = 0;
          colorRow.fills = [{ type: "SOLID", color: { r: 0.88, g: 0.88, b: 0.88 } }];
          colorRow.clipsContent = true;

          for (var mi = 0; mi < modes.length; mi++) {
            var mode = modes[mi];
            var mVal = token.values[mode.name];
            var fr = 0.88, fg = 0.88, fb = 0.88, fa = 1;
            if (mVal && mVal.r !== undefined) { fr = mVal.r; fg = mVal.g; fb = mVal.b; fa = mVal.alpha !== undefined ? mVal.alpha : 1; }

            var slice = figma.createFrame();
            slice.name = mode.name;
            slice.layoutMode = "VERTICAL";
            slice.primaryAxisSizingMode = "FIXED";
            slice.counterAxisSizingMode = "FIXED";
            var sw = (mi === modes.length - 1) ? CARD_W - sliceW * mi : sliceW;
            slice.resize(sw, COLOR_H);
            var sliceFill = { type: "SOLID", color: { r: fr, g: fg, b: fb }, opacity: fa };
            slice.fills = [sliceFill];

            if (mi === 0 && realVar) {
              try {
                var bf = figma.variables.setBoundVariableForPaint(sliceFill, "color", realVar);
                slice.fills = [bf];
              } catch(e) {}
            }
            colorRow.appendChild(slice);
          }
          card.appendChild(colorRow);

          // Info
          var infoFrame = figma.createFrame();
          infoFrame.name = "info";
          infoFrame.layoutMode = "VERTICAL";
          infoFrame.primaryAxisSizingMode = "AUTO";
          infoFrame.counterAxisSizingMode = "FIXED";
          infoFrame.resize(CARD_W, 10);
          infoFrame.primaryAxisSizingMode = "AUTO";
          infoFrame.itemSpacing = 0;
          infoFrame.paddingTop = 10; infoFrame.paddingBottom = 12;
          infoFrame.paddingLeft = 12; infoFrame.paddingRight = 12;
          infoFrame.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];

          var shortName = token.name.split("/").slice(1).join("/") || token.name;
          var nameText = figma.createText();
          nameText.name = "tokenName";
          nameText.characters = shortName;
          nameText.fontName = { family: "Inter", style: "Medium" };
          nameText.fontSize = 11;
          nameText.fills = [{ type: "SOLID", color: { r: 0.42, g: 0.27, b: 0.9 } }];
          nameText.resize(CARD_W - 24, nameText.height);
          nameText.textAutoResize = "HEIGHT";
          infoFrame.appendChild(nameText);

          var infoSep = figma.createRectangle();
          infoSep.resize(CARD_W - 24, 1);
          infoSep.fills = [{ type: "SOLID", color: { r: 0.93, g: 0.93, b: 0.95 } }];
          infoFrame.appendChild(infoSep);

          // Por modo: label + cadeia
          for (var mvi = 0; mvi < modes.length; mvi++) {
            var mv = modes[mvi];
            var modeVal = token.values[mv.name];
            var chain = (modeVal && Array.isArray(modeVal.chain)) ? modeVal.chain : [];
            var hexVal = modeVal && modeVal.hex ? modeVal.hex.toUpperCase() : null;

            var modeRow = figma.createFrame();
            modeRow.name = mv.name;
            modeRow.layoutMode = "HORIZONTAL";
            modeRow.primaryAxisSizingMode = "AUTO";
            modeRow.counterAxisSizingMode = "AUTO";
            modeRow.itemSpacing = 8;
            modeRow.fills = [];
            modeRow.paddingTop = mvi === 0 ? 8 : 6;
            modeRow.paddingBottom = 2;

            var modeLabel = figma.createText();
            modeLabel.characters = mv.name;
            modeLabel.fontName = { family: "Inter", style: "Regular" };
            modeLabel.fontSize = 10;
            modeLabel.fills = [{ type: "SOLID", color: { r: 0.6, g: 0.6, b: 0.6 } }];
            modeLabel.resize(52, modeLabel.height);
            modeLabel.textAutoResize = "HEIGHT";
            modeRow.appendChild(modeLabel);

            var chainFrame = figma.createFrame();
            chainFrame.name = "chain";
            chainFrame.layoutMode = "VERTICAL";
            chainFrame.primaryAxisSizingMode = "AUTO";
            chainFrame.counterAxisSizingMode = "AUTO";
            chainFrame.itemSpacing = 1;
            chainFrame.fills = [];

            if (chain.length > 0) {
              var firstAlias = figma.createText();
              firstAlias.characters = chain[0] + " ->";
              firstAlias.fontName = { family: "Inter", style: "Bold" };
              firstAlias.fontSize = 10;
              firstAlias.fills = [{ type: "SOLID", color: { r: 0.1, g: 0.1, b: 0.1 } }];
              firstAlias.resize(CARD_W - 28 - 60, firstAlias.height);
              firstAlias.textAutoResize = "HEIGHT";
              chainFrame.appendChild(firstAlias);
              for (var chi = 1; chi < chain.length; chi++) {
                var midAlias = figma.createText();
                midAlias.characters = chain[chi] + " ->";
                midAlias.fontName = { family: "Inter", style: "Regular" };
                midAlias.fontSize = 10;
                midAlias.fills = [{ type: "SOLID", color: { r: 0.45, g: 0.45, b: 0.45 } }];
                midAlias.resize(CARD_W - 28 - 60, midAlias.height);
                midAlias.textAutoResize = "HEIGHT";
                chainFrame.appendChild(midAlias);
              }
            }

            var valText = figma.createText();
            valText.characters = hexVal || (modeVal && modeVal.alias ? "-> " + modeVal.alias : "—");
            valText.fontName = { family: "Inter", style: "Regular" };
            valText.fontSize = 10;
            valText.fills = [{ type: "SOLID", color: { r: 0.45, g: 0.45, b: 0.45 } }];
            chainFrame.appendChild(valText);

            modeRow.appendChild(chainFrame);
            infoFrame.appendChild(modeRow);

            if (mvi < modes.length - 1) {
              var modeSep = figma.createRectangle();
              modeSep.resize(CARD_W - 24, 1);
              modeSep.fills = [{ type: "SOLID", color: { r: 0.95, g: 0.95, b: 0.96 } }];
              infoFrame.appendChild(modeSep);
            }
          }

          // Enriched documentation from web app
          if (enrichedTokenData) {
            var enrichedEntry = enrichedTokenData[token.name] || null;
            if (!enrichedEntry) {
              // Try lowercase lookup
              var enrichedKeys = Object.keys(enrichedTokenData);
              for (var eki = 0; eki < enrichedKeys.length; eki++) {
                if (enrichedKeys[eki].toLowerCase() === token.name.toLowerCase()) {
                  enrichedEntry = enrichedTokenData[enrichedKeys[eki]];
                  break;
                }
              }
            }
            if (enrichedEntry) {
              var enrichSep = figma.createRectangle();
              enrichSep.resize(CARD_W - 24, 1);
              enrichSep.fills = [{ type: "SOLID", color: { r: 0.85, g: 0.88, b: 0.95 } }];
              infoFrame.appendChild(enrichSep);

              var enrichFrame = figma.createFrame();
              enrichFrame.name = "enriched-docs";
              enrichFrame.layoutMode = "VERTICAL";
              enrichFrame.primaryAxisSizingMode = "AUTO";
              enrichFrame.counterAxisSizingMode = "FIXED";
              enrichFrame.resize(CARD_W - 24, 10);
              enrichFrame.primaryAxisSizingMode = "AUTO";
              enrichFrame.itemSpacing = 3;
              enrichFrame.paddingTop = 6;
              enrichFrame.paddingBottom = 4;
              enrichFrame.fills = [];

              if (enrichedEntry.context) {
                var ctxText = figma.createText();
                ctxText.characters = "Context: " + enrichedEntry.context;
                ctxText.fontName = { family: "Inter", style: "Regular" };
                ctxText.fontSize = 9;
                ctxText.fills = [{ type: "SOLID", color: { r: 0.25, g: 0.35, b: 0.60 } }];
                ctxText.resize(CARD_W - 28, ctxText.height);
                ctxText.textAutoResize = "HEIGHT";
                enrichFrame.appendChild(ctxText);
              }

              if (enrichedEntry.aliasChain) {
                var aliasChainStr = "";
                if (typeof enrichedEntry.aliasChain === "string") {
                  aliasChainStr = enrichedEntry.aliasChain;
                } else if (Array.isArray(enrichedEntry.aliasChain)) {
                  aliasChainStr = enrichedEntry.aliasChain.join(" -> ");
                }
                if (aliasChainStr) {
                  var acText = figma.createText();
                  acText.characters = "Alias: " + aliasChainStr;
                  acText.fontName = { family: "Inter", style: "Regular" };
                  acText.fontSize = 9;
                  acText.fills = [{ type: "SOLID", color: { r: 0.35, g: 0.35, b: 0.50 } }];
                  acText.resize(CARD_W - 28, acText.height);
                  acText.textAutoResize = "HEIGHT";
                  enrichFrame.appendChild(acText);
                }
              }

              if (enrichedEntry.role) {
                var roleText = figma.createText();
                roleText.characters = "Role: " + enrichedEntry.role;
                roleText.fontName = { family: "Inter", style: "Regular" };
                roleText.fontSize = 9;
                roleText.fills = [{ type: "SOLID", color: { r: 0.35, g: 0.35, b: 0.50 } }];
                enrichFrame.appendChild(roleText);
              }

              if (enrichedEntry.cssProperty) {
                var cssText = figma.createText();
                cssText.characters = "CSS: " + enrichedEntry.cssProperty;
                cssText.fontName = { family: "Inter", style: "Regular" };
                cssText.fontSize = 9;
                cssText.fills = [{ type: "SOLID", color: { r: 0.40, g: 0.40, b: 0.50 } }];
                enrichFrame.appendChild(cssText);
              }

              infoFrame.appendChild(enrichFrame);
            }
          }

          card.appendChild(infoFrame);
          cardRow.appendChild(card);
        }

        subFrame.appendChild(cardRow);
        sgFrame.appendChild(subFrame);
      }
    }

    // Tokens não-cor
    if (otherTokens.length > 0) {
      var ogFrame = figma.createFrame();
      ogFrame.name = "outros";
      ogFrame.layoutMode = "VERTICAL";
      ogFrame.primaryAxisSizingMode = "AUTO";
      ogFrame.counterAxisSizingMode = "AUTO";
      ogFrame.itemSpacing = 2;
      ogFrame.paddingTop = 14; ogFrame.paddingBottom = 14;
      ogFrame.paddingLeft = 14; ogFrame.paddingRight = 14;
      ogFrame.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
      ogFrame.cornerRadius = 8;

      for (var oti = 0; oti < otherTokens.length; oti++) {
        var oToken = otherTokens[oti];
        var oRow = figma.createFrame();
        oRow.layoutMode = "HORIZONTAL";
        oRow.primaryAxisSizingMode = "AUTO";
        oRow.counterAxisSizingMode = "AUTO";
        oRow.itemSpacing = 24;
        oRow.fills = [];
        oRow.paddingTop = 4; oRow.paddingBottom = 4;

        var oNameT = figma.createText();
        oNameT.characters = oToken.name.split("/").pop();
        oNameT.fontName = { family: "Inter", style: "Medium" };
        oNameT.fontSize = 11;
        oNameT.fills = [{ type: "SOLID", color: { r: 0.15, g: 0.15, b: 0.15 } }];
        oRow.appendChild(oNameT);

        for (var omvi = 0; omvi < modes.length; omvi++) {
          var omMode = modes[omvi];
          var oVal = oToken.values[omMode.name];
          var oDv = "—";
          if (oVal !== null && oVal !== undefined) {
            if (typeof oVal === "object" && oVal.alias) oDv = oVal.alias;
            else if (typeof oVal === "object" && oVal.hex) {
              var oChain = Array.isArray(oVal.chain) ? oVal.chain : [];
              oDv = oChain.length ? oChain.join(" -> ") + " -> " + oVal.hex : oVal.hex;
            } else oDv = String(oVal);
          }
          var oValText = figma.createText();
          oValText.characters = modes.length > 1 ? omMode.name + ": " + oDv : oDv;
          oValText.fontName = { family: "Inter", style: "Regular" };
          oValText.fontSize = 11;
          oValText.fills = [{ type: "SOLID", color: { r: 0.5, g: 0.5, b: 0.5 } }];
          oRow.appendChild(oValText);
        }
        ogFrame.appendChild(oRow);
      }
      sgFrame.appendChild(ogFrame);
    }

    collFrame.appendChild(sgFrame);
  }

  return collFrame;
}

// ═══════════════════════════════════════════════════════════════════════════
// SEÇÃO 8: BOARD REGISTRY MANAGER
// Gerenciamento do registro de boards no canvas, sincronização de posições
// e geração de boards a partir de collections.
// ═══════════════════════════════════════════════════════════════════════════

/**
 * syncBoardRegistry()
 *
 * Rebuilds the boardRegistry object by scanning the current Figma page
 * for the root frame "📚 Token Docs" and all board frames (prefixed with "📘 ").
 * Maps each board to its collection ID (and group key for split collections).
 * Populates nodeId for each entry to enable direct lookup via figma.getNodeById().
 * Resets boardRegistry before scanning.
 *
 * @returns {Promise<void>}
 * @sideeffects Mutates global `boardRegistry` object, reads from Figma page.
 */
async function syncBoardRegistry() {
  boardRegistry = {};
  try {
    var rootFrame = figma.currentPage.findOne(function(n) { return n.name === "📚 Token Docs"; });
    if (rootFrame) {
      boardRegistry["__root__"] = { name: "📚 Token Docs", nodeId: rootFrame.id, x: rootFrame.x, y: rootFrame.y };
    }
    var collections = await figma.variables.getLocalVariableCollectionsAsync();
    var nodes = rootFrame ? rootFrame.children : figma.currentPage.children;
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      if (node.type !== "FRAME") continue;
      var nodeName = node.name;
      var boardName = nodeName.indexOf("📘 ") === 0 ? nodeName.replace("📘 ", "") : nodeName;
      for (var ci = 0; ci < collections.length; ci++) {
        if (collections[ci].name === boardName) {
          boardRegistry[collections[ci].id] = { name: boardName, nodeId: node.id, x: node.x, y: node.y, tokenSnapshot: null, lastUpdated: null };
          break;
        }
        if (boardName.indexOf(collections[ci].name + " / ") === 0) {
          var groupLabel = boardName.replace(collections[ci].name + " / ", "").toLowerCase();
          var gKey = groupLabel;
          for (var gi = 0; gi < SEMANTIC_ORDER.length; gi++) {
            var gMeta = GROUP_META[SEMANTIC_ORDER[gi]];
            if (gMeta && gMeta.label.toLowerCase() === groupLabel) { gKey = SEMANTIC_ORDER[gi]; break; }
          }
          boardRegistry[collections[ci].id + "__" + gKey] = { name: boardName, nodeId: node.id, x: node.x, y: node.y, tokenSnapshot: null, lastUpdated: null };
          if (!boardRegistry[collections[ci].id]) {
            boardRegistry[collections[ci].id] = { name: collections[ci].name, nodeId: node.id, x: node.x, y: node.y, tokenSnapshot: null, lastUpdated: null };
          }
          break;
        }
      }
    }
  } catch(e) {}
}

/**
 * getBoardForCollection(collectionId)
 *
 * Returns the Figma node of the board for a given collection, or null
 * if the board does not exist. Uses the nodeId stored in boardRegistry
 * for direct lookup via figma.getNodeById(), avoiding full page scans.
 *
 * @param {string} collectionId - The ID of the collection to look up.
 * @returns {Object|null} The Figma node of the board, or null if not found.
 */
function getBoardForCollection(collectionId) {
  var entry = boardRegistry[collectionId];
  if (!entry || !entry.nodeId) return null;
  var node = figma.getNodeById(entry.nodeId);
  return node || null;
}

/**
 * updateBoardRegistryEntry(collectionId, nodeId, x, y, tokenSnapshot)
 *
 * Updates or creates an entry in the boardRegistry for a given collection.
 * Stores the Figma node ID, position, token snapshot for diff, and
 * the current timestamp as lastUpdated.
 *
 * @param {string} collectionId - The ID of the collection.
 * @param {string} nodeId - The Figma node ID of the board frame.
 * @param {number} x - The x position of the board on the canvas.
 * @param {number} y - The y position of the board on the canvas.
 * @param {Object|null} tokenSnapshot - Map of tokenName to valueHash for diff.
 * @returns {void}
 * @sideeffects Mutates global `boardRegistry` object.
 */
function updateBoardRegistryEntry(collectionId, nodeId, x, y, tokenSnapshot) {
  var existing = boardRegistry[collectionId];
  var name = existing ? existing.name : "";
  boardRegistry[collectionId] = {
    name: name,
    nodeId: nodeId,
    x: x,
    y: y,
    tokenSnapshot: tokenSnapshot || null,
    lastUpdated: Date.now()
  };
}

/**
 * removeBoardRegistryEntry(collectionId)
 *
 * Removes the entry for a given collection from the boardRegistry.
 * Does not remove the Figma node from the canvas — callers should
 * handle node removal separately if needed.
 *
 * @param {string} collectionId - The ID of the collection to remove.
 * @returns {void}
 * @sideeffects Mutates global `boardRegistry` object.
 */
function removeBoardRegistryEntry(collectionId) {
  if (boardRegistry[collectionId]) {
    delete boardRegistry[collectionId];
  }
}

/**
 * tokenValueHash(token)
 *
 * Generates a deterministic string hash of a token's values across all modes.
 * Mode names are sorted alphabetically to ensure consistent output regardless
 * of object key order. Used for quick equality comparison in diff operations.
 *
 * @param {Object} token - Token object with a `values` map { modeName: value }.
 * @returns {string} Deterministic hash string (e.g. "Dark:#000000|Default:#FFFFFF").
 */
function tokenValueHash(token) {
  var parts = [];
  var modeNames = Object.keys(token.values);
  modeNames.sort();
  for (var i = 0; i < modeNames.length; i++) {
    var val = token.values[modeNames[i]];
    if (val && val.hex) parts.push(modeNames[i] + ":" + val.hex);
    else if (val && val.alias) parts.push(modeNames[i] + ":" + val.alias);
    else parts.push(modeNames[i] + ":" + String(val));
  }
  return parts.join("|");
}

/**
 * diffTokenSnapshots(oldSnapshot, newTokens)
 *
 * Compares an old snapshot (map of tokenName → valueHash) with current tokens
 * to determine what changed. Used for incremental board updates.
 *
 * - added: tokens present in newTokens but absent in oldSnapshot
 * - removed: tokens present in oldSnapshot but absent in newTokens
 * - changed: tokens present in both but with a different value hash
 *
 * @param {Object} oldSnapshot - Map { tokenName: valueHash } from previous generation.
 * @param {Array} newTokens - Array of token objects with `name` and `values` properties.
 * @returns {Object} { added: Array<Object>, removed: Array<string>, changed: Array<Object> }
 */
function diffTokenSnapshots(oldSnapshot, newTokens) {
  var result = { added: [], removed: [], changed: [] };
  var newMap = {};

  for (var i = 0; i < newTokens.length; i++) {
    var tok = newTokens[i];
    var valHash = tokenValueHash(tok);
    newMap[tok.name] = valHash;

    if (!oldSnapshot[tok.name]) {
      result.added.push(tok);
    } else if (oldSnapshot[tok.name] !== valHash) {
      result.changed.push(tok);
    }
  }

  var oldKeys = Object.keys(oldSnapshot);
  for (var j = 0; j < oldKeys.length; j++) {
    if (!newMap[oldKeys[j]]) {
      result.removed.push(oldKeys[j]);
    }
  }

  return result;
}

/**
 * nextBoardPosition()
 *
 * Calculates the next available x position for placing a new board by finding
 * the rightmost edge of existing board frames (📘 prefix) plus an 80px gap.
 *
 * @returns {{ x: number, y: number }} Position object with y always 0.
 * @sideeffects None (read-only scan of page children).
 */
function nextBoardPosition() {
  var maxX = 0;
  var nodes = figma.currentPage.children;
  for (var i = 0; i < nodes.length; i++) {
    var node = nodes[i];
    if (node.type === "FRAME" && node.name.indexOf("📘 ") === 0) {
      var right = node.x + node.width + 80;
      if (right > maxX) maxX = right;
    }
  }
  return { x: maxX, y: 0 };
}

/**
 * generateDocsFromScratch(selectedIds)
 *
 * Main entry point for generating documentation boards. Loads fonts, builds
 * variable map, creates root frame "📚 Token Docs", iterates collections
 * (filtered by selectedIds if non-empty), builds collection frames (splitting
 * large collections by group), adds decision tree and role mapping frames,
 * updates boardRegistry, and persists to clientStorage.
 *
 * @param {Array<string>} selectedIds - Array of collection IDs to generate.
 *   If empty, all collections are generated.
 * @returns {Promise<void>}
 * @sideeffects Creates/removes Figma nodes, mutates boardRegistry,
 *   writes to clientStorage, sends postMessage to UI.
 */
async function generateDocsFromScratch(selectedIds) {
  try {
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
    await figma.loadFontAsync({ family: "Inter", style: "Bold" });
    await figma.loadFontAsync({ family: "Inter", style: "Medium" });
    await buildVarMap();

    var collections = await figma.variables.getLocalVariableCollectionsAsync();

    // Frame raiz com auto-layout horizontal — contém todos os boards lado a lado
    var rootName = "📚 Token Docs";
    var existingRoot = figma.currentPage.findOne(function(n) { return n.name === rootName; });
    var rootX = existingRoot ? existingRoot.x : 0;
    var rootY = existingRoot ? existingRoot.y : 0;
    if (existingRoot) existingRoot.remove();

    var rootFrame = figma.createFrame();
    rootFrame.name = rootName;
    rootFrame.layoutMode = "HORIZONTAL";
    rootFrame.primaryAxisSizingMode = "AUTO";
    rootFrame.counterAxisSizingMode = "AUTO";
    rootFrame.itemSpacing = 80;
    rootFrame.paddingTop = 0; rootFrame.paddingBottom = 0;
    rootFrame.paddingLeft = 0; rootFrame.paddingRight = 0;
    rootFrame.fills = [];
    rootFrame.x = rootX;
    rootFrame.y = rootY;
    figma.currentPage.appendChild(rootFrame);

    for (var ci = 0; ci < collections.length; ci++) {
      var collection = collections[ci];
      if (selectedIds.length > 0 && selectedIds.indexOf(collection.id) === -1) continue;

      var modes = collection.modes.map(function(m) { return { id: m.modeId, name: m.name }; });
      var collData = { id: collection.id, name: collection.name, modes: modes, tokens: [] };

      for (var vi = 0; vi < collection.variableIds.length; vi++) {
        var variable = await figma.variables.getVariableByIdAsync(collection.variableIds[vi]);
        if (!variable) continue;
        var token = { name: variable.name, type: variable.resolvedType, variableId: variable.id, values: {} };
        for (var mj = 0; mj < collection.modes.length; mj++) {
          var mode = collection.modes[mj];
          var r2 = await resolveChain(variable.valuesByMode[mode.modeId], variable.resolvedType, mode.modeId, 0);
          var val = r2.resolved;
          if (val && val.hex) token.values[mode.name] = { hex: val.hex, alpha: val.alpha, r: val.r, g: val.g, b: val.b, chain: r2.chain };
          else if (r2.chain.length > 0) token.values[mode.name] = { alias: r2.chain.join(" -> "), chain: r2.chain };
          else if (val !== null && val !== undefined) token.values[mode.name] = val;
          else token.values[mode.name] = null;
        }
        collData.tokens.push(token);
      }

      if (shouldSplitCollection(collData)) {
        // Collections grandes: um sub-frame por grupo, todos dentro de um wrapper vertical
        var collWrapper = figma.createFrame();
        collWrapper.name = collData.name;
        collWrapper.layoutMode = "HORIZONTAL";
        collWrapper.primaryAxisSizingMode = "AUTO";
        collWrapper.counterAxisSizingMode = "AUTO";
        collWrapper.itemSpacing = 48;
        collWrapper.paddingTop = 0; collWrapper.paddingBottom = 0;
        collWrapper.paddingLeft = 0; collWrapper.paddingRight = 0;
        collWrapper.fills = [];

        var subColls = splitCollectionByGroup(collData);
        for (var sci = 0; sci < subColls.length; sci++) {
          var subColl = subColls[sci];
          var subFrame;
          try { subFrame = await buildCollectionFrame(subColl); } catch(e) { continue; }
          collWrapper.appendChild(subFrame);
        }

        rootFrame.appendChild(collWrapper);

      } else {
        var frame;
        try { frame = await buildCollectionFrame(collData); } catch(e) { continue; }
        rootFrame.appendChild(frame);
      }
    }

    // Adiciona frame de árvore de decisão
    var decisionTreeFrame = buildDecisionTreeFrame(DECISION_TREE);
    rootFrame.appendChild(decisionTreeFrame);

    // Adiciona frame de mapeamento de roles
    var roleMappingFrame = buildRoleMappingFrame(ROLE_MAPPING);
    rootFrame.appendChild(roleMappingFrame);

    figma.viewport.scrollAndZoomIntoView([rootFrame]);
    figma.ui.postMessage({ type: "docs-done" });

    // Atualiza registry
    boardRegistry["__root__"] = { name: rootName, nodeId: rootFrame.id, x: rootFrame.x, y: rootFrame.y };
    figma.clientStorage.setAsync("boardRegistry", boardRegistry);

  } catch(err) {
    figma.ui.postMessage({ type: "error", message: "generateDocs: " + String(err) });
  }
}

/**
 * generateDocsSelective(selectedIds)
 *
 * Generates documentation boards only for the selected collections,
 * preserving the root frame and boards of non-selected collections.
 *
 * Algorithm:
 * 1. If selectedIds is empty, sends a warning message to the UI and returns.
 * 2. Finds or creates the root frame "📚 Token Docs".
 * 3. For each selected collection:
 *    a. If a board already exists in the root frame, removes only that board.
 *    b. Generates a new board with buildCollectionFrame().
 *    c. Inserts the new board into the root frame.
 * 4. Boards of non-selected collections remain intact.
 * 5. Updates boardRegistry and persists to clientStorage.
 *
 * @param {Array<string>} selectedIds - Array of collection IDs to generate.
 * @returns {Promise<void>}
 * @sideeffects Creates/removes Figma nodes, mutates boardRegistry,
 *   writes to clientStorage, sends postMessage to UI.
 */
async function generateDocsSelective(selectedIds) {
  if (!selectedIds || selectedIds.length === 0) {
    figma.ui.postMessage({ type: "warning", message: "Nenhuma collection selecionada" });
    return;
  }

  try {
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
    await figma.loadFontAsync({ family: "Inter", style: "Bold" });
    await figma.loadFontAsync({ family: "Inter", style: "Medium" });
    await buildVarMap();

    var collections = await figma.variables.getLocalVariableCollectionsAsync();

    // Busca ou cria o root frame
    var rootName = "📚 Token Docs";
    var rootFrame = figma.currentPage.findOne(function(n) { return n.name === rootName; });

    if (!rootFrame) {
      rootFrame = figma.createFrame();
      rootFrame.name = rootName;
      rootFrame.layoutMode = "HORIZONTAL";
      rootFrame.primaryAxisSizingMode = "AUTO";
      rootFrame.counterAxisSizingMode = "AUTO";
      rootFrame.itemSpacing = 80;
      rootFrame.paddingTop = 0; rootFrame.paddingBottom = 0;
      rootFrame.paddingLeft = 0; rootFrame.paddingRight = 0;
      rootFrame.fills = [];
      rootFrame.x = 0;
      rootFrame.y = 0;
      figma.currentPage.appendChild(rootFrame);
    }

    // Para cada collection selecionada, remove board existente e gera novo
    for (var ci = 0; ci < collections.length; ci++) {
      var collection = collections[ci];
      if (selectedIds.indexOf(collection.id) === -1) continue;

      // Remove boards existentes desta collection do root frame
      var childrenToRemove = [];
      for (var ri = 0; ri < rootFrame.children.length; ri++) {
        var child = rootFrame.children[ri];
        var childName = child.name;
        // Match exact collection name (with or without 📘 prefix)
        var cleanName = childName.indexOf("📘 ") === 0 ? childName.replace("📘 ", "") : childName;
        if (cleanName === collection.name || cleanName.indexOf(collection.name + " / ") === 0) {
          childrenToRemove.push(child);
        }
      }
      for (var rj = 0; rj < childrenToRemove.length; rj++) {
        childrenToRemove[rj].remove();
      }

      // Remove registry entries for this collection
      var regKeys = Object.keys(boardRegistry);
      for (var rk = 0; rk < regKeys.length; rk++) {
        if (regKeys[rk] === collection.id || regKeys[rk].indexOf(collection.id + "__") === 0) {
          removeBoardRegistryEntry(regKeys[rk]);
        }
      }

      // Build collection data
      var modes = collection.modes.map(function(m) { return { id: m.modeId, name: m.name }; });
      var collData = { id: collection.id, name: collection.name, modes: modes, tokens: [] };

      for (var vi = 0; vi < collection.variableIds.length; vi++) {
        var variable = await figma.variables.getVariableByIdAsync(collection.variableIds[vi]);
        if (!variable) continue;
        var token = { name: variable.name, type: variable.resolvedType, variableId: variable.id, values: {} };
        for (var mj = 0; mj < collection.modes.length; mj++) {
          var mode = collection.modes[mj];
          var r2 = await resolveChain(variable.valuesByMode[mode.modeId], variable.resolvedType, mode.modeId, 0);
          var val = r2.resolved;
          if (val && val.hex) token.values[mode.name] = { hex: val.hex, alpha: val.alpha, r: val.r, g: val.g, b: val.b, chain: r2.chain };
          else if (r2.chain.length > 0) token.values[mode.name] = { alias: r2.chain.join(" -> "), chain: r2.chain };
          else if (val !== null && val !== undefined) token.values[mode.name] = val;
          else token.values[mode.name] = null;
        }
        collData.tokens.push(token);
      }

      // Generate board(s) for this collection
      if (shouldSplitCollection(collData)) {
        var collWrapper = figma.createFrame();
        collWrapper.name = collData.name;
        collWrapper.layoutMode = "HORIZONTAL";
        collWrapper.primaryAxisSizingMode = "AUTO";
        collWrapper.counterAxisSizingMode = "AUTO";
        collWrapper.itemSpacing = 48;
        collWrapper.paddingTop = 0; collWrapper.paddingBottom = 0;
        collWrapper.paddingLeft = 0; collWrapper.paddingRight = 0;
        collWrapper.fills = [];

        var subColls = splitCollectionByGroup(collData);
        for (var sci = 0; sci < subColls.length; sci++) {
          var subColl = subColls[sci];
          var subFrame;
          try { subFrame = await buildCollectionFrame(subColl); } catch(e) { continue; }
          collWrapper.appendChild(subFrame);
        }

        rootFrame.appendChild(collWrapper);
      } else {
        var frame;
        try { frame = await buildCollectionFrame(collData); } catch(e) { continue; }
        rootFrame.appendChild(frame);
      }

      // Build token snapshot for registry
      var snapshot = {};
      for (var si = 0; si < collData.tokens.length; si++) {
        snapshot[collData.tokens[si].name] = tokenValueHash(collData.tokens[si]);
      }

      // Update registry entry for this collection
      var boardNode = rootFrame.children[rootFrame.children.length - 1];
      updateBoardRegistryEntry(collection.id, boardNode.id, boardNode.x, boardNode.y, snapshot);
    }

    // Update root registry entry
    boardRegistry["__root__"] = { name: rootName, nodeId: rootFrame.id, x: rootFrame.x, y: rootFrame.y };

    figma.viewport.scrollAndZoomIntoView([rootFrame]);
    figma.ui.postMessage({ type: "docs-done" });
    figma.clientStorage.setAsync("boardRegistry", boardRegistry);

  } catch(err) {
    figma.ui.postMessage({ type: "error", message: "generateDocsSelective: " + String(err) });
  }
}

/**
 * updateDocsIncremental(selectedIds)
 *
 * Incrementally updates existing boards for the selected collections
 * without removing and recreating them. Preserves board positions on canvas.
 *
 * Algorithm:
 * 1. If selectedIds is empty, sends a warning message to the UI and returns.
 * 2. For each selected collection:
 *    a. Looks up existing board via boardRegistry (getBoardForCollection).
 *    b. If board not found → fallback to generateDocsSelective for that collection.
 *    c. If board found:
 *       i.   Saves position (x, y) of the existing board.
 *       ii.  Computes diff via diffTokenSnapshots between saved tokenSnapshot and current tokens.
 *       iii. If diff is empty (no added, removed, or changed) → skip.
 *       iv.  If diff has changes → regenerates board preserving position.
 *       v.   Updates tokenSnapshot in registry.
 * 3. Persists boardRegistry to clientStorage after update.
 *
 * @param {Array<string>} selectedIds - Array of collection IDs to update.
 * @returns {Promise<void>}
 * @sideeffects Creates/removes Figma nodes, mutates boardRegistry,
 *   writes to clientStorage, sends postMessage to UI.
 *
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6
 */
async function updateDocsIncremental(selectedIds) {
  if (!selectedIds || selectedIds.length === 0) {
    figma.ui.postMessage({ type: "warning", message: "Nenhuma collection selecionada" });
    return;
  }

  try {
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
    await figma.loadFontAsync({ family: "Inter", style: "Bold" });
    await figma.loadFontAsync({ family: "Inter", style: "Medium" });
    await buildVarMap();

    var collections = await figma.variables.getLocalVariableCollectionsAsync();
    var fallbackIds = [];

    for (var ci = 0; ci < collections.length; ci++) {
      var collection = collections[ci];
      if (selectedIds.indexOf(collection.id) === -1) continue;

      // Look up existing board via boardRegistry
      var existingBoard = getBoardForCollection(collection.id);

      if (!existingBoard) {
        // Board not found → collect for fallback generation
        fallbackIds.push(collection.id);
        continue;
      }

      // Board found — save position
      var savedX = existingBoard.x;
      var savedY = existingBoard.y;

      // Build current token data for this collection
      var modes = collection.modes.map(function(m) { return { id: m.modeId, name: m.name }; });
      var collData = { id: collection.id, name: collection.name, modes: modes, tokens: [] };

      for (var vi = 0; vi < collection.variableIds.length; vi++) {
        var variable = await figma.variables.getVariableByIdAsync(collection.variableIds[vi]);
        if (!variable) continue;
        var token = { name: variable.name, type: variable.resolvedType, variableId: variable.id, values: {} };
        for (var mj = 0; mj < collection.modes.length; mj++) {
          var mode = collection.modes[mj];
          var r2 = await resolveChain(variable.valuesByMode[mode.modeId], variable.resolvedType, mode.modeId, 0);
          var val = r2.resolved;
          if (val && val.hex) token.values[mode.name] = { hex: val.hex, alpha: val.alpha, r: val.r, g: val.g, b: val.b, chain: r2.chain };
          else if (r2.chain.length > 0) token.values[mode.name] = { alias: r2.chain.join(" -> "), chain: r2.chain };
          else if (val !== null && val !== undefined) token.values[mode.name] = val;
          else token.values[mode.name] = null;
        }
        collData.tokens.push(token);
      }

      // Build new snapshot
      var newSnapshot = {};
      for (var si = 0; si < collData.tokens.length; si++) {
        newSnapshot[collData.tokens[si].name] = tokenValueHash(collData.tokens[si]);
      }

      // Get old snapshot from registry
      var registryEntry = boardRegistry[collection.id];
      var oldSnapshot = (registryEntry && registryEntry.tokenSnapshot) ? registryEntry.tokenSnapshot : {};

      // Compute diff
      var diff = diffTokenSnapshots(oldSnapshot, collData.tokens);

      // If no changes, skip this collection
      if (diff.added.length === 0 && diff.removed.length === 0 && diff.changed.length === 0) {
        continue;
      }

      // Diff has changes → regenerate board preserving position
      // Find the parent of the existing board to insert the new one in the same place
      var parentNode = existingBoard.parent;
      var insertIndex = -1;
      if (parentNode) {
        for (var pi = 0; pi < parentNode.children.length; pi++) {
          if (parentNode.children[pi].id === existingBoard.id) {
            insertIndex = pi;
            break;
          }
        }
      }

      // Remove old board
      existingBoard.remove();

      // Generate new board
      if (shouldSplitCollection(collData)) {
        var collWrapper = figma.createFrame();
        collWrapper.name = collData.name;
        collWrapper.layoutMode = "HORIZONTAL";
        collWrapper.primaryAxisSizingMode = "AUTO";
        collWrapper.counterAxisSizingMode = "AUTO";
        collWrapper.itemSpacing = 48;
        collWrapper.paddingTop = 0; collWrapper.paddingBottom = 0;
        collWrapper.paddingLeft = 0; collWrapper.paddingRight = 0;
        collWrapper.fills = [];

        var subColls = splitCollectionByGroup(collData);
        for (var sci = 0; sci < subColls.length; sci++) {
          var subColl = subColls[sci];
          var subFrame;
          try { subFrame = await buildCollectionFrame(subColl); } catch(e) { continue; }
          collWrapper.appendChild(subFrame);
        }

        if (parentNode && insertIndex !== -1) {
          parentNode.insertChild(insertIndex, collWrapper);
        } else if (parentNode) {
          parentNode.appendChild(collWrapper);
        } else {
          figma.currentPage.appendChild(collWrapper);
        }

        // Preserve position
        collWrapper.x = savedX;
        collWrapper.y = savedY;

        // Update registry
        updateBoardRegistryEntry(collection.id, collWrapper.id, savedX, savedY, newSnapshot);
      } else {
        var frame;
        try { frame = await buildCollectionFrame(collData); } catch(e) { continue; }

        if (parentNode && insertIndex !== -1) {
          parentNode.insertChild(insertIndex, frame);
        } else if (parentNode) {
          parentNode.appendChild(frame);
        } else {
          figma.currentPage.appendChild(frame);
        }

        // Preserve position
        frame.x = savedX;
        frame.y = savedY;

        // Update registry
        updateBoardRegistryEntry(collection.id, frame.id, savedX, savedY, newSnapshot);
      }
    }

    // Handle fallback collections (boards not found in registry)
    if (fallbackIds.length > 0) {
      await generateDocsSelective(fallbackIds);
    }

    // Persist boardRegistry to clientStorage
    figma.clientStorage.setAsync("boardRegistry", boardRegistry);
    figma.ui.postMessage({ type: "docs-done" });

  } catch(err) {
    figma.ui.postMessage({ type: "error", message: "updateDocsIncremental: " + String(err) });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SEÇÃO 9: POLLING E AUTO-UPDATE
// Monitoramento periódico de variáveis e atualização automática de boards
// quando mudanças são detectadas.
// ═══════════════════════════════════════════════════════════════════════════

/**
 * buildSnapshotMap()
 *
 * Constrói um mapa de snapshot de todas as variáveis locais do Figma,
 * indexando cada variável por ID e serializando seus valores por modo.
 * Usado para detectar mudanças entre ciclos de polling.
 *
 * @returns {Promise<Object>} Mapa { variableId: { modeId: valorSerializado } }
 * @sideeffect Lê todas as variáveis locais via API assíncrona do Figma.
 */
async function buildSnapshotMap() {
  var map = {};
  try {
    var all = await figma.variables.getLocalVariablesAsync();
    for (var i = 0; i < all.length; i++) {
      var v = all[i];
      map[v.id] = {};
      var modeIds = Object.keys(v.valuesByMode);
      for (var j = 0; j < modeIds.length; j++) {
        var val = v.valuesByMode[modeIds[j]];
        map[v.id][modeIds[j]] = (val && typeof val === "object") ? JSON.stringify(val) : String(val);
      }
    }
  } catch(e) {}
  return map;
}

/**
 * diffSnapshots(oldMap, newMap)
 *
 * Compara dois mapas de snapshot de variáveis e retorna os IDs das
 * variáveis que foram adicionadas ou cujos valores mudaram.
 *
 * @param {Object} oldMap - Snapshot anterior { variableId: { modeId: valor } }.
 * @param {Object} newMap - Snapshot atual { variableId: { modeId: valor } }.
 * @returns {Array<string>} IDs das variáveis que mudaram ou foram adicionadas.
 */
function diffSnapshots(oldMap, newMap) {
  var changed = [];
  var allIds = Object.keys(newMap);
  for (var i = 0; i < allIds.length; i++) {
    var id = allIds[i];
    if (!oldMap[id]) { changed.push(id); continue; }
    var newModes = Object.keys(newMap[id]);
    for (var j = 0; j < newModes.length; j++) {
      if (oldMap[id][newModes[j]] !== newMap[id][newModes[j]]) { changed.push(id); break; }
    }
  }
  return changed;
}

/**
 * pollForChanges()
 *
 * Verifica se houve mudanças nas variáveis desde o último snapshot.
 * Se detectar alterações, regenera todos os boards e atualiza o registry.
 * Protegida contra reentrada via flag isAutoUpdating.
 *
 * @returns {Promise<void>}
 * @sideeffect Atualiza varSnapshotMap, boardRegistry e clientStorage.
 *             Envia mensagens "auto-updating" e "auto-updated" para a UI.
 */
async function pollForChanges() {
  if (isAutoUpdating) return;
  if (Object.keys(boardRegistry).length === 0) return;
  var newMap = await buildSnapshotMap();
  var changed = diffSnapshots(varSnapshotMap, newMap);
  if (changed.length === 0) return;
  varSnapshotMap = newMap;
  isAutoUpdating = true;
  figma.ui.postMessage({ type: "auto-updating", count: changed.length });
  try {
    var ids = Object.keys(boardRegistry).filter(function(k) { return k.indexOf("__") === -1; });
    await generateDocsFromScratch(ids);
    await syncBoardRegistry();
    figma.clientStorage.setAsync("varSnapshotMap", newMap);
    figma.clientStorage.setAsync("boardRegistry", boardRegistry);
    figma.ui.postMessage({ type: "auto-updated", patched: changed.length });
  } catch(e) {}
  isAutoUpdating = false;
}

/**
 * startPolling()
 *
 * Inicia o timer de polling que verifica mudanças nas variáveis a cada
 * 2 segundos. Se o timer já estiver ativo, não cria um novo.
 *
 * @returns {void}
 * @sideeffect Define pollTimer via setInterval.
 */
function startPolling() {
  if (pollTimer) return;
  pollTimer = setInterval(function() { pollForChanges(); }, 2000);
}

// ═══════════════════════════════════════════════════════════════════════════
// SEÇÃO 10: EXPORTAÇÃO MARKDOWN
// Geração de documentação em formato Markdown a partir dos dados de tokens.
// ═══════════════════════════════════════════════════════════════════════════

/**
 * generateMarkdownDocs(collectionsData)
 *
 * Gera documentação completa em formato Markdown a partir dos dados de
 * tokens exportados. Inclui regras de consumo para IAs, arquitetura de
 * camadas, e tabelas de tokens agrupados por grupo semântico.
 *
 * @param {Array<Object>} collectionsData - Array de collections com tokens resolvidos.
 *   Cada collection: { name, modes: [{ name }], tokens: [{ name, values }] }
 * @returns {string} Documento Markdown completo.
 */
function generateMarkdownDocs(collectionsData) {
  var lines = [];
  lines.push("# Design System - Documentacao de Tokens");
  lines.push("");
  lines.push("> Gerado automaticamente pelo Token Docs Plugin - " + new Date().toLocaleDateString("pt-BR"));
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push("## Para IAs: Regras de Consumo");
  lines.push("");
  lines.push("### Arquitetura de 4 camadas");
  lines.push("- **Base Tokens (Foundations)** — valores brutos, NUNCA usar em UI");
  lines.push("- **Brand Tokens** — filtro dos Base por marca, evitar uso direto");
  lines.push("- **Usage Tokens** — camada principal de consumo (Dynamic, Interactive, Static, Inputable, Core, Elevation)");
  lines.push("- **Component Tokens** — uso restrito ao time de System Ops");
  lines.push("- **Theme Tokens** = Brand + Usage (prefixo LfThm)");
  lines.push("");
  lines.push("### Regras");
  lines.push("- NUNCA use Base Tokens diretamente em UI");
  lines.push("- NUNCA use Brand Tokens diretamente em UI");
  lines.push("- SEMPRE use Usage Tokens (camada principal)");
  lines.push("- text -> tokens on-surface | container -> tokens surface | border -> tokens border");
  lines.push("- Se background = brand -> OBRIGATORIO usar token on-surface correspondente (contraste minimo AA 4.5:1)");
  lines.push("- Maximo 1 elemento primary por area de acao visivel");
  lines.push("- Cada surface tem um on-surface do MESMO grupo e hierarquia");
  lines.push("");
  lines.push("### Marcas suportadas");
  lines.push("Estacio, Wyden, YDUQS, Ibmec, Idomed, Damasio, Ensine.me, Estacio Curso Tecnico");
  lines.push("- 2 modos por marca: Default e High Contrast");
  lines.push("");
  lines.push("### Cadeia de aliases");
  lines.push("Usage -> Brand -> Base -> valor");
  lines.push("Ex: Dynamic/Primary/Surface/Default -> Brand/Color/Primary/500 -> saphire/500 -> #076AEA");
  lines.push("");
  lines.push("---");
  lines.push("");

  for (var ci = 0; ci < collectionsData.length; ci++) {
    var coll = collectionsData[ci];
    lines.push("# " + coll.name);
    lines.push("");
    var groups = {};
    for (var ti = 0; ti < coll.tokens.length; ti++) {
      var gKey = coll.tokens[ti].name.split("/")[0].toLowerCase();
      if (!groups[gKey]) groups[gKey] = [];
      groups[gKey].push(coll.tokens[ti]);
    }
    var gKeys = Object.keys(groups);
    for (var gi = 0; gi < gKeys.length; gi++) {
      var gk = gKeys[gi];
      var meta = GROUP_META[gk];
      lines.push("## " + (meta ? meta.label : gk));
      lines.push("");
      if (meta) { lines.push(meta.description); lines.push(""); }
      var modeNames = coll.modes.map(function(m) { return m.name; });
      lines.push("| Token | " + modeNames.join(" | ") + " |");
      lines.push("|-------|" + modeNames.map(function() { return "-------|"; }).join(""));
      for (var tki = 0; tki < groups[gk].length; tki++) {
        var tok = groups[gk][tki];
        var shortName = tok.name.split("/").slice(1).join("/") || tok.name;
        var row = "| `" + shortName + "` |";
        for (var mni = 0; mni < modeNames.length; mni++) {
          var v = tok.values[modeNames[mni]];
          var disp = "—";
          if (v && v.hex) {
            var ch = Array.isArray(v.chain) ? v.chain : [];
            disp = ch.length ? ch.join(" -> ") + " -> " + v.hex.toUpperCase() : v.hex.toUpperCase();
          } else if (v && v.alias) { disp = "-> " + v.alias; }
          else if (v !== null && v !== undefined) { disp = String(v); }
          row += " " + disp + " |";
        }
        lines.push(row);
      }
      lines.push("");
    }
  }
  return lines.join("\n");
}

// ═══════════════════════════════════════════════════════════════════════════
// SEÇÃO 11: TOKEN ENGINE / REGISTRY
// Indexação, normalização e lookup de tokens. Inclui detecção de layer,
// categoria, tipo, role, variação, normalização Storybook e builders.
// Também inclui composição semântica e sugestão de tokens para nós.
// ═══════════════════════════════════════════════════════════════════════════

// ── Composição semântica e sugestão de tokens ──

/**
 * detectComposition(node)
 *
 * Analisa um nó do Figma e detecta sua composição semântica: grupo
 * (dynamic, interactive, static, inputable, elevation), role, estado,
 * layer e feedback. Usa o nome do nó e heurísticas de tipo de componente.
 *
 * @param {Object} node - Nó do Figma (SceneNode).
 * @returns {Object} Composição detectada com campos: semanticGroup, role,
 *   state, layer, feedback, isText, isContainer.
 */
function detectComposition(node) {
  var comp = { semanticGroup: null, role: null, state: "default", layer: null, feedback: null,
    isText: node.type === "TEXT", isContainer: ["FRAME","COMPONENT","INSTANCE","GROUP","SECTION"].indexOf(node.type) !== -1 };
  var name = (node.name || "").toLowerCase();
  var parts = name.split(/[\s\/\-_\.]+/);
  var groups = ["dynamic","interactive","static","inputable","core","elevation"];
  for (var i = 0; i < groups.length; i++) { if (parts.indexOf(groups[i]) !== -1) { comp.semanticGroup = groups[i]; break; } }
  if (!comp.semanticGroup) {
    if (/button|btn|cta|submit/.test(name)) comp.semanticGroup = "dynamic";
    else if (/accordion|tab|tooltip|dropdown/.test(name)) comp.semanticGroup = "interactive";
    else if (/card|banner|badge|divider/.test(name)) comp.semanticGroup = "static";
    else if (/input|field|checkbox|radio|select|switch|toggle/.test(name)) comp.semanticGroup = "inputable";
    else if (/modal|dialog|drawer|popover|overlay/.test(name)) comp.semanticGroup = "elevation";
  }
  if (/primary/.test(name)) comp.role = "primary";
  else if (/secondary/.test(name)) comp.role = "secondary";
  else if (/brand/.test(name)) comp.role = "brand";
  if (/hover/.test(name)) comp.state = "hover";
  else if (/active|pressed/.test(name)) comp.state = "active";
  else if (/disabled/.test(name)) comp.state = "disabled";
  else if (/error/.test(name)) comp.state = "error";
  if (/success/.test(name)) comp.feedback = "success";
  else if (/warning/.test(name)) comp.feedback = "warning";
  else if (/critical|error|danger/.test(name)) comp.feedback = "critical";
  if (comp.isText) comp.layer = "on-surface";
  else if (comp.isContainer) comp.layer = "surface";
  return comp;
}

/**
 * isCoreToken(variable)
 *
 * Verifica se uma variável é um token Core/Base (não semântico).
 * Tokens Core têm nomes curtos (até 3 segmentos) com sufixo numérico
 * e não pertencem a grupos semânticos (dynamic, interactive, etc.).
 *
 * @param {Object|null} variable - Variável do Figma.
 * @returns {boolean} true se for token Core/Base.
 */
function isCoreToken(variable) {
  if (!variable) return false;
  var name = (variable.name || "").toLowerCase();
  var semanticPrefixes = ["dynamic","interactive","static","inputable","elevation"];
  for (var i = 0; i < semanticPrefixes.length; i++) { if (name.indexOf(semanticPrefixes[i]) !== -1) return false; }
  var parts = name.split("/");
  return parts.length <= 3 && /\d/.test(parts[parts.length - 1]);
}

/**
 * suggestForProperty(node, propType, currentHex, composition, allLocalVars)
 *
 * Sugere até 3 tokens adequados para uma propriedade de um nó, com base
 * na composição semântica detectada. Pontua candidatos por grupo, layer,
 * role, feedback e estado. Penaliza tokens Core.
 *
 * @param {Object} node - Nó do Figma.
 * @param {string} propType - Tipo da propriedade ("fill", "stroke", "text").
 * @param {string|null} currentHex - Valor hex atual da propriedade.
 * @param {Object} composition - Composição semântica do nó (de detectComposition).
 * @param {Array<Object>} allLocalVars - Todas as variáveis locais do Figma.
 * @returns {Array<Object>} Até 3 sugestões com tokenName, tokenId, score, reason, isCore.
 */
function suggestForProperty(node, propType, currentHex, composition, allLocalVars) {
  var suggestions = [];
  var expectedLayer = composition.layer;
  if (propType === "stroke") expectedLayer = "border";
  if (propType === "text" || (propType === "fill" && composition.isText)) expectedLayer = "on-surface";
  var group = composition.semanticGroup;
  var role = composition.role || "neutral";
  var state = composition.state || "default";
  var feedback = composition.feedback;
  var candidates = [];
  for (var i = 0; i < allLocalVars.length; i++) {
    var v = allLocalVars[i];
    if (v.resolvedType !== "COLOR") continue;
    var vName = (v.name || "").toLowerCase();
    var score = 0;
    if (group && vName.indexOf(group) !== -1) score += 40;
    if (expectedLayer) {
      if (expectedLayer === "on-surface" && vName.indexOf("on-surface") !== -1) score += 30;
      else if (expectedLayer === "surface" && vName.indexOf("surface") !== -1 && vName.indexOf("on-surface") === -1) score += 30;
      else if (expectedLayer === "border" && (vName.indexOf("border") !== -1 || vName.indexOf("stroke") !== -1)) score += 30;
    }
    if (role !== "neutral" && vName.indexOf(role) !== -1) score += 20;
    if (feedback && vName.indexOf(feedback) !== -1) score += 25;
    if (state !== "default" && vName.indexOf(state) !== -1) score += 15;
    if (isCoreToken(v)) score -= 50;
    if (score > 0) candidates.push({ token: v, score: score });
  }
  candidates.sort(function(a, b) { return b.score - a.score; });
  for (var ci = 0; ci < Math.min(3, candidates.length); ci++) {
    var c = candidates[ci];
    suggestions.push({ tokenName: c.token.name, tokenId: c.token.id, score: c.score,
      reason: "Sugerido por: " + (group || "") + " " + (expectedLayer || "") + " " + (role !== "neutral" ? role : ""),
      isCore: isCoreToken(c.token) });
  }
  return suggestions;
}

// ── Registro de tokens ──

var tokenRegistry = {
  byName: {},       // "Brand/Color/Primary/500" -> entry
  byNameNoSpace: {},// "Brand/Color/Primary/500" (sem espaços nos segmentos)
  byValue: {},      // "#076AEA" -> [entry, ...]
  byLayer: {        // layer -> [entry, ...]
    base: [], brand: [], usage: [], component: [], screen: []
  },
  byCategory: {},   // "color" -> [...], "spacing" -> [...]
  byType: {},       // "surface" -> [...], "on-surface" -> [...]
  byRole: {},       // "dynamic" -> [...], "neutral" -> [...]
  entries: []       // flat list
};

// ── Layer detection ──
// Priority: collection name > token name prefix > fallback

var LAYER_BY_COLLECTION = {
  "base": "base", "primitive": "base", "foundation": "base",
  "brand": "brand",
  "usage": "usage", "semantic": "usage",
  "component": "component",
  "screen": "screen", "responsive": "screen"
};

var LAYER_BY_PREFIX = {
  "core": "usage", "base": "base", "primitive": "base",
  "brand": "brand",
  "dynamic": "usage", "interactive": "usage", "static": "usage", "inputable": "usage", "elevation": "usage",
  "component": "component", "screen": "screen"
};

/**
 * detectLayer(tokenName, collectionName)
 *
 * Detecta a camada (layer) de um token com base no nome da collection
 * e no prefixo do nome do token. Prioridade: collection > prefixo > fallback.
 * Camadas possíveis: base, brand, usage, component, screen.
 *
 * @param {string} tokenName - Nome completo do token (ex: "Dynamic/Primary/Surface/Default").
 * @param {string} collectionName - Nome da collection do Figma (ex: "Usage Collection").
 * @returns {string} Camada detectada ("base", "brand", "usage", "component" ou "screen").
 */
function detectLayer(tokenName, collectionName) {
  // 1. By collection name keywords
  var collLower = (collectionName || "").toLowerCase();
  var collKeys = Object.keys(LAYER_BY_COLLECTION);
  for (var i = 0; i < collKeys.length; i++) {
    if (collLower.indexOf(collKeys[i]) !== -1) return LAYER_BY_COLLECTION[collKeys[i]];
  }
  // 2. By first segment of token name
  var firstSeg = tokenName.toLowerCase().split("/")[0].replace(/\s+/g, "");
  if (LAYER_BY_PREFIX[firstSeg]) return LAYER_BY_PREFIX[firstSeg];
  // 3. Fallback: if has numeric suffix (e.g. /500) likely brand
  if (/\/\d+$/.test(tokenName)) return "brand";
  return "brand";
}

// ── Category detection ──

/**
 * CATEGORY_KEYWORDS
 *
 * Mapa de categorias para palavras-chave usadas na detecção automática
 * de categoria de um token pelo nome.
 */
var CATEGORY_KEYWORDS = {
  color: ["color","fill","surface","background","foreground","stroke","border","icon","text","on-surface","on-container"],
  spacing: ["spacing","space","gap","margin","padding","inset","offset"],
  typography: ["typography","font","family","weight","size","line-height","letter-spacing","paragraph","display","heading","body","caption","label","overline","link"],
  radius: ["radius","corner","rounded"],
  shadow: ["shadow","elevation","blur"],
  opacity: ["opacity","alpha","transparent"]
};

/**
 * detectCategory(name)
 *
 * Detecta a categoria semântica de um token (color, spacing, typography,
 * radius, shadow, opacity) com base em palavras-chave presentes no nome.
 * Retorna "color" como fallback padrão.
 *
 * @param {string} name - Nome completo do token.
 * @returns {string} Categoria detectada (ex: "color", "spacing", "typography").
 */
function detectCategory(name) {
  var lower = name.toLowerCase();
  var catKeys = Object.keys(CATEGORY_KEYWORDS);
  for (var ci = 0; ci < catKeys.length; ci++) {
    var keywords = CATEGORY_KEYWORDS[catKeys[ci]];
    for (var ki = 0; ki < keywords.length; ki++) {
      if (lower.indexOf(keywords[ki]) !== -1) return catKeys[ci];
    }
  }
  return "color"; // default
}

// ── Type detection (surface, on-surface, border, text, icon, padding) ──

/**
 * detectTokenType(name)
 *
 * Detecta o tipo estrutural de um token (surface, on-surface, on-container,
 * container, border, icon, text, padding, spacing) a partir do nome.
 * Verifica termos compostos primeiro (on-surface, on-container) para evitar
 * falsos positivos com "surface" ou "container" isolados.
 *
 * @param {string} name - Nome completo do token.
 * @returns {string|null} Tipo detectado, ou null se nenhum padrão encontrado.
 */
function detectTokenType(name) {
  var lower = name.toLowerCase();
  var joined = lower.replace(/[\s\/]+/g, "-");
  // Order matters: check compound terms first
  if (joined.indexOf("on-surface") !== -1 || joined.indexOf("onsurface") !== -1) return "on-surface";
  if (joined.indexOf("on-container") !== -1 || joined.indexOf("oncontainer") !== -1) return "on-container";
  if (lower.indexOf("surface") !== -1) return "surface";
  if (lower.indexOf("container") !== -1) return "container";
  if (lower.indexOf("border") !== -1 || lower.indexOf("stroke") !== -1 || lower.indexOf("outline") !== -1) return "border";
  if (lower.indexOf("icon") !== -1) return "icon";
  if (lower.indexOf("text") !== -1) return "text";
  if (lower.indexOf("padding") !== -1 || lower.indexOf("margin") !== -1) return "padding";
  if (lower.indexOf("gap") !== -1 || lower.indexOf("spacing") !== -1) return "spacing";
  return null;
}

// ── Role detection (semantic group) ──

/**
 * detectTokenRole(parts)
 *
 * Detecta o papel semântico (role) de um token a partir das partes do nome.
 * Roles possíveis: dynamic, interactive, static, inputable, core, elevation,
 * brand, neutral, feedback. Retorna "neutral" como fallback.
 *
 * @param {Array<string>} parts - Partes do nome do token em lowercase.
 * @returns {string} Role detectada (ex: "dynamic", "neutral").
 */
function detectTokenRole(parts) {
  var roles = ["dynamic","interactive","static","inputable","core","elevation","brand","neutral","feedback"];
  for (var i = 0; i < roles.length; i++) {
    if (parts.indexOf(roles[i]) !== -1) return roles[i];
  }
  return "neutral";
}

// ── Variation detection ──

/**
 * detectVariation(parts)
 *
 * Detecta a variação de um token (primary, secondary, tertiary, neutral,
 * brand, high, medium, low, inverse, default) a partir das partes do nome.
 * Retorna "default" como fallback.
 *
 * @param {Array<string>} parts - Partes do nome do token em lowercase.
 * @returns {string} Variação detectada (ex: "primary", "default").
 */
function detectVariation(parts) {
  var variations = {
    "primary": "primary", "secondary": "secondary", "tertiary": "tertiary",
    "neutral": "neutral", "brand": "brand",
    "high": "high", "medium": "medium", "low": "low",
    "inverse": "inverse", "default": "default"
  };
  var vKeys = Object.keys(variations);
  for (var i = 0; i < vKeys.length; i++) {
    if (parts.indexOf(vKeys[i]) !== -1) return variations[vKeys[i]];
  }
  return "default";
}

// ── Storybook name normalization ──

/**
 * sbNameToFigma(name)
 *
 * Converte um nome de token no formato Storybook/npm (camelCase com prefixo
 * "LfThm") para o formato Figma (segmentos separados por "/").
 * Exemplo: "LfThmBrandColorPrimary500" → "Brand/Color/Primary/500".
 *
 * @param {string} name - Nome do token no formato Storybook (ex: "LfThmBrandColorPrimary500").
 * @returns {string} Nome no formato Figma (ex: "Brand/Color/Primary/500").
 */
function sbNameToFigma(name) {
  var s = name.replace(/^LfThm/, "");
  var result = s
    .replace(/([A-Z][a-z]+)([0-9]+)/g, "$1/$2")
    .replace(/([a-z])([A-Z])/g, "$1/$2")
    .replace(/([A-Z][a-z]+)([A-Z])/g, "$1/$2");
  return result.split("/").map(function(seg) {
    return seg.charAt(0).toUpperCase() + seg.slice(1);
  }).join("/");
}

// ── Semantic normalization ──

/**
 * normalizeToSemantic(name)
 *
 * Normaliza o nome de um token para uma chave semântica no formato
 * "category.type.role.variation[.state]". Combina detecção de categoria,
 * tipo, role, variação e estado.
 * Exemplo: "Brand/Color/Primary/500" → "color.surface.brand.primary".
 *
 * @param {string} name - Nome completo do token.
 * @returns {string} Chave semântica normalizada.
 */
function normalizeToSemantic(name) {
  var parts = name.toLowerCase().split(/[\s\/\.\-_]+/);
  var category = detectCategory(name);
  var type = detectTokenType(name) || "unknown";
  var role = detectTokenRole(parts);
  var variation = detectVariation(parts);
  var state = detectState(parts);
  var result = category + "." + type + "." + role + "." + variation;
  if (state && state !== "default") result += "." + state;
  return result;
}

// ── Token entry builder ──

/**
 * buildTokenEntry(name, value, figmaId, source, collectionName)
 *
 * Constrói um objeto de entrada de token com todos os metadados semânticos
 * detectados automaticamente: nome normalizado, categoria, tipo, role,
 * variação, estado, layer, feedback e valor.
 *
 * @param {string} name - Nome completo do token (ex: "Dynamic/Primary/Surface/Default").
 * @param {*} value - Valor do token (hex string para cores, ou outro tipo).
 * @param {string|null} figmaId - ID da variável no Figma, ou null.
 * @param {string} source - Origem do token ("figma" ou "storybook").
 * @param {string|null} collectionName - Nome da collection de origem, ou null.
 * @returns {Object} Entrada de token com campos: name, normalizedName, category,
 *   type, role, variation, state, layer, feedback, value, figmaId, source, isColor,
 *   collectionName.
 */
function buildTokenEntry(name, value, figmaId, source, collectionName) {
  var parts = name.toLowerCase().split(/[\s\/\.\-_]+/);
  var isColor = typeof value === "string" && /^#[0-9a-fA-F]{3,8}$/.test(value);

  return {
    name: name,
    normalizedName: normalizeToSemantic(name),
    category: detectCategory(name),
    type: detectTokenType(name),
    role: detectTokenRole(parts),
    variation: detectVariation(parts),
    state: detectState(parts),
    layer: detectLayer(name, collectionName),
    feedback: detectFeedback(parts),
    value: isColor ? value.toUpperCase() : value,
    figmaId: figmaId || null,
    source: source || "figma",
    isColor: isColor,
    collectionName: collectionName || null
  };
}

// ── Registry builders ──

/**
 * indexEntry(entry)
 *
 * Indexa uma entrada de token no tokenRegistry em todos os índices:
 * byName, byNameNoSpace, byValue (para cores), byLayer, byCategory,
 * byType e byRole. Também adiciona à lista flat entries.
 *
 * @param {Object} entry - Entrada de token criada por buildTokenEntry.
 * @returns {void}
 * @sideeffect Modifica o objeto global tokenRegistry.
 */
function indexEntry(entry) {
  tokenRegistry.entries.push(entry);

  // byName: original + lowercase
  tokenRegistry.byName[entry.name] = entry;
  tokenRegistry.byName[entry.name.toLowerCase()] = entry;

  // byNameNoSpace: segments without spaces
  var noSpace = entry.name.split("/").map(function(s) { return s.replace(/ /g, ""); }).join("/");
  tokenRegistry.byNameNoSpace[noSpace] = entry;
  tokenRegistry.byNameNoSpace[noSpace.toLowerCase()] = entry;

  // byValue: reverse lookup (color only)
  if (entry.isColor && entry.value) {
    if (!tokenRegistry.byValue[entry.value]) tokenRegistry.byValue[entry.value] = [];
    tokenRegistry.byValue[entry.value].push(entry);
  }

  // byLayer
  if (!tokenRegistry.byLayer[entry.layer]) tokenRegistry.byLayer[entry.layer] = [];
  tokenRegistry.byLayer[entry.layer].push(entry);

  // byCategory
  if (!tokenRegistry.byCategory[entry.category]) tokenRegistry.byCategory[entry.category] = [];
  tokenRegistry.byCategory[entry.category].push(entry);

  // byType
  if (entry.type) {
    if (!tokenRegistry.byType[entry.type]) tokenRegistry.byType[entry.type] = [];
    tokenRegistry.byType[entry.type].push(entry);
  }

  // byRole
  if (!tokenRegistry.byRole[entry.role]) tokenRegistry.byRole[entry.role] = [];
  tokenRegistry.byRole[entry.role].push(entry);
}

/**
 * resetRegistry()
 *
 * Reinicializa o tokenRegistry, limpando todos os índices e a lista
 * de entradas. Chamado antes de reconstruir o registry a partir de
 * uma nova fonte de dados.
 *
 * @returns {void}
 * @sideeffect Substitui o objeto global tokenRegistry por um novo vazio.
 */
function resetRegistry() {
  tokenRegistry = {
    byName: {}, byNameNoSpace: {}, byValue: {},
    byLayer: { base: [], brand: [], usage: [], component: [], screen: [] },
    byCategory: {}, byType: {}, byRole: {},
    entries: []
  };
}

/**
 * buildRegistryFromFigma(allData, activeMode)
 *
 * Constrói o tokenRegistry a partir dos dados exportados do Figma
 * (saída de exportTokens). Itera sobre todas as collections e tokens,
 * extrai valores hex do modo ativo e indexa cada entrada.
 *
 * @param {Array<Object>} allData - Array de CollectionData exportados do Figma.
 * @param {string} activeMode - Nome do modo ativo para extração de valores.
 * @returns {Object} O tokenRegistry populado.
 * @sideeffect Reinicializa e popula o objeto global tokenRegistry.
 */
// Build from Figma allData (output of exportTokens)
function buildRegistryFromFigma(allData, activeMode) {
  resetRegistry();

  for (var ci = 0; ci < allData.length; ci++) {
    var coll = allData[ci];
    var modeName = activeMode;
    if (!modeName && coll.modes && coll.modes.length > 0) {
      modeName = typeof coll.modes[0] === "object" ? coll.modes[0].name : coll.modes[0];
    }

    for (var ti = 0; ti < coll.tokens.length; ti++) {
      var tok = coll.tokens[ti];
      var val = tok.values ? tok.values[modeName] : null;
      var hexVal = null;
      if (val && val.hex) hexVal = val.hex.toUpperCase();
      else if (typeof val === "string" && /^#[0-9a-fA-F]{3,8}$/.test(val)) hexVal = val.toUpperCase();

      var entry = buildTokenEntry(tok.name, hexVal || val, tok.variableId, "figma", coll.name);
      indexEntry(entry);
    }
  }

  return tokenRegistry;
}

/**
 * buildRegistryFromStorybook(sbTokens)
 *
 * Constrói um registry separado a partir de tokens do Storybook/npm.
 * Converte nomes do formato Storybook (LfThm...) para formato Figma
 * e indexa por nome, nome sem espaços e valor hex.
 *
 * @param {Object} sbTokens - Mapa de nome Storybook para valor (ex: { "LfThmBrandColorPrimary500": "#076AEA" }).
 * @returns {Object} Registry do Storybook com campos: byName, byNameNoSpace, byValue, entries.
 */
// Build from Storybook JSON (tokens-storybook.json)
function buildRegistryFromStorybook(sbTokens) {
  var sbRegistry = {
    byName: {}, byNameNoSpace: {}, byValue: {}, entries: []
  };

  var keys = Object.keys(sbTokens);
  for (var i = 0; i < keys.length; i++) {
    var sbKey = keys[i];
    var sbVal = sbTokens[sbKey];
    var figmaName = sbNameToFigma(sbKey);
    var entry = buildTokenEntry(figmaName, sbVal, null, "storybook", null);
    entry.sbOriginalName = sbKey;

    sbRegistry.entries.push(entry);
    sbRegistry.byName[figmaName] = entry;
    sbRegistry.byName[figmaName.toLowerCase()] = entry;

    var noSpace = figmaName.split("/").map(function(s) { return s.replace(/ /g, ""); }).join("/");
    sbRegistry.byNameNoSpace[noSpace] = entry;
    sbRegistry.byNameNoSpace[noSpace.toLowerCase()] = entry;

    if (entry.isColor && entry.value) {
      if (!sbRegistry.byValue[entry.value]) sbRegistry.byValue[entry.value] = [];
      sbRegistry.byValue[entry.value].push(entry);
    }
  }

  return sbRegistry;
}

// ── Registry lookup helpers ──

/**
 * registryLookup(name)
 *
 * Busca uma entrada no tokenRegistry pelo nome, tentando múltiplas
 * variações: nome original, lowercase, sem espaços nos segmentos.
 *
 * @param {string} name - Nome do token a buscar.
 * @returns {Object|null} Entrada do token encontrada, ou null.
 */
// Find entry by name (tries multiple variations)
function registryLookup(name) {
  if (tokenRegistry.byName[name]) return tokenRegistry.byName[name];
  if (tokenRegistry.byName[name.toLowerCase()]) return tokenRegistry.byName[name.toLowerCase()];
  var noSpace = name.split("/").map(function(s) { return s.replace(/ /g, ""); }).join("/");
  if (tokenRegistry.byNameNoSpace[noSpace]) return tokenRegistry.byNameNoSpace[noSpace];
  if (tokenRegistry.byNameNoSpace[noSpace.toLowerCase()]) return tokenRegistry.byNameNoSpace[noSpace.toLowerCase()];
  return null;
}

/**
 * findUsageTokenByValue(hexValue)
 *
 * Busca o melhor token Usage para um dado valor hex. Prioriza tokens
 * de camadas superiores (usage > component > brand > screen > base).
 *
 * @param {string|null} hexValue - Valor hex da cor (ex: "#076AEA").
 * @returns {Object|null} Entrada do token com maior prioridade, ou null.
 */
// Find best Usage token for a given hex value
function findUsageTokenByValue(hexValue) {
  if (!hexValue) return null;
  var hex = hexValue.toUpperCase();
  var candidates = tokenRegistry.byValue[hex];
  if (!candidates || candidates.length === 0) return null;

  // Priority: usage > component > brand > base
  var layerPriority = { usage: 4, component: 3, brand: 2, screen: 1, base: 0 };
  var best = null;
  var bestScore = -1;

  for (var i = 0; i < candidates.length; i++) {
    var c = candidates[i];
    var score = layerPriority[c.layer] || 0;
    if (score > bestScore) { bestScore = score; best = c; }
  }

  return best;
}

/**
 * getTokensByLayer(layer)
 *
 * Retorna todos os tokens de uma camada específica do registry.
 *
 * @param {string} layer - Nome da camada ("base", "brand", "usage", "component", "screen").
 * @returns {Array<Object>} Array de entradas de token da camada.
 */
// Get all tokens of a specific layer
function getTokensByLayer(layer) {
  return tokenRegistry.byLayer[layer] || [];
}

/**
 * getRegistryStats()
 *
 * Retorna estatísticas do tokenRegistry: total de tokens, contagem
 * por camada (base, brand, usage, component, screen), por categoria
 * (colors, spacing, typography) e valores únicos.
 *
 * @returns {Object} Estatísticas com campos: total, base, brand, usage,
 *   component, screen, colors, spacing, typography, uniqueValues.
 */
// Get registry stats
function getRegistryStats() {
  return {
    total: tokenRegistry.entries.length,
    base: (tokenRegistry.byLayer.base || []).length,
    brand: (tokenRegistry.byLayer.brand || []).length,
    usage: (tokenRegistry.byLayer.usage || []).length,
    component: (tokenRegistry.byLayer.component || []).length,
    screen: (tokenRegistry.byLayer.screen || []).length,
    colors: (tokenRegistry.byCategory.color || []).length,
    spacing: (tokenRegistry.byCategory.spacing || []).length,
    typography: (tokenRegistry.byCategory.typography || []).length,
    uniqueValues: Object.keys(tokenRegistry.byValue).length
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// SEÇÃO 12: AUDIT ENGINE
// Funções de auditoria de uso de tokens nos componentes do Figma.
// Detecta valores brutos, tokens de camada incorreta e tipos incompatíveis.
// ═══════════════════════════════════════════════════════════════════════════

/**
 * auditTokenEntry(entry, propType)
 *
 * Audita um token vinculado a uma propriedade de um nó do Figma.
 * Retorna uma lista de issues encontrados, cada um com severidade,
 * código, mensagem, texto educacional e sugestão de correção.
 *
 * Problemas detectados:
 * - BASE_TOKEN_USED (error): Token Base/Foundations usado diretamente em UI.
 *     Componentes devem usar tokens Usage que referenciam Base via Brand.
 * - BRAND_TOKEN_DIRECT (warning): Token Brand usado onde token Usage seria
 *     mais adequado. Tokens Brand são filtro por marca; prefira Usage.
 * - COMPONENT_TOKEN_USED (info): Token de Component detectado. Uso restrito
 *     ao time de System Ops; em produtos, prefira tokens Usage.
 * - RAW_VALUE (error): Valor bruto (hardcoded) sem token vinculado.
 *     Valores hardcoded não respondem a temas ou modos.
 * - TYPE_MISMATCH (warning): Tipo de token incompatível com a propriedade.
 *     Ex: on-surface usado como fill, ou surface usado como texto.
 *
 * Recomendações são determinadas via findUsageTokenByValue, que busca
 * o melhor token Usage com o mesmo valor hex, priorizando camadas superiores.
 *
 * @param {Object|null} entry - Entrada do tokenRegistry (de buildTokenEntry),
 *   ou null se o nó usa valor bruto sem token vinculado.
 * @param {string} propType - Tipo da propriedade do nó ("fill", "stroke",
 *   "text", "text-color").
 * @returns {Array<Object>} Lista de issues, cada um com: severity (string),
 *   code (string), message (string), educational (string), suggestion (Object|null).
 */
function auditTokenEntry(entry, propType) {
  var issues = [];

  // ERROR: Base/primitive token used directly in UI
  if (entry && entry.layer === "base") {
    issues.push({
      severity: "error", code: "BASE_TOKEN_USED",
      message: "Token Base (Foundations) usado em UI. Use token Usage em vez de '" + entry.name + "'.",
      educational: "Tokens Base (Foundations) definem valores brutos (ex: saphire/500). Componentes devem usar tokens Usage (ex: Dynamic/Primary/Surface) que referenciam Base como aliases via Brand.",
      suggestion: findUsageTokenByValue(entry.value)
    });
  }

  // WARNING: Brand token used where Usage should be
  if (entry && entry.layer === "brand") {
    var usageAlt = findUsageTokenByValue(entry.value);
    issues.push({
      severity: "warning", code: "BRAND_TOKEN_DIRECT",
      message: "Token Brand '" + entry.name + "' usado diretamente. Prefira token Usage" + (usageAlt ? " '" + usageAlt.name + "'" : "") + ".",
      educational: "Tokens Brand são filtro dos Base Tokens por marca. Use tokens Usage que mapeiam para Brand automaticamente. Theme Tokens = Brand + Usage.",
      suggestion: usageAlt
    });
  }

  // WARNING: Component token used outside System Ops context
  if (entry && entry.layer === "component") {
    issues.push({
      severity: "info", code: "COMPONENT_TOKEN_USED",
      message: "Token de Component '" + entry.name + "' detectado. Uso restrito ao time de System Ops.",
      educational: "Component Tokens são específicos por componente e de uso restrito ao time de System Ops. No contexto de produtos, prefira tokens Usage.",
      suggestion: null
    });
  }

  // ERROR: Raw value without any token
  if (!entry) {
    issues.push({
      severity: "error", code: "RAW_VALUE",
      message: "Valor bruto sem token vinculado. Vincule um token semantico.",
      educational: "Valores hardcoded (ex: #FF0000) nao respondem a temas ou modos. Vincule sempre um token de variavel.",
      suggestion: null
    });
  }

  // WARNING: Type mismatch (on-surface used as fill)
  if (entry && entry.type === "on-surface" && propType === "fill") {
    issues.push({
      severity: "warning", code: "TYPE_MISMATCH",
      message: "Token on-surface usado como fill/background. Use token surface.",
      educational: "Tokens on-surface sao para conteudo (texto, icone). Para backgrounds, use tokens surface.",
      suggestion: null
    });
  }

  // WARNING: surface used as text color
  if (entry && entry.type === "surface" && (propType === "text" || propType === "text-color")) {
    issues.push({
      severity: "warning", code: "TYPE_MISMATCH",
      message: "Token surface usado como cor de texto. Use token on-surface.",
      educational: "Tokens surface sao para backgrounds. Para texto e icones, use tokens on-surface.",
      suggestion: null
    });
  }

  return issues;
}

// ═══════════════════════════════════════════════════════════════════════════
// SEÇÃO 13: STORYBOOK VALIDATOR
// Comparação entre tokens do Figma e tokens do pacote npm/Storybook.
// Identifica tokens ok, divergentes, ausentes e extras.
// ═══════════════════════════════════════════════════════════════════════════

/**
 * validateAgainstStorybook(sbRegistry)
 *
 * Compara os tokens do Figma (tokenRegistry global) com os tokens do
 * Storybook (sbRegistry recebido). Para cada token do Storybook, tenta
 * encontrar correspondência no Figma por nome ou por valor hex.
 *
 * Dados comparados: nome do token (com variações) e valor hex (para cores).
 *
 * @param {Object} sbRegistry - Registry de tokens do Storybook, construído
 *   por buildRegistryFromStorybook. Deve conter: entries (Array de entradas
 *   com campos name, isColor, value).
 * @returns {Object} Resultado da validação com campos:
 *   - ok {Array}: Pares { figma, storybook } com valores idênticos.
 *   - diff {Array}: Pares { figma, storybook } com valores divergentes.
 *   - missing {Array}: Tokens { figma } presentes no Figma mas ausentes no Storybook.
 *   - extra {Array}: Tokens { storybook } presentes no Storybook mas ausentes no Figma.
 */
function validateAgainstStorybook(sbRegistry) {
  var results = { ok: [], diff: [], missing: [], extra: [] };
  var matched = {};

  for (var i = 0; i < sbRegistry.entries.length; i++) {
    var sbEntry = sbRegistry.entries[i];

    // Try name match
    var figmaEntry = registryLookup(sbEntry.name);

    // Try by value if name didn't match
    if (!figmaEntry && sbEntry.isColor && sbEntry.value) {
      var byVal = tokenRegistry.byValue[sbEntry.value];
      if (byVal && byVal.length > 0) figmaEntry = byVal[0];
    }

    if (figmaEntry) {
      matched[figmaEntry.name] = true;
      if (sbEntry.isColor && figmaEntry.isColor && sbEntry.value === figmaEntry.value) {
        results.ok.push({ figma: figmaEntry, storybook: sbEntry });
      } else if (sbEntry.isColor && figmaEntry.isColor) {
        results.diff.push({ figma: figmaEntry, storybook: sbEntry });
      } else {
        results.ok.push({ figma: figmaEntry, storybook: sbEntry });
      }
    } else {
      if (sbEntry.isColor) results.extra.push({ storybook: sbEntry });
    }
  }

  // Figma tokens not in Storybook (only colors)
  for (var fi = 0; fi < tokenRegistry.entries.length; fi++) {
    var fEntry = tokenRegistry.entries[fi];
    if (!matched[fEntry.name] && fEntry.isColor) {
      results.missing.push({ figma: fEntry });
    }
  }

  return results;
}

/**
 * syncDocsToBoards(docsUrl)
 *
 * Inicia a sincronização de dados enriquecidos de documentação com os
 * boards do canvas. Envia uma mensagem para a UI solicitando fetch da URL,
 * pois a UI tem acesso web irrestrito.
 *
 * @param {string} docsUrl - URL do JSON com dados enriquecidos de tokens.
 * @returns {void}
 * @sideeffect Envia mensagem { type: "fetch-url", requestId: "sync-docs", url } para a UI.
 */
// ── Sync Docs to Boards (enriched token data) ──

function syncDocsToBoards(docsUrl) {
  // Pede para a UI fazer o fetch (UI tem acesso web irrestrito)
  figma.ui.postMessage({ type: "fetch-url", requestId: "sync-docs", url: docsUrl });
}

/**
 * handleFetchResponse(requestId, data, error)
 *
 * Processa a resposta de um fetch realizado pela UI. Roteia a resposta
 * com base no requestId: "sync-docs" para sincronização de documentação
 * enriquecida, "check-div" para dados de divergência.
 *
 * @param {string} requestId - Identificador da requisição ("sync-docs" ou "check-div").
 * @param {Object|null} data - Dados retornados pelo fetch, ou null em caso de erro.
 * @param {string|null} error - Mensagem de erro, ou null em caso de sucesso.
 * @returns {void}
 * @sideeffect Pode modificar enrichedTokenData, disparar regeneração de boards,
 *   ou chamar processDivergenceData.
 */
// Handler para quando a UI retorna os dados do fetch
function handleFetchResponse(requestId, data, error) {
  if (error) {
    figma.ui.postMessage({ type: "error", message: requestId + ": " + error });
    return;
  }
  if (requestId === "sync-docs") {
    var lookup = {};
    if (data.tokens && Array.isArray(data.tokens)) {
      for (var i = 0; i < data.tokens.length; i++) {
        var t = data.tokens[i];
        if (t.name) lookup[t.name] = t;
      }
    } else {
      lookup = data;
    }
    enrichedTokenData = lookup;
    figma.ui.postMessage({ type: "sync-docs-status", status: "loaded", count: Object.keys(lookup).length });
    var ids = Object.keys(boardRegistry).filter(function(k) { return k.indexOf("__") === -1; });
    if (ids.length > 0) {
      generateDocsFromScratch(ids).then(function() {
        syncBoardRegistry().then(function() {
          figma.ui.postMessage({ type: "sync-docs-done", count: Object.keys(lookup).length });
        });
      });
    } else {
      figma.ui.postMessage({ type: "sync-docs-done", count: Object.keys(lookup).length });
    }
  }
  if (requestId === "check-div") {
    processDivergenceData(data);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SEÇÃO 14: DIVERGENCE CHECKER
// Verificação de divergências entre tokens do Figma e do npm por marca e modo.
// ═══════════════════════════════════════════════════════════════════════════

/**
 * figmaNameToSb(name)
 *
 * Converte um nome de token no formato Figma (segmentos separados por "/")
 * para o formato Storybook/npm (camelCase com prefixo "LfThm").
 * Operação inversa de sbNameToFigma.
 * Exemplo: "Brand/Color/Primary/500" → "LfThmBrandColorPrimary500".
 *
 * @param {string} name - Nome do token no formato Figma.
 * @returns {string} Nome no formato Storybook (ex: "LfThmBrandColorPrimary500").
 */
function figmaNameToSb(name) {
  // Reverse of sbNameToFigma: Brand/Color/Primary/500 → LfThmBrandColorPrimary500
  var parts = name.split("/");
  var camel = "";
  for (var i = 0; i < parts.length; i++) {
    var seg = parts[i].replace(/\s+/g, "");
    if (seg.length > 0) {
      camel += seg.charAt(0).toUpperCase() + seg.slice(1);
    }
  }
  return "LfThm" + camel;
}

/**
 * checkDivergences(npmTokensJsonUrl)
 *
 * Inicia a verificação de divergências entre tokens do Figma e do npm.
 * Envia uma mensagem para a UI solicitando fetch da URL de tokens npm,
 * pois a UI tem acesso web irrestrito. O resultado é processado por
 * processDivergenceData quando a UI responde.
 *
 * @param {string} [npmTokensJsonUrl] - URL do JSON com tokens npm.
 *   Padrão: "http://localhost:3001/tokens-all-brands.json".
 * @returns {void}
 * @sideeffect Envia mensagem { type: "fetch-url", requestId: "check-div", url } para a UI.
 */
function checkDivergences(npmTokensJsonUrl) {
  var url = npmTokensJsonUrl || "http://localhost:3001/tokens-all-brands.json";
  // Pede para a UI fazer o fetch
  figma.ui.postMessage({ type: "fetch-url", requestId: "check-div", url: url });
}

/**
 * processDivergenceData(npmData)
 *
 * Processa os dados de tokens npm recebidos via fetch e compara com os
 * tokens locais do Figma. Constrói mapas de tokens Figma (por nome → hex)
 * e npm (por nome original e nome Figma-style → hex), depois compara
 * para identificar divergências.
 *
 * Dados comparados: valores hex de cores, com busca case-insensitive
 * e conversão de nomes entre formatos Figma e Storybook.
 *
 * @param {Object} npmData - Mapa de tokens npm. Chaves são nomes Storybook,
 *   valores podem ser strings hex, ou objetos com campos value ou light.
 * @returns {void}
 * @sideeffect Atualiza npmTokenCache, persiste no clientStorage, e envia
 *   mensagem { type: "divergence-report", data: DivergenceReport } para a UI.
 *   DivergenceReport contém: onlyInFigma, onlyInNpm, valueMismatch, matching.
 */
function processDivergenceData(npmData) {
  (async function() {
    try {

      // Step 2: Build Figma token map (name -> hex, for all modes)
      await buildVarMap();
      var collections = await figma.variables.getLocalVariableCollectionsAsync();
      var figmaTokens = {};
      for (var ci = 0; ci < collections.length; ci++) {
        var collection = collections[ci];
        for (var vi = 0; vi < collection.variableIds.length; vi++) {
          var variable = await figma.variables.getVariableByIdAsync(collection.variableIds[vi]);
          if (!variable) continue;
          if (variable.resolvedType !== "COLOR") continue;
          var modeIds = Object.keys(variable.valuesByMode);
          for (var mi = 0; mi < modeIds.length; mi++) {
            var r2 = await resolveChain(variable.valuesByMode[modeIds[mi]], variable.resolvedType, modeIds[mi], 0);
            if (r2.resolved && r2.resolved.hex) {
              figmaTokens[variable.name] = r2.resolved.hex.toUpperCase();
              break; // Use first mode with a resolved value
            }
          }
        }
      }

      // Step 3: Build npm token map (normalize names)
      var npmTokens = {};
      var npmKeys = Object.keys(npmData);
      for (var ni = 0; ni < npmKeys.length; ni++) {
        var npmKey = npmKeys[ni];
        var npmVal = npmData[npmKey];
        var npmHex = null;
        if (typeof npmVal === "string" && npmVal.indexOf("#") === 0) {
          npmHex = npmVal.toUpperCase();
        } else if (typeof npmVal === "object" && npmVal !== null) {
          if (npmVal.value && typeof npmVal.value === "string" && npmVal.value.indexOf("#") === 0) {
            npmHex = npmVal.value.toUpperCase();
          } else if (npmVal.light && typeof npmVal.light === "string" && npmVal.light.indexOf("#") === 0) {
            npmHex = npmVal.light.toUpperCase();
          }
        }
        if (npmHex) {
          // Store with original key and also with Figma-style name
          npmTokens[npmKey] = npmHex;
          var figmaStyleName = sbNameToFigma(npmKey);
          npmTokens[figmaStyleName] = npmHex;
        }
      }

      // Step 4: Compare
      var report = {
        onlyInFigma: [],
        onlyInNpm: [],
        valueMismatch: [],
        matching: 0
      };

      var figmaKeys = Object.keys(figmaTokens);
      for (var fi = 0; fi < figmaKeys.length; fi++) {
        var fName = figmaKeys[fi];
        var fHex = figmaTokens[fName];
        // Try to find in npm: direct name, or convert to sb name
        var sbName = figmaNameToSb(fName);
        var npmHexMatch = npmTokens[fName] || npmTokens[sbName] || npmTokens[fName.toLowerCase()] || null;

        if (!npmHexMatch) {
          // Also try case-insensitive search
          var npmAllKeys = Object.keys(npmTokens);
          for (var nki = 0; nki < npmAllKeys.length; nki++) {
            if (npmAllKeys[nki].toLowerCase() === fName.toLowerCase() || npmAllKeys[nki].toLowerCase() === sbName.toLowerCase()) {
              npmHexMatch = npmTokens[npmAllKeys[nki]];
              break;
            }
          }
        }

        if (!npmHexMatch) {
          report.onlyInFigma.push({ name: fName, figmaValue: fHex });
        } else if (fHex.toLowerCase() !== npmHexMatch.toLowerCase()) {
          report.valueMismatch.push({ name: fName, figmaValue: fHex, npmValue: npmHexMatch });
        } else {
          report.matching++;
        }
      }

      // Check npm tokens not in Figma
      var processedNpmKeys = {};
      var allNpmOrigKeys = Object.keys(npmData);
      for (var oni = 0; oni < allNpmOrigKeys.length; oni++) {
        var origKey = allNpmOrigKeys[oni];
        if (processedNpmKeys[origKey]) continue;
        processedNpmKeys[origKey] = true;
        var figmaStyleName2 = sbNameToFigma(origKey);
        if (!figmaTokens[figmaStyleName2] && !figmaTokens[origKey]) {
          // Check case-insensitive
          var found = false;
          for (var fki = 0; fki < figmaKeys.length; fki++) {
            if (figmaKeys[fki].toLowerCase() === figmaStyleName2.toLowerCase() || figmaKeys[fki].toLowerCase() === origKey.toLowerCase()) {
              found = true;
              break;
            }
          }
          if (!found) {
            var origVal = npmData[origKey];
            var displayVal = "";
            if (typeof origVal === "string") displayVal = origVal;
            else if (typeof origVal === "object" && origVal !== null && origVal.value) displayVal = origVal.value;
            else if (typeof origVal === "object" && origVal !== null && origVal.light) displayVal = origVal.light;
            report.onlyInNpm.push({ name: origKey, npmValue: displayVal });
          }
        }
      }

      // Step 5: Update npm cache for watch feature
      npmTokenCache = npmTokens;
      figma.clientStorage.setAsync("npmTokenCache", npmTokenCache);

      // Step 6: Send report to UI
      figma.ui.postMessage({ type: "divergence-report", data: report });

    } catch(e) {
      figma.ui.postMessage({ type: "error", message: "check-divergences: " + (e && e.message ? e.message : String(e)) });
    }
  })();
}

// ═══════════════════════════════════════════════════════════════════════════
// SEÇÃO 15: TOKEN WATCH
// Monitoramento de mudanças em tokens e notificações em tempo real.
// ═══════════════════════════════════════════════════════════════════════════

/**
 * toggleTokenWatch(enabled)
 *
 * Ativa ou desativa o monitoramento em tempo real de mudanças em tokens.
 * Quando ativado, carrega o cache npm do clientStorage (se necessário)
 * e inicia o polling periódico. Quando desativado, para o polling.
 *
 * @param {boolean} enabled - true para ativar, false para desativar.
 * @returns {void}
 * @sideeffect Pode carregar npmTokenCache do clientStorage, iniciar/parar
 *   pollTimer, e enviar mensagem { type: "watch-status", enabled } para a UI.
 */
function toggleTokenWatch(enabled) {
  if (enabled) {
    // Load npm cache from clientStorage if not already loaded
    if (!npmTokenCache) {
      figma.clientStorage.getAsync("npmTokenCache").then(function(cached) {
        if (cached) {
          npmTokenCache = cached;
        }
        startWatchPolling();
      });
    } else {
      startWatchPolling();
    }
    figma.ui.postMessage({ type: "watch-status", enabled: true });
  } else {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
    figma.ui.postMessage({ type: "watch-status", enabled: false });
  }
}

/**
 * startWatchPolling()
 *
 * Inicia o polling periódico para detecção de mudanças em tokens.
 * Constrói um snapshot inicial das variáveis e configura um intervalo
 * de 2 segundos para verificar alterações.
 *
 * @returns {void}
 * @sideeffect Popula varSnapshotMap com snapshot inicial e configura
 *   pollTimer com intervalo de 2000ms chamando watchPollForChanges.
 */
function startWatchPolling() {
  if (pollTimer) return;
  // Take initial snapshot
  buildSnapshotMap().then(function(map) {
    varSnapshotMap = map;
    pollTimer = setInterval(function() { watchPollForChanges(); }, 2000);
  });
}

/**
 * watchPollForChanges()
 *
 * Executa uma iteração do polling de mudanças. Compara o snapshot atual
 * com o anterior, identifica variáveis alteradas, resolve novos valores
 * hex, verifica divergência com cache npm e notifica a UI. Se boards
 * existem no registry, regenera-os automaticamente.
 *
 * @returns {Promise<void>}
 * @sideeffect Atualiza varSnapshotMap, pode regenerar boards, persiste
 *   snapshots e registry no clientStorage, e envia mensagens
 *   { type: "token-changed" }, { type: "auto-updating" } e
 *   { type: "auto-updated" } para a UI.
 */
async function watchPollForChanges() {
  if (isAutoUpdating) return;
  var newMap = await buildSnapshotMap();
  var changed = diffSnapshots(varSnapshotMap, newMap);
  if (changed.length === 0) return;

  // Notify about each changed token
  for (var ci = 0; ci < changed.length; ci++) {
    var varId = changed[ci];
    try {
      var variable = await figma.variables.getVariableByIdAsync(varId);
      if (!variable) continue;
      if (variable.resolvedType !== "COLOR") continue;

      var modeIds = Object.keys(variable.valuesByMode);
      var newHex = null;
      var oldHex = null;

      // Get new value
      for (var mi = 0; mi < modeIds.length; mi++) {
        var r2 = await resolveChain(variable.valuesByMode[modeIds[mi]], variable.resolvedType, modeIds[mi], 0);
        if (r2.resolved && r2.resolved.hex) {
          newHex = r2.resolved.hex.toUpperCase();
          break;
        }
      }

      // Get old value from snapshot
      if (varSnapshotMap[varId]) {
        var oldModeKeys = Object.keys(varSnapshotMap[varId]);
        for (var omi = 0; omi < oldModeKeys.length; omi++) {
          var oldVal = varSnapshotMap[varId][oldModeKeys[omi]];
          // Try to parse the old snapshot value to extract hex
          if (typeof oldVal === "string") {
            try {
              var parsed = JSON.parse(oldVal);
              if (parsed && parsed.r !== undefined && parsed.g !== undefined && parsed.b !== undefined) {
                var oR = Math.round(parsed.r * 255);
                var oG = Math.round(parsed.g * 255);
                var oB = Math.round(parsed.b * 255);
                oldHex = "#" + oR.toString(16).padStart(2, "0") + oG.toString(16).padStart(2, "0") + oB.toString(16).padStart(2, "0");
                oldHex = oldHex.toUpperCase();
                break;
              }
            } catch(pe) {}
          }
        }
      }

      // Check against npm cache
      var npmValue = null;
      var isDivergent = false;
      if (npmTokenCache) {
        var sbName = figmaNameToSb(variable.name);
        npmValue = npmTokenCache[variable.name] || npmTokenCache[sbName] || null;
        if (!npmValue) {
          // Case-insensitive search
          var cacheKeys = Object.keys(npmTokenCache);
          for (var cki = 0; cki < cacheKeys.length; cki++) {
            if (cacheKeys[cki].toLowerCase() === variable.name.toLowerCase() || cacheKeys[cki].toLowerCase() === sbName.toLowerCase()) {
              npmValue = npmTokenCache[cacheKeys[cki]];
              break;
            }
          }
        }
        if (npmValue && newHex) {
          isDivergent = newHex.toLowerCase() !== npmValue.toLowerCase();
        }
      }

      figma.ui.postMessage({
        type: "token-changed",
        data: {
          name: variable.name,
          oldValue: oldHex,
          newValue: newHex,
          npmValue: npmValue,
          isDivergent: isDivergent
        }
      });
    } catch(e) {
      // Skip tokens that fail to resolve
    }
  }

  varSnapshotMap = newMap;

  // Also update boards if registry exists
  if (Object.keys(boardRegistry).length > 0) {
    isAutoUpdating = true;
    figma.ui.postMessage({ type: "auto-updating", count: changed.length });
    try {
      var ids = Object.keys(boardRegistry).filter(function(k) { return k.indexOf("__") === -1; });
      await generateDocsFromScratch(ids);
      await syncBoardRegistry();
      figma.clientStorage.setAsync("varSnapshotMap", newMap);
      figma.clientStorage.setAsync("boardRegistry", boardRegistry);
      figma.ui.postMessage({ type: "auto-updated", patched: changed.length });
    } catch(e) {}
    isAutoUpdating = false;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SEÇÃO 16: HANDLERS DE MENSAGEM
// Handler principal de mensagens recebidas da UI via postMessage.
// Inclui inicialização do plugin e listeners de eventos do Figma.
// ═══════════════════════════════════════════════════════════════════════════

// ┌─────────────────────────────────────────────────────────────────────────┐
// │ MENSAGENS RECEBIDAS (ui.html → code.js)                               │
// │                                                                         │
// │ msg.type               Payload                  Descrição               │
// │ ─────────────────────  ───────────────────────  ─────────────────────── │
// │ get-data / refresh     {}                       Solicita dados tokens   │
// │ generate-docs          { selectedIds: [] }      Gerar boards seleção    │
// │ update-docs            { selectedIds: [] }      Atualizar boards exist. │
// │ get-json               {}                       Exportar JSON           │
// │ export-markdown         {}                       Exportar Markdown       │
// │ build-registry         { data, activeMode }     Construir token reg.    │
// │ run-enhanced-audit     {}                       Executar auditoria      │
// │ fix-issue              { nodeId, tokenId,       Corrigir issue indiv.   │
// │                          propType }                                     │
// │ fix-all                { issues }               Corrigir todos issues   │
// │ select-node            { nodeId }               Selecionar nó canvas    │
// │ apply-token-suggestion { nodeId, tokenId,       Aplicar sugestão token  │
// │                          propType }                                     │
// │ fetch-storybook        {}                       Buscar tokens Storybook │
// │ paste-tokens-json      { content: string }      Processar JSON colado   │
// │ check-divergences      { npmTokensJson }        Verificar divergências  │
// │ watch-tokens           { enabled: boolean }     Ativar/desativar watch  │
// │ fetch-response         { requestId, data,       Resposta de fetch UI    │
// │                          error }                                        │
// │ close                  {}                       Fechar plugin           │
// └─────────────────────────────────────────────────────────────────────────┘
//
// ┌─────────────────────────────────────────────────────────────────────────┐
// │ MENSAGENS ENVIADAS (code.js → ui.html)                                │
// │                                                                         │
// │ msg.type               Payload                  Descrição               │
// │ ─────────────────────  ───────────────────────  ─────────────────────── │
// │ result                 { data: CollectionData[] } Dados tokens export.  │
// │ docs-done              {}                       Geração/atualiz. ok     │
// │ docs-progress          { current, total,        Progresso da geração    │
// │                          collectionName }                               │
// │ error                  { message: string }      Erro genérico           │
// │ registry-built         { count: number }        Token registry pronto   │
// │ storybook-result       { ok, diff, missing,     Resultado valid. SB     │
// │                          extra }                                        │
// │ storybook-error        { message: string }      Erro ao buscar SB       │
// │ divergence-report      { data: DivergenceReport } Relatório diverg.     │
// │ token-changed          { data: TokenChangeInfo } Token alterado (watch) │
// │ watch-status           { enabled: boolean }     Status do watch         │
// │ auto-updating          { count: number }        Auto-update andamento   │
// │ auto-updated           { patched: number }      Auto-update concluído   │
// │ sync-docs-status       { status, count }        Status sync de docs     │
// │ sync-docs-done         { count: number }        Sync de docs concluído  │
// │ fetch-url              { requestId, url }       Pede UI fazer fetch     │
// └─────────────────────────────────────────────────────────────────────────┘

// ── Inicialização e listeners de eventos ──

/**
 * init()
 *
 * Inicializa o plugin: exporta tokens para a UI, sincroniza o board
 * registry, constrói o snapshot de variáveis e inicia o polling.
 *
 * @returns {Promise<void>}
 * @sideeffect Envia dados de tokens para a UI, popula boardRegistry e
 *             varSnapshotMap, e inicia o timer de polling.
 */
async function init() {
  try { await exportTokens(); } catch(e) { figma.ui.postMessage({ type: "error", message: "init: " + String(e) }); return; }
  try { await syncBoardRegistry(); } catch(e) {}
  try { varSnapshotMap = await buildSnapshotMap(); } catch(e) {}
  startPolling();
}

init();

figma.on("documentchange", function() { exportTokens(); });

figma.on("selectionchange", function() {
  var sel = figma.currentPage.selection;
  if (!sel || sel.length === 0) { figma.ui.postMessage({ type: "selection-cleared" }); return; }
  // Análise simples de seleção
  (async function() {
    try {
      await buildVarMap();
      var allLocalVars = await figma.variables.getLocalVariablesAsync();
      var results = [];
      for (var ni = 0; ni < sel.length; ni++) {
        var node = sel[ni];
        var comp = detectComposition(node);
        var props = [];
        if (node.fills && node.fills.length > 0) {
          var fill = node.fills[0];
          if (fill && fill.type === "SOLID") {
            var prop = { type: "fill", index: 0, hasToken: false };
            if (fill.boundVariables && fill.boundVariables.color) {
              var bvId = fill.boundVariables.color.id;
              var bv = varById[bvId] || varById[(bvId || "").replace(/^VariableID:/, "")];
              if (!bv) { try { bv = await figma.variables.getVariableByIdAsync(bvId); } catch(e) {} }
              if (bv) { prop.currentToken = bv.name; prop.hasToken = true; }
            }
            if (fill.color) prop.currentValue = rgbToHex(fill.color);
            prop.suggestions = suggestForProperty(node, "fill", prop.currentValue, comp, allLocalVars);
            props.push(prop);
          }
        }
        results.push({ nodeId: node.id, nodeName: node.name, nodeType: node.type, composition: comp, properties: props });
      }
      figma.ui.postMessage({ type: "selection-analysis", results: results });
    } catch(e) {}
  })();
});

// ── Handler principal de mensagens ──

figma.ui.onmessage = function(msg) {
  if (msg.type === "refresh" || msg.type === "get-data") exportTokens();

  if (msg.type === "build-registry") {
    buildRegistryFromFigma(msg.data, msg.activeMode);
    figma.ui.postMessage({ type: "registry-built", count: tokenRegistry.entries.length,
      layers: { base: (tokenRegistry.byLayer.base || []).length, brand: (tokenRegistry.byLayer.brand || []).length,
        usage: (tokenRegistry.byLayer.usage || []).length, component: (tokenRegistry.byLayer.component || []).length } });
  }

  if (msg.type === "run-enhanced-audit") {
    (async function() {
      try {
        figma.ui.postMessage({ type: "audit-progress", message: "Construindo registro de tokens..." });
        var allData = [];
        await buildVarMap();
        var collections = await figma.variables.getLocalVariableCollectionsAsync();
        for (var ci = 0; ci < collections.length; ci++) {
          var collection = collections[ci];
          var modes = collection.modes.map(function(m) { return { id: m.modeId, name: m.name }; });
          var collData = { id: collection.id, name: collection.name, modes: modes, tokens: [] };
          for (var vi = 0; vi < collection.variableIds.length; vi++) {
            var variable = await figma.variables.getVariableByIdAsync(collection.variableIds[vi]);
            if (!variable) continue;
            var token = { name: variable.name, type: variable.resolvedType, variableId: variable.id, values: {} };
            for (var mj = 0; mj < collection.modes.length; mj++) {
              var mode = collection.modes[mj];
              var r2 = await resolveChain(variable.valuesByMode[mode.modeId], variable.resolvedType, mode.modeId, 0);
              var val = r2.resolved;
              if (val && val.hex) token.values[mode.name] = { hex: val.hex, alpha: val.alpha, r: val.r, g: val.g, b: val.b, chain: r2.chain };
              else if (r2.chain.length > 0) token.values[mode.name] = { alias: r2.chain.join(" -> "), chain: r2.chain };
              else token.values[mode.name] = val;
            }
            collData.tokens.push(token);
          }
          allData.push(collData);
        }
        buildRegistryFromFigma(allData, msg.activeMode || null);
        figma.ui.postMessage({ type: "audit-progress", message: "Registro: " + tokenRegistry.entries.length + " tokens. Auditando nos..." });

        // Audit nodes
        var nodes = [];
        if (msg.scope === "selection") {
          var sel = figma.currentPage.selection;
          function expandSel(n) { nodes.push(n); if (n.children) { for (var ci2 = 0; ci2 < n.children.length; ci2++) expandSel(n.children[ci2]); } }
          for (var ni = 0; ni < sel.length; ni++) expandSel(sel[ni]);
        } else {
          nodes = figma.currentPage.findAll(function() { return true; });
        }

        var allIssues = [];
        var varLookup = {};
        var allVars = await figma.variables.getLocalVariablesAsync();
        for (var avi = 0; avi < allVars.length; avi++) {
          varLookup[allVars[avi].id] = allVars[avi];
          varLookup[allVars[avi].id.replace(/^VariableID:/, "")] = allVars[avi];
        }

        for (var ni2 = 0; ni2 < nodes.length; ni2++) {
          var node = nodes[ni2];
          if (!node.fills && !node.strokes) continue;

          // Audit fills
          if (node.fills) {
            for (var fi = 0; fi < node.fills.length; fi++) {
              var fill = node.fills[fi];
              if (!fill || fill.visible === false || fill.type !== "SOLID") continue;
              var entry = null;
              if (fill.boundVariables && fill.boundVariables.color) {
                var bvId = fill.boundVariables.color.id;
                var bv = varLookup[bvId] || varLookup[(bvId || "").replace(/^VariableID:/, "")];
                if (!bv) { try { bv = await figma.variables.getVariableByIdAsync(bvId); } catch(e) {} }
                if (bv) entry = buildTokenEntry(bv.name, fill.color ? rgbToHex(fill.color) : null, bv.id, "figma", null);
              }
              var issues = auditTokenEntry(entry, "fill");
              for (var ii = 0; ii < issues.length; ii++) {
                var suggested = null;
                var rawHex = fill.color ? rgbToHex(fill.color).toUpperCase() : null;
                if (rawHex && tokenRegistry.byValue[rawHex]) {
                  var cands = tokenRegistry.byValue[rawHex];
                  for (var ci3 = 0; ci3 < cands.length; ci3++) {
                    if (cands[ci3].layer === "usage") { suggested = cands[ci3]; break; }
                  }
                }
                allIssues.push({
                  nodeId: node.id, nodeName: node.name, nodeType: node.type, property: "fill",
                  current: entry ? entry.name : null, currentValue: rawHex,
                  currentLayer: entry ? entry.layer : null,
                  recommended: suggested ? suggested.name : null,
                  severity: issues[ii].severity, code: issues[ii].code,
                  reason: issues[ii].message, educational: issues[ii].educational,
                  fixable: !!suggested && !!suggested.figmaId
                });
              }
            }
          }

          if (ni2 % 100 === 0 && ni2 > 0) {
            figma.ui.postMessage({ type: "audit-progress", message: "Auditando... " + ni2 + "/" + nodes.length });
          }
        }

        figma.ui.postMessage({
          type: "audit-result",
          summary: {
            errors: allIssues.filter(function(i) { return i.severity === "error"; }).length,
            warnings: allIssues.filter(function(i) { return i.severity === "warning"; }).length,
            suggestions: allIssues.filter(function(i) { return i.severity === "suggestion"; }).length,
            total: allIssues.length, scanned: nodes.length,
            registry: { total: tokenRegistry.entries.length,
              base: (tokenRegistry.byLayer.base || []).length,
              brand: (tokenRegistry.byLayer.brand || []).length,
              usage: (tokenRegistry.byLayer.usage || []).length }
          },
          issues: allIssues
        });
      } catch(e) {
        figma.ui.postMessage({ type: "error", message: "enhanced-audit: " + String(e) });
      }
    })();
  }

  if (msg.type === "get-json") {
    // Exporta os dados atuais como JSON para a UI copiar
    (async function() {
      try {
        await buildVarMap();
        var collections = await figma.variables.getLocalVariableCollectionsAsync();
        var out = {};
        for (var ci = 0; ci < collections.length; ci++) {
          var collection = collections[ci];
          var modes = collection.modes.map(function(m) { return { id: m.modeId, name: m.name }; });
          var collData = { modes: modes.map(function(m) { return m.name; }), tokens: {} };
          for (var vi = 0; vi < collection.variableIds.length; vi++) {
            var variable = await figma.variables.getVariableByIdAsync(collection.variableIds[vi]);
            if (!variable) continue;
            var tokenValues = {};
            for (var mj = 0; mj < collection.modes.length; mj++) {
              var mode = collection.modes[mj];
              var r2 = await resolveChain(variable.valuesByMode[mode.modeId], variable.resolvedType, mode.modeId, 0);
              var val = r2.resolved;
              if (val && val.hex) {
                var chain = Array.isArray(r2.chain) ? r2.chain : [];
                tokenValues[mode.name] = chain.length ? chain.join(" -> ") + " -> " + val.hex.toUpperCase() : val.hex.toUpperCase();
              } else if (r2.chain.length > 0) {
                tokenValues[mode.name] = r2.chain.join(" -> ");
              } else if (val !== null && val !== undefined) {
                tokenValues[mode.name] = val;
              }
            }
            collData.tokens[variable.name] = tokenValues;
          }
          out[collection.name] = collData;
        }
        figma.ui.postMessage({ type: "json-ready", content: JSON.stringify(out, null, 2) });
      } catch(e) {
        figma.ui.postMessage({ type: "error", message: "get-json: " + String(e) });
      }
    })();
  }

  if (msg.type === "generate-docs") {
    var ids = msg.selectedIds || Object.keys(boardRegistry).filter(function(k) { return k.indexOf("__") === -1; });
    generateDocsSelective(ids).then(function() {
      syncBoardRegistry().then(function() {
        buildSnapshotMap().then(function(map) {
          varSnapshotMap = map;
          figma.clientStorage.setAsync("varSnapshotMap", map);
          figma.clientStorage.setAsync("boardRegistry", boardRegistry);
        });
      });
    });
  }

  if (msg.type === "update-docs" || msg.type === "update-tokens") {
    var ids2 = msg.selectedIds || Object.keys(boardRegistry).filter(function(k) { return k.indexOf("__") === -1; });
    updateDocsIncremental(ids2).then(function() {
      syncBoardRegistry();
      figma.ui.postMessage({ type: "update-done", updated: 1 });
    });
  }

  if (msg.type === "export-markdown") {
    (async function() {
      try {
        await buildVarMap();
        var collections = await figma.variables.getLocalVariableCollectionsAsync();
        var data = [];
        for (var ci = 0; ci < collections.length; ci++) {
          var collection = collections[ci];
          var modes = collection.modes.map(function(m) { return { id: m.modeId, name: m.name }; });
          var collData = { id: collection.id, name: collection.name, modes: modes, tokens: [] };
          for (var vi = 0; vi < collection.variableIds.length; vi++) {
            var variable = await figma.variables.getVariableByIdAsync(collection.variableIds[vi]);
            if (!variable) continue;
            var token = { name: variable.name, type: variable.resolvedType, values: {} };
            for (var mj = 0; mj < collection.modes.length; mj++) {
              var mode = collection.modes[mj];
              var r2 = await resolveChain(variable.valuesByMode[mode.modeId], variable.resolvedType, mode.modeId, 0);
              var val = r2.resolved;
              if (val && val.hex) token.values[mode.name] = { hex: val.hex, chain: r2.chain };
              else if (r2.chain.length > 0) token.values[mode.name] = { alias: r2.chain.join(" -> "), chain: r2.chain };
              else token.values[mode.name] = val;
            }
            collData.tokens.push(token);
          }
          data.push(collData);
        }
        var md = generateMarkdownDocs(data);
        figma.ui.postMessage({ type: "markdown-ready", content: md });
      } catch(e) {
        figma.ui.postMessage({ type: "error", message: "export-markdown: " + String(e) });
      }
    })();
  }

  if (msg.type === "select-node") {
    var node = figma.getNodeById(msg.nodeId);
    if (node) { figma.currentPage.selection = [node]; figma.viewport.scrollAndZoomIntoView([node]); }
  }

  if (msg.type === "apply-token-suggestion") {
    (async function() {
      try {
        var node = figma.getNodeById(msg.nodeId);
        if (!node) return;
        var variable = await figma.variables.getVariableByIdAsync(msg.tokenId);
        if (!variable) {
          var allVars = await figma.variables.getLocalVariablesAsync();
          for (var i = 0; i < allVars.length; i++) { if (allVars[i].name === msg.tokenName) { variable = allVars[i]; break; } }
        }
        if (!variable) return;
        if (msg.propType === "fill" || msg.propType === "text-color") {
          var fills = node.fills.map(function(f) { return f; });
          if (fills[msg.propIndex || 0]) {
            fills[msg.propIndex || 0] = figma.variables.setBoundVariableForPaint(fills[msg.propIndex || 0], "color", variable);
            node.fills = fills;
          }
        }
        figma.ui.postMessage({ type: "token-applied", tokenName: msg.tokenName });
      } catch(e) { figma.ui.postMessage({ type: "error", message: "apply: " + String(e) }); }
    })();
  }

  if (msg.type === "fetch-storybook") {
    var BASE = "https://lift.yduqs.com.br/v2/";
    var PROXY = "https://api.allorigins.win/raw?url=";

    function px(url) { return PROXY + encodeURIComponent(url); }
    function fetchText(url) {
      return fetch(px(url)).then(function(r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.text();
      });
    }
    function extractTokens(content) {
      var tokens = {};
      var m;
      var p1 = /"([A-Za-z][A-Za-z0-9_\-\/\.]{2,80})"\s*:\s*"(#[0-9a-fA-F]{3,8})"/g;
      while ((m = p1.exec(content)) !== null) {
        if (m[1].length > 3) tokens[m[1]] = m[2].toUpperCase();
      }
      var p2 = /--(lf[A-Za-z0-9\-]{2,80})\s*:\s*(#[0-9a-fA-F]{3,8})/g;
      while ((m = p2.exec(content)) !== null) tokens["--" + m[1]] = m[2].toUpperCase();
      // Padrão: LfThmBrandColorPrimary500: "#hex" (camelCase com prefixo Lf)
      var p3 = /\b(Lf[A-Z][A-Za-z0-9]{3,80})\s*:\s*"(#[0-9a-fA-F]{3,8})"/g;
      while ((m = p3.exec(content)) !== null) tokens[m[1]] = m[2].toUpperCase();
      // Padrão: value: "#hex" com name próximo
      var p4 = /"value"\s*:\s*"(#[0-9a-fA-F]{6,8})"/g;
      while ((m = p4.exec(content)) !== null) {
        // Pega contexto para achar o nome
        var ctx = content.substring(Math.max(0, m.index - 200), m.index);
        var nameMatch = ctx.match(/"name"\s*:\s*"([^"]{3,80})"/);
        if (nameMatch) tokens[nameMatch[1]] = m[1].toUpperCase();
      }
      return tokens;
    }

    figma.ui.postMessage({ type: "storybook-debug", msg: "Buscando bundle principal..." });

    fetchText(BASE + "assets/iframe-C7HY-F-O.js")
      .then(function(mainBundle) {
        figma.ui.postMessage({ type: "storybook-debug", msg: "Bundle: " + mainBundle.length + " chars" });
        var chunkNames = [];
        var chunkRe = /["']([A-Za-z][A-Za-z0-9_\-]+-[A-Za-z0-9_\-]{6,12})["']/g;
        var m;
        while ((m = chunkRe.exec(mainBundle)) !== null) {
          if (m[1].indexOf("-") !== -1 && chunkNames.indexOf(m[1]) === -1) chunkNames.push(m[1]);
        }
        var hashRe = /\d+:"([A-Za-z0-9_\-]{6,20})"/g;
        while ((m = hashRe.exec(mainBundle)) !== null) {
          if (chunkNames.indexOf(m[1]) === -1) chunkNames.push(m[1]);
        }
        figma.ui.postMessage({ type: "storybook-debug", msg: "Chunks: " + chunkNames.length });

        var priorityChunks = chunkNames.filter(function(n) { return /token|styled|theme|color|brand|lf/i.test(n); });
        var otherChunks = chunkNames.filter(function(n) { return !/token|styled|theme|color|brand|lf/i.test(n); });
        var toTry = priorityChunks.concat(otherChunks).slice(0, 30);

        var allTokens = {};
        function mergeTokens(src) {
          var keys = Object.keys(src);
          for (var ki = 0; ki < keys.length; ki++) allTokens[keys[ki]] = src[keys[ki]];
        }

        // Também extrai do bundle principal
        mergeTokens(extractTokens(mainBundle));

        function tryNextChunk(idx) {
          if (idx >= toTry.length) {
            figma.ui.postMessage({ type: "storybook-tokens", tokens: allTokens, count: Object.keys(allTokens).length });
            return;
          }
          fetchText(BASE + "assets/" + toTry[idx] + ".js")
            .then(function(content) {
              var ct = extractTokens(content);
              var count = Object.keys(ct).length;
              if (count > 0) {
                mergeTokens(ct);
                figma.ui.postMessage({ type: "storybook-debug", msg: toTry[idx] + ": " + count + " tokens (total: " + Object.keys(allTokens).length + ")" });
              }
              tryNextChunk(idx + 1);
            })
            .catch(function() { tryNextChunk(idx + 1); });
        }

        tryNextChunk(0);
      })
      .catch(function(e) { figma.ui.postMessage({ type: "storybook-error", message: String(e) }); });
  }

  // Aceita JSON de tokens colado manualmente (fallback quando Storybook não é acessível)
  if (msg.type === "paste-tokens-json") {
    try {
      var parsed = JSON.parse(msg.content);
      // Normaliza: aceita {tokenName: "#hex"} ou {tokenName: {value: "#hex"}} ou {tokenName: {light: "#hex", dark: "#hex"}}
      var tokens = {};
      var keys = Object.keys(parsed);
      for (var ki = 0; ki < keys.length; ki++) {
        var k = keys[ki];
        var v = parsed[k];
        if (typeof v === "string" && v.match(/^#[0-9a-fA-F]{3,8}$/)) {
          tokens[k] = v.toUpperCase();
        } else if (typeof v === "object" && v !== null) {
          if (v.value && typeof v.value === "string") tokens[k] = v.value.toUpperCase();
          else if (v.light) tokens[k] = v.light.toUpperCase();
          else if (v.default) tokens[k] = v.default.toUpperCase();
        }
      }
      figma.ui.postMessage({ type: "storybook-tokens", tokens: tokens, count: Object.keys(tokens).length });
    } catch(e) {
      figma.ui.postMessage({ type: "storybook-error", message: "JSON inválido: " + String(e) });
    }
  }

  // ═══ FETCH RESPONSE (from UI) ═══
  if (msg.type === "fetch-response") {
    handleFetchResponse(msg.requestId, msg.data, msg.error);
  }

  // ═══ SYNC DOCS TO BOARDS ═══
  if (msg.type === "sync-docs-to-boards") {
    syncDocsToBoards(msg.docsUrl || "http://localhost:3001/tokens-figma-enriched.json");
  }

  // ═══ CHECK DIVERGENCES ═══
  if (msg.type === "check-divergences") {
    checkDivergences(msg.npmTokensJson);
  }

  // ═══ WATCH TOKENS ═══
  if (msg.type === "watch-tokens") {
    toggleTokenWatch(msg.enabled);
  }

  if (msg.type === "close") {
    if (pollTimer) clearInterval(pollTimer);
    figma.closePlugin();
  }
};
