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
