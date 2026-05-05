/**
 * @module theme-interface.property.test
 * @description Teste de propriedade para completude e tipagem da interface TypeScript.
 *
 * **Propriedade 6: Completude e tipagem da interface TypeScript**
 * Para conjuntos de tokens gerados, verificar que o `theme.d.ts` contém todas
 * as entradas com tipos corretos (`number` para breakpoint/z-index, `string` para demais).
 *
 * **Valida: Requisitos 9.3, 9.5**
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import type { BaseToken, TokenCategory } from '../models/base-token.types';
import { generateThemeInterface } from './theme-interface';
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
  BORDER_WIDTH_VALUES,
  OPACITY_VALUES,
  BORDER_RADIUS_VALUES,
  BASE_TOKEN_PREFIX,
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
    return makeToken(name, 'color', palette, String(scale), '#AABBCC');
  });

/** Spacing token arbitrary */
const spacingTokenArb = fc
  .tuple(
    fc.constantFrom(...SPACING_SUBGROUPS),
    fc.integer({ min: 0, max: 10 }).map((n) => n * 100),
  )
  .map(([sub, scale]) => {
    const name = `${BASE_TOKEN_PREFIX}Space${capitalize(sub)}${scale}`;
    return makeToken(name, 'spacing', sub, String(scale), `${scale}px`);
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

/** Breakpoint token arbitrary — tsType is 'number' */
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

/** Z-index token arbitrary — tsType is 'number' */
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

/** Array of 1-20 unique tokens */
const tokenArrayArb = fc
  .array(singleTokenArb, { minLength: 1, maxLength: 20 })
  .map((tokens) => {
    const seen = new Set<string>();
    return tokens.filter((t) => {
      if (seen.has(t.name)) return false;
      seen.add(t.name);
      return true;
    });
  })
  .filter((tokens) => tokens.length > 0);

// ---------------------------------------------------------------------------
// Parsing helpers
// ---------------------------------------------------------------------------

/**
 * Parses the generated theme.d.ts content and extracts property name → type mappings.
 */
function parseThemeInterface(content: string): Map<string, string> {
  const entries = new Map<string, string>();
  const lines = content.split('\n');

  for (const line of lines) {
    // Match lines like: `  LfBsColorNeutral100: string;`
    const match = line.match(/^\s+(LfBs\w+):\s+(string|number);$/);
    if (match) {
      entries.set(match[1], match[2]);
    }
  }

  return entries;
}

// ---------------------------------------------------------------------------
// Property 6: TypeScript interface completeness and typing
// ---------------------------------------------------------------------------

describe('Property 6: Completude e tipagem da interface TypeScript', () => {
  /**
   * **Validates: Requirements 9.3, 9.5**
   *
   * For any randomly generated set of BaseTokens, the generated theme.d.ts
   * must contain an entry for every token.
   */
  it('theme.d.ts contains an entry for every token (min 100 iterations)', () => {
    fc.assert(
      fc.property(tokenArrayArb, (tokens) => {
        const content = generateThemeInterface(tokens);
        const entries = parseThemeInterface(content);

        // Every token must be present
        for (const token of tokens) {
          expect(entries.has(token.name)).toBe(true);
        }

        // No extra entries beyond the tokens
        expect(entries.size).toBe(tokens.length);
      }),
      { numRuns: 150 },
    );
  });

  /**
   * **Validates: Requirements 9.3, 9.5**
   *
   * Breakpoint and z-index tokens must have type `number`.
   * All other tokens must have type `string`.
   */
  it('numeric tokens (breakpoint, z-index) are typed as number, others as string (min 100 iterations)', () => {
    fc.assert(
      fc.property(tokenArrayArb, (tokens) => {
        const content = generateThemeInterface(tokens);
        const entries = parseThemeInterface(content);

        for (const token of tokens) {
          const tsType = entries.get(token.name);
          expect(tsType).toBeDefined();

          if (token.tsType === 'number') {
            expect(tsType).toBe('number');
          } else {
            expect(tsType).toBe('string');
          }
        }
      }),
      { numRuns: 150 },
    );
  });

  /**
   * **Validates: Requirements 9.3**
   *
   * The generated content must be a valid TypeScript interface declaration
   * with the `Theme` export.
   */
  it('generated content contains a valid exported Theme interface', () => {
    fc.assert(
      fc.property(tokenArrayArb, (tokens) => {
        const content = generateThemeInterface(tokens);

        // Must contain the interface declaration
        expect(content).toContain('export interface Theme {');

        // Must end with closing brace
        expect(content).toContain('}');

        // All token names must appear with LfBs prefix
        for (const token of tokens) {
          expect(content).toContain(token.name);
        }
      }),
      { numRuns: 150 },
    );
  });
});
