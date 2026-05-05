import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { getPreviewType } from '../token-detail/VisualPreview';

const VALID_PREVIEW_TYPES = ['typography', 'surface', 'border', 'shadow', 'non-color'];
const ALL_ROLES = ['surface', 'onSurface', 'border', 'shadow', 'icon', 'text', 'link', 'skeleton', 'gradient', 'container', 'onContainer'];

describe('Feature: token-detail-page', () => {
  describe('Property 4: Tipo de preview determinístico a partir do role', () => {
    it('getPreviewType returns a valid preview type for any role × isColor combination', () => {
      fc.assert(fc.property(
        fc.constantFrom(...ALL_ROLES),
        fc.boolean(),
        (role, isColor) => {
          const result = getPreviewType(role, isColor);
          expect(VALID_PREVIEW_TYPES).toContain(result);
        }
      ), { numRuns: 100 });
    });

    it('getPreviewType is total — covers all known roles', () => {
      ALL_ROLES.forEach(role => {
        [true, false].forEach(isColor => {
          const result = getPreviewType(role, isColor);
          expect(result).toBeTruthy();
          expect(VALID_PREVIEW_TYPES).toContain(result);
        });
      });
    });
  });
});
