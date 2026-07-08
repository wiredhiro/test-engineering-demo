import Database from "better-sqlite3";
import { beforeEach, afterEach, describe, test, expect } from "vitest";
import { registerUser } from "../src/registerUser";

// 結合テスト：本物のDBを使って、バリデーション〜保存の「つなぎ目」を確認する。
//
// ポイントは、テスト専用の使い捨てDBを使うこと。
//   - 本番DBは絶対に使わない（データを壊す）
//   - 普段の開発用DBも共用しない（残りデータでテストが不安定になる）
//   - 代わりに、テストごとに作り直せる ":memory:"（メモリ上のSQLite）を使う

describe("registerUser（結合テスト・テスト専用DB）", () => {
  let db: Database.Database;

  beforeEach(() => {
    // 各テストの前に、まっさらな使い捨てDBを新しく作る
    db = new Database(":memory:");
    db.exec(`
      CREATE TABLE users (
        id   INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
      )
    `);
  });

  afterEach(() => {
    // 後始末。次のテストにデータを残さない
    db.close();
  });

  test("I-01 各テストは空のDBから始まる（前のテストの残りがない）", () => {
    const 件数 = db.prepare("SELECT COUNT(*) AS n FROM users").get() as { n: number };
    expect(件数.n).toBe(0);
  });

  test("I-02 新規ユーザーを登録でき、実際にDBに入る", () => {
    const r = registerUser("tanaka_9", db);
    expect(r.ok).toBe(true);

    // つなぎ目の確認：本当にDBに保存されたかを、DB側から見る
    const 行 = db.prepare("SELECT name FROM users WHERE name = ?").get("tanaka_9");
    expect(行).toEqual({ name: "tanaka_9" });
  });

  test("I-03/I-04 同じ名前は二重登録できず、DBは1件のまま", () => {
    registerUser("tanaka_9", db); // 1回目：成功
    const r = registerUser("tanaka_9", db); // 2回目：同じ名前
    expect(r).toEqual({ ok: false, error: "その名前は使われています" });

    // DBには1件しか入っていないこと
    const 件数 = db.prepare("SELECT COUNT(*) AS n FROM users").get() as { n: number };
    expect(件数.n).toBe(1);
  });

  test("I-05 バリデーションNGな名前は、DBに1件も入らない（①で止まる）", () => {
    const r = registerUser("ab", db); // 3文字未満＝バリデーションNG
    expect(r.ok).toBe(false);

    // 保存処理まで進んでいないこと（つなぎ目が正しく止まっている）
    const 件数 = db.prepare("SELECT COUNT(*) AS n FROM users").get() as { n: number };
    expect(件数.n).toBe(0);
  });
});
