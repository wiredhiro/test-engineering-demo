import { test, expect } from "@playwright/test";

// E2E（End-to-End）テスト：本物のブラウザで、ユーザーと同じ操作をする。
// 画面 → 入力 → 通信 → サーバー → DB → 画面表示、の全部を通して確認する。

test("E-01 ユーザー名を入力して登録すると、成功メッセージが出る", async ({ page }) => {
  await page.goto("/signup");                              // 画面を開く
  await page.fill('input[name="username"]', "tanaka_9");   // 入力欄に打つ
  await page.click('button[type="submit"]');               // 登録ボタンを押す

  // ユーザーの目線で、画面に出た結果を確認する（出るまで自動で待つ）
  await expect(page.getByText("登録しました")).toBeVisible();
});

test("E-02 短すぎる名前は、エラーメッセージが出る", async ({ page }) => {
  await page.goto("/signup");
  await page.fill('input[name="username"]', "ab");         // 2文字＝短すぎ
  await page.click('button[type="submit"]');

  await expect(page.getByText("3文字以上で入力してください")).toBeVisible();
});

test("E-03 同じ名前は二重登録できない", async ({ page }) => {
  // 1回目：登録できる
  await page.goto("/signup");
  await page.fill('input[name="username"]', "hanako_1");
  await page.click('button[type="submit"]');
  await expect(page.getByText("登録しました")).toBeVisible();

  // 2回目：同じ名前 → 使われていますエラー（DBの状態まで通して確認）
  await page.goto("/signup");
  await page.fill('input[name="username"]', "hanako_1");
  await page.click('button[type="submit"]');
  await expect(page.getByText("その名前は使われています")).toBeVisible();
});
