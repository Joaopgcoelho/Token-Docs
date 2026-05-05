/**
 * @module build-pipeline
 * @description Pipeline de build completo para os Base Tokens do design system Lift.
 *
 * Integra todos os componentes de validação, ordenação e geração de saídas
 * em um fluxo único e determinístico:
 *
 * 1. Validação de nomenclatura (Naming Convention Validator)
 * 2. Validação de consistência cross-marca (Cross-Brand Consistency Checker)
 * 3. Validação de restrição de uso (Usage Restriction Validator)
 * 4. Ordenação de tokens (Token Sorting)
 * 5. Geração de arquivos de saída para 6 plataformas × 8 marcas
 * 6. Geração da interface TypeScript (`theme.d.ts`)
 *
 * O pipeline adota a estratégia fail-fast: coleta todos os erros de validação
 * antes de falhar, permitindo que o desenvolvedor corrija múltiplos problemas
 * de uma vez.
 *
 * @see {@link ../validators/naming-convention.ts} para validação de nomes
 * @see {@link ../validators/cross-brand-consistency.ts} para consistência cross-marca
 * @see {@link ../validators/usage-restriction.ts} para restrição de uso
 * @see {@link ../utils/token-sorting.ts} para ordenação de tokens
 * @see {@link ./platform-formats.ts} para geração de saídas por plataforma
 * @see {@link ../generators/theme-interface.ts} para geração de theme.d.ts
 *
 * @see Requisitos 9.2, 10.4, 11.4
 */

import type { BaseToken } from '../models/base-token.types';
import type { TokenSchema } from '../validators/usage-restriction';
import { validateTokenName } from '../validators/naming-convention';
import { checkCrossBrandConsistency } from '../validators/cross-brand-consistency';
import { validateUsageRestrictions } from '../validators/usage-restriction';
import { sortTokens } from '../utils/token-sorting';
import { generateAllPlatformFiles } from './platform-formats';
import { generateThemeInterface } from '../generators/theme-interface';
import { BRAND_NAMES, INVARIANT_CATEGORIES } from '../constants/base-token-config';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Input for the build pipeline.
 *
 * Accepts either a flat array of tokens (single-brand) or a map of
 * brand → tokens for multi-brand builds.
 */
export interface BuildPipelineInput {
  /**
   * Map of brand name → array of BaseToken objects.
   * All 8 brands must be present for cross-brand consistency checks.
   */
  brandTokens: Record<string, BaseToken[]>;

  /**
   * The token-schema.json content for usage restriction validation.
   */
  tokenSchema: TokenSchema;

  /**
   * Output modes to generate (e.g., ['default', 'high-contrast']).
   * Defaults to ['default'] if not provided.
   */
  modes?: string[];
}

/**
 * Result of a successful build pipeline execution.
 */
export interface BuildPipelineResult {
  /** Whether the build succeeded. */
  success: true;

  /**
   * Map of output file path → file content.
   * Includes all platform files for all brands and modes.
   */
  files: Record<string, string>;

  /**
   * Content of the generated theme.d.ts file.
   */
  themeInterface: string;

  /**
   * Sorted tokens used for generation (from the first brand).
   */
  sortedTokens: BaseToken[];
}

/**
 * Result of a failed build pipeline execution.
 */
export interface BuildPipelineError {
  /** Whether the build succeeded. */
  success: false;

  /**
   * All validation errors collected during the pipeline.
   * The pipeline collects all errors before failing (fail-fast with all errors).
   */
  errors: string[];
}

/** Union type for build pipeline results. */
export type BuildPipelineOutput = BuildPipelineResult | BuildPipelineError;

// ---------------------------------------------------------------------------
// Pipeline steps
// ---------------------------------------------------------------------------

/**
 * Step 1: Validate naming conventions for all tokens across all brands.
 *
 * Checks every token name against the LfBs naming convention.
 * Collects all errors without stopping at the first one.
 *
 * @param brandTokens - Map of brand → tokens
 * @returns Array of error messages (empty if all valid)
 */
function validateNaming(brandTokens: Record<string, BaseToken[]>): string[] {
  const errors: string[] = [];
  const checkedNames = new Set<string>();

  for (const [brand, tokens] of Object.entries(brandTokens)) {
    for (const token of tokens) {
      // Avoid duplicate validation for the same token name across brands
      const key = `${brand}:${token.name}`;
      if (checkedNames.has(key)) continue;
      checkedNames.add(key);

      const result = validateTokenName(token.name);
      if (!result.valid) {
        errors.push(
          `[${brand}] Token "${token.name}": ${result.errors.join('; ')}`,
        );
      }
    }
  }

  return errors;
}

/**
 * Step 2: Validate cross-brand consistency.
 *
 * Ensures all brands have the same token names and that invariant
 * categories have identical values across brands.
 *
 * @param brandTokens - Map of brand → tokens
 * @returns Array of error messages (empty if consistent)
 */
function validateConsistency(brandTokens: Record<string, BaseToken[]>): string[] {
  const errors: string[] = [];

  const report = checkCrossBrandConsistency(
    brandTokens,
    [...INVARIANT_CATEGORIES],
  );

  if (!report.consistent) {
    for (const { brand, tokenName } of report.missingTokens) {
      errors.push(
        `Token "${tokenName}" está faltando na marca "${brand}"`,
      );
    }

    for (const { brand, tokenName } of report.extraTokens) {
      errors.push(
        `Token "${tokenName}" é extra na marca "${brand}" (não presente em todas as marcas)`,
      );
    }

    for (const { tokenName, brands } of report.valueMismatches) {
      const brandValues = Object.entries(brands)
        .map(([b, v]) => `${b}=${v}`)
        .join(', ');
      errors.push(
        `Token invariante "${tokenName}" tem valores divergentes entre marcas: ${brandValues}`,
      );
    }
  }

  return errors;
}

/**
 * Step 3: Validate usage restrictions from token-schema.json.
 *
 * Ensures the schema declares Base Tokens as non-UI and that
 * rule R01 exists with severity "error".
 *
 * @param tokenSchema - The token-schema.json content
 * @returns Array of error messages (empty if valid)
 */
function validateUsage(tokenSchema: TokenSchema): string[] {
  const result = validateUsageRestrictions(tokenSchema);
  return result.valid ? [] : result.errors;
}

// ---------------------------------------------------------------------------
// Main pipeline
// ---------------------------------------------------------------------------

/**
 * Executes the complete build pipeline for Base Tokens.
 *
 * The pipeline follows these steps in order:
 * 1. **Naming validation** — validates all token names follow the LfBs convention
 * 2. **Cross-brand consistency** — ensures all brands have identical token structures
 * 3. **Usage restriction validation** — checks token-schema.json constraints
 * 4. **Fail-fast** — if any validation errors exist, returns all errors at once
 * 5. **Token sorting** — sorts tokens in deterministic order
 * 6. **Platform file generation** — generates output files for all 6 platforms × all brands × all modes
 * 7. **Theme interface generation** — generates theme.d.ts
 *
 * @param input - Build pipeline input configuration
 * @returns Build result with generated files, or error with all validation messages
 *
 * @example
 * ```ts
 * const result = runBuildPipeline({
 *   brandTokens: { damasio: [...], estacio: [...], ... },
 *   tokenSchema: require('../../token-schema.json'),
 *   modes: ['default', 'high-contrast'],
 * });
 *
 * if (result.success) {
 *   // Write files to disk
 *   for (const [path, content] of Object.entries(result.files)) {
 *     fs.writeFileSync(path, content);
 *   }
 * } else {
 *   console.error('Build failed:', result.errors);
 * }
 * ```
 *
 * @see Requisitos 9.2, 10.4, 11.4
 */
export function runBuildPipeline(input: BuildPipelineInput): BuildPipelineOutput {
  const { brandTokens, tokenSchema, modes = ['default'] } = input;

  // -----------------------------------------------------------------------
  // Validation phase — collect ALL errors before failing
  // -----------------------------------------------------------------------
  const allErrors: string[] = [];

  // Step 1: Naming validation
  const namingErrors = validateNaming(brandTokens);
  allErrors.push(...namingErrors);

  // Step 2: Cross-brand consistency
  const consistencyErrors = validateConsistency(brandTokens);
  allErrors.push(...consistencyErrors);

  // Step 3: Usage restriction validation
  const usageErrors = validateUsage(tokenSchema);
  allErrors.push(...usageErrors);

  // Fail-fast with all collected errors
  if (allErrors.length > 0) {
    return { success: false, errors: allErrors };
  }

  // -----------------------------------------------------------------------
  // Generation phase
  // -----------------------------------------------------------------------

  const allFiles: Record<string, string> = {};

  // Step 4 & 5: Sort tokens and generate platform files for each brand/mode
  const brandNames = Object.keys(brandTokens);

  for (const brand of brandNames) {
    const sorted = sortTokens(brandTokens[brand]);

    for (const mode of modes) {
      const platformFiles = generateAllPlatformFiles(sorted, brand, mode);
      Object.assign(allFiles, platformFiles);
    }
  }

  // Step 6: Generate theme.d.ts using tokens from the first brand
  // (all brands have the same structure after consistency validation)
  const firstBrand = brandNames[0];
  const sortedTokens = sortTokens(brandTokens[firstBrand]);
  const themeInterface = generateThemeInterface(sortedTokens);

  return {
    success: true,
    files: allFiles,
    themeInterface,
    sortedTokens,
  };
}
