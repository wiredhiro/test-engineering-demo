import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  // チェックしないもの
  {
    ignores: ["node_modules/", "test-results/", "playwright-report/"],
  },
  // JS/TS の推奨ルール
  js.configs.recommended,
  ...tseslint.configs.recommended,
  // このプロジェクト向けの微調整
  {
    rules: {
      // 未使用変数は警告。ただし _ で始まる引数は「わざと使わない」印として許可
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
    },
  },
);
