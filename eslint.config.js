// eslint.config.js (flat config, ESLint 9+/10)
const expoConfig = require('eslint-config-expo/flat');
const eslintConfigPrettier = require('eslint-config-prettier');

module.exports = [
  ...expoConfig,
  eslintConfigPrettier,
  {
    ignores: ['dist/*', 'node_modules/*', '.expo/*', 'babel.config.js', 'jest.setup.js'],
  },
  {
    // The `const X = z.enum(...)` + `type X = z.infer<...>` idiom is intentional
    // (separate value/type namespaces); silence the redeclare false-positive.
    files: ['src/domain/schemas.ts'],
    rules: { 'no-redeclare': 'off', '@typescript-eslint/no-redeclare': 'off' },
  },
];
