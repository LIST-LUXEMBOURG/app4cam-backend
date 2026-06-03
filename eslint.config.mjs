import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import { defineConfig } from 'eslint/config'
import eslintConfigPrettier from 'eslint-config-prettier/flat'
import importPlugin from 'eslint-plugin-import'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import vitest from '@vitest/eslint-plugin'

export default defineConfig([
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    plugins: { js },
    extends: ['js/recommended'],
    languageOptions: { globals: globals.node },
  },
  tseslint.configs.recommended,
  importPlugin.flatConfigs.recommended,
  {
    files: ['**/*.ts'],
    extends: [
      importPlugin.flatConfigs.recommended,
      importPlugin.flatConfigs.typescript,
    ],
    rules: {
      'import/order': [
        'error',
        { alphabetize: { order: 'asc', caseInsensitive: true } },
      ],
    },
  },
  eslintConfigPrettier,
  eslintPluginPrettierRecommended,
  {
    settings: {
      'import/resolver': {
        typescript: {
          project: './tsconfig.build.json',
        },
      },
    },
  },
  {
    files: ['**/*{.e2e-spec,.spec}.ts'],
    plugins: {
      vitest,
    },
    rules: {
      ...vitest.configs.recommended.rules,
      'vitest/expect-expect': [
        'error',
        { assertFunctionNames: ['expect', '**.expect'] },
      ],
      'vitest/no-standalone-expect': [
        'error',
        {
          additionalTestBlockFunctions: ['itIfNotWindows'],
        },
      ],
      'vitest/valid-title': ['error', { ignoreTypeOfDescribeName: true }],
    },
  },
])
