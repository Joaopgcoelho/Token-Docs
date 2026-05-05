/**
 * @module platform-formats
 * @description Configuração das 6 plataformas de saída para Base Tokens.
 *
 * Define os formatadores para cada plataforma de saída suportada pelo pipeline
 * de build do `@lift/ds-tokens`:
 *
 * | Plataforma  | Formato                                                        |
 * |-------------|----------------------------------------------------------------|
 * | CSS         | `--lf-bs-color-neutral-100: #FAFAFA;` (custom property em `:root`) |
 * | SCSS        | `$lf-bs-color-neutral-100: #FAFAFA;`                           |
 * | JS (CJS)    | `exports.LfBsColorNeutral100 = "#FAFAFA";` (module.exports)   |
 * | TS (ESM)    | `export const LfBsColorNeutral100 = "#FAFAFA";`               |
 * | Android XML | `<color name="lf_bs_color_neutral_100">#FAFAFA</color>`        |
 * | iOS Swift   | `static let lfBsColorNeutral100 = "#FAFAFA"`                  |
 *
 * Cada plataforma gera saídas por marca (8 marcas) e por modo (default, high-contrast).
 *
 * @see {@link ../validators/naming-convention.ts} para conversão de nomes
 * @see {@link ../constants/base-token-config.ts} para constantes de configuração
 * @see {@link ../models/base-token.types.ts} para `BaseToken` e `PlatformOutput`
 */

import type { BaseToken, Platform, PlatformOutput } from '../models/base-token.types';
import { camelToCssProperty } from '../validators/naming-convention';
import { sortTokens } from '../utils/token-sorting';
import {
  BASE_TOKEN_CSS_PREFIX,
  BRAND_NAMES,
} from '../constants/base-token-config';

// ---------------------------------------------------------------------------
// Name conversion helpers
// ---------------------------------------------------------------------------

/**
 * Converts a camelCase token name to SCSS variable name.
 *
 * Strips the `LfBs` prefix, converts to kebab-case, and prepends `$lf-bs-`.
 * Example: `LfBsColorNeutral100` → `$lf-bs-color-neutral-100`
 *
 * @param token - Base token with name and cssProperty
 * @returns SCSS variable name
 */
function toScssVariableName(token: BaseToken): string {
  // cssProperty is already `--lf-bs-color-neutral-100`, strip the `--` prefix and add `$`
  return '$' + token.cssProperty.slice(2);
}

/**
 * Converts a camelCase token name to Android XML resource name.
 *
 * Strips the `--` prefix from the CSS property and replaces hyphens with underscores.
 * Example: `--lf-bs-color-neutral-100` → `lf_bs_color_neutral_100`
 *
 * @param token - Base token with cssProperty
 * @returns Android XML resource name
 */
function toAndroidResourceName(token: BaseToken): string {
  // Strip `--` prefix and replace hyphens with underscores
  return token.cssProperty.slice(2).replace(/-/g, '_');
}

/**
 * Converts a camelCase token name to iOS Swift constant name.
 *
 * Uses the camelCase name with first letter lowercased.
 * Example: `LfBsColorNeutral100` → `lfBsColorNeutral100`
 *
 * @param token - Base token with name
 * @returns iOS Swift constant name (lowerCamelCase)
 */
function toSwiftConstantName(token: BaseToken): string {
  return token.name.charAt(0).toLowerCase() + token.name.slice(1);
}

// ---------------------------------------------------------------------------
// Value formatting helpers
// ---------------------------------------------------------------------------

/**
 * Formats a token value for string-based platforms (CSS, SCSS).
 * Values are output as-is (no quoting).
 */
function formatRawValue(token: BaseToken): string {
  return token.value;
}

/**
 * Formats a token value for JavaScript/TypeScript platforms.
 * Numeric types are output without quotes; string types are quoted.
 */
function formatJsValue(token: BaseToken): string {
  if (token.tsType === 'number') {
    return token.value;
  }
  return `"${token.value}"`;
}

// ---------------------------------------------------------------------------
// Per-token line formatters
// ---------------------------------------------------------------------------

/**
 * Formats a single token as a CSS custom property declaration.
 *
 * @example `--lf-bs-color-neutral-100: #FAFAFA;`
 */
export function formatCssToken(token: BaseToken): string {
  return `  ${token.cssProperty}: ${formatRawValue(token)};`;
}

/**
 * Formats a single token as a SCSS variable declaration.
 *
 * @example `$lf-bs-color-neutral-100: #FAFAFA;`
 */
export function formatScssToken(token: BaseToken): string {
  return `${toScssVariableName(token)}: ${formatRawValue(token)};`;
}

/**
 * Formats a single token as a JavaScript CJS export.
 *
 * @example `  "LfBsColorNeutral100": "#FAFAFA",`
 */
export function formatJsCjsToken(token: BaseToken): string {
  return `  "${token.name}": ${formatJsValue(token)},`;
}

/**
 * Formats a single token as a TypeScript ESM export.
 *
 * @example `export const LfBsColorNeutral100 = "#FAFAFA";`
 */
export function formatTsEsmToken(token: BaseToken): string {
  return `export const ${token.name} = ${formatJsValue(token)};`;
}

/**
 * Formats a single token as an Android XML resource element.
 *
 * Uses `<color>` for color tokens and `<string>` for all other types.
 *
 * @example `  <color name="lf_bs_color_neutral_100">#FAFAFA</color>`
 * @example `  <string name="lf_bs_breakpoint_xs">0</string>`
 */
export function formatAndroidXmlToken(token: BaseToken): string {
  const resourceName = toAndroidResourceName(token);
  const tag = token.category === 'color' ? 'color' : 'string';
  return `  <${tag} name="${resourceName}">${token.value}</${tag}>`;
}

/**
 * Formats a single token as an iOS Swift static constant.
 *
 * @example `    public static let lfBsColorNeutral100 = "#FAFAFA"`
 */
export function formatIosSwiftToken(token: BaseToken): string {
  const constName = toSwiftConstantName(token);
  const value = token.tsType === 'number' ? token.value : `"${token.value}"`;
  return `    public static let ${constName} = ${value}`;
}

// ---------------------------------------------------------------------------
// Full-file formatters
// ---------------------------------------------------------------------------

/** Auto-generated file header comment. */
const AUTO_GENERATED_COMMENT = 'Do not edit directly, this file was auto-generated.';

/**
 * Generates a complete CSS file with all tokens as custom properties in `:root`.
 *
 * @param tokens - Array of Base Tokens (will be sorted)
 * @returns Complete CSS file content
 *
 * @example
 * ```css
 * :root {
 *   --lf-bs-color-neutral-100: #FAFAFA;
 *   --lf-bs-color-neutral-200: #F5F5F5;
 * }
 * ```
 */
export function generateCssFile(tokens: readonly BaseToken[]): string {
  const sorted = sortTokens(tokens);
  const lines = [
    `/**`,
    ` * ${AUTO_GENERATED_COMMENT}`,
    ` */`,
    ``,
    `:root {`,
    ...sorted.map(formatCssToken),
    `}`,
    ``,
  ];
  return lines.join('\n');
}

/**
 * Generates a complete SCSS file with all tokens as variables.
 *
 * @param tokens - Array of Base Tokens (will be sorted)
 * @returns Complete SCSS file content
 *
 * @example
 * ```scss
 * $lf-bs-color-neutral-100: #FAFAFA;
 * $lf-bs-color-neutral-200: #F5F5F5;
 * ```
 */
export function generateScssFile(tokens: readonly BaseToken[]): string {
  const sorted = sortTokens(tokens);
  const lines = [
    ``,
    `// ${AUTO_GENERATED_COMMENT}`,
    ``,
    ...sorted.map(formatScssToken),
    ``,
  ];
  return lines.join('\n');
}

/**
 * Generates a complete JavaScript CJS file with all tokens as module exports.
 *
 * @param tokens - Array of Base Tokens (will be sorted)
 * @returns Complete CJS file content
 *
 * @example
 * ```js
 * module.exports = {
 *   "LfBsColorNeutral100": "#FAFAFA",
 * };
 * ```
 */
export function generateJsCjsFile(tokens: readonly BaseToken[]): string {
  const sorted = sortTokens(tokens);
  const lines = [
    `/**`,
    ` * ${AUTO_GENERATED_COMMENT}`,
    ` */`,
    ``,
    `module.exports = {`,
    ...sorted.map(formatJsCjsToken),
    `};`,
    ``,
  ];
  return lines.join('\n');
}

/**
 * Generates a complete TypeScript ESM file with all tokens as named exports.
 *
 * @param tokens - Array of Base Tokens (will be sorted)
 * @returns Complete ESM file content
 *
 * @example
 * ```ts
 * export const LfBsColorNeutral100 = "#FAFAFA";
 * ```
 */
export function generateTsEsmFile(tokens: readonly BaseToken[]): string {
  const sorted = sortTokens(tokens);
  const lines = [
    `/**`,
    ` * ${AUTO_GENERATED_COMMENT}`,
    ` */`,
    ...sorted.map(formatTsEsmToken),
    ``,
  ];
  return lines.join('\n');
}

/**
 * Generates a complete Android XML resources file.
 *
 * @param tokens - Array of Base Tokens (will be sorted)
 * @returns Complete Android XML file content
 *
 * @example
 * ```xml
 * <?xml version="1.0" encoding="UTF-8"?>
 * <resources>
 *   <color name="lf_bs_color_neutral_100">#FAFAFA</color>
 * </resources>
 * ```
 */
export function generateAndroidXmlFile(tokens: readonly BaseToken[]): string {
  const sorted = sortTokens(tokens);
  const lines = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    ``,
    `<!--`,
    `  ${AUTO_GENERATED_COMMENT}`,
    `-->`,
    `<resources>`,
    ...sorted.map(formatAndroidXmlToken),
    `</resources>`,
    ``,
  ];
  return lines.join('\n');
}

/**
 * Generates a complete iOS Swift file with all tokens as static constants.
 *
 * @param tokens - Array of Base Tokens (will be sorted)
 * @returns Complete Swift file content
 *
 * @example
 * ```swift
 * import SwiftUI
 *
 * public class LiftBaseTokens {
 *     public static let lfBsColorNeutral100 = "#FAFAFA"
 * }
 * ```
 */
export function generateIosSwiftFile(tokens: readonly BaseToken[]): string {
  const sorted = sortTokens(tokens);
  const lines = [
    ``,
    `//`,
    `// LiftBaseTokens.swift`,
    `//`,
    ``,
    `// ${AUTO_GENERATED_COMMENT}`,
    ``,
    ``,
    `import SwiftUI`,
    ``,
    `public class LiftBaseTokens {`,
    ...sorted.map(formatIosSwiftToken),
    `}`,
    ``,
  ];
  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Platform output configurations
// ---------------------------------------------------------------------------

/**
 * Creates a PlatformOutput configuration for CSS.
 *
 * @param brand - Brand name (e.g., 'estacio')
 * @param mode - Output mode (e.g., 'default', 'high-contrast')
 * @returns PlatformOutput for CSS
 */
export function createCssPlatform(brand: string, mode: string = 'default'): PlatformOutput {
  return {
    platform: 'css',
    fileExtension: '.css',
    outputPath: `brands/${brand}/css/${mode}.css`,
    formatFn: formatCssToken,
  };
}

/**
 * Creates a PlatformOutput configuration for SCSS.
 *
 * @param brand - Brand name
 * @param mode - Output mode
 * @returns PlatformOutput for SCSS
 */
export function createScssPlatform(brand: string, mode: string = 'default'): PlatformOutput {
  return {
    platform: 'scss',
    fileExtension: '.scss',
    outputPath: `brands/${brand}/scss/${mode}.scss`,
    formatFn: formatScssToken,
  };
}

/**
 * Creates a PlatformOutput configuration for JavaScript CJS.
 *
 * @param brand - Brand name
 * @param mode - Output mode
 * @returns PlatformOutput for JS CJS
 */
export function createJsCjsPlatform(brand: string, mode: string = 'default'): PlatformOutput {
  return {
    platform: 'js',
    fileExtension: '.cjs',
    outputPath: `brands/${brand}/js/${mode}.cjs`,
    formatFn: formatJsCjsToken,
  };
}

/**
 * Creates a PlatformOutput configuration for TypeScript ESM.
 *
 * @param brand - Brand name
 * @param mode - Output mode
 * @returns PlatformOutput for TS ESM
 */
export function createTsEsmPlatform(brand: string, mode: string = 'default'): PlatformOutput {
  return {
    platform: 'ts',
    fileExtension: '.js',
    outputPath: `brands/${brand}/ts/${mode}.js`,
    formatFn: formatTsEsmToken,
  };
}

/**
 * Creates a PlatformOutput configuration for Android XML.
 *
 * @param brand - Brand name
 * @param mode - Output mode
 * @returns PlatformOutput for Android XML
 */
export function createAndroidPlatform(brand: string, mode: string = 'default'): PlatformOutput {
  return {
    platform: 'android',
    fileExtension: '.xml',
    outputPath: `brands/${brand}/android/${mode}.xml`,
    formatFn: formatAndroidXmlToken,
  };
}

/**
 * Creates a PlatformOutput configuration for iOS Swift.
 *
 * @param brand - Brand name
 * @param mode - Output mode
 * @returns PlatformOutput for iOS Swift
 */
export function createIosPlatform(brand: string, mode: string = 'default'): PlatformOutput {
  return {
    platform: 'ios',
    fileExtension: '.swift',
    outputPath: `brands/${brand}/ios/${mode}.swift`,
    formatFn: formatIosSwiftToken,
  };
}

// ---------------------------------------------------------------------------
// All platforms factory
// ---------------------------------------------------------------------------

/**
 * Output modes supported by the build pipeline.
 */
export const OUTPUT_MODES = ['default', 'high-contrast'] as const;

/**
 * Creates PlatformOutput configurations for all 6 platforms for a given brand and mode.
 *
 * @param brand - Brand name (e.g., 'estacio')
 * @param mode - Output mode (e.g., 'default', 'high-contrast')
 * @returns Array of 6 PlatformOutput configurations
 *
 * @example
 * ```ts
 * const platforms = createAllPlatforms('estacio', 'default');
 * // Returns: [css, scss, js, ts, android, ios] PlatformOutput configs
 * ```
 */
export function createAllPlatforms(brand: string, mode: string = 'default'): PlatformOutput[] {
  return [
    createCssPlatform(brand, mode),
    createScssPlatform(brand, mode),
    createJsCjsPlatform(brand, mode),
    createTsEsmPlatform(brand, mode),
    createAndroidPlatform(brand, mode),
    createIosPlatform(brand, mode),
  ];
}

/**
 * Creates PlatformOutput configurations for all brands, all modes, and all platforms.
 *
 * Generates 6 platforms × 8 brands × 2 modes = 96 output configurations.
 *
 * @returns Map of `{brand}/{mode}` → array of PlatformOutput configurations
 *
 * @example
 * ```ts
 * const allOutputs = createAllBrandPlatforms();
 * const estacioPlatforms = allOutputs['estacio/default'];
 * ```
 */
export function createAllBrandPlatforms(): Record<string, PlatformOutput[]> {
  const result: Record<string, PlatformOutput[]> = {};

  for (const brand of BRAND_NAMES) {
    for (const mode of OUTPUT_MODES) {
      const key = `${brand}/${mode}`;
      result[key] = createAllPlatforms(brand, mode);
    }
  }

  return result;
}

/**
 * Generates all output files for a given set of tokens and a specific brand/mode.
 *
 * @param tokens - Array of Base Tokens
 * @param brand - Brand name
 * @param mode - Output mode
 * @returns Map of output path → file content
 *
 * @example
 * ```ts
 * const files = generateAllPlatformFiles(tokens, 'estacio', 'default');
 * // files['brands/estacio/css/default.css'] = ':root { ... }'
 * ```
 */
export function generateAllPlatformFiles(
  tokens: readonly BaseToken[],
  brand: string,
  mode: string = 'default',
): Record<string, string> {
  const result: Record<string, string> = {};
  const platforms = createAllPlatforms(brand, mode);

  for (const platform of platforms) {
    let content: string;

    switch (platform.platform) {
      case 'css':
        content = generateCssFile(tokens);
        break;
      case 'scss':
        content = generateScssFile(tokens);
        break;
      case 'js':
        content = generateJsCjsFile(tokens);
        break;
      case 'ts':
        content = generateTsEsmFile(tokens);
        break;
      case 'android':
        content = generateAndroidXmlFile(tokens);
        break;
      case 'ios':
        content = generateIosSwiftFile(tokens);
        break;
      default:
        content = '';
    }

    result[platform.outputPath] = content;
  }

  return result;
}
