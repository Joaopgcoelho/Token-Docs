const { defineConfig } = require('vitest/config');

module.exports = defineConfig({
  test: {
    globals: false,
    exclude: ['node_modules/**', '@lift/**', 'docs-site/**'],
  },
});
