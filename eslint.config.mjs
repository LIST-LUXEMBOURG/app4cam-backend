import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import { defineConfig } from 'eslint/config'
import eslintConfigPrettier from 'eslint-config-prettier/flat'
import importPlugin from 'eslint-plugin-import'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript'

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
    files: ['**/*.{ts,tsx}'],
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
      'import-x/resolver-next': [
        createTypeScriptImportResolver({
          alwaysTryTypes: true,
          project: './tsconfig.build.json',
        }),
      ],
    },
  },
  {
    files: ['eslint.config.mjs'],
    rules: {
      'import-x/no-unresolved': [
        'error',
        { ignore: ['typescript-eslint', 'eslint/config'] },
      ],
    },
  },
])
