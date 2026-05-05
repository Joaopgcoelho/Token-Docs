import React from 'react';
import * as icons from '@lift/ds-assets/base/icons';

/**
 * Renders an SVG icon from @lift/ds-assets inline.
 * @param {Object} props
 * @param {string} props.name - PascalCase icon name (e.g. "AlertTriangle", "Check", "ArrowLeft")
 * @param {number} [props.size=16] - Width and height in px
 * @param {string} [props.color] - CSS color (defaults to currentColor)
 * @param {string} [props.className] - Additional CSS class
 * @param {Object} [props.style] - Additional inline styles
 */
export default function Icon({ name, size = 16, color, className, style }) {
  var svgString = icons[name];
  if (!svgString) return null;

  return (
    <span
      className={className || 'ds-icon'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        color: color || 'currentColor',
        flexShrink: 0,
        ...style,
      }}
      dangerouslySetInnerHTML={{ __html: svgString }}
      aria-hidden="true"
    />
  );
}
