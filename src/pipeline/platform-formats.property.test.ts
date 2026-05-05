/**
 * @module platform-formats.property.test
 * @description Teste de propriedade para consistência cross-plataforma dos Base Tokens.
 *
 * **Propriedade 4: Consistência cross-plataforma**
 * Para tokens gerados, verificar que a saída em diferentes plataformas preserva
 * o valor semântico e a ordem dos grupamentos.
 *
 * **Valida: Requisitos 8.2, 9.4**
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import type { BaseToken, TokenCategory } from '../models/base-token.types';
import { generateAllPlatformFiles } from './platform-formats';
import {
  ALL_COLOR_PALETTES,
  COLOR_SCALE,
  SPACING_SUBGROUPS,
  BORDER_WIDTH_SCALE,
  BORDER_RADIUS_VARIANTS,
  OPACITY_SCALE,
  BREAKPOINT_NAMES,
  BREAKPOINT_VALUES,
  DURATION_VALUES,
  MOTION_CURVE_NAMES,
  MOTION_CURVES,
  ZINDEX_VALUES,
  SHADOW_LEVELS,
  SHADOW_LAYERS,
  TYPOGRAPHY_ROLES,
  TYPOGRAPHY_ROLE_WEIGHTS,
  BORDER_WIDTH_VALUES,
  OPACITY_VALUES,
  BORDER_RADIUS_VALUES,
  BASE_TOKEN_PREFIX,
  TOKEN_CATEGORIES,
  BRAND_NAMES,
} from '../constants/base-token-config';
import { camelToCssProperty } from '../validators/naming-convention';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function hyphenatedToPascal(s: string): string {
  return s.split('-').map(capitalize).join('');
}

/**
 * Creates a BaseToken from parts.
 */
function makeToken(
  name: string,
  category: TokenCategory,
  subcategory: string,
  scale: string,
  value: string,
  tsType: 'string' | 'number' = 'string',
  isInvariant: boolean = false,
): BaseToken {
  return {
    name,
    cssProperty: camelToCssProperty(name),
    category,
    subcategory,
    scale,
    value,
    tsType,
    isInvariant,
  };
}

// ---------------------------------------------------------------------------
// Arbitraries: generate random BaseToken arrays
// ---------------------------------------------------------------------------

/** Color token arbitrary */
const colorTokenArb = fc
  .tuple(
    fc.constantFrom(...ALL_COLOR_PALETTES),
    fc.constantFrom(...COLOR_SCALE),
  )
  .map(([palette, scale]) => {
    const name = `${BASE_TOKEN_PREFIX}Color${hyphenatedToPascal(palette)}${scale}`;
    const value = `#${Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0').toUpperCase()}`;
    return makeToken(name, 'color', palette, String(scale), value);
  });

/** Spacing token arbitrary */
const spacingTokenArb = fc
  .tuple(
    fc.constantFrom(...SPACING_SUBGROUPS),
    fc.integer({ min: 0, max: 10 }).map((n) => n * 100),
  )
  .map(([sub, scale]) => {
    const name = `${BASE_TOKEN_PREFIX}Space${capitalize(sub)}${scale}`;
    return makeToken(name, 'spacing', sub, String(scale), `${scale / 25}px`);
  });

/** Border-width token arbitrary */
const borderWidthTokenArb = fc
  .constantFrom(...BORDER_WIDTH_SCALE)
  .map((scale) => {
    const name = `${BASE_TOKEN_PREFIX}BorderWidth${scale}`;
    return makeToken(name, 'border', 'width', String(scale), BORDER_WIDTH_VALUES[scale]);
  });

/** Border-radius token arbitrary */
const borderRadiusTokenArb = fc
  .constantFrom(...BORDER_RADIUS_VARIANTS)
  .map((variant) => {
    const name = `${BASE_TOKEN_PREFIX}BorderRadius${hyphenatedToPascal(variant)}`;
    return makeToken(name, 'border', 'radius', variant, BORDER_RADIUS_VALUES[variant]);
  });

/** Shadow token arbitrary */
const shadowTokenArb = fc
  .tuple(
    fc.constantFrom(...SHADOW_LEVELS),
    fc.constantFrom(...SHADOW_LAYERS),
  )
  .map(([level, layer]) => {
    const name = `${BASE_TOKEN_PREFIX}ShadowLevel${level}Layer${layer}`;
    return makeToken(name, 'shadow', `level-${level}`, String(layer), `0px ${level}px ${layer * 2}px rgba(0,0,0,0.12)`);
  });

/** Opacity token arbitrary */
const opacityTokenArb = fc
  .constantFrom(...OPACITY_SCALE)
  .map((scale) => {
    const name = `${BASE_TOKEN_PREFIX}Opacity${scale}`;
    return makeToken(name, 'opacity', 'opacity', String(scale), String(OPACITY_VALUES[scale]));
  });

/** Breakpoint token arbitrary */
const breakpointTokenArb = fc
  .constantFrom(...BREAKPOINT_NAMES)
  .map((bp) => {
    const name = `${BASE_TOKEN_PREFIX}Breakpoint${capitalize(bp)}`;
    return makeToken(name, 'utility', 'breakpoint', bp, String(BREAKPOINT_VALUES[bp]), 'number', true);
  });

/** Duration token arbitrary */
const durationTokenArb = fc
  .constantFrom(...DURATION_VALUES)
  .map((val) => {
    const name = `${BASE_TOKEN_PREFIX}Duration${val}`;
    return makeToken(name, 'utility', 'duration', String(val), `${val}ms`, 'string', true);
  });

/** Motion token arbitrary */
const motionTokenArb = fc
  .constantFrom(...MOTION_CURVE_NAMES)
  .map((curve) => {
    const name = `${BASE_TOKEN_PREFIX}MotionMovent${hyphenatedToPascal(curve)}`;
    return makeToken(name, 'utility', 'motion', curve, MOTION_CURVES[curve], 'string', true);
  });

/** Z-index token arbitrary */
const zindexTokenArb = fc
  .constantFrom(...ZINDEX_VALUES)
  .map((val) => {
    const name = `${BASE_TOKEN_PREFIX}Zindex${val}`;
    return makeToken(name, 'utility', 'z-index', String(val), String(val), 'number', true);
  });

/** Single token arbitrary (union of all categories) */
const singleTokenArb = fc.oneof(
  colorTokenArb,
  spacingTokenArb,
  borderWidthTokenArb,
  borderRadiusTokenArb,
  shadowTokenArb,
  opacityTokenArb,
  breakpointTokenArb,
  durationTokenArb,
  motionTokenArb,
  zindexTokenArb,
);

/** Array of 1-15 unique tokens */
const tokenArrayArb = fc
  .array(singleTokenArb, { minLength: 1, maxLength: 15 })
  .map((tokens) => {
    // Deduplicate by name
    const seen = new Set<string>();
    return tokens.filter((t) => {
      if (seen.has(t.name)) return false;
      seen.add(t.name);
      return true;
    });
  })
  .filter((tokens) => tokens.length > 0);

// ---------------------------------------------------------------------------
// Value extraction helpers
// ---------------------------------------------------------------------------

/**
 * Extracts the semantic value from a CSS line like:
 *   `  --lf-bs-color-neutral-100: #FAFAFA;`
 * Returns the value part (e.g. "#FAFAFA").
 */
function extractCssValue(line: string): string | null {
  const match = line.match(/:\s*(.+?)\s*;/);
  return match ? match[1] : null;
}

/**
 * Extracts the semantic value from a SCSS line like:
 *   `$lf-bs-color-neutral-100: #FAFAFA;`
 */
function extractScssValue(line: string): string | null {
  const match = line.match(/:\s*(.+?)\s*;/);
  return match ? match[1] : null;
}

/**
 * Extracts the semantic value from a JS CJS line like:
 *   `  "LfBsColorNeutral100": "#FAFAFA",`
 */
function extractJsValue(line: string): string | null {
  const match = line.match(/:\s*(".*?"|[\d.]+)\s*,?/);
  if (!match) return null;
  // Strip quotes if present
  return match[1].replace(/^"|"$/g, '');
}

/**
 * Extracts the semantic value from a TS ESM line like:
 *   `export const LfBsColorNeutral100 = "#FAFAFA";`
 */
function extractTsValue(line: string): string | null {
  const match = line.match(/=\s*(".*?"|[\d.]+)\s*;/);
  if (!match) return null;
  return match[1].replace(/^"|"$/g, '');
}

/**
 * Extracts the semantic value from an Android XML line like:
 *   `  <color name="lf_bs_color_neutral_100">#FAFAFA</color>`
 */
function extractAndroidValue(line: string): string | null {
  const match = line.match(/>(.+?)<\//);
  return match ? match[1] : null;
}

/**
 * Extracts the semantic value from an iOS Swift line like:
 *   `    public static let lfBsColorNeutral100 = "#FAFAFA"`
 */
function extractSwiftValue(line: string): string | null {
  const match = line.match(/=\s*(".*?"|[\d.]+)\s*$/);
  if (!match) return null;
  return match[1].replace(/^"|"$/g, '');
}

/**
 * Extracts all token values from a platform file content.
 * Returns an array of values in order of appearance.
 */
function extractValuesFromPlatform(
  content: string,
  platform: string,
): string[] {
  const lines = content.split('\n');
  const values: string[] = [];

  for (const line of lines) {
    let val: string | null = null;
    switch (platform) {
      case 'css':
        val = extractCssValue(line);
        break;
      case 'scss':
        val = extractScssValue(line);
        break;
      case 'js':
        val = extractJsValue(line);
        break;
      case 'ts':
        val = extractTsValue(line);
        break;
      case 'android':
        val = extractAndroidValue(line);
        break;
      case 'ios':
        val = extractSwiftValue(line);
        break;
    }
    if (val !== null) {
      values.push(val);
    }
  }

  return values;
}

// ---------------------------------------------------------------------------
// Property 4: Cross-platform consistency
// ---------------------------------------------------------------------------

describe('Property 4: Consistência cross-plataforma', () => {
  /**
   * **Validates: Requirements 8.2, 9.4**
   *
   * For any randomly generated set of BaseTokens, all 6 platform outputs
   * must contain the same token values (semantic equivalence).
   */
  it('all 6 platform outputs contain the same token values (min 100 iterations)', () => {
    fc.assert(
      fc.property(tokenArrayArb, (tokens) => {
        const files = generateAllPlatformFiles(tokens, 'estacio', 'default');
        const paths = Object.keys(files);

        // Should have exactly 6 platform files
        expect(paths).toHaveLength(6);

        // Extract values from each platform
        const platformValues: Record<string, string[]> = {};
        const platformTypes = ['css', 'scss', 'js', 'ts', 'android', 'ios'];

        for (const path of paths) {
          const platform = platformTypes.find((p) => {
            if (p === 'css') return path.endsWith('.css');
            if (p === 'scss') return path.endsWith('.scss');
            if (p === 'js') return path.endsWith('.cjs');
            if (p === 'ts') return path.includes('/ts/') && path.endsWith('.js');
            if (p === 'android') return path.endsWith('.xml');
            if (p === 'ios') return path.endsWith('.swift');
            return false;
          });

          if (platform) {
            platformValues[platform] = extractValuesFromPlatform(files[path], platform);
          }
        }

        // All platforms should have the same number of values
        const counts = Object.values(platformValues).map((v) => v.length);
        const expectedCount = counts[0];
        for (const count of counts) {
          expect(count).toBe(expectedCount);
        }

        // All platforms should have the same values in the same order
        const cssValues = platformValues['css'];
        for (const platform of platformTypes) {
          if (platform === 'css') continue;
          const pValues = platformValues[platform];
          expect(pValues).toEqual(cssValues);
        }
      }),
      { numRuns: 150 },
    );
  });

  /**
   * **Validates: Requirements 8.2, 9.4**
   *
   * The order of token groupings (by category) is preserved across all platforms.
   */
  it('token grouping order is preserved across all platforms (min 100 iterations)', () => {
    fc.assert(
      fc.property(tokenArrayArb, (tokens) => {
        const files = generateAllPlatformFiles(tokens, 'estacio', 'default');
        const paths = Object.keys(files);

        // Extract values from each platform
        const platformValues: Record<string, string[]> = {};
        const platformTypes = ['css', 'scss', 'js', 'ts', 'android', 'ios'];

        for (const path of paths) {
          const platform = platformTypes.find((p) => {
            if (p === 'css') return path.endsWith('.css');
            if (p === 'scss') return path.endsWith('.scss');
            if (p === 'js') return path.endsWith('.cjs');
            if (p === 'ts') return path.includes('/ts/') && path.endsWith('.js');
            if (p === 'android') return path.endsWith('.xml');
            if (p === 'ios') return path.endsWith('.swift');
            return false;
          });

          if (platform) {
            platformValues[platform] = extractValuesFromPlatform(files[path], platform);
          }
        }

        // Compare ordering: every platform should have the same sequence of values
        const referenceValues = platformValues['css'];
        for (const platform of platformTypes.slice(1)) {
          expect(platformValues[platform]).toEqual(referenceValues);
        }
      }),
      { numRuns: 150 },
    );
  });
});
