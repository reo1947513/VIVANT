import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../lib/supabase/server";

/**
 * ログアウト。セッションを終わらせ、cookie を消す。
 * cookie の書き換えが必要なため、画面側ではなくここで行う（login と同じ理由）。
 */
export async function POST() {
  try {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  } catch (e) {
    // 失敗しても cookie が残るだけで、次の画面表示時に無効なセッションとして弾かれる
    console.error("[vivant] ログアウトに失敗しました:", e);
  }
  return NextResponse.json({ ok: true });
}
