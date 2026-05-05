import { describe, it, expect } from 'vitest';
import type { BaseToken } from '../models/base-token.types';
import {
  formatCssToken,
  formatScssToken,
  formatJsCjsToken,
  formatTsEsmToken,
  formatAndroidXmlToken,
  formatIosSwiftToken,
  generateCssFile,
  generateScssFile,
  generateJsCjsFile,
  generateTsEsmFile,
  generateAndroidXmlFile,
  generateIosSwiftFile,
  createAllPlatforms,
  createAllBrandPlatforms,
  generateAllPlatformFiles,
  OUTPUT_MODES,
} from './platform-formats';

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

const sampleTokens: BaseToken[] = [
  makeToken(),
  makeToken({
    name: 'LfBsColorPrimary500',
    cssProperty: '--lf-bs-color-primary-500',
    subcategory: 'primary',
    scale: '500',
    value: '#0066CC',
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
];

// ---------------------------------------------------------------------------
// Per-token formatters
// ---------------------------------------------------------------------------

describe('platform-formats', () => {
  describe('formatCssToken', () => {
    it('formats a color token as CSS custom property', () => {
      const result = formatCssToken(makeToken());
      expect(result).toBe('  --lf-bs-color-neutral-100: #FAFAFA;');
    });

    it('formats a numeric token without quotes', () => {
      const result = formatCssToken(makeToken({
        cssProperty: '--lf-bs-breakpoint-sm',
        value: '768',
        tsType: 'number',
      }));
      expect(result).toBe('  --lf-bs-breakpoint-sm: 768;');
    });
  });

  describe('formatScssToken', () => {
    it('formats a color token as SCSS variable', () => {
      const result = formatScssToken(makeToken());
      expect(result).toBe('$lf-bs-color-neutral-100: #FAFAFA;');
    });
  });

  describe('formatJsCjsToken', () => {
    it('formats a string token with quotes', () => {
      const result = formatJsCjsToken(makeToken());
      expect(result).toBe('  "LfBsColorNeutral100": "#FAFAFA",');
    });

    it('formats a numeric token without quotes', () => {
      const result = formatJsCjsToken(makeToken({
        name: 'LfBsBreakpointSm',
        value: '768',
        tsType: 'number',
      }));
      expect(result).toBe('  "LfBsBreakpointSm": 768,');
    });
  });

  describe('formatTsEsmToken', () => {
    it('formats a string token as export const', () => {
      const result = formatTsEsmToken(makeToken());
      expect(result).toBe('export const LfBsColorNeutral100 = "#FAFAFA";');
    });

    it('formats a numeric token without quotes', () => {
      const result = formatTsEsmToken(makeToken({
        name: 'LfBsBreakpointSm',
        value: '768',
        tsType: 'number',
      }));
      expect(result).toBe('export const LfBsBreakpointSm = 768;');
    });
  });

  describe('formatAndroidXmlToken', () => {
    it('formats a color token with <color> tag', () => {
      const result = formatAndroidXmlToken(makeToken());
      expect(result).toBe('  <color name="lf_bs_color_neutral_100">#FAFAFA</color>');
    });

    it('formats a non-color token with <string> tag', () => {
      const result = formatAndroidXmlToken(makeToken({
        cssProperty: '--lf-bs-breakpoint-sm',
        category: 'utility',
        value: '768',
      }));
      expect(result).toBe('  <string name="lf_bs_breakpoint_sm">768</string>');
    });

    it('uses underscores in resource name', () => {
      const result = formatAndroidXmlToken(makeToken({
        cssProperty: '--lf-bs-border-radius-xx-small',
        category: 'border',
        value: '2px',
      }));
      expect(result).toBe('  <string name="lf_bs_border_radius_xx_small">2px</string>');
    });
  });

  describe('formatIosSwiftToken', () => {
    it('formats a string token as static let with quotes', () => {
      const result = formatIosSwiftToken(makeToken());
      expect(result).toBe('    public static let lfBsColorNeutral100 = "#FAFAFA"');
    });

    it('formats a numeric token without quotes', () => {
      const result = formatIosSwiftToken(makeToken({
        name: 'LfBsBreakpointSm',
        value: '768',
        tsType: 'number',
      }));
      expect(result).toBe('    public static let lfBsBreakpointSm = 768');
    });
  });

  // ---------------------------------------------------------------------------
  // Full-file generators
  // ---------------------------------------------------------------------------

  describe('generateCssFile', () => {
    it('wraps tokens in :root block', () => {
      const result = generateCssFile(sampleTokens);
      expect(result).toContain(':root {');
      expect(result).toContain('--lf-bs-color-neutral-100: #FAFAFA;');
      expect(result).toContain('}');
    });

    it('includes auto-generated comment', () => {
      const result = generateCssFile(sampleTokens);
      expect(result).toContain('Do not edit directly');
    });

    it('sorts tokens by category then subcategory', () => {
      const result = generateCssFile(sampleTokens);
      const neutralIdx = result.indexOf('neutral-100');
      const primaryIdx = result.indexOf('primary-500');
      const breakpointIdx = result.indexOf('breakpoint-sm');
      expect(neutralIdx).toBeLessThan(primaryIdx);
      expect(primaryIdx).toBeLessThan(breakpointIdx);
    });
  });

  describe('generateScssFile', () => {
    it('generates SCSS variables', () => {
      const result = generateScssFile(sampleTokens);
      expect(result).toContain('$lf-bs-color-neutral-100: #FAFAFA;');
    });
  });

  describe('generateJsCjsFile', () => {
    it('wraps tokens in module.exports', () => {
      const result = generateJsCjsFile(sampleTokens);
      expect(result).toContain('module.exports = {');
      expect(result).toContain('"LfBsColorNeutral100": "#FAFAFA"');
      expect(result).toContain('};');
    });

    it('outputs numeric values without quotes', () => {
      const result = generateJsCjsFile(sampleTokens);
      expect(result).toContain('"LfBsBreakpointSm": 768');
    });
  });

  describe('generateTsEsmFile', () => {
    it('generates export const statements', () => {
      const result = generateTsEsmFile(sampleTokens);
      expect(result).toContain('export const LfBsColorNeutral100 = "#FAFAFA";');
      expect(result).toContain('export const LfBsBreakpointSm = 768;');
    });
  });

  describe('generateAndroidXmlFile', () => {
    it('generates valid XML structure', () => {
      const result = generateAndroidXmlFile(sampleTokens);
      expect(result).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(result).toContain('<resources>');
      expect(result).toContain('</resources>');
    });

    it('uses <color> tag for color tokens', () => {
      const result = generateAndroidXmlFile(sampleTokens);
      expect(result).toContain('<color name="lf_bs_color_neutral_100">#FAFAFA</color>');
    });

    it('uses <string> tag for non-color tokens', () => {
      const result = generateAndroidXmlFile(sampleTokens);
      expect(result).toContain('<string name="lf_bs_breakpoint_sm">768</string>');
    });
  });

  describe('generateIosSwiftFile', () => {
    it('generates Swift class structure', () => {
      const result = generateIosSwiftFile(sampleTokens);
      expect(result).toContain('import SwiftUI');
      expect(result).toContain('public class LiftBaseTokens {');
      expect(result).toContain('}');
    });

    it('generates static let constants', () => {
      const result = generateIosSwiftFile(sampleTokens);
      expect(result).toContain('public static let lfBsColorNeutral100 = "#FAFAFA"');
    });
  });

  // ---------------------------------------------------------------------------
  // Platform factories
  // ---------------------------------------------------------------------------

  describe('createAllPlatforms', () => {
    it('creates 6 platform configurations', () => {
      const platforms = createAllPlatforms('estacio');
      expect(platforms).toHaveLength(6);
    });

    it('includes all platform types', () => {
      const platforms = createAllPlatforms('estacio');
      const types = platforms.map((p) => p.platform);
      expect(types).toEqual(['css', 'scss', 'js', 'ts', 'android', 'ios']);
    });

    it('uses correct output paths', () => {
      const platforms = createAllPlatforms('estacio', 'default');
      expect(platforms[0].outputPath).toBe('brands/estacio/css/default.css');
      expect(platforms[4].outputPath).toBe('brands/estacio/android/default.xml');
    });

    it('uses correct file extensions', () => {
      const platforms = createAllPlatforms('estacio');
      const extensions = platforms.map((p) => p.fileExtension);
      expect(extensions).toEqual(['.css', '.scss', '.cjs', '.js', '.xml', '.swift']);
    });
  });

  describe('createAllBrandPlatforms', () => {
    it('creates configurations for all brands and modes', () => {
      const all = createAllBrandPlatforms();
      const keys = Object.keys(all);
      // 8 brands × 2 modes = 16 entries
      expect(keys).toHaveLength(16);
      expect(keys).toContain('estacio/default');
      expect(keys).toContain('estacio/high-contrast');
      expect(keys).toContain('wyden/default');
    });

    it('each entry has 6 platforms', () => {
      const all = createAllBrandPlatforms();
      for (const platforms of Object.values(all)) {
        expect(platforms).toHaveLength(6);
      }
    });
  });

  describe('OUTPUT_MODES', () => {
    it('includes default and high-contrast', () => {
      expect(OUTPUT_MODES).toEqual(['default', 'high-contrast']);
    });
  });

  // ---------------------------------------------------------------------------
  // generateAllPlatformFiles
  // ---------------------------------------------------------------------------

  describe('generateAllPlatformFiles', () => {
    it('generates files for all 6 platforms', () => {
      const files = generateAllPlatformFiles(sampleTokens, 'estacio');
      const paths = Object.keys(files);
      expect(paths).toHaveLength(6);
      expect(paths).toContain('brands/estacio/css/default.css');
      expect(paths).toContain('brands/estacio/scss/default.scss');
      expect(paths).toContain('brands/estacio/js/default.cjs');
      expect(paths).toContain('brands/estacio/ts/default.js');
      expect(paths).toContain('brands/estacio/android/default.xml');
      expect(paths).toContain('brands/estacio/ios/default.swift');
    });

    it('all files contain the same token value', () => {
      const files = generateAllPlatformFiles([makeToken()], 'estacio');
      for (const content of Object.values(files)) {
        expect(content).toContain('#FAFAFA');
      }
    });

    it('preserves semantic value across platforms', () => {
      const token = makeToken({
        name: 'LfBsBreakpointSm',
        cssProperty: '--lf-bs-breakpoint-sm',
        category: 'utility',
        subcategory: 'breakpoint',
        scale: 'sm',
        value: '768',
        tsType: 'number',
      });
      const files = generateAllPlatformFiles([token], 'estacio');
      for (const content of Object.values(files)) {
        expect(content).toContain('768');
      }
    });
  });
});
