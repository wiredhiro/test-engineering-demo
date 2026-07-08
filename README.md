# テスト設計デモ — 単体・結合・E2E・CI

![CI](https://github.com/wiredhiro/test-engineering-demo/actions/workflows/test.yml/badge.svg)

1つの機能（ユーザー登録）を題材に、**単体テスト・結合テスト・E2Eテスト ＋ CI ＋ 観点表 ＋ 不具合管理**を、実際に動く形でまとめたデモ。
「観点を洗い出す → テストにする → バグを捕まえる」というテスト設計の流れを、小さく通しで見せる。

## 動かし方

```bash
npm install
npm test                          # 単体10 + 結合4（Vitest）
npx playwright install chromium   # 初回だけ：E2E用ブラウザ
npm run e2e                       # E2E 3（Playwright）
```

- `npm run lint` … ESLint　／　`npm run typecheck` … 型チェック（tsc）

## 何を示すか（3層）

| 層 | 対象 | 通る範囲 | ファイル |
|---|---|---|---|
| 単体 | `validateUsername` | 関数ひとつ | `test/validateUsername.test.ts` |
| 結合 | `registerUser` ＋ DB | 部品のつなぎ目（テスト専用の使い捨てDB） | `test/registerUser.integration.test.ts` |
| E2E | 登録フォーム | 画面〜サーバー〜DB（Playwrightでブラウザ操作） | `e2e/signup.e2e.ts` |

**下（単体）を厚く、上（E2E）を薄く**積む（テストピラミッド）。各テストの名前には観点ID（U-06 等）を入れ、観点表と1対1で対応させている。

## テスト設計の流れ

1. **観点を洗い出す（設計）** … 何を確認すべきかを先に表にする → [観点表_3層.md](観点表_3層.md) ／ 統合版は `観点表.xlsx`
2. **テストにする（実装）** … 観点表の各行を、AAA（準備→実行→確認）でテストコードに
3. **バグを捕まえる** … 上限チェックを `>` → `>=` に1文字変えると、境界の観点だけが赤くなる（境界値の観点を先に置いたから捕まえられる）

## ファイルマップ

| ファイル | 中身 |
|---|---|
| `src/` `test/` `e2e/` `app/` | 対象コードとテスト |
| `観点表.xlsx` | 観点表＋実施結果＋不具合を統合した1タブ（プルダウン・フィルタ） |
| [観点表_3層.md](観点表_3層.md) | 3層の観点表・実施結果・不具合管理の考え方 |
| [結合テスト_README.md](結合テスト_README.md) ／ [E2E_README.md](E2E_README.md) | 各層の解説 |
| [サンプル資料.md](サンプル資料.md) | 単体〜E2E を通した資料 |
| [ブランチ保護_設定メモ.md](ブランチ保護_設定メモ.md) | CI を「必須」にする手順 |
| [CLAUDE.md](CLAUDE.md) | AI（Claude Code）にテストを書かせる際の**ルールファイル** |
| `.github/workflows/test.yml` | CI（lint→型→テスト→E2E、fail fast） |
| `.github/ISSUE_TEMPLATE/bug_report.yml` | 不具合報告フォーム |

## 使用技術

TypeScript ／ Vitest（単体・結合）／ Playwright（E2E）／ better-sqlite3（テスト専用インメモリDB）／ ESLint ／ GitHub Actions
