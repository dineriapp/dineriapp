import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: ["node_modules/**","src/generated"], // ✅ Correct way in flat config
  },
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off", //
      "@typescript-eslint/ban-ts-comment": [
        "error",
        {
          "ts-ignore": false,
          "ts-nocheck": false,
          "ts-check": false,
          "ts-expect-error": false,
        },
      ],
    },
  },
];

export default eslintConfig;
