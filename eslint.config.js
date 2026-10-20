import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import { reactRefresh } from 'eslint-plugin-react-refresh';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const SEE_CLAUDE_MD = 'Se arkitekturprinciperna i CLAUDE.md.';

const ioGlobals = [
  { name: 'fetch', message: `Nätverksanrop hör hemma i src/api/. ${SEE_CLAUDE_MD}` },
  { name: 'localStorage', message: `localStorage används bara i src/api/. ${SEE_CLAUDE_MD}` },
  { name: 'sessionStorage', message: `sessionStorage används bara i src/api/. ${SEE_CLAUDE_MD}` },
];

const ioProperties = ['window', 'globalThis', 'self'].flatMap((object) =>
  ioGlobals.map(({ name, message }) => ({ object, property: name, message })),
);

const uiImportPatterns = {
  group: ['**/ui', '**/ui/**'],
  message: `Lagren får bara bero nedåt, aldrig på src/ui/. ${SEE_CLAUDE_MD}`,
};

export default defineConfig([
  globalIgnores(['dist', 'coverage']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommendedTypeChecked,
      reactHooks.configs.flat['recommended-latest'],
      reactRefresh.configs.vite(),
    ],
    languageOptions: {
      ecmaVersion: 2023,
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      // A new ApiError kind without a message would otherwise show nothing (principle 8).
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
    },
  },
  {
    files: ['eslint.config.js'],
    extends: [js.configs.recommended],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['src/ui/**/*.{ts,tsx}', 'src/domain/**/*.ts'],
    // Tests may set up and inspect fetch and storage; the layering rule is about app code.
    ignores: ['**/*.test.{ts,tsx}'],
    rules: {
      'no-restricted-globals': ['error', ...ioGlobals],
      'no-restricted-properties': ['error', ...ioProperties],
    },
  },
  {
    files: ['src/domain/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            { name: 'react', message: `src/domain/ är ren logik utan React. ${SEE_CLAUDE_MD}` },
            { name: 'react-dom', message: `src/domain/ är ren logik utan React. ${SEE_CLAUDE_MD}` },
          ],
          patterns: [
            uiImportPatterns,
            {
              group: ['**/api', '**/api/**'],
              message: `src/domain/ får inte bero på src/api/. ${SEE_CLAUDE_MD}`,
            },
          ],
        },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: "NewExpression[callee.name='Date']",
          message: `src/domain/ får inte läsa klockan. Skicka in tiden som argument. ${SEE_CLAUDE_MD}`,
        },
        {
          selector: "CallExpression[callee.object.name='Date'][callee.property.name='now']",
          message: `src/domain/ får inte läsa klockan. Skicka in tiden som argument. ${SEE_CLAUDE_MD}`,
        },
      ],
    },
  },
  {
    files: ['src/api/**/*.ts'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [uiImportPatterns] }],
    },
  },
  eslintConfigPrettier,
]);
