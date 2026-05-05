/**
 * @module style-dictionary-config
 * @description Configuração do Style Dictionary para processamento dos Base Tokens.
 *
 * Define transforms customizados para conversão de nomes (Figma path → camelCase → CSS property),
 * filters para isolar tokens com prefixo `LfBs`, e actions de validação que interrompem
 * o build quando nomes inválidos ou inconsistências cross-marca são detectados.
 *
 * Este módulo é consumido pelo pipeline de build do `@lift/ds-tokens` (Style Dictionary 4.x).
 *
 * @see {@link ../validators/naming-convention.ts} para funções de conversão de nomes
 * @see {@link ../validators/cross-brand-consistency.ts} para verificação cross-marca
 * @see {@link ../constants/base-token-config.ts} para constantes de configuração
 */

import { validateTokenName, camelToCssProperty, figmaPathToCamel } from '../validators/naming-convention';
import { checkCrossBrandConsistency } from '../validators/cross-brand-consistency';
import { sortTokens } from '../utils/token-sorting';
import type { BaseToken, TokenCategory } from '../models/base-token.types';
import {
  BASE_TOKEN_PREFIX,
  BASE_TOKEN_CSS_PREFIX,
  BRAND_NAMES,
  INVARIANT_CATEGORIES,
} from '../constants/base-token-config';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Represents a Style Dictionary token as received during transforms.
 * Simplified interface matching the relevant fields from Style Dictionary 4.x.
 */
export interface SDToken {
  /** Original token name or path from the source JSON. */
  name: string;
  /** Resolved value of the token. */
  value: string;
  /** Token path segments (e.g., ['Base', 'Colors', 'Neutral', '100']). */
  path: string[];
  /** Token type (e.g., 'color', 'dimension'). */
  $type?: string;
  /** Additional attributes set by transforms. */
  attributes?: Record<string, string>;
}

/**
 * Configuration for a Style Dictionary transform.
 */
export interface TransformConfig {
  /** Unique name for the transform. */
  name: string;
  /** Transform type: 'name', 'value', or 'attribute'. */
  type: 'name' | 'value' | 'attribute';
  /** Filter function — return true to apply the transform to this token. */
  filter: (token: SDToken) => boolean;
  /** Transform function — returns the transformed value. */
  transform: (token: SDToken) => string | Record<string, string>;
}

/**
 * Configuration for a Style Dictionary filter.
 */
export interface FilterConfig {
  /** Unique name for the filter. */
  name: string;
  /** Filter function — return true to include the token. */
  filter: (token: SDToken) => boolean;
}

/**
 * Configuration for a Style Dictionary action.
 */
export interface ActionConfig {
  /** Unique name for the action. */
  name: string;
  /** Action function executed during the build. */
  do: (tokens: SDToken[], config?: Record<string, unknown>) => void;
}

/**
 * Complete Style Dictionary configuration for Base Tokens.
 */
export interface StyleDictionaryBaseConfig {
  /** Custom transforms for name conversion. */
  transforms: TransformConfig[];
  /** Filters to isolate Base Tokens. */
  filters: FilterConfig[];
  /** Build actions for validation. */
  actions: ActionConfig[];
  /** Brand names to process. */
  brands: readonly string[];
  /** Categories that must have identical values across brands. */
  invariantCategories: readonly string[];
}

// ---------------------------------------------------------------------------
// Transforms
// ---------------------------------------------------------------------------

/**
 * Transform: Converts Figma path to camelCase name with `LfBs` prefix.
 *
 * Applies to tokens whose path starts with 'Base'.
 * Example: `['Base', 'Colors', 'Neutral', '100']` → `'LfBsColorNeutral100'`
 */
export const figmaToCamelTransform: TransformConfig = {
  name: 'name/lf/figmaToCamel',
  type: 'name',
  filter: (token) => {
    return token.path.length > 0 && token.path[0] === 'Base';
  },
  transform: (token) => {
    const figmaPath = token.path.join('/');
    return figmaPathToCamel(figmaPath);
  },
};

/**
 * Transform: Converts camelCase name to CSS custom property format.
 *
 * Applies to tokens whose name starts with the `LfBs` prefix.
 * Example: `'LfBsColorNeutral100'` → `'--lf-bs-color-neutral-100'`
 */
export const camelToCssTransform: TransformConfig = {
  name: 'name/lf/camelToCss',
  type: 'name',
  filter: (token) => {
    return token.name.startsWith(BASE_TOKEN_PREFIX);
  },
  transform: (token) => {
    return camelToCssProperty(token.name);
  },
};

// ---------------------------------------------------------------------------
// Filters
// ---------------------------------------------------------------------------

/**
 * Filter: Isolates tokens with the `LfBs` prefix.
 *
 * Used to ensure only Base Tokens are processed in base-token-specific
 * platform configurations.
 */
export const baseTokenFilter: FilterConfig = {
  name: 'filter/lf/baseTokens',
  filter: (token) => {
    return token.name.startsWith(BASE_TOKEN_PREFIX);
  },
};

/**
 * Filter: Isolates tokens whose CSS property starts with `--lf-bs-`.
 *
 * Useful when tokens have already been transformed to CSS property format.
 */
export const baseTokenCssFilter: FilterConfig = {
  name: 'filter/lf/baseTokensCss',
  filter: (token) => {
    return token.name.startsWith(BASE_TOKEN_CSS_PREFIX);
  },
};

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

/**
 * Action: Validates naming convention for all Base Tokens.
 *
 * Iterates over all tokens and validates each name against the `LfBs` convention.
 * Throws an error (failing the build) if any token has an invalid name.
 *
 * @throws {Error} When one or more tokens have invalid names
 */
export const namingValidationAction: ActionConfig = {
  name: 'action/lf/validateNaming',
  do: (tokens) => {
    const errors: string[] = [];

    for (const token of tokens) {
      // Only validate tokens that should be Base Tokens
      if (!token.name.startsWith(BASE_TOKEN_PREFIX) && !token.path?.[0]?.startsWith('Base')) {
        continue;
      }

      const result = validateTokenName(token.name);
      if (!result.valid) {
        errors.push(`Token "${token.name}": ${result.errors.join(', ')}`);
      }
    }

    if (errors.length > 0) {
      throw new Error(
        `[Naming Convention] Build failed — ${errors.length} token(s) with invalid names:\n` +
        errors.map((e) => `  • ${e}`).join('\n')
      );
    }
  },
};

/**
 * Action: Checks cross-brand consistency for Base Tokens.
 *
 * Verifies that all brands have the same set of token names and that
 * invariant categories have identical values across all brands.
 * Throws an error (failing the build) if inconsistencies are found.
 *
 * @throws {Error} When cross-brand inconsistencies are detected
 */
export const crossBrandConsistencyAction: ActionConfig = {
  name: 'action/lf/checkCrossBrandConsistency',
  do: (tokens, config) => {
    const invariantCats = (config?.invariantCategories as string[]) ?? [...INVARIANT_CATEGORIES];

    // Group tokens by brand — expects tokens to have a brand attribute
    const brandTokens: Record<string, BaseToken[]> = {};

    for (const token of tokens) {
      const brand = token.attributes?.brand;
      if (!brand) continue;

      if (!brandTokens[brand]) {
        brandTokens[brand] = [];
      }

      brandTokens[brand].push({
        name: token.name,
        cssProperty: camelToCssProperty(token.name),
        category: (token.attributes?.category ?? 'utility') as TokenCategory,
        subcategory: token.attributes?.subcategory ?? '',
        scale: token.attributes?.scale ?? '',
        value: String(token.value),
        tsType: 'string',
        isInvariant: false,
      });
    }

    // Only check if we have multiple brands
    if (Object.keys(brandTokens).length <= 1) return;

    const report = checkCrossBrandConsistency(brandTokens, invariantCats);

    if (!report.consistent) {
      const messages: string[] = [];

      if (report.missingTokens.length > 0) {
        messages.push('Missing tokens:');
        for (const { brand, tokenName } of report.missingTokens) {
          messages.push(`  • "${tokenName}" missing in brand "${brand}"`);
        }
      }

      if (report.extraTokens.length > 0) {
        messages.push('Extra tokens:');
        for (const { brand, tokenName } of report.extraTokens) {
          messages.push(`  • "${tokenName}" extra in brand "${brand}"`);
        }
      }

      if (report.valueMismatches.length > 0) {
        messages.push('Value mismatches in invariant categories:');
        for (const { tokenName, brands } of report.valueMismatches) {
          const values = Object.entries(brands)
            .map(([b, v]) => `${b}=${v}`)
            .join(', ');
          messages.push(`  • "${tokenName}": ${values}`);
        }
      }

      throw new Error(
        `[Cross-Brand Consistency] Build failed:\n${messages.join('\n')}`
      );
    }
  },
};

// ---------------------------------------------------------------------------
// Configuration Factory
// ---------------------------------------------------------------------------

/**
 * Creates the complete Style Dictionary configuration for Base Tokens.
 *
 * Includes all custom transforms, filters, and validation actions needed
 * to process Base Tokens through the Style Dictionary pipeline.
 *
 * @returns Complete configuration object for Base Token processing
 *
 * @example
 * ```ts
 * import { createBaseTokenConfig } from './style-dictionary-config';
 *
 * const config = createBaseTokenConfig();
 * // Register transforms, filters, and actions with Style Dictionary
 * for (const transform of config.transforms) {
 *   sd.registerTransform(transform);
 * }
 * ```
 */
export function createBaseTokenConfig(): StyleDictionaryBaseConfig {
  return {
    transforms: [figmaToCamelTransform, camelToCssTransform],
    filters: [baseTokenFilter, baseTokenCssFilter],
    actions: [namingValidationAction, crossBrandConsistencyAction],
    brands: BRAND_NAMES,
    invariantCategories: INVARIANT_CATEGORIES,
  };
}

/**
 * Utility: Sorts an array of SD tokens using the standard Base Token ordering.
 *
 * Converts SD tokens to BaseToken format, sorts them, and returns the
 * sorted names in order. Useful for ensuring consistent output ordering
 * across all platforms.
 *
 * @param tokens - Array of SD tokens to sort
 * @returns Sorted array of token names
 */
export function sortSDTokens(tokens: SDToken[]): string[] {
  const baseTokens: BaseToken[] = tokens.map((t) => ({
    name: t.name,
    cssProperty: t.name.startsWith(BASE_TOKEN_PREFIX) ? camelToCssProperty(t.name) : t.name,
    category: (t.attributes?.category ?? 'utility') as TokenCategory,
    subcategory: t.attributes?.subcategory ?? '',
    scale: t.attributes?.scale ?? '',
    value: String(t.value),
    tsType: 'string',
    isInvariant: false,
  }));

  return sortTokens(baseTokens).map((t) => t.name);
}
