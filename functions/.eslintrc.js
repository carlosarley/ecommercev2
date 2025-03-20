module.exports = {
  env: {
    node: true,
    es2021: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "google",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 12,
    sourceType: "module",
  },
  plugins: [
    "@typescript-eslint",
  ],
  rules: {
    "quotes": ["error", "double"],
    "semi": ["error", "always"],
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": ["error"],
    "indent": ["error", 2],
    "max-len": ["error", { "code": 120 }],
    "@typescript-eslint/no-unused-expressions": [
      "error",
      {
        "allowShortCircuit": true, // Permitir expresiones de cortocircuito (&&, ||)
        "allowTernary": true, // Permitir expresiones ternarias
      },
    ],
  },
};