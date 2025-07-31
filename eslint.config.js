const js = require('@eslint/js');
const pluginUnusedImports = require('eslint-plugin-unused-imports');

module.exports = [
  js.configs.recommended,
  {
    plugins: {
      'unused-imports': pluginUnusedImports
    },
    rules: {
      'unused-imports/no-unused-imports': 'warn',
      'unused-imports/no-unused-vars': [
        'warn',
        { vars: 'all', varsIgnorePattern: '^_', argsIgnorePattern: '^_' }
      ]
    }
  }
];
