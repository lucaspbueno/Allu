/* eslint-env node */
module.exports = {
  root: true,
  env: { node: true, es2022: true },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
    ecmaFeatures: { jsx: true },
  },
  plugins: ["@typescript-eslint", "prettier"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
    "prettier",
  ],
  ignorePatterns: [
    "dist",
    "node_modules",
    "coverage",
    "*.cjs",
    "**/vite.config.d.ts",
  ],
  overrides: [
    {
      files: ["apps/frontend/**/*.{ts,tsx}"],
      extends: [
        "plugin:react/recommended",
        "plugin:react-hooks/recommended",
        "plugin:jsx-a11y/recommended",
      ],
      settings: { react: { version: "detect" } },
      rules: {
        "react/react-in-jsx-scope": "off",
      },
    },
  ],
};
