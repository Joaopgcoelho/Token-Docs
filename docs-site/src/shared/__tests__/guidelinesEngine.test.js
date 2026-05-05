import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { generateGuidelines } from '../guidelinesEngine';
import { ENRICHED_MAP } from '../tokenData';

const allTokenNames = Object.keys(ENRICHED_MAP);
const tokenNameArb = fc.constantFrom(...allTokenNames);

describe('Feature: token-detail-page', () => {
  describe('Property 5: Geração de diretrizes consistente com metadados', () => {
    it('generateGuidelines returns non-empty array for any token', () => {
      fc.assert(fc.property(tokenNameArb, (name) => {
        const token = ENRICHED_MAP[name];
        const guidelines = generateGuidelines(token);
        expect(Array.isArray(guidelines)).toBe(true);
        expect(guidelines.length).toBeGreaterThan(0);
      }), { numRuns: 200 });
    });

    it('usage layer tokens have both do and dont guidelines', () => {
      const usageTokens = allTokenNames.filter(n => ENRICHED_MAP[n].layer === 'usage');
      if (usageTokens.length === 0) return;
      const usageArb = fc.constantFrom(...usageTokens);
      fc.assert(fc.property(usageArb, (name) => {
        const token = ENRICHED_MAP[name];
        const guidelines = generateGuidelines(token);
        const hasDo = guidelines.some(g => g.type === 'do');
        const hasDont = guidelines.some(g => g.type === 'dont');
        expect(hasDo).toBe(true);
        expect(hasDont).toBe(true);
      }), { numRuns: 100 });
    });

    it('surface role tokens have onSurface pairing guideline', () => {
      const surfaceTokens = allTokenNames.filter(n => ENRICHED_MAP[n].role === 'surface');
      if (surfaceTokens.length === 0) return;
      const surfaceArb = fc.constantFrom(...surfaceTokens);
      fc.assert(fc.property(surfaceArb, (name) => {
        const token = ENRICHED_MAP[name];
        const guidelines = generateGuidelines(token);
        const hasOnSurfaceGuideline = guidelines.some(g =>
          g.text.toLowerCase().includes('on surface') || g.text.toLowerCase().includes('onsurface')
        );
        expect(hasOnSurfaceGuideline).toBe(true);
      }), { numRuns: 100 });
    });
  });
});
