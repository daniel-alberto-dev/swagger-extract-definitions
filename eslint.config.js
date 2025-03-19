import eslint from '@eslint/js';
import { configs as _configs } from 'typescript-eslint';
import tsEslint from '@typescript-eslint/eslint-plugin';
import prettierPlugin from 'eslint-plugin-prettier';
import tsParser from '@typescript-eslint/parser';

export default [
  eslint.configs.recommended,
  ..._configs.recommended,
  {
    files: ['**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
      },
      globals: {
        describe: 'readonly',
        test: 'readonly',
        jest: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        require: 'readonly',
      },
    },
    plugins: {
      prettier: prettierPlugin,
      '@typescript-eslint': tsEslint,
    },
    rules: {
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/naming-convention': [
        'error',
        { selector: 'typeLike', format: ['PascalCase'] },
      ],
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/no-unused-vars': ['error'],
      'arrow-body-style': ['error', 'as-needed'],
      'no-duplicate-imports': ['error'],
      'no-extra-boolean-cast': 'off',
      'no-useless-escape': 'off',
      'object-shorthand': 'error',
    },
  },
  {
    ignores: [
      '*.d.ts',
      'dist/',
      'example/',
      'node_modules/',
      'eslint.config.js',
      'tsup.config.ts',
      'jest.config.js',
    ],
  },
];
