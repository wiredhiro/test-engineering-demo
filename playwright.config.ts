import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  testMatch: "**/*.e2e.ts",
  // 1つの使い捨てDBを共有するので、順番に実行して安定させる
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
  },
  // テスト実行の前に、E2E用アプリを自動で起動する（本番ではない）
  webServer: {
    command: "npx tsx app/server.ts",
    url: "http://localhost:3000/signup",
    reuseExistingServer: false,
    stdout: "pipe",
  },
});
