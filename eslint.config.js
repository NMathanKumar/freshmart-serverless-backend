import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
  {
    ignores: [
      '**/dist/**',
      '**/coverage/**',
      '**/artifacts/**',
      '**/node_modules/**',
      'packages/shared/**',
      'src/**',
      'terraform/**',
      'postman/**',
      'docs/**',
      'services/**/src/**/*.js',
      'services/**/src/runtime/**',
      'services/**/src/controller/**',
      'services/**/src/service/**',
      'services/**/src/validator/**',
      'services/**/src/controllers/**/*.js',
      'services/**/src/repositories/**/*.js',
      'services/**/src/routes/**/*.js',
      'services/**/src/services/**/*.js',
      'services/**/src/events/**/*.js',
      'services/**/src/integrations/**/*.js',
      'services/**/src/workflows/**/*.js',
      'services/**/src/lambda.js',
      'services/**/test/**/*.js',
      'scripts/materialize-local-deps.js',
      'scripts/package.js',
      'scripts/test.js',
      'scripts/verify-deployment.js',
      'services/admin-service/**',
      'services/product-service/**',
      'services/menu-service/**',
      'services/payment-service/**'
    ]
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser
      }
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }]
    }
  },
  {
    files: ['**/*.js', '**/*.mjs'],
    languageOptions: {
      globals: {
        ...globals.node
      }
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }]
    }
  }
];
