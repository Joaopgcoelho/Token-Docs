import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { generateES5Constants, validateES5 } from '../generate-token-docs.js';

/**
 * **Validates: Requirements 4.2**
 *
 * Property CONS.3: validateES5(generateES5Constants(schema)).violations.length === 0
 *
 * The ES5 code generated from any valid schema must never contain:
 * - Arrow functions (=>)
 * - .includes() calls
 * - Template literals (backticks)
 * - const declarations
 * - let declarations
 * - Object.assign
 * - Array.from
 */

// ── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Load the real token-schema.json as the base schema for perturbation tests.
 */
function loadRealSchema() {
  const schemaPath = resolve(__dirname, '../../token-schema.json');
  return JSON.parse(readFileSync(schemaPath, 'utf-8'));
}

// ── Arbitraries ─────────────────────────────────────────────────────────────

/**
 * Arbitrary: generates a non-empty printable string (no control chars).
 * Used for descriptions, labels, whenUse/whenNotUse items, etc.
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
 * Arbitrary: generates realistic schema strings with special characters
 * that could appear in Portuguese documentation content.
 * Includes accented characters, punctuation, hyphens, and mixed case.
 */
const richContentString = fc.oneof(
  safeString,
  fc.constant('Botão que submete formulário ou navega para outra rota'),
  fc.constant('Accordion ou tab — use Interactive'),
  fc.constant('Campo de formulário — use Inputable'),
  fc.constant('Elementos de composição visual sem interação'),
  fc.constant('text/ícone → tokens on-surface'),
  safeString.map((s) => 'Use em ' + s),
  safeString.map((s) => s + ' — use ' + s),
  safeString.map((s) => '"' + s + '"'),
  safeString.map((s) => s + '\n' + s),
  safeString.map((s) => s + '\\' + s)
);

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
  whenUse: fc.array(safeString, { minLength: 1, maxLength: 4 }),
  whenNotUse: fc.array(safeString, { minLength: 1, maxLength: 4 }),
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
 * Arbitrary: generates a complete valid schema with 1-4 groups.
 */
const schemaArb = fc
  .dictionary(
    fc.constantFrom('dynamic', 'interactive', 'static', 'inputable', 'core', 'elevation', 'testgroup'),
    groupArb,
    { minKeys: 1, maxKeys: 4 }
  )
  .chain((groups) =>
    fc.record({
      groups: fc.constant(groups),
      decisionTree: decisionTreeArb,
      roleMapping: roleMappingArb,
    })
  );

// ── Tests ───────────────────────────────────────────────────────────────────

describe('ES5 Compliance - Property-Based Tests', () => {
  /**
   * **Validates: Requirements 4.2**
   *
   * Property CONS.3: For any valid schema,
   * validateES5(generateES5Constants(schema)).violations.length === 0
   *
   * The generated ES5 code must never contain prohibited ES6+ syntax,
   * regardless of the schema content.
   */
  it('CONS.3: generateES5Constants always produces ES5-valid code for any valid schema', () => {
    fc.assert(
      fc.property(schemaArb, (schema) => {
        const es5Code = generateES5Constants(schema);
        const result = validateES5(es5Code);
        expect(result.violations).toEqual([]);
        expect(result.valid).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Validates: Requirements 4.2**
   *
   * Property CONS.3 (schema perturbation variant): When group descriptions,
   * whenUse items, whenNotUse items, labels, and examples contain varied
   * content (accented characters, punctuation, quotes, newlines, backslashes),
   * the serializer must handle them so the output remains ES5-valid.
   */
  it('CONS.3: varied schema string content does not break ES5 compliance', () => {
    fc.assert(
      fc.property(
        richContentString,
        richContentString,
        richContentString,
        richContentString,
        (description, whenUseItem, whenNotUseItem, label) => {
          const schema = {
            groups: {
              testgroup: {
                label: label,
                color: { r: 0.5, g: 0.5, b: 0.5 },
                description: description,
                examples: [description],
                whenUse: [whenUseItem],
                whenNotUse: [whenNotUseItem],
                roles: {
                  surface: {
                    cssProperty: 'background-color',
                    description: 'Test role',
                    figmaProperty: 'fills',
                  },
                },
                hierarchies: [],
                states: [],
                componentExamples: [],
              },
            },
            decisionTree: { question: 'Test?', yes: { result: 'dynamic' }, no: { result: 'static' } },
            roleMapping: { surface: { css: 'background-color', figma: 'fills', description: 'bg' } },
          };

          const es5Code = generateES5Constants(schema);
          const result = validateES5(es5Code);
          expect(result.violations).toEqual([]);
          expect(result.valid).toBe(true);
        }
      ),
      { numRuns: 150 }
    );
  });
});

describe('ES5 Compliance - Example-Based Tests', () => {
  /**
   * **Validates: Requirements 4.2**
   *
   * Verify that the real token-schema.json produces ES5-valid output.
   */
  it('CONS.3: real token-schema.json produces ES5-valid constants', () => {
    const schema = loadRealSchema();
    const es5Code = generateES5Constants(schema);
    const result = validateES5(es5Code);

    expect(result.violations).toEqual([]);
    expect(result.valid).toBe(true);
  });

  it('generated code contains GROUP_META and GROUP_GUIDELINES variables', () => {
    const schema = loadRealSchema();
    const es5Code = generateES5Constants(schema);

    expect(es5Code).toContain('var GROUP_META');
    expect(es5Code).toContain('var GROUP_GUIDELINES');
    expect(es5Code).toContain('var DECISION_TREE');
    expect(es5Code).toContain('var ROLE_MAPPING');
  });

  it('generated code contains all 6 groups from the schema', () => {
    const schema = loadRealSchema();
    const es5Code = generateES5Constants(schema);
    const groupKeys = Object.keys(schema.groups);

    for (const key of groupKeys) {
      expect(es5Code).toContain(key + ':');
    }
  });
});
