/**
 * @module naming-convention
 * @description Validação e conversão de nomes de Base Tokens do design system Lift.
 *
 * Implementa as funções de conversão entre os três formatos de nome:
 * - **camelCase** com prefixo `LfBs` (ex: `LfBsColorNeutral100`)
 * - **CSS custom property** com prefixo `--lf-bs-` (ex: `--lf-bs-color-neutral-100`)
 * - **Figma path** hierárquico (ex: `Base/Colors/Neutral/100`)
 *
 * A propriedade round-trip é garantida:
 * `cssPropertyToCamel(camelToCssProperty(name)) === name` para qualquer nome válido.
 *
 * @see {@link ../models/base-token.types.ts} para `NamingValidationResult`
 * @see {@link ../constants/base-token-config.ts} para `BASE_TOKEN_PREFIX` e `BASE_TOKEN_CSS_PREFIX`
 */

import type { NamingValidationResult } from '../models/base-token.types';
import { BASE_TOKEN_PREFIX, BASE_TOKEN_CSS_PREFIX } from '../constants/base-token-config';

/**
 * Splits a camelCase string (after the LfBs prefix) into lowercase segments,
 * keeping consecutive uppercase letters as a single segment and treating
 * digit sequences as their own segment.
 *
 * Examples:
 *   "ColorNeutral100"   → ["color", "neutral", "100"]
 *   "BorderRadiusXxSmall" → ["border", "radius", "xx", "small"]
 *   "ZindexValue"       → ["zindex", "value"]  — but we handle z-index specially
 *
 * @internal
 */
function splitCamelSegments(str: string): string[] {
  const segments: string[] = [];
  let current = '';

  for (let i = 0; i < str.length; i++) {
    const ch = str[i];

    if (/\d/.test(ch)) {
      // If current has alpha chars, flush them first
      if (current.length > 0 && !/\d/.test(current[0])) {
        segments.push(current.toLowerCase());
        current = '';
      }
      current += ch;
    } else if (ch === ch.toUpperCase() && ch !== ch.toLowerCase()) {
      // Uppercase letter — start a new segment (unless current is empty)
      if (current.length > 0) {
        segments.push(current.toLowerCase());
        current = '';
      }
      current += ch;
    } else {
      current += ch;
    }
  }

  if (current.length > 0) {
    segments.push(current.toLowerCase());
  }

  return segments;
}

/**
 * Valida se um nome de token segue a convenção `LfBs` + categoria + variante.
 *
 * @param tokenName - Nome em camelCase (ex: `"LfBsColorNeutral100"`)
 * @returns Resultado da validação com lista de erros encontrados
 *
 * @example
 * ```ts
 * validateTokenName('LfBsColorNeutral100');
 * // { valid: true, tokenName: 'LfBsColorNeutral100', errors: [] }
 *
 * validateTokenName('LfColorNeutral100');
 * // { valid: false, tokenName: 'LfColorNeutral100', errors: ['Nome deve começar com o prefixo "LfBs"'] }
 * ```
 *
 * @see Requisitos 11.1, 11.4
 */
export function validateTokenName(tokenName: string): NamingValidationResult {
  const errors: string[] = [];

  if (!tokenName || typeof tokenName !== 'string') {
    return { valid: false, tokenName: tokenName ?? '', errors: ['Nome do token é obrigatório'] };
  }

  // Check prefix
  if (!tokenName.startsWith(BASE_TOKEN_PREFIX)) {
    errors.push(`Nome deve começar com o prefixo "${BASE_TOKEN_PREFIX}"`);
  }

  // After prefix, there must be more content
  if (tokenName === BASE_TOKEN_PREFIX) {
    errors.push('Nome deve conter categoria e variante após o prefixo');
  }

  // The character after the prefix should be uppercase (start of category)
  if (tokenName.length > BASE_TOKEN_PREFIX.length) {
    const afterPrefix = tokenName[BASE_TOKEN_PREFIX.length];
    if (afterPrefix !== afterPrefix.toUpperCase() || afterPrefix === afterPrefix.toLowerCase()) {
      errors.push('Categoria deve começar com letra maiúscula após o prefixo');
    }
  }

  // Check for invalid characters (only alphanumeric allowed)
  if (!/^[A-Za-z0-9]+$/.test(tokenName)) {
    errors.push('Nome deve conter apenas caracteres alfanuméricos (camelCase)');
  }

  return {
    valid: errors.length === 0,
    tokenName,
    errors,
  };
}

/**
 * Converte nome camelCase com prefixo `LfBs` para CSS custom property.
 *
 * Segmentos são separados por hífens e convertidos para minúsculas.
 * Segmentos numéricos são mantidos como estão.
 *
 * @param camelName - Nome em camelCase com prefixo `LfBs`
 * @returns CSS custom property string com prefixo `--lf-bs-`
 *
 * @example
 * ```ts
 * camelToCssProperty('LfBsColorNeutral100');
 * // '--lf-bs-color-neutral-100'
 *
 * camelToCssProperty('LfBsBorderRadiusXxSmall');
 * // '--lf-bs-border-radius-xx-small'
 * ```
 *
 * @see Requisito 11.2
 */
export function camelToCssProperty(camelName: string): string {
  // Remove the LfBs prefix
  const body = camelName.slice(BASE_TOKEN_PREFIX.length);

  // Split into segments
  const segments = splitCamelSegments(body);

  // Join with hyphens and prepend CSS prefix
  return BASE_TOKEN_CSS_PREFIX + segments.join('-');
}

/**
 * Converte CSS custom property com prefixo `--lf-bs-` para nome camelCase.
 *
 * Cada segmento separado por hífen é capitalizado (PascalCase).
 * Segmentos puramente numéricos são mantidos como estão.
 *
 * @param cssProperty - CSS custom property com prefixo `--lf-bs-`
 * @returns Nome em camelCase com prefixo `LfBs`
 *
 * @example
 * ```ts
 * cssPropertyToCamel('--lf-bs-color-neutral-100');
 * // 'LfBsColorNeutral100'
 *
 * cssPropertyToCamel('--lf-bs-border-radius-xx-small');
 * // 'LfBsBorderRadiusXxSmall'
 * ```
 *
 * @see Requisito 11.3
 */
export function cssPropertyToCamel(cssProperty: string): string {
  // Remove the CSS prefix
  const body = cssProperty.slice(BASE_TOKEN_CSS_PREFIX.length);

  // Split by hyphens
  const segments = body.split('-');

  // Capitalize each segment (PascalCase), but keep pure numbers as-is
  const camelSegments = segments.map((segment) => {
    // Pure numeric segment — keep as-is
    if (/^\d+$/.test(segment)) {
      return segment;
    }
    // Capitalize first letter
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  });

  return BASE_TOKEN_PREFIX + camelSegments.join('');
}

/**
 * Mapa de segmentos do Figma que precisam de normalização para o padrão camelCase.
 *
 * O Figma usa nomes no plural ou diferentes do padrão interno do Lift.
 * @internal
 */
const FIGMA_SEGMENT_MAP: Record<string, string> = {
  'Colors': 'Color',
  'Sizing': '',
};

/**
 * Converte path hierárquico do Figma para nome camelCase com prefixo `LfBs`.
 *
 * O path do Figma segue o formato `Base/Colors/Neutral/100` e é convertido
 * para `LfBsColorNeutral100`.
 *
 * @param figmaPath - Caminho hierárquico do Figma (separado por `/`)
 * @returns Nome em camelCase com prefixo `LfBs`
 *
 * @example
 * ```ts
 * figmaPathToCamel('Base/Colors/Neutral/100');
 * // 'LfBsColorNeutral100'
 *
 * figmaPathToCamel('Base/Sizing/border/radius/xx-small');
 * // 'LfBsBorderRadiusXxSmall'
 * ```
 *
 * @see Requisito 11.4
 */
export function figmaPathToCamel(figmaPath: string): string {
  const parts = figmaPath.split('/');

  // Remove the "Base" prefix if present
  const startIndex = parts[0] === 'Base' ? 1 : 0;

  const camelParts: string[] = [];

  for (let i = startIndex; i < parts.length; i++) {
    const part = parts[i];

    // Check if this segment needs mapping
    const mapped = FIGMA_SEGMENT_MAP[part];
    if (mapped !== undefined) {
      // If mapped to empty string, skip this segment (e.g., "Sizing" is structural)
      if (mapped !== '') {
        camelParts.push(mapped);
      }
      continue;
    }

    // Handle hyphenated segments (e.g., "xx-small" → "XxSmall")
    if (part.includes('-')) {
      const subParts = part.split('-');
      for (const sub of subParts) {
        if (/^\d+$/.test(sub)) {
          camelParts.push(sub);
        } else {
          camelParts.push(sub.charAt(0).toUpperCase() + sub.slice(1).toLowerCase());
        }
      }
      continue;
    }

    // Pure numeric segment — keep as-is
    if (/^\d+$/.test(part)) {
      camelParts.push(part);
      continue;
    }

    // Regular segment — capitalize first letter
    camelParts.push(part.charAt(0).toUpperCase() + part.slice(1));
  }

  return BASE_TOKEN_PREFIX + camelParts.join('');
}
