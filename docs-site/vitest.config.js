import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

const parentModules = path.resolve(__dirname, '..', 'node_modules');

export default defineConfig({
  plugins: [react({ jsxImportSource: '@emotion/react' })],
  resolve: {
    alias: {
      '@lift/ds-tokens': path.join(parentModules, '@lift/ds-tokens'),
      '@lift/ds-web': path.join(parentModules, '@lift/ds-web'),
      '@lift/ds-assets': path.join(parentModules, '@lift/ds-assets'),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.{js,jsx}'],
  },
});
