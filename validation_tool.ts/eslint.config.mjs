// eslint.config.mjs

// Helper imports
import tseslint from "typescript-eslint";
import globals from "globals";

// Plugin imports
import react from "eslint-plugin-react";
import reactRecommended from "eslint-plugin-react/configs/recommended.js";
import reactHooks from "eslint-plugin-react-hooks";
import { fixupPluginRules } from "@eslint/compat";

// The Prettier config must be last
import eslintConfigPrettier from "eslint-config-prettier";

export default tseslint.config(
  // 1. Base configurations for ESLint and TypeScript
  // This replaces `extends: ["eslint:recommended"]` and sets up the TS parser.
  ...tseslint.configs.recommended,

  // 2. React and React Hooks configuration
  {
    // Apply these rules to all relevant files
    files: ["**/*.{js,jsx,ts,tsx}"],

    // Use the recommended rules from eslint-plugin-react
    ...reactRecommended,

    // Add plugins for this configuration block
    plugins: {
      react,
      "react-hooks": fixupPluginRules(reactHooks),
    },

    // Language options specific to React/JSX
    languageOptions: {
      ...reactRecommended.languageOptions, // Includes parser options for JSX
      globals: {
        ...globals.browser, // Add browser globals like `window`
        ...globals.node, // Add Node.js globals
      },
    },

    // *** THE FIX IS HERE ***
    // Add the settings object to detect the React version
    settings: {
      react: {
        version: "detect",
      },
    },

    // Your custom rules for React and general code
    rules: {
      // Your existing custom rules
      "no-use-before-define": "off",
      "@typescript-eslint/no-use-before-define": ["error"],
      "no-unused-vars": "off", // Base rule is off, TS rule from `tseslint.configs.recommended` is on

      // Your React Hooks rules
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },

  // 3. Prettier configuration
  // This MUST be the last item in the array to override other configs.
  // It disables any ESLint rules that would conflict with Prettier's formatting.
  eslintConfigPrettier,
);
