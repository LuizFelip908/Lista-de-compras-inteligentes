import { defineConfig } from 'eslint/config';
import expoConfig from 'eslint-config-expo/flat.js';
import prettierConfig from 'eslint-config-prettier/flat';

export default defineConfig([
  { ignores: ['.expo/**', 'coverage/**', 'out/**', 'dist/**', 'node_modules/**'] },
  expoConfig,
  prettierConfig,
  {
    rules: {
      'no-console': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
]);
