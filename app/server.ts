import http from "node:http";
import Database from "better-sqlite3";
import { registerUser } from "../src/registerUser";

// E2E 用の最小アプリ。
//   GET  /signup   … 登録フォームの画面を返す
//   POST /register … 名前を受け取り、registerUser で登録する
//
// DB はテスト専用の使い捨て（メモリ上のSQLite）。本番は使わない。

const db = new Database(":memory:");
db.exec(`
  CREATE TABLE users (
    id   INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
  )
`);

const PAGE = `<!doctype html>
<html lang="ja">
<head><meta charset="utf-8"><title>ユーザー登録</title></head>
<body>
  <h1>ユーザー登録</h1>
  <form id="signup">
    <input name="username" placeholder="ユーザー名" autocomplete="off" />
    <button type="submit">登録</button>
  </form>
  <p id="result"></p>
  <script>
    document.getElementById("signup").addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = e.target.username.value;
      const res = await fetch("/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      // ユーザーの目に見える結果を、画面に出す
      document.getElementById("result").textContent = data.ok ? "登録しました" : data.error;
    });
  </script>
</body>
</html>`;

const server = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/signup") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(PAGE);
    return;
  }

  if (req.method === "POST" && req.url === "/register") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      let name: unknown;
      try {
        name = JSON.parse(body).name;
      } catch {
        name = undefined;
      }
      const result = registerUser(name, db);
      res.writeHead(result.ok ? 200 : 400, {
        "Content-Type": "application/json; charset=utf-8",
      });
      res.end(JSON.stringify(result));
    });
    return;
  }

  res.writeHead(404);
  res.end("not found");
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`E2E用アプリ起動: http://localhost:${PORT}/signup`);
});
