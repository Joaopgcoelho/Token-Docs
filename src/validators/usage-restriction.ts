/**
 * @module usage-restriction
 * @description Validação de restrição de uso dos Base Tokens do design system Lift.
 *
 * Garante que a arquitetura de camadas do design system é respeitada:
 * - Base Tokens (`LfBs`) NÃO devem ser usados diretamente em UI
 * - O `token-schema.json` deve manter `layers.base.useInUI: false`
 * - A regra R01 ("NUNCA use Base Tokens diretamente em UI") deve existir com severidade "error"
 * - Base Tokens devem ser referenciados exclusivamente por Brand Tokens
 *
 * @see Requisitos 12.1, 12.2, 12.3, 12.4
 */

import { BASE_TOKEN_PREFIX } from '../constants/base-token-config';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Estrutura esperada da camada base no token-schema.json.
 */
export interface SchemaLayer {
  label: string;
  prefix: string;
  useInUI: boolean;
  description: string;
}

/**
 * Estrutura esperada de uma regra AI no token-schema.json.
 */
export interface AiRule {
  id: string;
  rule: string;
  severity: string;
}

/**
 * Estrutura mínima do token-schema.json necessária para validação de restrição de uso.
 */
export interface TokenSchema {
  layers: {
    base: SchemaLayer;
    [key: string]: SchemaLayer;
  };
  aiRules: AiRule[];
}

/**
 * Resultado da validação de restrição de uso.
 */
export interface UsageRestrictionResult {
  /** Indica se todas as restrições de uso são válidas. */
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
function ok(): UsageRestrictionResult {
  return { valid: true, errors: [] };
}

// ---------------------------------------------------------------------------
// Schema validation
// ---------------------------------------------------------------------------

/**
 * Valida que a camada base no token-schema.json possui `useInUI: false`.
 *
 * Garante que o schema declara explicitamente que Base Tokens não devem
 * ser usados diretamente em componentes de UI.
 *
 * @param schema - Objeto do token-schema.json
 * @returns Resultado da validação
 *
 * @example
 * ```ts
 * const schema = { layers: { base: { useInUI: false, ... } }, ... };
 * validateBaseLayerUseInUI(schema); // { valid: true, errors: [] }
 * ```
 *
 * @see Requisito 12.1
 */
export function validateBaseLayerUseInUI(schema: TokenSchema): UsageRestrictionResult {
  const errors: string[] = [];

  if (!schema.layers) {
    errors.push('token-schema.json não possui a propriedade "layers"');
    return { valid: false, errors };
  }

  if (!schema.layers.base) {
    errors.push('token-schema.json não possui a camada "layers.base"');
    return { valid: false, errors };
  }

  if (schema.layers.base.useInUI !== false) {
    errors.push(
      `layers.base.useInUI deve ser false, recebido: ${JSON.stringify(schema.layers.base.useInUI)}`,
    );
    return { valid: false, errors };
  }

  return ok();
}

/**
 * Valida que a regra R01 existe no token-schema.json com severidade "error".
 *
 * A regra R01 ("NUNCA use Base Tokens diretamente em UI") é a regra fundamental
 * que impede o uso direto de Base Tokens em componentes de UI.
 *
 * @param schema - Objeto do token-schema.json
 * @returns Resultado da validação
 *
 * @example
 * ```ts
 * const schema = {
 *   aiRules: [{ id: 'R01', rule: 'NUNCA use Base Tokens diretamente em UI', severity: 'error' }],
 *   ...
 * };
 * validateRuleR01(schema); // { valid: true, errors: [] }
 * ```
 *
 * @see Requisito 12.4
 */
export function validateRuleR01(schema: TokenSchema): UsageRestrictionResult {
  const errors: string[] = [];

  if (!schema.aiRules || !Array.isArray(schema.aiRules)) {
    errors.push('token-schema.json não possui a propriedade "aiRules" como array');
    return { valid: false, errors };
  }

  const r01 = schema.aiRules.find((rule) => rule.id === 'R01');

  if (!r01) {
    errors.push('Regra R01 não encontrada em aiRules');
    return { valid: false, errors };
  }

  if (r01.severity !== 'error') {
    errors.push(
      `Regra R01 deve ter severidade "error", recebido: "${r01.severity}"`,
    );
    return { valid: false, errors };
  }

  if (!r01.rule.includes('Base Tokens') || !r01.rule.includes('UI')) {
    errors.push(
      `Regra R01 deve mencionar "Base Tokens" e "UI" na descrição, recebido: "${r01.rule}"`,
    );
    return { valid: false, errors };
  }

  return ok();
}

// ---------------------------------------------------------------------------
// Token name validation
// ---------------------------------------------------------------------------

/**
 * Verifica se um nome de token é um Base Token (prefixo `LfBs`).
 *
 * @param tokenName - Nome do token em camelCase
 * @returns `true` se o token é um Base Token
 *
 * @example
 * ```ts
 * isBaseToken('LfBsColorNeutral100');  // true
 * isBaseToken('LfThmDynamicPrimary');   // false
 * isBaseToken('');                       // false
 * ```
 *
 * @see Requisito 12.2
 */
export function isBaseToken(tokenName: string): boolean {
  return tokenName.startsWith(BASE_TOKEN_PREFIX);
}

/**
 * Valida que nenhum token com prefixo `LfBs` aparece em uma lista de tokens
 * de camadas de uso direto (usage, component).
 *
 * Base Tokens devem ser referenciados exclusivamente por Brand Tokens,
 * nunca diretamente por camadas de consumo.
 *
 * @param usageTokenNames - Lista de nomes de tokens presentes em camadas de uso direto
 * @returns Resultado da validação com lista de tokens violadores
 *
 * @example
 * ```ts
 * validateNoBaseTokensInUsageLayer(['LfThmDynamicPrimary']); // { valid: true, errors: [] }
 * validateNoBaseTokensInUsageLayer(['LfBsColorNeutral100']); // { valid: false, errors: [...] }
 * ```
 *
 * @see Requisitos 12.2, 12.3
 */
export function validateNoBaseTokensInUsageLayer(
  usageTokenNames: string[],
): UsageRestrictionResult {
  const violations = usageTokenNames.filter((name) => isBaseToken(name));

  if (violations.length === 0) {
    return ok();
  }

  const errors = violations.map(
    (name) =>
      `Base Token "${name}" encontrado em camada de uso direto. Base Tokens (prefixo ${BASE_TOKEN_PREFIX}) devem ser referenciados exclusivamente por Brand Tokens.`,
  );

  return { valid: false, errors };
}

// ---------------------------------------------------------------------------
// Full schema validation
// ---------------------------------------------------------------------------

/**
 * Executa todas as validações de restrição de uso do token-schema.json.
 *
 * Combina as validações de:
 * 1. `layers.base.useInUI === false`
 * 2. Regra R01 com severidade "error"
 *
 * @param schema - Objeto do token-schema.json
 * @returns Resultado consolidado da validação
 *
 * @example
 * ```ts
 * import tokenSchema from '../../token-schema.json';
 * const result = validateUsageRestrictions(tokenSchema);
 * if (!result.valid) {
 *   console.error('Violações de restrição de uso:', result.errors);
 * }
 * ```
 *
 * @see Requisitos 12.1, 12.2, 12.4
 */
export function validateUsageRestrictions(schema: TokenSchema): UsageRestrictionResult {
  const allErrors: string[] = [];

  const useInUIResult = validateBaseLayerUseInUI(schema);
  if (!useInUIResult.valid) {
    allErrors.push(...useInUIResult.errors);
  }

  const r01Result = validateRuleR01(schema);
  if (!r01Result.valid) {
    allErrors.push(...r01Result.errors);
  }

  if (allErrors.length > 0) {
    return { valid: false, errors: allErrors };
  }

  return ok();
}
