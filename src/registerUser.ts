import type Database from "better-sqlite3";
import { validateUsername } from "./validateUsername";

// ユーザー登録（複数の部品のつなぎ目）:
//   ① バリデーション（validateUsername＝単体で検証済みの部品を再利用）
//   ② DBで重複チェック
//   ③ DBに保存
//
// ①だけを調べるのが単体テスト。①〜③のつなぎ目を本物のDBで調べるのが結合テスト。

export type RegisterResult =
  | { ok: true; id: number }
  | { ok: false; error: string };

export function registerUser(name: unknown, db: Database.Database): RegisterResult {
  // ① バリデーション
  const v = validateUsername(name);
  if (!v.ok) return { ok: false, error: v.error };
  const username = name as string;

  // ② DBで重複チェック
  const 既存 = db.prepare("SELECT id FROM users WHERE name = ?").get(username);
  if (既存) return { ok: false, error: "その名前は使われています" };

  // ③ DBに保存
  const info = db.prepare("INSERT INTO users (name) VALUES (?)").run(username);
  return { ok: true, id: Number(info.lastInsertRowid) };
}
