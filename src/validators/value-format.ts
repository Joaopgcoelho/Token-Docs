/**
 * @module value-format
 * @description Validação de formato de valor por categoria para Base Tokens do design system Lift.
 *
 * Cada categoria de token possui um formato de valor específico:
 * - **color (opaca)**: hexadecimal 6 dígitos (`#RRGGBB`)
 * - **color (alpha)**: formato `rgba(r,g,b,a)`
 * - **spacing / border-width / border-radius**: valor em `px` ou `rem`
 * - **opacity**: número decimal no intervalo [0, 1]
 * - **duration**: valor em `ms`
 * - **motion**: formato `cubic-bezier(a,b,c,d)`
 * - **shadow**: formato CSS box-shadow
 * - **breakpoint / z-index**: número inteiro sem unidade
 *
 * @see {@link ../models/base-token.types.ts} para as interfaces correspondentes
 * @see Requisitos 1.6, 3.3, 5.2, 6.2, 7.3
 */

// ---------------------------------------------------------------------------
// Result interface
// ---------------------------------------------------------------------------

/**
 * Resultado da validação de formato de valor de um token.
 */
export interface ValueValidationResult {
  /** Indica se o valor é válido para a categoria. */
  valid: boolean;
  /** Lista de erros encontrados (vazia quando `valid` é `true`). */
  errors: string[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Creates a successful validation result.
 * @internal
 */
function ok(): ValueValidationResult {
  return { valid: true, errors: [] };
}

/**
 * Creates a failed validation result with one error message.
 * @internal
 */
function fail(message: string): ValueValidationResult {
  return { valid: false, errors: [message] };
}

// ---------------------------------------------------------------------------
// Opaque color: #RRGGBB (exactly 6 hex digits)
// ---------------------------------------------------------------------------

/**
 * Regex for opaque hex color: `#` followed by exactly 6 hex digits (case-insensitive).
 * @internal
 */
const HEX_COLOR_RE = /^#[0-9A-Fa-f]{6}$/;

/**
 * Valida se o valor é uma cor opaca no formato hexadecimal de 6 dígitos (`#RRGGBB`).
 *
 * Rejeita shorthands como `#FFF` e formatos de 8 dígitos (`#RRGGBBAA`).
 *
 * @param value - Valor a ser validado
 * @returns Resultado da validação
 *
 * @example
 * ```ts
 * validateOpaqueColor('#FAFAFA'); // { valid: true, errors: [] }
 * validateOpaqueColor('#FFF');    // { valid: false, errors: [...] }
 * ```
 *
 * @see Requisito 1.6
 */
export function validateOpaqueColor(value: string): ValueValidationResult {
  if (HEX_COLOR_RE.test(value)) {
    return ok();
  }
  return fail(
    `Cor opaca deve estar no formato hexadecimal de 6 dígitos (#RRGGBB), recebido: "${value}"`,
  );
}

// ---------------------------------------------------------------------------
// Alpha color: rgba(r,g,b,a)
// ---------------------------------------------------------------------------

/**
 * Regex for rgba color format.
 * Accepts `rgba(r, g, b, a)` with optional spaces around commas.
 * - r, g, b: integers 0–255
 * - a: decimal 0–1 (e.g. 0, 1, 0.5, .5)
 * @internal
 */
const RGBA_RE = /^rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(0|1|0?\.\d+|1\.0+)\s*\)$/;

/**
 * Valida se o valor é uma cor com transparência no formato `rgba(r,g,b,a)`.
 *
 * - r, g, b: inteiros de 0 a 255
 * - a: decimal de 0 a 1
 *
 * @param value - Valor a ser validado
 * @returns Resultado da validação
 *
 * @example
 * ```ts
 * validateAlphaColor('rgba(0,0,0,0.04)');   // { valid: true, errors: [] }
 * validateAlphaColor('rgba(255,255,255,1)'); // { valid: true, errors: [] }
 * validateAlphaColor('rgb(0,0,0)');          // { valid: false, errors: [...] }
 * ```
 *
 * @see Requisito 1.6
 */
export function validateAlphaColor(value: string): ValueValidationResult {
  const match = RGBA_RE.exec(value);
  if (!match) {
    return fail(
      `Cor com transparência deve estar no formato rgba(r,g,b,a), recebido: "${value}"`,
    );
  }

  const r = parseInt(match[1], 10);
  const g = parseInt(match[2], 10);
  const b = parseInt(match[3], 10);
  const a = parseFloat(match[4]);

  const errors: string[] = [];

  if (r < 0 || r > 255) errors.push(`Valor de R (${r}) deve estar entre 0 e 255`);
  if (g < 0 || g > 255) errors.push(`Valor de G (${g}) deve estar entre 0 e 255`);
  if (b < 0 || b > 255) errors.push(`Valor de B (${b}) deve estar entre 0 e 255`);
  if (a < 0 || a > 1) errors.push(`Valor de alpha (${a}) deve estar entre 0 e 1`);

  return errors.length === 0 ? ok() : { valid: false, errors };
}

// ---------------------------------------------------------------------------
// Spacing: value in px or rem
// ---------------------------------------------------------------------------

/**
 * Regex for spacing values: a non-negative number followed by `px` or `rem`.
 * Also accepts `0px` and `0rem`.
 * @internal
 */
const SPACING_RE = /^(\d+(\.\d+)?)(px|rem)$/;

/**
 * Valida se o valor é um espaçamento válido em `px` ou `rem`.
 *
 * Aceita valores não-negativos como `0px`, `4px`, `1.5rem`.
 *
 * @param value - Valor a ser validado
 * @returns Resultado da validação
 *
 * @example
 * ```ts
 * validateSpacing('4px');    // { valid: true, errors: [] }
 * validateSpacing('1.5rem'); // { valid: true, errors: [] }
 * validateSpacing('4em');    // { valid: false, errors: [...] }
 * ```
 *
 * @see Requisito 3.3
 */
export function validateSpacing(value: string): ValueValidationResult {
  if (SPACING_RE.test(value)) {
    return ok();
  }
  return fail(
    `Espaçamento deve estar no formato numérico com unidade px ou rem, recebido: "${value}"`,
  );
}

// ---------------------------------------------------------------------------
// Opacity: decimal in [0, 1]
// ---------------------------------------------------------------------------

/**
 * Valida se o valor é uma opacidade válida — número decimal no intervalo [0, 1].
 *
 * Aceita inteiros (0, 1) e decimais (0.5, 0.04).
 * Rejeita valores negativos e maiores que 1.
 *
 * @param value - Valor a ser validado (string representando um número)
 * @returns Resultado da validação
 *
 * @example
 * ```ts
 * validateOpacity('0');    // { valid: true, errors: [] }
 * validateOpacity('0.5');  // { valid: true, errors: [] }
 * validateOpacity('1');    // { valid: true, errors: [] }
 * validateOpacity('-0.1'); // { valid: false, errors: [...] }
 * validateOpacity('1.5');  // { valid: false, errors: [...] }
 * ```
 *
 * @see Requisito 6.2
 */
export function validateOpacity(value: string): ValueValidationResult {
  if (value.trim() === '') {
    return fail(`Opacidade deve ser um número decimal, recebido: "${value}"`);
  }

  const num = Number(value);

  if (isNaN(num)) {
    return fail(`Opacidade deve ser um número decimal, recebido: "${value}"`);
  }

  if (num < 0 || num > 1) {
    return fail(
      `Opacidade deve estar no intervalo [0, 1], recebido: ${num}`,
    );
  }

  return ok();
}

// ---------------------------------------------------------------------------
// Duration: value in ms
// ---------------------------------------------------------------------------

/**
 * Regex for duration values: a non-negative integer followed by `ms`.
 * @internal
 */
const DURATION_RE = /^(\d+)ms$/;

/**
 * Valida se o valor é uma duração válida em milissegundos (`ms`).
 *
 * Aceita valores inteiros não-negativos como `0ms`, `100ms`, `5000ms`.
 *
 * @param value - Valor a ser validado
 * @returns Resultado da validação
 *
 * @example
 * ```ts
 * validateDuration('100ms');  // { valid: true, errors: [] }
 * validateDuration('5000ms'); // { valid: true, errors: [] }
 * validateDuration('100');    // { valid: false, errors: [...] }
 * validateDuration('1.5ms');  // { valid: false, errors: [...] }
 * ```
 *
 * @see Requisito 7.3
 */
export function validateDuration(value: string): ValueValidationResult {
  if (DURATION_RE.test(value)) {
    return ok();
  }
  return fail(
    `Duração deve estar no formato inteiro com unidade ms (ex: "100ms"), recebido: "${value}"`,
  );
}

// ---------------------------------------------------------------------------
// Motion: cubic-bezier(a,b,c,d)
// ---------------------------------------------------------------------------

/**
 * Regex for cubic-bezier format.
 * Accepts `cubic-bezier(a, b, c, d)` where a,b,c,d are numbers (int or float,
 * possibly negative).
 * @internal
 */
const CUBIC_BEZIER_RE =
  /^cubic-bezier\(\s*(-?\d+(\.\d+)?)\s*,\s*(-?\d+(\.\d+)?)\s*,\s*(-?\d+(\.\d+)?)\s*,\s*(-?\d+(\.\d+)?)\s*\)$/;

/**
 * Valida se o valor é uma curva de motion no formato `cubic-bezier(a,b,c,d)`.
 *
 * Os parâmetros a, b, c, d podem ser números inteiros ou decimais (incluindo negativos).
 *
 * @param value - Valor a ser validado
 * @returns Resultado da validação
 *
 * @example
 * ```ts
 * validateMotion('cubic-bezier(0.42, 0, 0.58, 1)'); // { valid: true, errors: [] }
 * validateMotion('cubic-bezier(0, 0, 1, 1)');        // { valid: true, errors: [] }
 * validateMotion('ease-in-out');                      // { valid: false, errors: [...] }
 * ```
 *
 * @see Requisito 7.3
 */
export function validateMotion(value: string): ValueValidationResult {
  if (CUBIC_BEZIER_RE.test(value)) {
    return ok();
  }
  return fail(
    `Motion deve estar no formato cubic-bezier(a,b,c,d), recebido: "${value}"`,
  );
}

// ---------------------------------------------------------------------------
// Shadow: CSS box-shadow format
// ---------------------------------------------------------------------------

/**
 * Regex for a single CSS box-shadow layer.
 * Format: `{offset-x}px {offset-y}px {blur}px {spread?}px? {color}`
 * Color can be hex (#RRGGBB) or rgba(r,g,b,a).
 * @internal
 */
const SHADOW_LAYER_RE =
  /^(-?\d+(\.\d+)?)px\s+(-?\d+(\.\d+)?)px\s+(-?\d+(\.\d+)?)px(\s+(-?\d+(\.\d+)?)px)?\s+(#[0-9A-Fa-f]{6}|rgba\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*(0|1|0?\.\d+|1\.0+)\s*\))$/;

/**
 * Valida se o valor é uma sombra CSS válida no formato box-shadow.
 *
 * Formato aceito: `{offset-x}px {offset-y}px {blur}px [spread]px {color}`
 * onde color pode ser `#RRGGBB` ou `rgba(r,g,b,a)`.
 *
 * Aceita múltiplas camadas separadas por vírgula.
 *
 * @param value - Valor a ser validado
 * @returns Resultado da validação
 *
 * @example
 * ```ts
 * validateShadow('0px 1px 2px rgba(0,0,0,0.12)');           // { valid: true, errors: [] }
 * validateShadow('0px 1px 2px 0px rgba(0,0,0,0.12)');       // { valid: true, errors: [] }
 * validateShadow('0px 1px 2px #000000');                     // { valid: true, errors: [] }
 * validateShadow('none');                                     // { valid: false, errors: [...] }
 * ```
 *
 * @see Requisito 5.2
 */
export function validateShadow(value: string): ValueValidationResult {
  // Split by comma for multi-layer shadows, but be careful not to split
  // inside rgba() parentheses
  const layers = splitShadowLayers(value);

  if (layers.length === 0) {
    return fail(`Sombra deve ter pelo menos uma camada no formato CSS box-shadow, recebido: "${value}"`);
  }

  for (let i = 0; i < layers.length; i++) {
    const layer = layers[i].trim();
    if (!SHADOW_LAYER_RE.test(layer)) {
      return fail(
        `Camada de sombra ${i + 1} inválida. Formato esperado: "{offset-x}px {offset-y}px {blur}px [spread]px {color}", recebido: "${layer}"`,
      );
    }
  }

  return ok();
}

/**
 * Splits a box-shadow value into individual layers, respecting parentheses
 * in rgba() color values.
 * @internal
 */
function splitShadowLayers(value: string): string[] {
  const layers: string[] = [];
  let current = '';
  let depth = 0;

  for (const ch of value) {
    if (ch === '(') {
      depth++;
      current += ch;
    } else if (ch === ')') {
      depth--;
      current += ch;
    } else if (ch === ',' && depth === 0) {
      layers.push(current);
      current = '';
    } else {
      current += ch;
    }
  }

  if (current.trim().length > 0) {
    layers.push(current);
  }

  return layers;
}

// ---------------------------------------------------------------------------
// Breakpoint / Z-index: unitless integer
// ---------------------------------------------------------------------------

/**
 * Regex for unitless non-negative integer.
 * @internal
 */
const UNITLESS_INT_RE = /^\d+$/;

/**
 * Valida se o valor é um número inteiro sem unidade (para breakpoint e z-index).
 *
 * Aceita inteiros não-negativos como `0`, `768`, `1080`.
 * Rejeita decimais, negativos e valores com unidade.
 *
 * @param value - Valor a ser validado
 * @returns Resultado da validação
 *
 * @example
 * ```ts
 * validateUnitlessInteger('768');  // { valid: true, errors: [] }
 * validateUnitlessInteger('0');    // { valid: true, errors: [] }
 * validateUnitlessInteger('1.5'); // { valid: false, errors: [...] }
 * validateUnitlessInteger('768px'); // { valid: false, errors: [...] }
 * ```
 *
 * @see Requisito 7.3
 */
export function validateUnitlessInteger(value: string): ValueValidationResult {
  if (UNITLESS_INT_RE.test(value)) {
    return ok();
  }
  return fail(
    `Valor deve ser um número inteiro sem unidade, recebido: "${value}"`,
  );
}

// ---------------------------------------------------------------------------
// Dispatcher: validate value by category
// ---------------------------------------------------------------------------

/**
 * Tipo de formato de valor suportado pelo validador.
 */
export type ValueFormatCategory =
  | 'opaque-color'
  | 'alpha-color'
  | 'spacing'
  | 'opacity'
  | 'duration'
  | 'motion'
  | 'shadow'
  | 'unitless-integer';

/**
 * Valida o formato de um valor de token com base na sua categoria.
 *
 * Despacha para a função de validação específica da categoria.
 *
 * @param value - Valor a ser validado
 * @param category - Categoria do formato de valor
 * @returns Resultado da validação
 *
 * @example
 * ```ts
 * validateValueFormat('#FAFAFA', 'opaque-color');           // { valid: true, errors: [] }
 * validateValueFormat('rgba(0,0,0,0.5)', 'alpha-color');    // { valid: true, errors: [] }
 * validateValueFormat('4px', 'spacing');                     // { valid: true, errors: [] }
 * validateValueFormat('0.5', 'opacity');                     // { valid: true, errors: [] }
 * validateValueFormat('100ms', 'duration');                  // { valid: true, errors: [] }
 * validateValueFormat('cubic-bezier(0,0,1,1)', 'motion');   // { valid: true, errors: [] }
 * validateValueFormat('0px 1px 2px rgba(0,0,0,0.1)', 'shadow'); // { valid: true, errors: [] }
 * validateValueFormat('768', 'unitless-integer');            // { valid: true, errors: [] }
 * ```
 *
 * @see Requisitos 1.6, 3.3, 5.2, 6.2, 7.3
 */
export function validateValueFormat(
  value: string,
  category: ValueFormatCategory,
): ValueValidationResult {
  switch (category) {
    case 'opaque-color':
      return validateOpaqueColor(value);
    case 'alpha-color':
      return validateAlphaColor(value);
    case 'spacing':
      return validateSpacing(value);
    case 'opacity':
      return validateOpacity(value);
    case 'duration':
      return validateDuration(value);
    case 'motion':
      return validateMotion(value);
    case 'shadow':
      return validateShadow(value);
    case 'unitless-integer':
      return validateUnitlessInteger(value);
    default: {
      const _exhaustive: never = category;
      return fail(`Categoria de formato desconhecida: ${_exhaustive}`);
    }
  }
}
