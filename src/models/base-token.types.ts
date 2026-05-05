/**
 * @module base-token.types
 * @description Interfaces e tipos fundamentais para os Base Tokens do design system Lift.
 *
 * Os Base Tokens são a camada mais fundamental do design system, contendo valores
 * brutos de referência interna (cores, tipografia, espaçamento, bordas, sombras,
 * opacidade e utilitários). Utilizam o prefixo `LfBs` (camelCase) e `--lf-bs-`
 * (CSS custom properties), e NÃO devem ser usados diretamente em UI.
 */

// ---------------------------------------------------------------------------
// Tipos Literais
// ---------------------------------------------------------------------------

/**
 * Categoria funcional de um Base Token conforme definido no `token-schema.json`.
 *
 * Cada categoria agrupa tokens com propósito semelhante:
 * - `color` — cores de preenchimento, texto e borda
 * - `typography` — font-family, font-weight, font-size, line-height
 * - `spacing` — padding, margin, gap, section
 * - `border` — border-width, border-radius
 * - `shadow` — box-shadow / elevação
 * - `opacity` — transparência
 * - `utility` — breakpoint, duration, motion, z-index
 */
export type TokenCategory =
  | 'color'
  | 'typography'
  | 'spacing'
  | 'border'
  | 'shadow'
  | 'opacity'
  | 'utility';

/**
 * Papel tipográfico suportado pelo design system Lift.
 *
 * Cada papel define a função semântica do texto na interface:
 * - `display` — textos de destaque / hero
 * - `heading` — títulos e subtítulos
 * - `paragraph` — corpo de texto
 * - `link` — links e âncoras
 * - `label` — rótulos de campos e botões
 * - `caption` — legendas e textos auxiliares
 * - `overline` — textos acima de títulos
 * - `code` — trechos de código / monospace
 */
export type TypographyRole =
  | 'display'
  | 'heading'
  | 'paragraph'
  | 'link'
  | 'label'
  | 'caption'
  | 'overline'
  | 'code';

/**
 * Plataformas de saída suportadas pelo pipeline de build.
 */
export type Platform = 'css' | 'scss' | 'js' | 'ts' | 'android' | 'ios';

// ---------------------------------------------------------------------------
// Interfaces Principais
// ---------------------------------------------------------------------------

/**
 * Representa um Base Token processado pelo pipeline Style Dictionary.
 *
 * Cada instância contém o nome normalizado, a CSS custom property correspondente,
 * a categoria, o valor bruto e metadados de tipagem e invariância entre marcas.
 *
 * @example
 * ```ts
 * const token: BaseToken = {
 *   name: 'LfBsColorNeutral100',
 *   cssProperty: '--lf-bs-color-neutral-100',
 *   category: 'color',
 *   subcategory: 'neutral',
 *   scale: '100',
 *   value: '#FAFAFA',
 *   tsType: 'string',
 *   isInvariant: false,
 * };
 * ```
 */
export interface BaseToken {
  /** Nome em camelCase com prefixo `LfBs` (ex: `"LfBsColorNeutral100"`). */
  name: string;

  /** CSS custom property correspondente (ex: `"--lf-bs-color-neutral-100"`). */
  cssProperty: string;

  /** Categoria do token conforme `token-schema.json`. */
  category: TokenCategory;

  /** Subcategoria dentro da categoria (ex: `"neutral"`, `"gap"`, `"width"`). */
  subcategory: string;

  /** Valor da escala numérica ou nome semântico (ex: `"100"`, `"small"`). */
  scale: string;

  /** Valor bruto do token (ex: `"#FAFAFA"`, `"4px"`, `"0.04"`). */
  value: string;

  /** Tipo do valor para tipagem TypeScript (`"string"` ou `"number"`). */
  tsType: 'string' | 'number';

  /** Indica se o valor é invariante (idêntico) entre todas as marcas. */
  isInvariant: boolean;
}

// ---------------------------------------------------------------------------
// Modelos de Dados por Categoria
// ---------------------------------------------------------------------------

/**
 * Representa uma paleta de cores completa com escala numérica.
 *
 * Paletas opacas utilizam valores hexadecimais de 6 dígitos (`#RRGGBB`).
 * A paleta `neutral-alpha` utiliza valores `rgba(r,g,b,a)`.
 *
 * Paletas obrigatórias: neutral, primary, secondary, tertiary, critical,
 * warning, success, info, highlight, contrast, ai e neutral-alpha.
 *
 * @example
 * ```ts
 * const neutral: ColorScale = {
 *   palette: 'neutral',
 *   values: { 100: '#FAFAFA', 200: '#F5F5F5', ... },
 *   hasAlpha: false,
 * };
 * ```
 */
export interface ColorScale {
  /** Nome da paleta (ex: `"neutral"`, `"primary"`, `"neutral-alpha"`). */
  palette: string;

  /** Mapa de escala numérica → valor hex (`#RRGGBB`) ou `rgba(r,g,b,a)`. */
  values: Record<number, string>;

  /** Indica se a paleta usa valores com transparência (ex: `neutral-alpha`). */
  hasAlpha: boolean;
}

/**
 * Conjunto completo de tokens tipográficos dos Base Tokens.
 *
 * Agrupa font-family por papel tipográfico, font-weight por combinação
 * de papel e peso, e font-size / line-height por escala numérica.
 *
 * @example
 * ```ts
 * const typography: TypographyTokenSet = {
 *   fontFamily: { display: 'Inter', heading: 'Inter', ... },
 *   fontWeight: { DisplayBold: '700', HeadingRegular: '400', ... },
 *   fontSize: { 100: '12px', 200: '14px', ... },
 *   lineHeight: { 100: '16px', 200: '20px', ... },
 * };
 * ```
 */
export interface TypographyTokenSet {
  /** Mapa de papel tipográfico → nome da família de fonte. */
  fontFamily: Record<TypographyRole, string>;

  /**
   * Mapa de combinação `{Role}{Weight}` → valor do peso.
   * Ex: `"DisplayBold"` → `"700"`, `"HeadingRegular"` → `"400"`.
   */
  fontWeight: Record<string, string>;

  /** Mapa de escala numérica → valor de font-size em `px`. */
  fontSize: Record<number, string>;

  /** Mapa de escala numérica → valor de line-height em `px`. */
  lineHeight: Record<number, string>;
}

/**
 * Conjunto completo de tokens de espaçamento dos Base Tokens.
 *
 * Cada subgrupo (gap, padding, margin, section) possui uma escala numérica
 * começando em 0 (valor `"0px"`) e progredindo em incrementos de 100.
 *
 * @example
 * ```ts
 * const spacing: SpacingTokenSet = {
 *   gap: { 0: '0px', 100: '4px', 200: '8px', ... },
 *   padding: { 0: '0px', 100: '4px', ... },
 *   margin: { 0: '0px', 100: '4px', ... },
 *   section: { 0: '0px', 100: '8px', ... },
 * };
 * ```
 */
export interface SpacingTokenSet {
  /** Escala de espaçamento para gap (espaço entre elementos). */
  gap: Record<number, string>;

  /** Escala de espaçamento para padding (preenchimento interno). */
  padding: Record<number, string>;

  /** Escala de espaçamento para margin (margem externa). */
  margin: Record<number, string>;

  /** Escala de espaçamento para section (espaçamento entre seções). */
  section: Record<number, string>;
}

/**
 * Token de sombra com nível de elevação e camada.
 *
 * O sistema define 4 níveis de elevação × 3 camadas = 12 tokens de sombra.
 * Cada valor segue o formato CSS `box-shadow`:
 * `{offset-x}px {offset-y}px {blur}px rgba(r,g,b,a)`.
 *
 * @example
 * ```ts
 * const shadow: ShadowToken = {
 *   level: 1,
 *   layer: 1,
 *   value: '0px 1px 2px rgba(0,0,0,0.12)',
 * };
 * ```
 */
export interface ShadowToken {
  /** Nível de elevação (1 = mais baixo, 4 = mais alto). */
  level: 1 | 2 | 3 | 4;

  /** Camada da sombra dentro do nível (1, 2 ou 3). */
  layer: 1 | 2 | 3;

  /** Valor da sombra no formato CSS `box-shadow`. */
  value: string;
}

/**
 * Configuração de saída por plataforma no pipeline de build.
 *
 * Define como os tokens são formatados e onde são escritos para cada
 * plataforma de saída suportada (CSS, SCSS, JS, TS, Android XML, iOS Swift).
 *
 * @example
 * ```ts
 * const cssOutput: PlatformOutput = {
 *   platform: 'css',
 *   fileExtension: '.css',
 *   outputPath: 'brands/estacio/css/',
 *   formatFn: (token) => `--${token.cssProperty}: ${token.value};`,
 * };
 * ```
 */
export interface PlatformOutput {
  /** Identificador da plataforma de saída. */
  platform: Platform;

  /** Extensão do arquivo gerado (ex: `".css"`, `".scss"`, `".swift"`). */
  fileExtension: string;

  /** Caminho de saída relativo ao diretório de build. */
  outputPath: string;

  /** Função de formatação que converte um `BaseToken` na string de saída da plataforma. */
  formatFn: (token: BaseToken) => string;
}

// ---------------------------------------------------------------------------
// Interfaces de Validação e Relatório
// ---------------------------------------------------------------------------

/**
 * Resultado da validação de nomenclatura de um Base Token.
 *
 * Retornado pela função `validateTokenName` para indicar se o nome
 * segue a convenção `LfBs` definida no `token-schema.json`.
 *
 * @example
 * ```ts
 * const result: NamingValidationResult = {
 *   valid: false,
 *   tokenName: 'LfColorNeutral100',
 *   errors: ['Nome deve começar com o prefixo "LfBs"'],
 * };
 * ```
 */
export interface NamingValidationResult {
  /** Indica se o nome do token é válido. */
  valid: boolean;

  /** Nome do token que foi validado. */
  tokenName: string;

  /** Lista de erros encontrados (vazia quando `valid` é `true`). */
  errors: string[];
}

/**
 * Relatório de consistência cross-marca dos Base Tokens.
 *
 * Gerado pela função `checkCrossBrandConsistency` para verificar que
 * todas as 8 marcas possuem a mesma estrutura de tokens e que tokens
 * utilitários (invariantes) possuem valores idênticos.
 *
 * @example
 * ```ts
 * const report: ConsistencyReport = {
 *   consistent: false,
 *   missingTokens: [{ brand: 'wyden', tokenName: 'LfBsColorAi100' }],
 *   extraTokens: [],
 *   valueMismatches: [{
 *     tokenName: 'LfBsBreakpointSm',
 *     brands: { estacio: '768', wyden: '800' },
 *   }],
 * };
 * ```
 */
export interface ConsistencyReport {
  /** Indica se todas as marcas são consistentes. */
  consistent: boolean;

  /** Tokens que estão faltando em alguma marca. */
  missingTokens: { brand: string; tokenName: string }[];

  /** Tokens extras encontrados em alguma marca (não presentes nas demais). */
  extraTokens: { brand: string; tokenName: string }[];

  /** Tokens utilitários com valores divergentes entre marcas. */
  valueMismatches: { tokenName: string; brands: Record<string, string> }[];
}
