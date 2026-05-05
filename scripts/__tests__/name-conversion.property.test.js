import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  figmaPathToJsName,
  jsNameToFigmaPath,
} from '../generate-token-docs.js';

/**
 * Known compound words used in Figma token paths.
 * These are multi-word segments joined by spaces within a single path segment.
 */
const COMPOUND_WORDS = [
  'On Surface',
  'On Container',
  'Neutral Alpha',
  'Static Alpha',
  'High Contrast',
];

/**
 * Arbitrary: generates a single capitalized word (first letter uppercase, rest lowercase).
 * These represent simple Figma path segments like "Dynamic", "Primary", "Surface", "Default".
 */
const capitalizedWord = fc
  .array(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz'), { minLength: 1, maxLength: 12 })
  .map((chars) => {
    const s = chars.join('');
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  });

/**
 * Arbitrary: generates a valid Figma path segment.
 * A segment is either a simple capitalized word or one of the known compound words.
 */
const figmaSegment = fc.oneof(
  { weight: 5, arbitrary: capitalizedWord },
  { weight: 1, arbitrary: fc.constantFrom(...COMPOUND_WORDS) }
);

/**
 * Arbitrary: generates a valid Figma path with 2-6 segments joined by "/".
 */
const validFigmaPath = fc
  .array(figmaSegment, { minLength: 2, maxLength: 6 })
  .map((segments) => segments.join('/'));

describe('Name Conversion - Property-Based Tests', () => {
  /**
   * **Validates: Requirements 6.3**
   *
   * Property CONS.4: For all valid Figma paths,
   * jsNameToFigmaPath(figmaPathToJsName(path)) === path
   *
   * This verifies the round-trip / bidirectional conversion property:
   * converting a Figma path to a JS name and back must yield the original path.
   */
  it('CONS.4: round-trip figmaPath → jsName → figmaPath preserves the original path', () => {
    fc.assert(
      fc.property(validFigmaPath, (path) => {
        const jsName = figmaPathToJsName(path);
        const roundTripped = jsNameToFigmaPath(jsName);
        expect(roundTripped).toBe(path);
      }),
      { numRuns: 200 }
    );
  });
});

describe('Name Conversion - Example-Based Tests', () => {
  /**
   * Concrete examples using real token paths from the schema.
   * **Validates: Requirements 6.3**
   */
  const realPaths = [
    'Dynamic/Primary/Surface/Default',
    'Dynamic/Primary/On Surface/Default',
    'Interactive/Primary/Surface/Default',
    'Static/Primary/On Container/Default',
    'Elevation/Surface/Default',
    'Inputable/Field/Neutral/On Surface/Default',
  ];

  it.each(realPaths)(
    'round-trip preserves real token path: %s',
    (path) => {
      const jsName = figmaPathToJsName(path);
      const roundTripped = jsNameToFigmaPath(jsName);
      expect(roundTripped).toBe(path);
    }
  );

  it('figmaPathToJsName produces expected JS names', () => {
    expect(figmaPathToJsName('Dynamic/Primary/Surface/Default')).toBe(
      'LfThmDynamicPrimarySurfaceDefault'
    );
    expect(figmaPathToJsName('Dynamic/Primary/On Surface/Default')).toBe(
      'LfThmDynamicPrimaryOnSurfaceDefault'
    );
    expect(figmaPathToJsName('Elevation/Surface/Default')).toBe(
      'LfThmElevationSurfaceDefault'
    );
  });

  it('jsNameToFigmaPath produces expected Figma paths', () => {
    expect(jsNameToFigmaPath('LfThmDynamicPrimarySurfaceDefault')).toBe(
      'Dynamic/Primary/Surface/Default'
    );
    expect(jsNameToFigmaPath('LfThmDynamicPrimaryOnSurfaceDefault')).toBe(
      'Dynamic/Primary/On Surface/Default'
    );
    expect(jsNameToFigmaPath('LfThmStaticPrimaryOnContainerDefault')).toBe(
      'Static/Primary/On Container/Default'
    );
  });
});
