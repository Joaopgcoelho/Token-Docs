import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { hexToRgb, hexToRgbString, hexToHslString, hexToOklchString, relativeLuminance, contrastRatio, wcagLevel } from '../colorUtils';

// Helper: generate valid 6-digit hex strings
const hexArb = fc.tuple(
  fc.integer({ min: 0, max: 255 }),
  fc.integer({ min: 0, max: 255 }),
  fc.integer({ min: 0, max: 255 })
).map(([r, g, b]) => '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('').toUpperCase());

describe('Feature: token-detail-page', () => {
  describe('Property 1: Round-trip de conversão de cor', () => {
    it('hexToRgb → reconstruct hex produces original normalized value', () => {
      fc.assert(fc.property(hexArb, (hex) => {
        const rgb = hexToRgb(hex);
        expect(rgb).not.toBeNull();
        const reconstructed = '#' + [rgb.r, rgb.g, rgb.b].map(c => c.toString(16).padStart(2, '0')).join('').toUpperCase();
        expect(reconstructed).toBe(hex);
      }), { numRuns: 200 });
    });

    it('hexToRgbString returns valid rgb() string for any valid hex', () => {
      fc.assert(fc.property(hexArb, (hex) => {
        const result = hexToRgbString(hex);
        expect(result).not.toBeNull();
        expect(result).toMatch(/^rgb\(\d+, \d+, \d+\)$/);
      }), { numRuns: 100 });
    });

    it('hexToHslString returns valid hsl() string for any valid hex', () => {
      fc.assert(fc.property(hexArb, (hex) => {
        const result = hexToHslString(hex);
        expect(result).not.toBeNull();
        expect(result).toMatch(/^hsl\(\d+, \d+%, \d+%\)$/);
      }), { numRuns: 100 });
    });

    it('hexToOklchString returns valid oklch() string for any valid hex', () => {
      fc.assert(fc.property(hexArb, (hex) => {
        const result = hexToOklchString(hex);
        expect(result).not.toBeNull();
        expect(result).toMatch(/^oklch\(/);
      }), { numRuns: 100 });
    });

    it('returns null for invalid input', () => {
      expect(hexToRgb(null)).toBeNull();
      expect(hexToRgb('')).toBeNull();
      expect(hexToRgb('not-a-color')).toBeNull();
      expect(hexToRgb(123)).toBeNull();
    });
  });

  describe('Property 2: Razão de contraste WCAG simétrica e limitada', () => {
    it('contrastRatio is symmetric: contrastRatio(a,b) === contrastRatio(b,a)', () => {
      fc.assert(fc.property(hexArb, hexArb, (fg, bg) => {
        const r1 = contrastRatio(fg, bg);
        const r2 = contrastRatio(bg, fg);
        expect(r1).not.toBeNull();
        expect(r2).not.toBeNull();
        expect(Math.abs(r1 - r2)).toBeLessThan(0.0001);
      }), { numRuns: 200 });
    });

    it('contrastRatio is in range [1, 21]', () => {
      fc.assert(fc.property(hexArb, hexArb, (fg, bg) => {
        const ratio = contrastRatio(fg, bg);
        expect(ratio).toBeGreaterThanOrEqual(1);
        expect(ratio).toBeLessThanOrEqual(21.01); // small epsilon for floating point
      }), { numRuns: 200 });
    });

    it('wcagLevel returns correct level for known thresholds', () => {
      expect(wcagLevel(7.5)).toBe('AAA');
      expect(wcagLevel(5.0)).toBe('AA');
      expect(wcagLevel(3.0)).toBe('Fail');
      expect(wcagLevel(4.5, 'large')).toBe('AAA');
      expect(wcagLevel(3.5, 'large')).toBe('AA');
      expect(wcagLevel(2.0, 'large')).toBe('Fail');
    });

    it('contrastRatio returns null for invalid input', () => {
      expect(contrastRatio('invalid', '#000000')).toBeNull();
      expect(contrastRatio('#000000', 'invalid')).toBeNull();
    });
  });
});
