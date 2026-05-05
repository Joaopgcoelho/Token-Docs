/**
 * @module base-token-config
 * @description Constantes de configuração dos Base Tokens do design system Lift.
 *
 * Define todas as paletas de cor obrigatórias, escalas numéricas por categoria,
 * papéis tipográficos, subgrupos de espaçamento, valores de breakpoint,
 * border-radius, durações, curvas de motion, z-index e categorias invariantes
 * entre marcas.
 *
 * Todas as constantes utilizam `as const` para garantir tipos literais no TypeScript.
 *
 * @see {@link ../models/base-token.types.ts} para as interfaces correspondentes.
 */

import type { TokenCategory, TypographyRole } from '../models/base-token.types';

// ---------------------------------------------------------------------------
// Paletas de Cor
// ---------------------------------------------------------------------------

/**
 * Paletas de cor opacas obrigatórias nos Base Tokens.
 *
 * Cada paleta utiliza valores hexadecimais de 6 dígitos (`#RRGGBB`)
 * e escala numérica de 100 a 1000.
 *
 * @see Requisito 1.1
 */
export const COLOR_PALETTES = [
  'neutral',
  'primary',
  'secondary',
  'tertiary',
  'critical',
  'warning',
  'success',
  'info',
  'highlight',
  'contrast',
  'ai',
] as const;

/**
 * Paleta de cor com transparência (neutral-alpha).
 *
 * Utiliza valores `rgba(r,g,b,a)` e a mesma escala numérica de 100 a 1000.
 *
 * @see Requisito 1.3
 */
export const ALPHA_PALETTE = 'neutral-alpha' as const;

/**
 * Todas as paletas de cor obrigatórias (opacas + alpha).
 *
 * @see Requisitos 1.1, 1.3
 */
export const ALL_COLOR_PALETTES = [...COLOR_PALETTES, ALPHA_PALETTE] as const;

// ---------------------------------------------------------------------------
// Escalas Numéricas
// ---------------------------------------------------------------------------

/**
 * Escala numérica de cor: 100 a 1000 com incrementos de 100.
 *
 * Aplicável a todas as paletas de cor (opacas e alpha).
 *
 * @see Requisito 1.2
 */
export const COLOR_SCALE = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000] as const;

/**
 * Escala numérica de border-width: 0 a 400.
 *
 * Valores correspondentes: 0px, 1px, 2px, 4px, 6px.
 *
 * @see Requisito 4.1
 */
export const BORDER_WIDTH_SCALE = [0, 100, 200, 300, 400] as const;

/**
 * Mapa de escala de border-width para valores em pixels.
 *
 * @see Requisito 4.1
 */
export const BORDER_WIDTH_VALUES: Record<(typeof BORDER_WIDTH_SCALE)[number], string> = {
  0: '0px',
  100: '1px',
  200: '2px',
  300: '4px',
  400: '6px',
} as const;

/**
 * Escala numérica de opacidade: 0 a 100.
 *
 * Valores armazenados como decimais entre 0 e 1.
 *
 * @see Requisito 6.1
 */
export const OPACITY_SCALE = [0, 4, 8, 16, 24, 48, 64, 80, 100] as const;

/**
 * Mapa de escala de opacidade para valores decimais.
 *
 * @see Requisito 6.2
 */
export const OPACITY_VALUES: Record<(typeof OPACITY_SCALE)[number], number> = {
  0: 0,
  4: 0.04,
  8: 0.08,
  16: 0.16,
  24: 0.24,
  48: 0.48,
  64: 0.64,
  80: 0.80,
  100: 1,
} as const;

// ---------------------------------------------------------------------------
// Tipografia
// ---------------------------------------------------------------------------

/**
 * Papéis tipográficos suportados pelo design system Lift.
 *
 * Cada papel define a função semântica do texto na interface.
 *
 * @see Requisito 2.1
 */
export const TYPOGRAPHY_ROLES: readonly TypographyRole[] = [
  'display',
  'heading',
  'paragraph',
  'link',
  'label',
  'caption',
  'overline',
  'code',
] as const;

/**
 * Pesos tipográficos disponíveis no design system.
 *
 * Nem todos os papéis suportam todos os pesos.
 *
 * @see Requisito 2.2
 */
export const FONT_WEIGHTS = ['light', 'regular', 'medium', 'semibold', 'bold'] as const;

/**
 * Mapa de papel tipográfico para os pesos disponíveis.
 *
 * Define quais combinações de papel × peso são válidas no design system.
 *
 * @see Requisito 2.2
 */
export const TYPOGRAPHY_ROLE_WEIGHTS: Record<TypographyRole, readonly string[]> = {
  display: ['light', 'regular', 'semibold', 'bold'],
  heading: ['light', 'regular', 'semibold', 'bold'],
  paragraph: ['light', 'regular', 'semibold', 'bold'],
  link: ['medium', 'semibold'],
  label: ['medium'],
  caption: ['regular', 'semibold', 'bold'],
  overline: ['regular'],
  code: ['regular'],
} as const;

/**
 * Mapa de nome de peso tipográfico para valor numérico CSS.
 *
 * @see Requisito 2.2
 */
export const FONT_WEIGHT_VALUES: Record<(typeof FONT_WEIGHTS)[number], string> = {
  light: '300',
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

// ---------------------------------------------------------------------------
// Espaçamento
// ---------------------------------------------------------------------------

/**
 * Subgrupos de espaçamento dos Base Tokens.
 *
 * Cada subgrupo possui sua própria escala numérica começando em 0.
 *
 * @see Requisito 3.1
 */
export const SPACING_SUBGROUPS = ['gap', 'padding', 'margin', 'section'] as const;

// ---------------------------------------------------------------------------
// Breakpoints
// ---------------------------------------------------------------------------

/**
 * Valores de breakpoint em pixels.
 *
 * Tokens de breakpoint são invariantes entre marcas.
 *
 * @see Requisito 7.1
 */
export const BREAKPOINT_VALUES = {
  xs: 0,
  sm: 768,
  md: 1024,
  lg: 1280,
  xl: 1600,
} as const;

/**
 * Nomes dos breakpoints ordenados por tamanho crescente.
 *
 * @see Requisito 7.1
 */
export const BREAKPOINT_NAMES = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

// ---------------------------------------------------------------------------
// Border Radius
// ---------------------------------------------------------------------------

/**
 * Variantes semânticas de border-radius.
 *
 * Ordenadas do menor para o maior valor de arredondamento.
 *
 * @see Requisito 4.2
 */
export const BORDER_RADIUS_VARIANTS = [
  'none',
  'xx-small',
  'x-small',
  'small',
  'medium',
  'large',
  'pill',
] as const;

/**
 * Mapa de variante de border-radius para valor em pixels.
 *
 * @see Requisito 4.2
 */
export const BORDER_RADIUS_VALUES: Record<(typeof BORDER_RADIUS_VARIANTS)[number], string> = {
  'none': '0px',
  'xx-small': '2px',
  'x-small': '4px',
  'small': '8px',
  'medium': '12px',
  'large': '24px',
  'pill': '200px',
} as const;

// ---------------------------------------------------------------------------
// Duration
// ---------------------------------------------------------------------------

/**
 * Valores de duração de animação em milissegundos.
 *
 * Tokens de duration são invariantes entre marcas.
 *
 * @see Requisito 7.2
 */
export const DURATION_VALUES = [
  0, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 1000, 1500, 5000,
] as const;

// ---------------------------------------------------------------------------
// Motion
// ---------------------------------------------------------------------------

/**
 * Curvas de easing para animações.
 *
 * Cada curva é definida no formato `cubic-bezier(a,b,c,d)`.
 * Tokens de motion são invariantes entre marcas.
 *
 * @see Requisito 7.3
 */
export const MOTION_CURVES = {
  'linear': 'cubic-bezier(0, 0, 1, 1)',
  'ease-in-out': 'cubic-bezier(0.42, 0, 0.58, 1)',
  'ease-out': 'cubic-bezier(0.19, 0.91, 0.38, 1)',
  'ease-in': 'cubic-bezier(0.42, 0, 1, 1)',
  'ease': 'cubic-bezier(0.25, 0.1, 0.25, 1)',
} as const;

/**
 * Nomes das curvas de motion disponíveis.
 *
 * @see Requisito 7.3
 */
export const MOTION_CURVE_NAMES = [
  'linear',
  'ease-in-out',
  'ease-out',
  'ease-in',
  'ease',
] as const;

// ---------------------------------------------------------------------------
// Z-Index
// ---------------------------------------------------------------------------

/**
 * Valores de z-index disponíveis no design system.
 *
 * Tokens de z-index são invariantes entre marcas.
 *
 * @see Requisito 7.4
 */
export const ZINDEX_VALUES = [
  0, 100, 200, 300, 400, 500, 600, 700, 800, 900,
  1000, 1020, 1030, 1040, 1050, 1060, 1070, 1080,
] as const;

// ---------------------------------------------------------------------------
// Shadow
// ---------------------------------------------------------------------------

/**
 * Níveis de elevação de sombra (1 = mais baixo, 4 = mais alto).
 *
 * @see Requisito 5.1
 */
export const SHADOW_LEVELS = [1, 2, 3, 4] as const;

/**
 * Camadas de sombra dentro de cada nível de elevação.
 *
 * @see Requisito 5.1
 */
export const SHADOW_LAYERS = [1, 2, 3] as const;

// ---------------------------------------------------------------------------
// Categorias e Invariância
// ---------------------------------------------------------------------------

/**
 * Todas as categorias de Base Token conforme `token-schema.json`.
 *
 * @see Requisito 8.1
 */
export const TOKEN_CATEGORIES: readonly TokenCategory[] = [
  'color',
  'typography',
  'spacing',
  'border',
  'shadow',
  'opacity',
  'utility',
] as const;

/**
 * Categorias/subcategorias cujos valores são invariantes (idênticos) entre todas as marcas.
 *
 * Tokens nestas categorias devem ter exatamente os mesmos valores em todas as 8 marcas.
 * Apenas tokens de cor podem variar por marca.
 *
 * @see Requisito 10.2
 */
export const INVARIANT_CATEGORIES = [
  'breakpoint',
  'duration',
  'motion',
  'z-index',
  'border-width',
] as const;

// ---------------------------------------------------------------------------
// Marcas
// ---------------------------------------------------------------------------

/**
 * Todas as marcas do design system Lift.
 *
 * @see Requisito 10.1
 */
export const BRAND_NAMES = [
  'damasio',
  'ensine-me',
  'estacio',
  'estacio-curso-tecnico',
  'ibmec',
  'idomed',
  'wyden',
  'yduqs',
] as const;

// ---------------------------------------------------------------------------
// Prefixos e Naming
// ---------------------------------------------------------------------------

/**
 * Prefixo camelCase para Base Tokens.
 *
 * @see Requisito 11.1
 */
export const BASE_TOKEN_PREFIX = 'LfBs' as const;

/**
 * Prefixo CSS custom property para Base Tokens.
 *
 * @see Requisito 11.2
 */
export const BASE_TOKEN_CSS_PREFIX = '--lf-bs-' as const;
