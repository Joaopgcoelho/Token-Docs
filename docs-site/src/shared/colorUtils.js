// docs-site/src/shared/colorUtils.js
// Pure utility functions for color conversion and WCAG contrast calculations.
// Used by TokenDetailPage to display color values in multiple formats
// and compute accessibility scores.

/**
 * Converts a HEX color string (3, 4, 6, or 8 digit) to an RGB object.
 * @param {string} hex - HEX string, e.g. "#076AEA", "#fff", "#ff00ff80"
 * @returns {{ r: number, g: number, b: number } | null} RGB values (0–255), or null for invalid input
 */
export function hexToRgb(hex) {
  if (!hex || typeof hex !== 'string') return null;
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  if (h.length === 4) h = h.split('').map(c => c + c).join('');
  if (!/^[0-9a-fA-F]{6,8}$/.test(h)) return null;
  const num = parseInt(h.substring(0, 6), 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

/**
 * Converts a HEX color string to an RGB string.
 * @param {string} hex
 * @returns {string | null} e.g. "rgb(7, 106, 234)", or null for invalid input
 */
export function hexToRgbString(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
}

/**
 * Converts a HEX color string to an HSL string.
 * Uses the standard RGB→HSL conversion algorithm.
 * @param {string} hex
 * @returns {string | null} e.g. "hsl(216, 94%, 47%)", or null for invalid input
 */
export function hexToHslString(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;

  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) {
    return `hsl(0, 0%, ${Math.round(l * 100)}%)`;
  }

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let h;
  if (max === r) {
    h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  } else if (max === g) {
    h = ((b - r) / d + 2) / 6;
  } else {
    h = ((r - g) / d + 4) / 6;
  }

  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}

/**
 * Converts a HEX color string to an OKLCH string.
 * Pipeline: HEX → linear RGB → OKLab (via 3×3 matrix) → OKLCH (polar).
 * @param {string} hex
 * @returns {string | null} e.g. "oklch(0.55 0.18 260)", or null for invalid input
 */
export function hexToOklchString(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;

  // sRGB to linear RGB
  const toLinear = (c) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };

  const lr = toLinear(rgb.r);
  const lg = toLinear(rgb.g);
  const lb = toLinear(rgb.b);

  // Linear RGB to LMS (using OKLab matrix step 1)
  const l_ = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
  const m_ = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
  const s_ = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;

  // Cube root
  const l_cr = Math.cbrt(l_);
  const m_cr = Math.cbrt(m_);
  const s_cr = Math.cbrt(s_);

  // LMS to OKLab (matrix step 2)
  const L = 0.2104542553 * l_cr + 0.7936177850 * m_cr - 0.0040720468 * s_cr;
  const a = 1.9779984951 * l_cr - 2.4285922050 * m_cr + 0.4505937099 * s_cr;
  const bVal = 0.0259040371 * l_cr + 0.7827717662 * m_cr - 0.8086757660 * s_cr;

  // OKLab to OKLCH (polar conversion)
  const C = Math.sqrt(a * a + bVal * bVal);
  let H = Math.atan2(bVal, a) * (180 / Math.PI);
  if (H < 0) H += 360;

  // Round to 2 decimal places for L and C, integer for H
  return `oklch(${L.toFixed(2)} ${C.toFixed(2)} ${Math.round(H)})`;
}

/**
 * Calculates the WCAG 2.1 relative luminance of an RGB color.
 * @param {{ r: number, g: number, b: number }} rgb - RGB values (0–255)
 * @returns {number} Relative luminance between 0 and 1
 */
export function relativeLuminance({ r, g, b }) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculates the WCAG 2.1 contrast ratio between two HEX colors.
 * @param {string} fgHex - Foreground color HEX
 * @param {string} bgHex - Background color HEX
 * @returns {number | null} Contrast ratio (1 to 21), or null if either color is invalid
 */
export function contrastRatio(fgHex, bgHex) {
  const fg = hexToRgb(fgHex);
  const bg = hexToRgb(bgHex);
  if (!fg || !bg) return null;
  const l1 = relativeLuminance(fg);
  const l2 = relativeLuminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Returns the WCAG 2.1 conformance level for a given contrast ratio.
 * @param {number} ratio - Contrast ratio
 * @param {'normal' | 'large'} textSize - Text size category
 * @returns {'AAA' | 'AA' | 'Fail'}
 */
export function wcagLevel(ratio, textSize = 'normal') {
  if (textSize === 'large') {
    if (ratio >= 4.5) return 'AAA';
    if (ratio >= 3) return 'AA';
    return 'Fail';
  }
  // normal text
  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  return 'Fail';
}
