import { fixupConfigRules } from '@eslint/compat';
import * as espree from 'espree';
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';

const config = [
  // Next's bundled plugins still use rule APIs removed in ESLint 10.
  ...fixupConfigRules(nextCoreWebVitals),
  {
    // Next's Babel parser lacks ESLint 10 scope support; use ESLint's JS parser.
    files: ['**/*.{js,jsx,mjs,cjs}'],
    languageOptions: {
      parser: espree,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
  },
  {
    rules: {
      'react-hooks/preserve-manual-memoization': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/set-state-in-render': 'off',
    },
  },
];

export default config;
