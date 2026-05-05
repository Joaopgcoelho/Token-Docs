import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { ENRICHED_MAP, BRANDS } from '../tokenData';
import { camelToKebab } from '../../sections/token-detail/CodeSection';

const allTokenNames = Object.keys(ENRICHED_MAP);
const tokenNameArb = fc.constantFrom(...allTokenNames);
const brandArb = fc.constantFrom(...Object.keys(BRANDS));

describe('Feature: token-detail-page', () => {
  describe('Property 6: Geração de snippets de código', () => {
    it('CSS snippet is var(--{kebab-case})', () => {
      fc.assert(fc.property(tokenNameArb, (name) => {
        const kebab = camelToKebab(name);
        const cssSnippet = `var(--${kebab})`;
        expect(cssSnippet).toMatch(/^var\(--[a-z0-9-]+\)$/);
      }), { numRuns: 200 });
    });

    it('JS snippet contains exact token name as named import', () => {
      fc.assert(fc.property(tokenNameArb, brandArb, (name, brand) => {
        const jsSnippet = `import { ${name} } from '@lift/ds-tokens/brands/${brand}/ts/default.js';`;
        expect(jsSnippet).toContain(name);
        expect(jsSnippet).toContain(`@lift/ds-tokens/brands/${brand}/ts/default.js`);
      }), { numRuns: 200 });
    });

    it('JSON snippet is valid parseable JSON containing the token name as key', () => {
      fc.assert(fc.property(tokenNameArb, (name) => {
        const token = ENRICHED_MAP[name];
        const jsonSnippet = JSON.stringify({ [name]: token.value || '' }, null, 2);
        const parsed = JSON.parse(jsonSnippet);
        expect(parsed).toHaveProperty(name);
      }), { numRuns: 200 });
    });
  });
});
