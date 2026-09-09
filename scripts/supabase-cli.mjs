/**
 * Supabase CLIを、このリポジトリ専用の SUPABASE_ACCESS_TOKEN で実行するラッパー。
 *
 * `supabase login` / `supabase logout` によるアカウントの都度切り替えを避けるための仕組み。
 * login/logoutを繰り返す運用だと、CLI側の既知の不具合により
 * 別アカウントでlinkしたプロジェクトへの操作が制限されずに通ってしまうことがあるため、
 * このリポジトリでは .env.local の SUPABASE_ACCESS_TOKEN を都度環境変数として渡す方式にする。
 *
 * 事前準備: Supabaseダッシュボード右上のアカウントメニュー → Access Tokens で
 *           このリポジトリ（案件）専用のトークンを発行し、.env.local に
 *           SUPABASE_ACCESS_TOKEN=xxxxx の形で追記しておくこと。
 *
 * 実行: npm run supabase -- <supabase CLIへ渡す引数>
 * 例  : npm run supabase -- projects list
 * 例  : npm run supabase -- link --project-ref xxxxxxxxxxxxxxxxxxxx
 * 例  : npm run supabase -- db push
 */
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

// .env.local を読む（Node からは自動で読み込まれないため）
const envPath = path.join(process.cwd(), ".env.local");
if (existsSync(envPath)) {
  const text = await readFile(envPath, "utf8");
  for (const line of text.split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
}

const token = process.env.SUPABASE_ACCESS_TOKEN;

if (!token) {
  console.error(
    "SUPABASE_ACCESS_TOKEN が .env.local に見つかりません。Supabaseダッシュボードの Account > Access Tokens でこの案件用のトークンを発行し、.env.local に SUPABASE_ACCESS_TOKEN=xxxxx の形で追記してください。"
  );
  process.exit(1);
}

const args = process.argv.slice(2);

if (args.length === 0) {
  console.error("Supabase CLIへ渡す引数がありません。例: npm run supabase -- projects list");
  process.exit(1);
}

const result = spawnSync("supabase", args, {
  stdio: "inherit",
  env: {
    ...process.env,
    SUPABASE_ACCESS_TOKEN: token,
  },
});

if (result.error) {
  console.error("Supabase CLIの起動に失敗しました。`supabase`コマンドがインストールされているか確認してください。");
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
