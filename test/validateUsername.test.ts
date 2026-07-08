import { describe, test, expect } from "vitest";
import { validateUsername } from "../src/validateUsername";

// このテストは 観点表.md を1行ずつコードにしたもの。
// 各 test の ID（U-01 など）は観点表と対応している。

describe("validateUsername", () => {
  // --- 正常系 ---
  test("U-01 有効な名前は通る", () => {
    expect(validateUsername("tanaka_9")).toEqual({ ok: true });
  });

  // --- 異常系 / null ---
  test("U-02 空文字を弾く", () => {
    expect(validateUsername("")).toEqual({
      ok: false,
      error: "ユーザー名を入力してください",
    });
  });

  test("U-03 null を弾く", () => {
    expect(validateUsername(null)).toEqual({
      ok: false,
      error: "ユーザー名を入力してください",
    });
  });

  // --- 境界値（同じ確認を値だけ変えて繰り返すのでパラメータ化・ガイド §6.2）---
  test("U-04 下限ちょうど(3文字)は通る", () => {
    expect(validateUsername("abc")).toEqual({ ok: true });
  });

  test("U-05 下限未満(2文字)を弾く", () => {
    expect(validateUsername("ab")).toEqual({
      ok: false,
      error: "3文字以上で入力してください",
    });
  });

  test("U-06 上限ちょうど(20文字)は通る", () => {
    expect(validateUsername("a".repeat(20))).toEqual({ ok: true });
  });

  test("U-07 上限超え(21文字)を弾く", () => {
    expect(validateUsername("a".repeat(21))).toEqual({
      ok: false,
      error: "20文字以内で入力してください",
    });
  });

  // --- 文字（使える文字かどうか）---
  test.each([
    ["U-08 記号", "tanaka!"],
    ["U-09 全角", "たなか"],
    ["U-10 空白", "tan aka"],
  ])("%s を含むと弾く", (_id, 入力) => {
    expect(validateUsername(入力)).toEqual({
      ok: false,
      error: "使えるのは半角英数字と _ です",
    });
  });
});
