# E2Eテストのサンプル：本物のブラウザで操作する

単体・結合テストに、**E2E（End-to-End）テスト**を足したもの。
本物のブラウザを Playwright で動かし、**ユーザーと同じ操作**（入力・クリック）で、
画面 → 通信 → サーバー → DB → 画面表示、の全部を通して確認する。

## 動かし方

```bash
npm install
npx playwright install chromium   # 初回だけ：ブラウザ本体を取得
npm run e2e                        # E2E（Playwright）
```

`npm run e2e` を実行すると、Playwright が **自動でアプリを起動**（`app/server.ts`）してから、
ブラウザでテストを流し、終わったらアプリを止める。

```
 ✓ ユーザー名を入力して登録すると、成功メッセージが出る
 ✓ 短すぎる名前は、エラーメッセージが出る
 ✓ 同じ名前は二重登録できない

 3 passed
```

（単体10＋結合4は `npm test`、E2E3は `npm run e2e`。runner が別なので分けてある）

## E2E も「テストファイル」を作る（＋設定とアプリ）

E2E も、単体・結合と同じく**テストファイルを作る**（このサンプルでは `e2e/signup.e2e.ts`）。
中身は「画面を操作する手順」＝ `goto`（開く）→ `fill`（入力）→ `click`（押す）→ `expect`（結果を見る）。

単体テストとの違いは3点：

| | 単体テスト | E2E |
|---|---|---|
| テストファイル | `validateUsername.test.ts` | `signup.e2e.ts` |
| 名前・場所 | `.test.ts`（慣習） | `.e2e.ts`（別ランナー用に設定） |
| 走らせるコマンド | `npm test`（Vitest） | `npm run e2e`（Playwright） |

さらに E2E は「動くアプリ」が要るので、単体テストのようにファイル1個では完結しない。
**テストファイル ＋ 設定 ＋ アプリ本体**の3点セットになる（詳細は末尾の「ファイル」表）：

- `e2e/signup.e2e.ts` … テストファイル（操作を書く）
- `playwright.config.ts` … 設定（アプリを自動起動する等）
- `app/server.ts` … テスト対象のアプリ本体

## 何が「端から端まで」なのか

E2E のテストはこう書く：

```ts
await page.goto("/signup");                              // 画面を開く
await page.fill('input[name="username"]', "tanaka_9");   // 入力欄に打つ
await page.click('button[type="submit"]');               // ボタンを押す
await expect(page.getByText("登録しました")).toBeVisible(); // 画面の結果を見る
```

このとき実際に動くのは：

```
ブラウザ → フォーム入力 → fetch通信 → サーバー(app/server.ts)
        → registerUser → DB(SQLite) → レスポンス → 画面に「登録しました」
```

単体（validateUsername）も結合（registerUser + DB）も、**画面は通っていない**。
「ボタンを押したら成功メッセージが出る」という、ユーザーが実際に見る動きを確認できるのは E2E だけ。

## 3層の違い（このサンプルで全部そろった）

| 層 | 対象 | 通る範囲 | ファイル |
|---|---|---|---|
| 単体 | `validateUsername` | 関数ひとつ | `test/validateUsername.test.ts` |
| 結合 | `registerUser` + DB | 部品のつなぎ目 | `test/registerUser.integration.test.ts` |
| E2E | 画面 + サーバー + DB | 端から端まで | `e2e/signup.e2e.ts` |

## E2Eの勘所（コードに反映済み）

1. **数を絞る**（テストピラミッドの頂点）
   遅く・壊れやすいので、主要動線だけ。ここでは「登録の正常系・入力エラー・二重登録」の3本。

2. **待ちは自動待機に任せる**
   `expect(...).toBeVisible()` は「出るまで自動で待つ」。`sleep(3秒)` のような固定待ちは書かない（flaky の元）。

3. **テスト専用の環境で動かす**
   `app/server.ts` はテスト専用の使い捨てDB（メモリ上のSQLite）につないでいる。本番は叩かない。
   `playwright.config.ts` の `webServer` が、このアプリを自動起動している。

## E2E はいつやるか（タイミング）

大原則：**頻度は 単体 ＞ 結合 ＞ E2E**。E2E は遅く・壊れやすいので、**主要動線に絞って、節目で**回す。

| どこ | いつ | 何を |
|---|---|---|
| ローカル | 機能を作り終えた時／主要フローを触った時 | push 前に、主要動線だけ手元で1回 |
| CI | 単体・結合は全PRで毎回、**E2E は節目で** | main マージ時／nightly（夜間一括）／リリース前 |
| リリース直前 | デプロイの前 | 主要動線が生きてるかの最終確認（スモークテスト） |

単体・結合ほど「毎回」やらない。**「ユーザーの一番大事な道が通るか」を要所で確認する**のが E2E。
`test.yml` で E2E を別ジョブにしてあるのも、この「段階的に走らせる」ため。

## サーバーは自分で立ち上げなくていい

E2E は「動くアプリ」をブラウザで操作するので、**実行時にアプリ（サーバー）の起動が必要**。
ただし手動起動は不要で、**Playwright が自動で起動・停止**する（`playwright.config.ts` の `webServer`）：

```
Playwright が
  ① アプリを自動起動（npx tsx app/server.ts）
  ② テスト用の使い捨てDBにつなぐ（本番は叩かない）
  ③ localhost にブラウザでアクセスして操作
  ④ 終わったらアプリを自動で停止
```

だから `npm run e2e` だけで、起動〜テスト〜停止まで全部走る。ローカルでも CI でも同じ仕組み。

## E2E 用のライブラリ

| ツール | 特徴 |
|---|---|
| **Playwright**（Microsoft） | 今の主流。多ブラウザ・自動待機・速い。このサンプルで採用 |
| Cypress | 人気。開発体験が良い、ブラウザ内で動く |
| Selenium | 老舗。多言語対応、大規模で根強い |
| Puppeteer | Chrome 操作用。E2E 専用ではないが使える |

Next.js / TypeScript なら **Playwright か Cypress** が二強。ここでは Playwright ＋ Chromium を使っている。

## 実務スタックへの応用

- Next.js なら Playwright が定番。`app/server.ts` を Next のローカルサーバーに置き換えれば同じ形。
- Cloudflare なら `wrangler dev`（ローカル専用D1込み）で起動 → その localhost に Playwright を流す。
- 「ボタンを押すと画面の表示が変わる」ような UI は、まさに E2E 向き。**最終的な見た目**は、単体でも結合でもなく E2E でしか確認できない。

## ファイル

| ファイル | 中身 |
|---|---|
| `app/server.ts` | E2E用の最小アプリ（登録フォーム＋登録API） |
| `e2e/signup.e2e.ts` | E2Eテスト（ブラウザ操作） |
| `playwright.config.ts` | アプリの自動起動・ブラウザ設定 |
