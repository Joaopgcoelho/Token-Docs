import { describe, it, expect } from 'vitest';
import {
  validateBaseLayerUseInUI,
  validateRuleR01,
  isBaseToken,
  validateNoBaseTokensInUsageLayer,
  validateUsageRestrictions,
} from './usage-restriction';
import type { TokenSchema } from './usage-restriction';

// ---------------------------------------------------------------------------
// Helpers — minimal valid schema for reuse across tests
// ---------------------------------------------------------------------------

function createValidSchema(overrides?: Partial<TokenSchema>): TokenSchema {
  return {
    layers: {
      base: {
        label: 'Base Tokens',
        prefix: 'LfBs',
        useInUI: false,
        description: 'Valores brutos de referência interna',
      },
      brand: {
        label: 'Brand Tokens',
        prefix: 'LfThm',
        useInUI: false,
        description: 'Filtro dos Base Tokens por marca',
      },
      usage: {
        label: 'Usage Tokens',
        prefix: 'LfThm',
        useInUI: true,
        description: 'Camada principal de consumo',
      },
    },
    aiRules: [
      { id: 'R01', rule: 'NUNCA use Base Tokens diretamente em UI', severity: 'error' },
      { id: 'R02', rule: 'NUNCA use tokens Core diretamente em componentes de UI', severity: 'error' },
    ],
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// validateBaseLayerUseInUI
// ---------------------------------------------------------------------------
describe('validateBaseLayerUseInUI', () => {
  it('accepts schema with layers.base.useInUI === false', () => {
    const schema = createValidSchema();
    const result = validateBaseLayerUseInUI(schema);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects schema with layers.base.useInUI === true', () => {
    const schema = createValidSchema();
    schema.layers.base.useInUI = true;
    const result = validateBaseLayerUseInUI(schema);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain('useInUI');
  });

  it('rejects schema without layers property', () => {
    const schema = { aiRules: [] } as unknown as TokenSchema;
    const result = validateBaseLayerUseInUI(schema);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('layers');
  });

  it('rejects schema without layers.base property', () => {
    const schema = { layers: {}, aiRules: [] } as unknown as TokenSchema;
    const result = validateBaseLayerUseInUI(schema);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('layers.base');
  });
});

// ---------------------------------------------------------------------------
// validateRuleR01
// ---------------------------------------------------------------------------
describe('validateRuleR01', () => {
  it('accepts schema with R01 rule having severity "error"', () => {
    const schema = createValidSchema();
    const result = validateRuleR01(schema);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects schema without aiRules array', () => {
    const schema = createValidSchema({ aiRules: undefined as unknown as [] });
    const result = validateRuleR01(schema);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('aiRules');
  });

  it('rejects schema where R01 is missing', () => {
    const schema = createValidSchema({
      aiRules: [
        { id: 'R02', rule: 'Some other rule', severity: 'error' },
      ],
    });
    const result = validateRuleR01(schema);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('R01');
  });

  it('rejects R01 with severity "warning" instead of "error"', () => {
    const schema = createValidSchema({
      aiRules: [
        { id: 'R01', rule: 'NUNCA use Base Tokens diretamente em UI', severity: 'warning' },
      ],
    });
    const result = validateRuleR01(schema);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('error');
  });

  it('rejects R01 with rule text not mentioning Base Tokens and UI', () => {
    const schema = createValidSchema({
      aiRules: [
        { id: 'R01', rule: 'Some unrelated rule', severity: 'error' },
      ],
    });
    const result = validateRuleR01(schema);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('Base Tokens');
  });
});

// ---------------------------------------------------------------------------
// isBaseToken
// ---------------------------------------------------------------------------
describe('isBaseToken', () => {
  it('returns true for tokens with LfBs prefix', () => {
    expect(isBaseToken('LfBsColorNeutral100')).toBe(true);
    expect(isBaseToken('LfBsSpaceGap100')).toBe(true);
    expect(isBaseToken('LfBsTypographyFontFamilyDisplay')).toBe(true);
    expect(isBaseToken('LfBsBreakpointXs')).toBe(true);
    expect(isBaseToken('LfBsOpacity48')).toBe(true);
  });

  it('returns false for tokens without LfBs prefix', () => {
    expect(isBaseToken('LfThmDynamicPrimarySurfaceDefault')).toBe(false);
    expect(isBaseToken('LfThmColorPrimary500')).toBe(false);
    expect(isBaseToken('SomeOtherToken')).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isBaseToken('')).toBe(false);
  });

  it('returns false for partial prefix', () => {
    expect(isBaseToken('LfB')).toBe(false);
    expect(isBaseToken('Lf')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// validateNoBaseTokensInUsageLayer
// ---------------------------------------------------------------------------
describe('validateNoBaseTokensInUsageLayer', () => {
  it('accepts list with no base tokens', () => {
    const tokens = [
      'LfThmDynamicPrimarySurfaceDefault',
      'LfThmStaticNeutralSurfaceLowest',
      'LfThmInteractivePrimaryOnSurface',
    ];
    const result = validateNoBaseTokensInUsageLayer(tokens);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects list containing base tokens', () => {
    const tokens = [
      'LfThmDynamicPrimarySurfaceDefault',
      'LfBsColorNeutral100',
      'LfThmStaticNeutralSurfaceLowest',
    ];
    const result = validateNoBaseTokensInUsageLayer(tokens);
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain('LfBsColorNeutral100');
  });

  it('reports all base token violations', () => {
    const tokens = [
      'LfBsColorNeutral100',
      'LfThmDynamicPrimary',
      'LfBsSpaceGap200',
      'LfBsOpacity48',
    ];
    const result = validateNoBaseTokensInUsageLayer(tokens);
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(3);
  });

  it('accepts empty list', () => {
    const result = validateNoBaseTokensInUsageLayer([]);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// validateUsageRestrictions (combined)
// ---------------------------------------------------------------------------
describe('validateUsageRestrictions', () => {
  it('passes with a fully valid schema', () => {
    const schema = createValidSchema();
    const result = validateUsageRestrictions(schema);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('collects errors from both useInUI and R01 validations', () => {
    const schema = createValidSchema({
      aiRules: [],
    });
    schema.layers.base.useInUI = true;
    const result = validateUsageRestrictions(schema);
    expect(result.valid).toBe(false);
    // Should have at least 2 errors: one for useInUI, one for missing R01
    expect(result.errors.length).toBeGreaterThanOrEqual(2);
  });

  it('fails when only useInUI is wrong', () => {
    const schema = createValidSchema();
    schema.layers.base.useInUI = true;
    const result = validateUsageRestrictions(schema);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('useInUI'))).toBe(true);
  });

  it('fails when only R01 is missing', () => {
    const schema = createValidSchema({ aiRules: [] });
    const result = validateUsageRestrictions(schema);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('R01'))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Validation against actual token-schema.json
// ---------------------------------------------------------------------------
describe('token-schema.json integration', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const tokenSchema = require('../../token-schema.json');

  it('layers.base.useInUI === false in token-schema.json', () => {
    expect(tokenSchema.layers).toBeDefined();
    expect(tokenSchema.layers.base).toBeDefined();
    expect(tokenSchema.layers.base.useInUI).toBe(false);

    const result = validateBaseLayerUseInUI(tokenSchema as TokenSchema);
    expect(result.valid).toBe(true);
  });

  it('R01 rule exists with severity "error" in token-schema.json', () => {
    expect(tokenSchema.aiRules).toBeDefined();
    expect(Array.isArray(tokenSchema.aiRules)).toBe(true);

    const r01 = tokenSchema.aiRules.find(
      (rule: { id: string }) => rule.id === 'R01',
    );
    expect(r01).toBeDefined();
    expect(r01.severity).toBe('error');
    expect(r01.rule).toContain('Base Tokens');

    const result = validateRuleR01(tokenSchema as TokenSchema);
    expect(result.valid).toBe(true);
  });

  it('full usage restriction validation passes on token-schema.json', () => {
    const result = validateUsageRestrictions(tokenSchema as TokenSchema);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('tokens with LfBs prefix do not appear in usage layer definitions', () => {
    // The token-schema.json layers define which prefixes belong to which layer.
    // Base tokens (LfBs) should only be in the base layer, not usage.
    const usageLayer = tokenSchema.layers.usage;
    expect(usageLayer).toBeDefined();
    expect(usageLayer.prefix).not.toBe('LfBs');

    // Verify that the usage layer prefix is different from base
    const baseLayer = tokenSchema.layers.base;
    expect(baseLayer.prefix).toBe('LfBs');
    expect(usageLayer.prefix).not.toBe(baseLayer.prefix);
  });
});
