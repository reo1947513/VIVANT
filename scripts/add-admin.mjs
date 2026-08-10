/**
 * 管理画面に入れる利用者を追加するスクリプト。
 *
 * やることは2つ：
 *   1. ログイン用の利用者を作る（メールアドレスと初期パスワード）
 *   2. 管理者の台帳 admin_emails に載せる（データベース側の読み書き許可）
 *
 * 実行：
 *   npm run add:admin -- "メールアドレス" "初期パスワード"
 *   npm run add:admin -- --remove "メールアドレス"   … 台帳から外す
 *
 * 注意：
 *   - パスワードは画面や履歴に残るため、渡した本人に初回ログイン後の変更を促すこと。
 *   - --remove は台帳から外すだけで、ログイン用の利用者そのものは消さない。
 *     完全に消す場合は Supabase ダッシュボードの Authentication から削除する。
 *   - 秘密キー（SUPABASE_SECRET_KEY）を使うため、実行できるのは手元だけ（.env.local を読む）。
 */
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

// .env.local を読む（Node からは自動で読み込まれないため）
const envPath = path.join(process.cwd(), ".env.local");
if (existsSync(envPath)) {
  const text = await readFile(envPath, "utf8");
  for (const line of text.split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;
if (!url || !secret) {
  console.error("NEXT_PUBLIC_SUPABASE_URL と SUPABASE_SECRET_KEY が必要です（.env.local）");
  process.exit(1);
}

const args = process.argv.slice(2);
const remove = args[0] === "--remove";
const email = (remove ? args[1] : args[0] || "").trim().toLowerCase();
const password = remove ? "" : (args[1] || "").trim();

if (!email || !email.includes("@")) {
  console.error('使い方: npm run add:admin -- "メールアドレス" "初期パスワード"');
  process.exit(1);
}
if (!remove && password.length < 8) {
  console.error("初期パスワードは8文字以上にしてください。");
  process.exit(1);
}

const supabase = createClient(url, secret, {
  auth: { persistSession: false, autoRefreshToken: false },
});

if (remove) {
  const { error } = await supabase.from("admin_emails").delete().eq("email", email);
  if (error) {
    console.error("台帳から外せませんでした:", error.message);
    process.exit(1);
  }
  console.log(`台帳から外しました: ${email}`);
  console.log("※ ログイン用の利用者自体は残っています（管理画面には入れません）。");
  process.exit(0);
}

// 1. ログイン用の利用者を作る。
//    email_confirm を true にして、確認メールを待たずにすぐ使えるようにする。
const { data: created, error: createError } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
});

if (createError) {
  // すでに同じメールアドレスの利用者がいる場合は、作らずに台帳への追加だけ進める
  const alreadyExists =
    createError.status === 422 || /already|registered|exists/i.test(createError.message);
  if (!alreadyExists) {
    console.error("利用者を作れませんでした:", createError.message);
    process.exit(1);
  }
  console.log(`利用者は既にあります: ${email}（パスワードは変更していません）`);
} else {
  console.log(`利用者を作りました: ${created.user?.email}`);
}

// 2. 管理者の台帳に載せる
const { error: listError } = await supabase
  .from("admin_emails")
  .upsert({ email }, { onConflict: "email" });

if (listError) {
  console.error("台帳に載せられませんでした:", listError.message);
  process.exit(1);
}

console.log(`台帳に載せました: ${email}`);
console.log(
  "これで管理画面（住所は app/lib/adminPath.ts の ADMIN_BASE）にログインできます。" +
    "初回ログイン後にパスワードを変更してください。"
);
