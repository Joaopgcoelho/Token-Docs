import { describe, it, expect } from 'vitest';
import { sortTokens } from './token-sorting';
import type { BaseToken } from '../models/base-token.types';

// ---------------------------------------------------------------------------
// Helper: create a minimal BaseToken for testing
// ---------------------------------------------------------------------------

function makeToken(
  overrides: Partial<BaseToken> & Pick<BaseToken, 'name' | 'category' | 'subcategory' | 'scale'>,
): BaseToken {
  return {
    cssProperty: `--lf-bs-${overrides.name.toLowerCase()}`,
    value: '#000000',
    tsType: 'string',
    isInvariant: false,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Unit tests for sortTokens
// ---------------------------------------------------------------------------

describe('sortTokens', () => {
  it('returns a new array without mutating the input', () => {
    const input: BaseToken[] = [
      makeToken({ name: 'LfBsColorPrimary200', category: 'color', subcategory: 'primary', scale: '200' }),
      makeToken({ name: 'LfBsColorNeutral100', category: 'color', subcategory: 'neutral', scale: '100' }),
    ];
    const original = [...input];
    const sorted = sortTokens(input);

    // Input unchanged
    expect(input).toEqual(original);
    // Result is a different array reference
    expect(sorted).not.toBe(input);
  });

  it('sorts by category following TOKEN_CATEGORIES order', () => {
    const tokens: BaseToken[] = [
      makeToken({ name: 'LfBsOpacity50', category: 'opacity', subcategory: 'opacity', scale: '50' }),
      makeToken({ name: 'LfBsColorNeutral100', category: 'color', subcategory: 'neutral', scale: '100' }),
      makeToken({ name: 'LfBsSpaceGap100', category: 'spacing', subcategory: 'gap', scale: '100' }),
      makeToken({ name: 'LfBsBorderWidth100', category: 'border', subcategory: 'width', scale: '100' }),
      makeToken({ name: 'LfBsShadowLevel1Layer1', category: 'shadow', subcategory: 'level1', scale: '1' }),
      makeToken({ name: 'LfBsBreakpointSm', category: 'utility', subcategory: 'breakpoint', scale: 'sm' }),
      makeToken({ name: 'LfBsTypographyFontSizeDisplay', category: 'typography', subcategory: 'font-size', scale: '100' }),
    ];

    const sorted = sortTokens(tokens);
    const categories = sorted.map((t) => t.category);

    expect(categories).toEqual([
      'color',
      'typography',
      'spacing',
      'border',
      'shadow',
      'opacity',
      'utility',
    ]);
  });

  it('sorts alphabetically by subcategory within the same category', () => {
    const tokens: BaseToken[] = [
      makeToken({ name: 'LfBsColorPrimary100', category: 'color', subcategory: 'primary', scale: '100' }),
      makeToken({ name: 'LfBsColorNeutral100', category: 'color', subcategory: 'neutral', scale: '100' }),
      makeToken({ name: 'LfBsColorWarning100', category: 'color', subcategory: 'warning', scale: '100' }),
      makeToken({ name: 'LfBsColorAi100', category: 'color', subcategory: 'ai', scale: '100' }),
      makeToken({ name: 'LfBsColorCritical100', category: 'color', subcategory: 'critical', scale: '100' }),
    ];

    const sorted = sortTokens(tokens);
    const subcategories = sorted.map((t) => t.subcategory);

    expect(subcategories).toEqual(['ai', 'critical', 'neutral', 'primary', 'warning']);
  });

  it('sorts numerically by scale within the same subcategory', () => {
    const tokens: BaseToken[] = [
      makeToken({ name: 'LfBsColorNeutral500', category: 'color', subcategory: 'neutral', scale: '500' }),
      makeToken({ name: 'LfBsColorNeutral100', category: 'color', subcategory: 'neutral', scale: '100' }),
      makeToken({ name: 'LfBsColorNeutral1000', category: 'color', subcategory: 'neutral', scale: '1000' }),
      makeToken({ name: 'LfBsColorNeutral200', category: 'color', subcategory: 'neutral', scale: '200' }),
    ];

    const sorted = sortTokens(tokens);
    const scales = sorted.map((t) => t.scale);

    expect(scales).toEqual(['100', '200', '500', '1000']);
  });

  it('sorts semantic scales alphabetically when not numeric', () => {
    const tokens: BaseToken[] = [
      makeToken({ name: 'LfBsBorderRadiusPill', category: 'border', subcategory: 'radius', scale: 'pill' }),
      makeToken({ name: 'LfBsBorderRadiusNone', category: 'border', subcategory: 'radius', scale: 'none' }),
      makeToken({ name: 'LfBsBorderRadiusSmall', category: 'border', subcategory: 'radius', scale: 'small' }),
      makeToken({ name: 'LfBsBorderRadiusLarge', category: 'border', subcategory: 'radius', scale: 'large' }),
      makeToken({ name: 'LfBsBorderRadiusMedium', category: 'border', subcategory: 'radius', scale: 'medium' }),
    ];

    const sorted = sortTokens(tokens);
    const scales = sorted.map((t) => t.scale);

    expect(scales).toEqual(['large', 'medium', 'none', 'pill', 'small']);
  });

  it('places numeric scales before semantic scales in the same subcategory', () => {
    const tokens: BaseToken[] = [
      makeToken({ name: 'LfBsTestSemantic', category: 'border', subcategory: 'mixed', scale: 'auto' }),
      makeToken({ name: 'LfBsTestNumeric', category: 'border', subcategory: 'mixed', scale: '100' }),
    ];

    const sorted = sortTokens(tokens);
    expect(sorted[0].scale).toBe('100');
    expect(sorted[1].scale).toBe('auto');
  });

  it('handles an empty array', () => {
    const sorted = sortTokens([]);
    expect(sorted).toEqual([]);
  });

  it('handles a single token', () => {
    const token = makeToken({ name: 'LfBsColorNeutral100', category: 'color', subcategory: 'neutral', scale: '100' });
    const sorted = sortTokens([token]);
    expect(sorted).toEqual([token]);
  });

  it('applies all three sorting levels together', () => {
    const tokens: BaseToken[] = [
      // Spacing tokens (should come after color)
      makeToken({ name: 'LfBsSpacePadding200', category: 'spacing', subcategory: 'padding', scale: '200' }),
      makeToken({ name: 'LfBsSpaceGap100', category: 'spacing', subcategory: 'gap', scale: '100' }),
      // Color tokens (should come first)
      makeToken({ name: 'LfBsColorPrimary200', category: 'color', subcategory: 'primary', scale: '200' }),
      makeToken({ name: 'LfBsColorNeutral300', category: 'color', subcategory: 'neutral', scale: '300' }),
      makeToken({ name: 'LfBsColorNeutral100', category: 'color', subcategory: 'neutral', scale: '100' }),
      makeToken({ name: 'LfBsColorPrimary100', category: 'color', subcategory: 'primary', scale: '100' }),
    ];

    const sorted = sortTokens(tokens);
    const names = sorted.map((t) => t.name);

    expect(names).toEqual([
      'LfBsColorNeutral100',
      'LfBsColorNeutral300',
      'LfBsColorPrimary100',
      'LfBsColorPrimary200',
      'LfBsSpaceGap100',
      'LfBsSpacePadding200',
    ]);
  });

  it('is case-insensitive when comparing subcategories', () => {
    const tokens: BaseToken[] = [
      makeToken({ name: 'LfBsColorZebra100', category: 'color', subcategory: 'Zebra', scale: '100' }),
      makeToken({ name: 'LfBsColorAlpha100', category: 'color', subcategory: 'alpha', scale: '100' }),
    ];

    const sorted = sortTokens(tokens);
    expect(sorted[0].subcategory).toBe('alpha');
    expect(sorted[1].subcategory).toBe('Zebra');
  });

  it('handles scale 0 correctly (sorts before positive numbers)', () => {
    const tokens: BaseToken[] = [
      makeToken({ name: 'LfBsSpaceGap200', category: 'spacing', subcategory: 'gap', scale: '200' }),
      makeToken({ name: 'LfBsSpaceGap0', category: 'spacing', subcategory: 'gap', scale: '0' }),
      makeToken({ name: 'LfBsSpaceGap100', category: 'spacing', subcategory: 'gap', scale: '100' }),
    ];

    const sorted = sortTokens(tokens);
    const scales = sorted.map((t) => t.scale);

    expect(scales).toEqual(['0', '100', '200']);
  });
});
