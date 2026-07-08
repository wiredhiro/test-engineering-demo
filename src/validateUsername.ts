// ユーザー名のバリデーション（入力チェック）
//
// 仕様（観点表.md の「期待する結果」と対応）:
//   - 空 / null / undefined     → NG「ユーザー名を入力してください」
//   - 3文字未満                 → NG「3文字以上で入力してください」
//   - 20文字を超える            → NG「20文字以内で入力してください」
//   - 半角英数字と _ 以外を含む  → NG「使えるのは半角英数字と _ です」
//   - 上のどれにも当たらない     → OK

export type ValidationResult =
  | { ok: true }
  | { ok: false; error: string };

const MIN = 3;
const MAX = 20;
const 使用可能文字 = /^[A-Za-z0-9_]+$/;

export function validateUsername(name: unknown): ValidationResult {
  // 空・null・undefined
  if (name == null || name === "") {
    return { ok: false, error: "ユーザー名を入力してください" };
  }
  if (typeof name !== "string") {
    return { ok: false, error: "ユーザー名を入力してください" };
  }

  // 長さ（下限・上限）
  if (name.length < MIN) {
    return { ok: false, error: "3文字以上で入力してください" };
  }
  if (name.length > MAX) {
    return { ok: false, error: "20文字以内で入力してください" };
  }

  // 使える文字
  if (!使用可能文字.test(name)) {
    return { ok: false, error: "使えるのは半角英数字と _ です" };
  }

  return { ok: true };
}
