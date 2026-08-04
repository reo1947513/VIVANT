import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "./supabase/server";
import { optionalEnv } from "./supabase/env";

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
 *   - ここ（環境変数 ADMIN_EMAIL との一致）… 画面に「権限がありません」と出すため
 *   - データベース側（admin_emails 表と is_admin 関数）… 実際の読み書きを止めるため
 *   アプリ側だけだと守りとして不十分で、DB側だけだと原因が分かりにくい。両方に置く。
 */

export type AdminUser = { id: string; email: string };

/**
 * ログイン中の管理者を返す。管理者でなければ null。
 * cache() で包んでいるので、1回のリクエストの中で何度呼んでも問い合わせは1回で済む。
 */
export const getAdminUser = cache(async (): Promise<AdminUser | null> => {
  const allowedEmail = optionalEnv("ADMIN_EMAIL").trim().toLowerCase();
  if (!allowedEmail) {
    console.error("[vivant] ADMIN_EMAIL が未設定のため、管理画面には入れません");
    return null;
  }

  try {
    const supabase = await createSupabaseServerClient();
    // getSession ではなく getUser を使う。getSession は cookie の中身をそのまま信じるが、
    // getUser は Supabase に問い合わせて本物か確かめるため、cookie の細工が効かない。
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) return null;
    if (user.email.trim().toLowerCase() !== allowedEmail) return null;

    return { id: user.id, email: user.email };
  } catch (e) {
    console.error("[vivant] 認証の確認に失敗しました:", e);
    return null;
  }
});

/** 画面用。管理者でなければログイン画面へ送る */
export async function requireAdmin(): Promise<AdminUser> {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");
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
