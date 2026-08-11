import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "../../../lib/supabase/server";
import { isAdminEmail } from "../../../lib/auth";

/**
 * 管理画面へのログイン。
 *
 * ここを route handler にしている理由：
 *   ログインが成功すると、セッションを保つための cookie を書き込む必要がある。
 *   画面の描画中（サーバーコンポーネント）からは cookie を書けないため、
 *   書き込みができるこの場所で行う。
 *
 * 管理者以外は、Supabase の認証が通っていても弾く。
 * 現在は新規登録を止めているので該当者は出ないはずだが、設定が戻された場合の保険。
 * 誰を管理者とみなすかは app/lib/auth.ts の isAdminEmail に一本化してある。
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

  /*
    認証を試す前に、管理者かどうかを先に確かめる。
    総当たりで別アカウントを探られても、ここで止まるため。

    判定は app/lib/auth.ts の isAdminEmail に任せる（環境変数と台帳の両方を見る）。
    以前はここで環境変数の1件とだけ突き合わせており、
    台帳に追加した2人目以降が、正しいパスワードを入れても
    「メールアドレスまたはパスワードが違います」で弾かれていた。
    ログイン後の確認は台帳を見ていたため、入口だけが食い違っていた。
  */
  if (!(await isAdminEmail(parsed.data.email))) {
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
