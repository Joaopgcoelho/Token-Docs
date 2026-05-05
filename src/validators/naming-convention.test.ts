import { describe, it, expect } from 'vitest';
import {
  validateTokenName,
  camelToCssProperty,
  cssPropertyToCamel,
  figmaPathToCamel,
} from './naming-convention';

describe('naming-convention', () => {
  // -----------------------------------------------------------------------
  // validateTokenName
  // -----------------------------------------------------------------------
  describe('validateTokenName', () => {
    it('accepts a valid color token name', () => {
      const result = validateTokenName('LfBsColorNeutral100');
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('accepts a valid border-radius token name', () => {
      const result = validateTokenName('LfBsBorderRadiusXxSmall');
      expect(result.valid).toBe(true);
    });

    it('rejects name without LfBs prefix', () => {
      const result = validateTokenName('LfColorNeutral100');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('rejects empty string', () => {
      const result = validateTokenName('');
      expect(result.valid).toBe(false);
    });

    it('rejects prefix-only name', () => {
      const result = validateTokenName('LfBs');
      expect(result.valid).toBe(false);
    });

    it('rejects name with hyphens', () => {
      const result = validateTokenName('LfBs-color-neutral');
      expect(result.valid).toBe(false);
    });

    it('rejects name where category starts with lowercase', () => {
      const result = validateTokenName('LfBscolorNeutral100');
      expect(result.valid).toBe(false);
    });
  });

  // -----------------------------------------------------------------------
  // camelToCssProperty
  // -----------------------------------------------------------------------
  describe('camelToCssProperty', () => {
    it('converts LfBsColorNeutral100 → --lf-bs-color-neutral-100', () => {
      expect(camelToCssProperty('LfBsColorNeutral100')).toBe('--lf-bs-color-neutral-100');
    });

    it('converts LfBsColorPrimary500 → --lf-bs-color-primary-500', () => {
      expect(camelToCssProperty('LfBsColorPrimary500')).toBe('--lf-bs-color-primary-500');
    });

    it('converts LfBsBorderRadiusXxSmall → --lf-bs-border-radius-xx-small', () => {
      expect(camelToCssProperty('LfBsBorderRadiusXxSmall')).toBe('--lf-bs-border-radius-xx-small');
    });

    it('converts LfBsBorderRadiusXSmall → --lf-bs-border-radius-x-small', () => {
      expect(camelToCssProperty('LfBsBorderRadiusXSmall')).toBe('--lf-bs-border-radius-x-small');
    });

    it('converts LfBsSpaceGap100 → --lf-bs-space-gap-100', () => {
      expect(camelToCssProperty('LfBsSpaceGap100')).toBe('--lf-bs-space-gap-100');
    });

    it('converts LfBsOpacity0 → --lf-bs-opacity-0', () => {
      expect(camelToCssProperty('LfBsOpacity0')).toBe('--lf-bs-opacity-0');
    });

    it('converts LfBsBreakpointXs → --lf-bs-breakpoint-xs', () => {
      expect(camelToCssProperty('LfBsBreakpointXs')).toBe('--lf-bs-breakpoint-xs');
    });

    it('converts LfBsShadowLevel1Layer1 → --lf-bs-shadow-level-1-layer-1', () => {
      expect(camelToCssProperty('LfBsShadowLevel1Layer1')).toBe('--lf-bs-shadow-level-1-layer-1');
    });

    it('converts LfBsColorNeutralAlpha100 → --lf-bs-color-neutral-alpha-100', () => {
      expect(camelToCssProperty('LfBsColorNeutralAlpha100')).toBe('--lf-bs-color-neutral-alpha-100');
    });

    it('converts LfBsBorderWidth0 → --lf-bs-border-width-0', () => {
      expect(camelToCssProperty('LfBsBorderWidth0')).toBe('--lf-bs-border-width-0');
    });

    it('converts LfBsColorNeutral1000 → --lf-bs-color-neutral-1000', () => {
      expect(camelToCssProperty('LfBsColorNeutral1000')).toBe('--lf-bs-color-neutral-1000');
    });

    it('converts LfBsDuration5000 → --lf-bs-duration-5000', () => {
      expect(camelToCssProperty('LfBsDuration5000')).toBe('--lf-bs-duration-5000');
    });

    it('converts LfBsZindex1080 → --lf-bs-zindex-1080', () => {
      expect(camelToCssProperty('LfBsZindex1080')).toBe('--lf-bs-zindex-1080');
    });
  });

  // -----------------------------------------------------------------------
  // cssPropertyToCamel
  // -----------------------------------------------------------------------
  describe('cssPropertyToCamel', () => {
    it('converts --lf-bs-color-neutral-100 → LfBsColorNeutral100', () => {
      expect(cssPropertyToCamel('--lf-bs-color-neutral-100')).toBe('LfBsColorNeutral100');
    });

    it('converts --lf-bs-border-radius-xx-small → LfBsBorderRadiusXxSmall', () => {
      expect(cssPropertyToCamel('--lf-bs-border-radius-xx-small')).toBe('LfBsBorderRadiusXxSmall');
    });

    it('converts --lf-bs-shadow-level-1-layer-1 → LfBsShadowLevel1Layer1', () => {
      expect(cssPropertyToCamel('--lf-bs-shadow-level-1-layer-1')).toBe('LfBsShadowLevel1Layer1');
    });

    it('converts --lf-bs-color-neutral-1000 → LfBsColorNeutral1000', () => {
      expect(cssPropertyToCamel('--lf-bs-color-neutral-1000')).toBe('LfBsColorNeutral1000');
    });

    it('converts --lf-bs-duration-5000 → LfBsDuration5000', () => {
      expect(cssPropertyToCamel('--lf-bs-duration-5000')).toBe('LfBsDuration5000');
    });
  });

  // -----------------------------------------------------------------------
  // Round-trip: camelCase ↔ CSS
  // -----------------------------------------------------------------------
  describe('round-trip camelCase ↔ CSS', () => {
    const names = [
      'LfBsColorNeutral100',
      'LfBsColorPrimary500',
      'LfBsColorNeutral1000',
      'LfBsColorNeutralAlpha100',
      'LfBsBorderRadiusXxSmall',
      'LfBsBorderRadiusXSmall',
      'LfBsBorderRadiusPill',
      'LfBsBorderWidth0',
      'LfBsBorderWidth400',
      'LfBsSpaceGap100',
      'LfBsSpacePadding0',
      'LfBsOpacity0',
      'LfBsOpacity100',
      'LfBsBreakpointXs',
      'LfBsBreakpointXl',
      'LfBsDuration0',
      'LfBsDuration5000',
      'LfBsShadowLevel1Layer1',
      'LfBsShadowLevel4Layer3',
      'LfBsZindex1080',
      'LfBsTypographyFontFamilyDisplay',
      'LfBsTypographyFontWeightHeadingBold',
    ];

    for (const name of names) {
      it(`round-trips ${name}`, () => {
        const css = camelToCssProperty(name);
        const back = cssPropertyToCamel(css);
        expect(back).toBe(name);
      });
    }
  });

  // -----------------------------------------------------------------------
  // figmaPathToCamel
  // -----------------------------------------------------------------------
  describe('figmaPathToCamel', () => {
    it('converts Base/Colors/Neutral/100 → LfBsColorNeutral100', () => {
      expect(figmaPathToCamel('Base/Colors/Neutral/100')).toBe('LfBsColorNeutral100');
    });

    it('converts Base/Colors/Primary/500 → LfBsColorPrimary500', () => {
      expect(figmaPathToCamel('Base/Colors/Primary/500')).toBe('LfBsColorPrimary500');
    });

    it('converts Base/Colors/NeutralAlpha/100 → LfBsColorNeutralAlpha100', () => {
      expect(figmaPathToCamel('Base/Colors/NeutralAlpha/100')).toBe('LfBsColorNeutralAlpha100');
    });

    it('converts Base/Sizing/border/radius/xx-small → LfBsBorderRadiusXxSmall', () => {
      expect(figmaPathToCamel('Base/Sizing/border/radius/xx-small')).toBe('LfBsBorderRadiusXxSmall');
    });

    it('converts Base/Sizing/border/width/0 → LfBsBorderWidth0', () => {
      expect(figmaPathToCamel('Base/Sizing/border/width/0')).toBe('LfBsBorderWidth0');
    });

    it('converts Base/Sizing/space/gap/100 → LfBsSpaceGap100', () => {
      expect(figmaPathToCamel('Base/Sizing/space/gap/100')).toBe('LfBsSpaceGap100');
    });

    it('handles path without Base/ prefix', () => {
      expect(figmaPathToCamel('Colors/Neutral/100')).toBe('LfBsColorNeutral100');
    });

    it('converts Base/Sizing/border/radius/x-small → LfBsBorderRadiusXSmall', () => {
      expect(figmaPathToCamel('Base/Sizing/border/radius/x-small')).toBe('LfBsBorderRadiusXSmall');
    });
  });
});
