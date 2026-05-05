/**
 * @module theme-interface
 * @description Gerador da interface TypeScript `theme.d.ts` para os Base Tokens.
 *
 * Gera uma interface `Theme` contendo todas as entradas dos Base Tokens com
 * prefixo `LfBs`, tipando cada propriedade de acordo com a categoria do token:
 * - Tokens numéricos (breakpoint, z-index) → tipo `number`
 * - Demais tokens → tipo `string`
 *
 * @see {@link ../models/base-token.types.ts} para `BaseToken`
 * @see {@link ../utils/token-sorting.ts} para ordenação consistente
 */

import type { BaseToken } from '../models/base-token.types';
import { sortTokens } from '../utils/token-sorting';

/** Auto-generated file header comment. */
const AUTO_GENERATED_COMMENT = 'Do not edit directly, this file was auto-generated.';

/**
 * Generates the TypeScript `theme.d.ts` interface containing all Base Tokens.
 *
 * Each token is represented as a property in the `Theme` interface with:
 * - Name: the camelCase token name with `LfBs` prefix
 * - Type: `number` for numeric tokens (breakpoint, z-index), `string` for all others
 *
 * Tokens are sorted using the standard sorting function to ensure consistent
 * ordering across all platform outputs.
 *
 * @param tokens - Array of Base Tokens processed by the pipeline
 * @returns Complete content of the `theme.d.ts` file
 *
 * @example
 * ```ts
 * const content = generateThemeInterface([
 *   { name: 'LfBsColorNeutral100', tsType: 'string', ... },
 *   { name: 'LfBsBreakpointSm', tsType: 'number', ... },
 * ]);
 * // Returns:
 * // export interface Theme {
 * //   LfBsColorNeutral100: string;
 * //   LfBsBreakpointSm: number;
 * // }
 * ```
 */
export function generateThemeInterface(tokens: BaseToken[]): string {
  const sorted = sortTokens(tokens);

  const lines: string[] = [
    `/**`,
    ` * ${AUTO_GENERATED_COMMENT}`,
    ` */`,
    ``,
    `export interface Theme {`,
  ];

  for (const token of sorted) {
    lines.push(`  ${token.name}: ${token.tsType};`);
  }

  lines.push(`}`);
  lines.push(``);

  return lines.join('\n');
}
