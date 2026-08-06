import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "../../../../lib/auth";
import { getAdminSupabase } from "../../../../lib/supabase/admin";
import { revalidatePublic } from "../../../../lib/revalidate";

/**
 * 表示順の入れ替え。
 * 画面から並び順（idの配列）を受け取り、先頭から1,2,3…と番号を振り直す。
 * 「1つ上と入れ替える」方式ではなく全体を振り直す方式にしているのは、
 * 途中で番号が重複していても、この操作で必ず整った状態に直るため。
 */
const schema = z.object({
  ids: z.array(z.uuid("並び順の指定が不正です。")).min(1, "並び順が空です。"),
});

export async function PATCH(request: Request) {
  const denied = await requireAdminApi();
  if (denied) return denied;

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

  const supabase = getAdminSupabase();

  // 全件をまとめて同時に更新する。
  // 1件ずつ順番に待つと、データベースまでの往復が件数分だけ積み上がる
  // （8人なら8往復）。並び順は毎回全件を振り直す方式なので、
  // 万一一部が失敗しても、もう一度並び替えれば必ず整った状態に直る。
  const results = await Promise.all(
    parsed.data.ids.map((id, index) =>
      supabase
        .from("casts")
        .update({ sort_order: index + 1 })
        .eq("id", id)
    )
  );

  const failed = results.find((result) => result.error);
  if (failed?.error) {
    console.error("[vivant] 並び替えに失敗:", failed.error.message);
    return NextResponse.json({ error: "並び替えできませんでした。" }, { status: 500 });
  }

  revalidatePublic("casts");
  return NextResponse.json({ ok: true });
}
