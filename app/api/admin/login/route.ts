import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "../../../lib/supabase/server";
import { optionalEnv } from "../../../lib/supabase/env";

/**
 * 管理画面へのログイン。
 *
 * ここを route handler にしている理由：
 *   ログインが成功すると、セッションを保つための cookie を書き込む必要がある。
 *   画面の描画中（サーバーコンポーネント）からは cookie を書けないため、
 *   書き込みができるこの場所で行う。
 *
 * 許可メール以外は、Supabase の認証が通っていても弾く。
 * 現在は新規登録を止めているので該当者は出ないはずだが、設定が戻された場合の保険。
 */
const schema = z.object({
  email: z.email("メールアドレスの形式が正しくありません。"),
  password: z.string().min(1, "パスワードを入力してください。"),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "入力を読み取れませんでした。" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "入力に誤りがあります。" },
      { status: 422 }
    );
  }

  const allowedEmail = optionalEnv("ADMIN_EMAIL").trim().toLowerCase();
  if (!allowedEmail) {
    console.error("[vivant] ADMIN_EMAIL が未設定です");
    return NextResponse.json(
      { error: "管理画面の設定が未完了です。" },
      { status: 500 }
    );
  }

  // 認証を試す前に弾く。総当たりで別アカウントを探られても、ここで止まる
  if (parsed.data.email.trim().toLowerCase() !== allowedEmail) {
    return NextResponse.json(
      { error: "メールアドレスまたはパスワードが違います。" },
      { status: 401 }
    );
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    // どちらが違うかは伝えない（存在するメールアドレスを探る手がかりを与えないため）
    console.error("[vivant] ログインに失敗しました:", error.message);
    return NextResponse.json(
      { error: "メールアドレスまたはパスワードが違います。" },
      { status: 401 }
    );
  }

  return NextResponse.json({ ok: true });
}
