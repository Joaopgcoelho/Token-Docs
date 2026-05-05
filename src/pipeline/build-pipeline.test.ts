import { describe, it, expect } from 'vitest';
import type { BaseToken } from '../models/base-token.types';
import type { TokenSchema } from '../validators/usage-restriction';
import { BRAND_NAMES } from '../constants/base-token-config';
import { runBuildPipeline } from './build-pipeline';
import type { BuildPipelineInput, BuildPipelineResult, BuildPipelineError } from './build-pipeline';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeToken(overrides: Partial<BaseToken> = {}): BaseToken {
  return {
    name: 'LfBsColorNeutral100',
    cssProperty: '--lf-bs-color-neutral-100',
    category: 'color',
    subcategory: 'neutral',
    scale: '100',
    value: '#FAFAFA',
    tsType: 'string',
    isInvariant: false,
    ...overrides,
  };
}

/**
 * Creates a minimal valid token-schema.json object for testing.
 */
function makeValidSchema(): TokenSchema {
  return {
    layers: {
      base: {
        label: 'Base Tokens',
        prefix: 'LfBs',
        useInUI: false,
        description: 'Valores brutos de referência interna',
      },
    },
    aiRules: [
      {
        id: 'R01',
        rule: 'NUNCA use Base Tokens diretamente em UI',
        severity: 'error',
      },
    ],
  };
}

/**
 * Creates a set of sample tokens that represent a minimal but valid
 * token set for testing the pipeline.
 */
function makeSampleTokens(): BaseToken[] {
  return [
    makeToken(),
    makeToken({
      name: 'LfBsColorPrimary500',
      cssProperty: '--lf-bs-color-primary-500',
      subcategory: 'primary',
      scale: '500',
      value: '#0066CC',
    }),
    makeToken({
      name: 'LfBsSpaceGap100',
      cssProperty: '--lf-bs-space-gap-100',
      category: 'spacing',
      subcategory: 'gap',
      scale: '100',
      value: '4px',
    }),
    makeToken({
      name: 'LfBsBreakpointSm',
      cssProperty: '--lf-bs-breakpoint-sm',
      category: 'utility',
      subcategory: 'breakpoint',
      scale: 'sm',
      value: '768',
      tsType: 'number',
      isInvariant: true,
    }),
    makeToken({
      name: 'LfBsOpacity48',
      cssProperty: '--lf-bs-opacity-48',
      category: 'opacity',
      subcategory: 'opacity',
      scale: '48',
      value: '0.48',
    }),
  ];
}

/**
 * Creates a brandTokens map with the same tokens for all 8 brands.
 */
function makeBrandTokens(tokens?: BaseToken[]): Record<string, BaseToken[]> {
  const t = tokens ?? makeSampleTokens();
  const result: Record<string, BaseToken[]> = {};
  for (const brand of BRAND_NAMES) {
    result[brand] = t.map((token) => ({ ...token }));
  }
  return result;
}

/**
 * Creates a valid BuildPipelineInput for testing.
 */
function makeValidInput(overrides?: Partial<BuildPipelineInput>): BuildPipelineInput {
  return {
    brandTokens: makeBrandTokens(),
    tokenSchema: makeValidSchema(),
    modes: ['default'],
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('build-pipeline', () => {
  // -------------------------------------------------------------------------
  // Successful build
  // -------------------------------------------------------------------------

  describe('successful build', () => {
    it('returns success: true for valid input', () => {
      const result = runBuildPipeline(makeValidInput());
      expect(result.success).toBe(true);
    });

    it('generates output files for all 6 platforms for all 8 brands', () => {
      /**
       * Validates: Requirements 8.2, 9.1, 9.2, 9.4, 10.1
       */
      const result = runBuildPipeline(makeValidInput()) as BuildPipelineResult;
      expect(result.success).toBe(true);

      const filePaths = Object.keys(result.files);

      // 8 brands × 1 mode × 6 platforms = 48 files
      expect(filePaths).toHaveLength(BRAND_NAMES.length * 6);

      // Verify each brand has all 6 platform files
      for (const brand of BRAND_NAMES) {
        const brandFiles = filePaths.filter((p) => p.startsWith(`brands/${brand}/`));
        expect(brandFiles).toHaveLength(6);

        expect(brandFiles).toContainEqual(expect.stringContaining('/css/'));
        expect(brandFiles).toContainEqual(expect.stringContaining('/scss/'));
        expect(brandFiles).toContainEqual(expect.stringContaining('/js/'));
        expect(brandFiles).toContainEqual(expect.stringContaining('/ts/'));
        expect(brandFiles).toContainEqual(expect.stringContaining('/android/'));
        expect(brandFiles).toContainEqual(expect.stringContaining('/ios/'));
      }
    });

    it('generates output files for multiple modes', () => {
      const result = runBuildPipeline(
        makeValidInput({ modes: ['default', 'high-contrast'] }),
      ) as BuildPipelineResult;

      expect(result.success).toBe(true);

      const filePaths = Object.keys(result.files);
      // 8 brands × 2 modes × 6 platforms = 96 files
      expect(filePaths).toHaveLength(BRAND_NAMES.length * 2 * 6);

      // Verify both modes exist for a brand
      const estacioPaths = filePaths.filter((p) => p.startsWith('brands/estacio/'));
      expect(estacioPaths).toHaveLength(12); // 2 modes × 6 platforms
      expect(estacioPaths).toContainEqual(expect.stringContaining('default'));
      expect(estacioPaths).toContainEqual(expect.stringContaining('high-contrast'));
    });

    it('generates theme.d.ts with all token entries', () => {
      /**
       * Validates: Requirement 9.3
       */
      const result = runBuildPipeline(makeValidInput()) as BuildPipelineResult;
      expect(result.success).toBe(true);

      const themeContent = result.themeInterface;
      expect(themeContent).toContain('export interface Theme {');
      expect(themeContent).toContain('LfBsColorNeutral100: string;');
      expect(themeContent).toContain('LfBsColorPrimary500: string;');
      expect(themeContent).toContain('LfBsSpaceGap100: string;');
      expect(themeContent).toContain('LfBsBreakpointSm: number;');
      expect(themeContent).toContain('LfBsOpacity48: string;');
    });

    it('returns sorted tokens', () => {
      const result = runBuildPipeline(makeValidInput()) as BuildPipelineResult;
      expect(result.success).toBe(true);
      expect(result.sortedTokens).toHaveLength(5);

      // Color tokens should come before spacing, which comes before opacity, which comes before utility
      const categories = result.sortedTokens.map((t) => t.category);
      const colorIdx = categories.indexOf('color');
      const spacingIdx = categories.indexOf('spacing');
      const opacityIdx = categories.indexOf('opacity');
      const utilityIdx = categories.indexOf('utility');

      expect(colorIdx).toBeLessThan(spacingIdx);
      expect(spacingIdx).toBeLessThan(opacityIdx);
      expect(opacityIdx).toBeLessThan(utilityIdx);
    });

    it('token added appears in all 8 brands', () => {
      /**
       * Validates: Requirement 10.1
       */
      const extraToken = makeToken({
        name: 'LfBsColorSuccess300',
        cssProperty: '--lf-bs-color-success-300',
        subcategory: 'success',
        scale: '300',
        value: '#00CC66',
      });

      const tokens = [...makeSampleTokens(), extraToken];
      const result = runBuildPipeline(
        makeValidInput({ brandTokens: makeBrandTokens(tokens) }),
      ) as BuildPipelineResult;

      expect(result.success).toBe(true);

      // Verify the new token appears in every brand's CSS output
      for (const brand of BRAND_NAMES) {
        const cssPath = `brands/${brand}/css/default.css`;
        const cssContent = result.files[cssPath];
        expect(cssContent).toBeDefined();
        expect(cssContent).toContain('--lf-bs-color-success-300: #00CC66;');
      }
    });

    it('grouping order is consistent across all platforms', () => {
      /**
       * Validates: Requirements 8.2, 9.4
       */
      const result = runBuildPipeline(makeValidInput()) as BuildPipelineResult;
      expect(result.success).toBe(true);

      // Check that in every platform output for a given brand,
      // color tokens appear before spacing tokens, which appear before utility tokens
      const brand = 'estacio';
      const cssContent = result.files[`brands/${brand}/css/default.css`];
      const scssContent = result.files[`brands/${brand}/scss/default.scss`];
      const jsContent = result.files[`brands/${brand}/js/default.cjs`];
      const tsContent = result.files[`brands/${brand}/ts/default.js`];
      const xmlContent = result.files[`brands/${brand}/android/default.xml`];
      const swiftContent = result.files[`brands/${brand}/ios/default.swift`];

      for (const content of [cssContent, scssContent, jsContent, tsContent, xmlContent, swiftContent]) {
        expect(content).toBeDefined();

        // Use case-insensitive search since platforms use different casing
        // (CSS: neutral, Swift: Neutral, etc.)
        const lowerContent = content.toLowerCase();

        // "neutral" (color) should appear before "gap" (spacing)
        const neutralIdx = lowerContent.indexOf('neutral');
        const gapIdx = lowerContent.indexOf('gap');
        const breakpointIdx = lowerContent.indexOf('breakpoint');

        expect(neutralIdx).toBeGreaterThan(-1);
        expect(gapIdx).toBeGreaterThan(-1);
        expect(breakpointIdx).toBeGreaterThan(-1);

        expect(neutralIdx).toBeLessThan(gapIdx);
        expect(gapIdx).toBeLessThan(breakpointIdx);
      }
    });

    it('all platform files contain the same token values', () => {
      /**
       * Validates: Requirement 9.4
       */
      const result = runBuildPipeline(makeValidInput()) as BuildPipelineResult;
      expect(result.success).toBe(true);

      const brand = 'damasio';
      const files = Object.entries(result.files).filter(([p]) =>
        p.startsWith(`brands/${brand}/`),
      );

      // Every platform file should contain the value #FAFAFA (from neutral-100)
      for (const [, content] of files) {
        expect(content).toContain('#FAFAFA');
      }

      // Every platform file should contain 768 (breakpoint sm)
      for (const [, content] of files) {
        expect(content).toContain('768');
      }
    });
  });

  // -------------------------------------------------------------------------
  // Naming validation failures
  // -------------------------------------------------------------------------

  describe('naming validation failures', () => {
    it('fails when a token has an invalid name (missing LfBs prefix)', () => {
      /**
       * Validates: Requirements 11.4, 9.2
       */
      const invalidToken = makeToken({
        name: 'ColorNeutral100', // Missing LfBs prefix
        cssProperty: '--lf-bs-color-neutral-100',
      });

      const brandTokens = makeBrandTokens([invalidToken]);
      const result = runBuildPipeline(
        makeValidInput({ brandTokens }),
      ) as BuildPipelineError;

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some((e) => e.includes('ColorNeutral100'))).toBe(true);
      expect(result.errors.some((e) => e.includes('LfBs'))).toBe(true);
    });

    it('reports errors for all brands with invalid tokens', () => {
      const invalidToken = makeToken({
        name: 'BadName',
        cssProperty: '--lf-bs-color-neutral-100',
      });

      const brandTokens = makeBrandTokens([invalidToken]);
      const result = runBuildPipeline(
        makeValidInput({ brandTokens }),
      ) as BuildPipelineError;

      expect(result.success).toBe(false);
      // Should have errors for each brand
      for (const brand of BRAND_NAMES) {
        expect(result.errors.some((e) => e.includes(brand))).toBe(true);
      }
    });

    it('collects multiple naming errors in a single run', () => {
      const tokens = [
        makeToken({ name: 'bad1' }),
        makeToken({
          name: 'bad2',
          cssProperty: '--lf-bs-color-primary-500',
          subcategory: 'primary',
          scale: '500',
        }),
      ];

      const brandTokens = makeBrandTokens(tokens);
      const result = runBuildPipeline(
        makeValidInput({ brandTokens }),
      ) as BuildPipelineError;

      expect(result.success).toBe(false);
      // Should have errors for both bad tokens
      expect(result.errors.some((e) => e.includes('bad1'))).toBe(true);
      expect(result.errors.some((e) => e.includes('bad2'))).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // Cross-brand consistency failures
  // -------------------------------------------------------------------------

  describe('cross-brand consistency failures', () => {
    it('fails when a token is missing from one brand', () => {
      /**
       * Validates: Requirement 10.4
       */
      const tokens = makeSampleTokens();
      const brandTokens = makeBrandTokens(tokens);

      // Remove a token from one brand
      brandTokens['wyden'] = brandTokens['wyden'].filter(
        (t) => t.name !== 'LfBsColorPrimary500',
      );

      const result = runBuildPipeline(
        makeValidInput({ brandTokens }),
      ) as BuildPipelineError;

      expect(result.success).toBe(false);
      expect(result.errors.some((e) => e.includes('wyden'))).toBe(true);
      expect(result.errors.some((e) => e.includes('LfBsColorPrimary500'))).toBe(true);
    });

    it('fails when an invariant token has different values across brands', () => {
      /**
       * Validates: Requirement 10.4
       */
      const tokens = makeSampleTokens();
      const brandTokens = makeBrandTokens(tokens);

      // Change breakpoint value in one brand
      const wydenBreakpoint = brandTokens['wyden'].find(
        (t) => t.name === 'LfBsBreakpointSm',
      );
      if (wydenBreakpoint) {
        wydenBreakpoint.value = '800'; // Different from 768
      }

      const result = runBuildPipeline(
        makeValidInput({ brandTokens }),
      ) as BuildPipelineError;

      expect(result.success).toBe(false);
      expect(result.errors.some((e) => e.includes('LfBsBreakpointSm'))).toBe(true);
      expect(result.errors.some((e) => e.includes('divergentes'))).toBe(true);
    });

    it('allows different color values across brands', () => {
      const tokens = makeSampleTokens();
      const brandTokens = makeBrandTokens(tokens);

      // Change a color value in one brand — this should be allowed
      const wydenColor = brandTokens['wyden'].find(
        (t) => t.name === 'LfBsColorPrimary500',
      );
      if (wydenColor) {
        wydenColor.value = '#FF0000';
      }

      const result = runBuildPipeline(makeValidInput({ brandTokens }));
      expect(result.success).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // Usage restriction failures
  // -------------------------------------------------------------------------

  describe('usage restriction failures', () => {
    it('fails when token-schema has useInUI: true for base layer', () => {
      const schema = makeValidSchema();
      schema.layers.base.useInUI = true as any;

      const result = runBuildPipeline(
        makeValidInput({ tokenSchema: schema }),
      ) as BuildPipelineError;

      expect(result.success).toBe(false);
      expect(result.errors.some((e) => e.includes('useInUI'))).toBe(true);
    });

    it('fails when R01 rule is missing', () => {
      const schema = makeValidSchema();
      schema.aiRules = [];

      const result = runBuildPipeline(
        makeValidInput({ tokenSchema: schema }),
      ) as BuildPipelineError;

      expect(result.success).toBe(false);
      expect(result.errors.some((e) => e.includes('R01'))).toBe(true);
    });

    it('fails when R01 rule has wrong severity', () => {
      const schema = makeValidSchema();
      schema.aiRules = [
        { id: 'R01', rule: 'NUNCA use Base Tokens diretamente em UI', severity: 'warning' },
      ];

      const result = runBuildPipeline(
        makeValidInput({ tokenSchema: schema }),
      ) as BuildPipelineError;

      expect(result.success).toBe(false);
      expect(result.errors.some((e) => e.includes('R01'))).toBe(true);
      expect(result.errors.some((e) => e.includes('error'))).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // Fail-fast with all errors
  // -------------------------------------------------------------------------

  describe('fail-fast with all errors', () => {
    it('collects errors from naming, consistency, and usage validation in one run', () => {
      /**
       * Validates: Requirements 9.2, 11.4
       */
      // Create input with multiple types of errors
      const invalidToken = makeToken({ name: 'BadName' });
      const brandTokens = makeBrandTokens([invalidToken]);

      // Also remove a token from one brand to trigger consistency error
      brandTokens['ibmec'] = [];

      // Also break the schema
      const schema = makeValidSchema();
      schema.aiRules = [];

      const result = runBuildPipeline({
        brandTokens,
        tokenSchema: schema,
      }) as BuildPipelineError;

      expect(result.success).toBe(false);

      // Should have naming errors
      expect(result.errors.some((e) => e.includes('BadName'))).toBe(true);

      // Should have consistency errors (ibmec is empty)
      expect(result.errors.some((e) => e.includes('ibmec'))).toBe(true);

      // Should have usage restriction errors
      expect(result.errors.some((e) => e.includes('R01'))).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // Default mode behavior
  // -------------------------------------------------------------------------

  describe('default mode', () => {
    it('defaults to single "default" mode when modes not specified', () => {
      const result = runBuildPipeline({
        brandTokens: makeBrandTokens(),
        tokenSchema: makeValidSchema(),
      }) as BuildPipelineResult;

      expect(result.success).toBe(true);

      const filePaths = Object.keys(result.files);
      // 8 brands × 1 mode × 6 platforms = 48 files
      expect(filePaths).toHaveLength(48);

      // All paths should contain 'default'
      for (const path of filePaths) {
        expect(path).toContain('default');
      }
    });
  });
});
