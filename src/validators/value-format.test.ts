import { describe, it, expect } from 'vitest';
import {
  validateOpaqueColor,
  validateAlphaColor,
  validateSpacing,
  validateOpacity,
  validateDuration,
  validateMotion,
  validateShadow,
  validateUnitlessInteger,
  validateValueFormat,
} from './value-format';

// ---------------------------------------------------------------------------
// validateOpaqueColor
// ---------------------------------------------------------------------------
describe('validateOpaqueColor', () => {
  it('accepts valid 6-digit hex color', () => {
    expect(validateOpaqueColor('#FAFAFA').valid).toBe(true);
    expect(validateOpaqueColor('#000000').valid).toBe(true);
    expect(validateOpaqueColor('#FFFFFF').valid).toBe(true);
    expect(validateOpaqueColor('#1a2b3c').valid).toBe(true);
  });

  it('rejects hex shorthand (#FFF)', () => {
    const result = validateOpaqueColor('#FFF');
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('rejects 8-digit hex (#RRGGBBAA)', () => {
    expect(validateOpaqueColor('#FAFAFA00').valid).toBe(false);
  });

  it('rejects hex without hash', () => {
    expect(validateOpaqueColor('FAFAFA').valid).toBe(false);
  });

  it('rejects rgba format', () => {
    expect(validateOpaqueColor('rgba(0,0,0,1)').valid).toBe(false);
  });

  it('rejects empty string', () => {
    expect(validateOpaqueColor('').valid).toBe(false);
  });

  it('rejects non-hex characters', () => {
    expect(validateOpaqueColor('#GGGGGG').valid).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// validateAlphaColor
// ---------------------------------------------------------------------------
describe('validateAlphaColor', () => {
  it('accepts valid rgba with integer components', () => {
    expect(validateAlphaColor('rgba(0,0,0,0.04)').valid).toBe(true);
    expect(validateAlphaColor('rgba(255,255,255,1)').valid).toBe(true);
    expect(validateAlphaColor('rgba(128,64,32,0.5)').valid).toBe(true);
  });

  it('accepts rgba without spaces', () => {
    expect(validateAlphaColor('rgba(0,0,0,0.04)').valid).toBe(true);
  });

  it('accepts rgba with spaces around commas', () => {
    expect(validateAlphaColor('rgba(0, 0, 0, 0.04)').valid).toBe(true);
    expect(validateAlphaColor('rgba( 0 , 0 , 0 , 0.5 )').valid).toBe(true);
  });

  it('accepts alpha = 0', () => {
    expect(validateAlphaColor('rgba(0,0,0,0)').valid).toBe(true);
  });

  it('accepts alpha = 1', () => {
    expect(validateAlphaColor('rgba(0,0,0,1)').valid).toBe(true);
  });

  it('accepts alpha with leading zero omitted (.5)', () => {
    expect(validateAlphaColor('rgba(0,0,0,.5)').valid).toBe(true);
  });

  it('rejects rgb() without alpha', () => {
    expect(validateAlphaColor('rgb(0,0,0)').valid).toBe(false);
  });

  it('rejects r > 255', () => {
    expect(validateAlphaColor('rgba(256,0,0,0.5)').valid).toBe(false);
  });

  it('rejects negative alpha', () => {
    // Negative alpha won't match the regex (no minus sign allowed for alpha)
    expect(validateAlphaColor('rgba(0,0,0,-0.1)').valid).toBe(false);
  });

  it('rejects alpha > 1', () => {
    expect(validateAlphaColor('rgba(0,0,0,1.5)').valid).toBe(false);
  });

  it('rejects hex format', () => {
    expect(validateAlphaColor('#FAFAFA').valid).toBe(false);
  });

  it('rejects empty string', () => {
    expect(validateAlphaColor('').valid).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// validateSpacing
// ---------------------------------------------------------------------------
describe('validateSpacing', () => {
  it('accepts valid px values', () => {
    expect(validateSpacing('0px').valid).toBe(true);
    expect(validateSpacing('4px').valid).toBe(true);
    expect(validateSpacing('16px').valid).toBe(true);
    expect(validateSpacing('200px').valid).toBe(true);
  });

  it('accepts valid rem values', () => {
    expect(validateSpacing('1rem').valid).toBe(true);
    expect(validateSpacing('1.5rem').valid).toBe(true);
    expect(validateSpacing('0rem').valid).toBe(true);
  });

  it('rejects em unit', () => {
    expect(validateSpacing('4em').valid).toBe(false);
  });

  it('rejects bare number', () => {
    expect(validateSpacing('4').valid).toBe(false);
  });

  it('rejects percentage', () => {
    expect(validateSpacing('50%').valid).toBe(false);
  });

  it('rejects empty string', () => {
    expect(validateSpacing('').valid).toBe(false);
  });

  it('rejects negative values', () => {
    expect(validateSpacing('-4px').valid).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// validateOpacity
// ---------------------------------------------------------------------------
describe('validateOpacity', () => {
  it('accepts 0', () => {
    expect(validateOpacity('0').valid).toBe(true);
  });

  it('accepts 1', () => {
    expect(validateOpacity('1').valid).toBe(true);
  });

  it('accepts decimal values in [0, 1]', () => {
    expect(validateOpacity('0.04').valid).toBe(true);
    expect(validateOpacity('0.5').valid).toBe(true);
    expect(validateOpacity('0.8').valid).toBe(true);
  });

  it('rejects negative opacity', () => {
    const result = validateOpacity('-0.1');
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('rejects opacity > 1', () => {
    const result = validateOpacity('1.5');
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('rejects non-numeric string', () => {
    expect(validateOpacity('abc').valid).toBe(false);
  });

  it('rejects empty string', () => {
    expect(validateOpacity('').valid).toBe(false);
  });

  it('accepts edge value 0.00', () => {
    expect(validateOpacity('0.00').valid).toBe(true);
  });

  it('accepts edge value 1.0', () => {
    expect(validateOpacity('1.0').valid).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// validateDuration
// ---------------------------------------------------------------------------
describe('validateDuration', () => {
  it('accepts valid ms values', () => {
    expect(validateDuration('0ms').valid).toBe(true);
    expect(validateDuration('100ms').valid).toBe(true);
    expect(validateDuration('5000ms').valid).toBe(true);
  });

  it('rejects bare number', () => {
    expect(validateDuration('100').valid).toBe(false);
  });

  it('rejects seconds unit', () => {
    expect(validateDuration('1s').valid).toBe(false);
  });

  it('rejects decimal ms', () => {
    expect(validateDuration('1.5ms').valid).toBe(false);
  });

  it('rejects empty string', () => {
    expect(validateDuration('').valid).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// validateMotion
// ---------------------------------------------------------------------------
describe('validateMotion', () => {
  it('accepts valid cubic-bezier values', () => {
    expect(validateMotion('cubic-bezier(0, 0, 1, 1)').valid).toBe(true);
    expect(validateMotion('cubic-bezier(0.42, 0, 0.58, 1)').valid).toBe(true);
    expect(validateMotion('cubic-bezier(0.25, 0.1, 0.25, 1)').valid).toBe(true);
  });

  it('accepts cubic-bezier without spaces', () => {
    expect(validateMotion('cubic-bezier(0,0,1,1)').valid).toBe(true);
  });

  it('accepts negative values in cubic-bezier', () => {
    expect(validateMotion('cubic-bezier(-0.5, 0, 1, 1)').valid).toBe(true);
  });

  it('rejects named easing keywords', () => {
    expect(validateMotion('ease-in-out').valid).toBe(false);
    expect(validateMotion('linear').valid).toBe(false);
  });

  it('rejects empty string', () => {
    expect(validateMotion('').valid).toBe(false);
  });

  it('rejects cubic-bezier with wrong number of params', () => {
    expect(validateMotion('cubic-bezier(0, 0, 1)').valid).toBe(false);
    expect(validateMotion('cubic-bezier(0, 0, 1, 1, 0)').valid).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// validateShadow
// ---------------------------------------------------------------------------
describe('validateShadow', () => {
  it('accepts valid box-shadow with rgba color', () => {
    expect(validateShadow('0px 1px 2px rgba(0,0,0,0.12)').valid).toBe(true);
  });

  it('accepts valid box-shadow with hex color', () => {
    expect(validateShadow('0px 1px 2px #000000').valid).toBe(true);
  });

  it('accepts box-shadow with spread radius', () => {
    expect(validateShadow('0px 1px 2px 0px rgba(0,0,0,0.12)').valid).toBe(true);
  });

  it('accepts negative offset values', () => {
    expect(validateShadow('-2px -1px 4px rgba(0,0,0,0.1)').valid).toBe(true);
  });

  it('accepts multi-layer shadow', () => {
    const multiLayer = '0px 1px 2px rgba(0,0,0,0.12), 0px 2px 4px rgba(0,0,0,0.08)';
    expect(validateShadow(multiLayer).valid).toBe(true);
  });

  it('rejects "none"', () => {
    expect(validateShadow('none').valid).toBe(false);
  });

  it('rejects empty string', () => {
    expect(validateShadow('').valid).toBe(false);
  });

  it('rejects shadow without color', () => {
    expect(validateShadow('0px 1px 2px').valid).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// validateUnitlessInteger
// ---------------------------------------------------------------------------
describe('validateUnitlessInteger', () => {
  it('accepts valid integers', () => {
    expect(validateUnitlessInteger('0').valid).toBe(true);
    expect(validateUnitlessInteger('768').valid).toBe(true);
    expect(validateUnitlessInteger('1080').valid).toBe(true);
  });

  it('rejects decimal values', () => {
    expect(validateUnitlessInteger('1.5').valid).toBe(false);
  });

  it('rejects values with px unit', () => {
    expect(validateUnitlessInteger('768px').valid).toBe(false);
  });

  it('rejects negative values', () => {
    expect(validateUnitlessInteger('-1').valid).toBe(false);
  });

  it('rejects empty string', () => {
    expect(validateUnitlessInteger('').valid).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// validateValueFormat (dispatcher)
// ---------------------------------------------------------------------------
describe('validateValueFormat', () => {
  it('dispatches opaque-color correctly', () => {
    expect(validateValueFormat('#FAFAFA', 'opaque-color').valid).toBe(true);
    expect(validateValueFormat('#FFF', 'opaque-color').valid).toBe(false);
  });

  it('dispatches alpha-color correctly', () => {
    expect(validateValueFormat('rgba(0,0,0,0.5)', 'alpha-color').valid).toBe(true);
    expect(validateValueFormat('#FAFAFA', 'alpha-color').valid).toBe(false);
  });

  it('dispatches spacing correctly', () => {
    expect(validateValueFormat('4px', 'spacing').valid).toBe(true);
    expect(validateValueFormat('4em', 'spacing').valid).toBe(false);
  });

  it('dispatches opacity correctly', () => {
    expect(validateValueFormat('0.5', 'opacity').valid).toBe(true);
    expect(validateValueFormat('1.5', 'opacity').valid).toBe(false);
  });

  it('dispatches duration correctly', () => {
    expect(validateValueFormat('100ms', 'duration').valid).toBe(true);
    expect(validateValueFormat('100', 'duration').valid).toBe(false);
  });

  it('dispatches motion correctly', () => {
    expect(validateValueFormat('cubic-bezier(0,0,1,1)', 'motion').valid).toBe(true);
    expect(validateValueFormat('ease', 'motion').valid).toBe(false);
  });

  it('dispatches shadow correctly', () => {
    expect(validateValueFormat('0px 1px 2px rgba(0,0,0,0.1)', 'shadow').valid).toBe(true);
    expect(validateValueFormat('none', 'shadow').valid).toBe(false);
  });

  it('dispatches unitless-integer correctly', () => {
    expect(validateValueFormat('768', 'unitless-integer').valid).toBe(true);
    expect(validateValueFormat('768px', 'unitless-integer').valid).toBe(false);
  });
});
