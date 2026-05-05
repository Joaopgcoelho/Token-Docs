import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const parentModules = path.resolve(__dirname, '..', 'node_modules');

export default defineConfig({
  plugins: [react({ jsxImportSource: '@emotion/react' })],
  base: './',
  build: {
    outDir: '../docs',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@lift/ds-tokens': path.join(parentModules, '@lift/ds-tokens'),
      '@lift/ds-web': path.join(parentModules, '@lift/ds-web'),
      '@lift/ds-assets': path.join(parentModules, '@lift/ds-assets'),
    },
    dedupe: ['react', 'react-dom', '@emotion/react', '@emotion/styled'],
  },
});
