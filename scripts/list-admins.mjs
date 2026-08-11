/**
 * 管理者アカウントの一覧。読み取りだけで、何も変更しない。
 *
 * 実行：
 *   npm run list:admins
 *
 * 管理者かどうかは2つの条件の組み合わせで決まる（app/lib/auth.ts と同じ判定）。
 *   1. ログインできる利用者として登録されていること（Supabase の認証側）
 *   2. 管理者として許されていること
 *      … 環境変数 ADMIN_EMAIL に一致するか、admin_emails 表に載っているか
 *
 * 片方だけでは管理画面に入れない。たとえば台帳に載っていても利用者が無ければ
 * そもそもログインできず、逆に利用者があっても台帳に無ければ弾かれる。
 * その食い違いを見つけられるよう、両方を突き合わせて出す。
 */
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

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

const supabase = createClient(url, secret, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const ownerEmail = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();

// 1. 台帳（admin_emails 表）
const { data: ledger, error: ledgerError } = await supabase
  .from("admin_emails")
  .select("email, created_at")
  .order("created_at", { ascending: true });

if (ledgerError) {
  console.error("台帳の取得に失敗しました:", ledgerError.message);
  process.exit(1);
}

// 2. ログインできる利用者（認証側）
const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers({
  page: 1,
  perPage: 200,
});

if (usersError) {
  console.error("利用者の取得に失敗しました:", usersError.message);
  process.exit(1);
}

const users = usersData?.users ?? [];
const userByEmail = new Map(
  users.filter((u) => u.email).map((u) => [u.email.trim().toLowerCase(), u])
);

// 3. 管理者として許されているメールアドレスを集める
const allowed = new Set();
if (ownerEmail) allowed.add(ownerEmail);
for (const row of ledger ?? []) allowed.add(String(row.email).trim().toLowerCase());

console.log("■ 管理画面に入れるアカウント");
if (allowed.size === 0) {
  console.log("  （1件もありません）");
} else {
  let usable = 0;
  for (const email of allowed) {
    const user = userByEmail.get(email);
    const source = [];
    if (email === ownerEmail) source.push("環境変数");
    if ((ledger ?? []).some((r) => String(r.email).trim().toLowerCase() === email)) {
      source.push("台帳");
    }
    if (user) {
      usable++;
      const last = user.last_sign_in_at
        ? new Date(user.last_sign_in_at).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })
        : "未ログイン";
      // メール確認が済んでいないとログインできない設定の場合があるため状態を出す
      const confirmed = user.email_confirmed_at ? "確認済み" : "【未確認】";
      const banned =
        user.banned_until && new Date(user.banned_until) > new Date()
          ? `【停止中: ${user.banned_until}】`
          : "";
      console.log(`  ${email}`);
      console.log(`    許可の根拠: ${source.join(" と ")} / 最終ログイン: ${last}`);
      console.log(`    メール: ${confirmed}${banned ? " / " + banned : ""}`);
    } else {
      console.log(`  ${email}【ログインできません】`);
      console.log(`    許可の根拠: ${source.join(" と ")} / 認証側に利用者が居ません`);
    }
  }
  console.log("");
  console.log(`  実際にログインできる管理者: ${usable} 件`);
}

// 4. 利用者は居るが管理者ではない人（居れば知らせる）
const notAdmin = users.filter(
  (u) => u.email && !allowed.has(u.email.trim().toLowerCase())
);
if (notAdmin.length > 0) {
  console.log("");
  console.log("■ 利用者として登録はあるが、管理者ではないもの");
  for (const u of notAdmin) console.log(`  ${u.email}`);
  console.log("  （ログインしても管理画面には入れません）");
}
