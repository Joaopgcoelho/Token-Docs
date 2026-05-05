import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import {
  generateES5Constants,
  generateHTMLData,
  generateAIMarkdown,
} from '../generate-token-docs.js';

/**
 * **Validates: Requirements 7.1, 7.2**
 *
 * Property CONS.1: For all groupKeys in schema.groups, ES5 output contains
 * groupKey, htmlJson.groups[groupKey] exists, aiMarkdown contains groupKey.
 *
 * Property CONS.2: For all groups, schema whenUse/whenNotUse ===
 * htmlJson whenUse/whenNotUse.
 */

// ── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Load the real token-schema.json as the base schema.
 */
function loadRealSchema() {
  const schemaPath = resolve(__dirname, '../../token-schema.json');
  return JSON.parse(readFileSync(schemaPath, 'utf-8'));
}

/**
 * Generate all 3 outputs from a schema for consistency testing.
 * Uses a non-existent enriched tokens path so generateHTMLData
 * proceeds with empty tokens (which is fine for consistency checks).
 */
function generateAllOutputs(schema) {
  const es5Code = generateES5Constants(schema);
  const htmlJson = generateHTMLData(schema, '/nonexistent/path.json');
  const aiMarkdown = generateAIMarkdown(schema);
  return { es5Code, htmlJson, aiMarkdown };
}

// ── Arbitraries ─────────────────────────────────────────────────────────────

/**
 * Arbitrary: generates a non-empty printable string.
 */
const safeString = fc
  .array(
    fc.constantFrom(
      ...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 .,;:!?()-/'
    ),
    { minLength: 1, maxLength: 60 }
  )
  .map((chars) => chars.join(''));

/**
 * Arbitrary: generates a meaningful string with length > 5 for whenUse/whenNotUse items.
 */
const meaningfulString = fc
  .array(
    fc.constantFrom(
      ...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 .,;:!?()-/'
    ),
    { minLength: 6, maxLength: 60 }
  )
  .map((chars) => chars.join(''));

/**
 * Arbitrary: generates a valid color object with r, g, b in [0, 1].
 */
const colorArb = fc.record({
  r: fc.double({ min: 0, max: 1, noNaN: true }),
  g: fc.double({ min: 0, max: 1, noNaN: true }),
  b: fc.double({ min: 0, max: 1, noNaN: true }),
});

/**
 * Arbitrary: generates a valid role object.
 */
const roleArb = fc.record({
  cssProperty: fc.constantFrom('background-color', 'color', 'border-color', 'box-shadow'),
  description: safeString,
  figmaProperty: fc.constantFrom('fills', 'strokes', 'effects', 'fills (texto/ícone)'),
});

/**
 * Arbitrary: generates a valid group entry for the schema.
 */
const groupArb = fc.record({
  label: safeString,
  color: colorArb,
  description: safeString,
  examples: fc.array(safeString, { minLength: 1, maxLength: 4 }),
  whenUse: fc.array(meaningfulString, { minLength: 1, maxLength: 4 }),
  whenNotUse: fc.array(meaningfulString, { minLength: 1, maxLength: 4 }),
  roles: fc.dictionary(
    fc.constantFrom('surface', 'on-surface', 'border', 'container', 'on-container', 'shadow'),
    roleArb,
    { minKeys: 1, maxKeys: 3 }
  ),
  hierarchies: fc.array(fc.constantFrom('primary', 'secondary', 'tertiary', 'neutral'), { minLength: 0, maxLength: 3 }),
  states: fc.array(fc.constantFrom('default', 'hover', 'active', 'focus', 'disabled'), { minLength: 0, maxLength: 4 }),
  componentExamples: fc.constant([]),
});

/**
 * Arbitrary: generates a valid decision tree node.
 */
const decisionTreeArb = fc.constant({
  question: 'Test question?',
  yes: { result: 'dynamic' },
  no: { result: 'static' },
});

/**
 * Arbitrary: generates a valid roleMapping.
 */
const roleMappingArb = fc.constant({
  surface: { css: 'background-color', figma: 'fills', description: 'Background' },
  'on-surface': { css: 'color', figma: 'fills', description: 'Content' },
});

/**
 * Arbitrary: generates a valid aiRules array.
 */
const aiRulesArb = fc.constant([
  { id: 'R01', rule: 'Never use base tokens directly', severity: 'error' },
  { id: 'R02', rule: 'Always use usage tokens', severity: 'warning' },
]);

/**
 * Arbitrary: generates a complete valid schema with the 6 required groups.
 * Uses the real group keys to ensure the schema is realistic.
 */
const schemaWithAllGroupsArb = fc
  .tuple(groupArb, groupArb, groupArb, groupArb, groupArb, groupArb)
  .map(([dynamic, interactive, staticG, inputable, core, elevation]) => ({
    version: '1.0.0',
    lastUpdated: '2025-01-15',
    groups: { dynamic, interactive, static: staticG, inputable, core, elevation },
    decisionTree: { question: 'Test?', yes: { result: 'dynamic' }, no: { result: 'static' } },
    roleMapping: {
      surface: { css: 'background-color', figma: 'fills', description: 'Background' },
      'on-surface': { css: 'color', figma: 'fills', description: 'Content' },
    },
    aiRules: [
      { id: 'R01', rule: 'Never use base tokens directly', severity: 'error' },
      { id: 'R02', rule: 'Always use usage tokens', severity: 'warning' },
    ],
    naming: {
      figmaPath: 'Dynamic/Primary/Surface/Default',
      camelCase: 'LfThmDynamicPrimarySurfaceDefault',
      cssCustomProperty: '--lf-thm-dynamic-primary-surface-default',
      conversionRules: {},
    },
    categories: {},
    layers: {},
  }));

/**
 * Arbitrary: generates a schema with a variable number of groups (1-6),
 * using a subset of the known group keys.
 */
const schemaWithVariableGroupsArb = fc
  .subarray(['dynamic', 'interactive', 'static', 'inputable', 'core', 'elevation'], { minLength: 1 })
  .chain((keys) =>
    fc.tuple(...keys.map(() => groupArb)).map((groups) => {
      const groupsObj = {};
      keys.forEach((key, i) => { groupsObj[key] = groups[i]; });
      return {
        version: '1.0.0',
        lastUpdated: '2025-01-15',
        groups: groupsObj,
        decisionTree: { question: 'Test?', yes: { result: 'dynamic' }, no: { result: 'static' } },
        roleMapping: {
          surface: { css: 'background-color', figma: 'fills', description: 'Background' },
          'on-surface': { css: 'color', figma: 'fills', description: 'Content' },
        },
        aiRules: [
          { id: 'R01', rule: 'Never use base tokens directly', severity: 'error' },
        ],
        naming: {
          figmaPath: 'Dynamic/Primary/Surface/Default',
          camelCase: 'LfThmDynamicPrimarySurfaceDefault',
          cssCustomProperty: '--lf-thm-dynamic-primary-surface-default',
          conversionRules: {},
        },
        categories: {},
        layers: {},
      };
    })
  );

// ── Tests ───────────────────────────────────────────────────────────────────

describe('Cross-Surface Consistency - Property-Based Tests', () => {
  /**
   * **Validates: Requirements 7.1**
   *
   * Property CONS.1: For all groupKeys in schema.groups, ES5 output contains
   * groupKey, htmlJson.groups[groupKey] exists, aiMarkdown contains groupKey.
   *
   * This ensures every group defined in the schema is represented across
   * all 3 output surfaces (ES5, HTML JSON, AI Markdown).
   */
  it('CONS.1: every group key appears in all 3 output surfaces for any valid schema', () => {
    fc.assert(
      fc.property(schemaWithVariableGroupsArb, (schema) => {
        const { es5Code, htmlJson, aiMarkdown } = generateAllOutputs(schema);
        const groupKeys = Object.keys(schema.groups);

        for (const groupKey of groupKeys) {
          // ES5 output must contain the group key (as object property)
          expect(
            es5Code.indexOf(groupKey + ':') !== -1 || es5Code.indexOf('"' + groupKey + '"') !== -1
          ).toBe(true);

          // HTML JSON must have the group key in its groups object
          expect(htmlJson.groups[groupKey]).toBeDefined();

          // AI Markdown must contain the group key
          expect(aiMarkdown).toContain(groupKey);
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Validates: Requirements 7.2**
   *
   * Property CONS.2: For all groups, schema whenUse/whenNotUse ===
   * htmlJson whenUse/whenNotUse.
   *
   * This ensures the whenUse and whenNotUse arrays in the HTML JSON output
   * are identical (same length, same items, same order) to those in the schema.
   */
  it('CONS.2: whenUse and whenNotUse in HTML JSON are identical to schema for any valid schema', () => {
    fc.assert(
      fc.property(schemaWithVariableGroupsArb, (schema) => {
        const { htmlJson } = generateAllOutputs(schema);
        const groupKeys = Object.keys(schema.groups);

        for (const groupKey of groupKeys) {
          const schemaGroup = schema.groups[groupKey];
          const htmlGroup = htmlJson.groups[groupKey];

          // whenUse arrays must be identical
          expect(htmlGroup.whenUse).toEqual(schemaGroup.whenUse);

          // whenNotUse arrays must be identical
          expect(htmlGroup.whenNotUse).toEqual(schemaGroup.whenNotUse);
        }
      }),
      { numRuns: 100 }
    );
  });
});

describe('Cross-Surface Consistency - Example-Based Tests', () => {
  /**
   * **Validates: Requirements 7.1**
   *
   * Verify CONS.1 with the real token-schema.json.
   */
  it('CONS.1: real schema — all 6 groups appear in all 3 output surfaces', () => {
    const schema = loadRealSchema();
    const { es5Code, htmlJson, aiMarkdown } = generateAllOutputs(schema);
    const groupKeys = Object.keys(schema.groups);

    expect(groupKeys).toEqual(
      expect.arrayContaining(['dynamic', 'interactive', 'static', 'inputable', 'core', 'elevation'])
    );

    for (const groupKey of groupKeys) {
      expect(
        es5Code.indexOf(groupKey + ':') !== -1 || es5Code.indexOf('"' + groupKey + '"') !== -1
      ).toBe(true);
      expect(htmlJson.groups[groupKey]).toBeDefined();
      expect(aiMarkdown).toContain(groupKey);
    }
  });

  /**
   * **Validates: Requirements 7.2**
   *
   * Verify CONS.2 with the real token-schema.json.
   */
  it('CONS.2: real schema — whenUse/whenNotUse in HTML JSON match schema exactly', () => {
    const schema = loadRealSchema();
    const { htmlJson } = generateAllOutputs(schema);
    const groupKeys = Object.keys(schema.groups);

    for (const groupKey of groupKeys) {
      const schemaGroup = schema.groups[groupKey];
      const htmlGroup = htmlJson.groups[groupKey];

      expect(htmlGroup.whenUse).toEqual(schemaGroup.whenUse);
      expect(htmlGroup.whenNotUse).toEqual(schemaGroup.whenNotUse);
    }
  });
});
