import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "./supabase/server";
import { getAdminSupabase } from "./supabase/admin";
import { optionalEnv } from "./supabase/env";
import { ADMIN_LOGIN_PATH } from "./adminPath";

/**
 * 管理画面の認証。
 *
 * 守り方の方針：
 *   Next.js 16 では middleware が proxy という名前に変わったが、ここでは使わない。
 *   公式の案内でも「proxy での確認は簡易的なもので、本命はデータに近い層で守ること」
 *   とされている。管理者は1名、管理ページも10枚程度なので、
 *   (1) 保護領域のレイアウトで1回確認し、
 *   (2) 書き込みを行う API でも毎回確認する、
 *   の二重で守るほうが確実で、余計な通信も増えない。
 *
 * 管理者かどうかは2箇所で判定している：
 *   - ここ（環境変数 ADMIN_EMAIL、または admin_emails 表に載っているか）
 *     … 画面に「権限がありません」と出すため
 *   - データベース側（admin_emails 表と is_admin 関数）… 実際の読み書きを止めるため
 *   アプリ側だけだと守りとして不十分で、DB側だけだと原因が分かりにくい。両方に置く。
 *
 * 管理者を増やすときは scripts/add-admin.mjs を使う（ログイン用の利用者を作り、
 * admin_emails 表にも載せる）。環境変数の書き換えと再デプロイは要らない。
 *
 * 管理画面の住所は app/lib/adminPath.ts にまとめてある。住所を隠しているのは
 * 人目に触れさせないための目隠しで、守りの本体はここの確認とデータベース側にある。
 */

type AdminUser = { id: string; email: string };

/**
 * そのメールアドレスが管理者として許されているかを返す。
 *
 * 判定は2段。環境変数 ADMIN_EMAIL に一致するか、admin_emails 表に載っているか。
 * ログイン後の確認（getAdminUser）と、ログインの入口（/api/admin/login）の
 * 両方から呼ぶ。ここを共通にしておかないと、
 * 「台帳に追加したのにログインできない」という食い違いが起きる。
 * 実際、以前はログインの入口だけが環境変数の1件しか通さず、
 * 台帳に追加した2人目以降が入れない状態になっていた。
 *
 * 台帳は行レベルセキュリティで誰も読めないため、秘密キーを使う側から確認する。
 */
export async function isAdminEmail(rawEmail: string): Promise<boolean> {
  const email = rawEmail.trim().toLowerCase();
  if (!email) return false;

  // 1人目（オーナー）は環境変数で許す。環境変数を消すと締め出される事故を防ぐため、
  // この判定は残しておく。
  const allowedEmail = optionalEnv("ADMIN_EMAIL").trim().toLowerCase();
  if (allowedEmail && email === allowedEmail) return true;

  // 2人目以降は admin_emails 表で許す。ここが台帳の本体で、
  // 追加のたびに環境変数を書き換えて再デプロイする必要がない。
  const { data, error } = await getAdminSupabase()
    .from("admin_emails")
    .select("email")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    console.error("[vivant] 管理者台帳の確認に失敗しました:", error.message);
    return false;
  }
  return Boolean(data);
}

/**
 * ログイン中の管理者を返す。管理者でなければ null。
 * cache() で包んでいるので、1回のリクエストの中で何度呼んでも問い合わせは1回で済む。
 */
export const getAdminUser = cache(async (): Promise<AdminUser | null> => {
  try {
    const supabase = await createSupabaseServerClient();
    // getSession ではなく getUser を使う。getSession は cookie の中身をそのまま信じるが、
    // getUser は Supabase に問い合わせて本物か確かめるため、cookie の細工が効かない。
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) return null;

    if (!(await isAdminEmail(user.email))) return null;

    return { id: user.id, email: user.email };
  } catch (e) {
    console.error("[vivant] 認証の確認に失敗しました:", e);
    return null;
  }
});

/** 画面用。管理者でなければログイン画面へ送る */
export async function requireAdmin(): Promise<AdminUser> {
  const user = await getAdminUser();
  if (!user) redirect(ADMIN_LOGIN_PATH);
  return user;
}

/**
 * API用。管理者でなければ 401 を返す。
 * 使い方：
 *   const denied = await requireAdminApi();
 *   if (denied) return denied;
 */
export async function requireAdminApi(): Promise<NextResponse | null> {
  const user = await getAdminUser();
  if (user) return null;
  return NextResponse.json(
    { error: "ログインが必要です。" },
    { status: 401 }
  );
}
