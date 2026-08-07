import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "../../../../lib/auth";
import { getAdminSupabase } from "../../../../lib/supabase/admin";
import { revalidatePublic } from "../../../../lib/revalidate";
import { deleteImage } from "../../../../lib/upload";

/**
 * キャストの一括操作（公開／非公開／削除）。
 *
 * 1件ずつの窓口（/api/admin/casts/[id]）を人数分呼ぶこともできるが、
 * それだと呼んだ回数だけ本人確認とデータベースの往復が生じる。
 * ここでは本人確認1回・書き込み1回で済ませる。
 *
 * 削除では写真も消す。行を消してからでは保存先が分からなくなるため、
 * 先に保存先を控えてから行を消し、その後にまとめて写真を消す。
 */
const schema = z.object({
  ids: z.array(z.uuid("対象の指定が不正です。")).min(1, "対象が選ばれていません。").max(100),
  action: z.enum(["publish", "unpublish", "delete"]),
});

export async function POST(request: Request) {
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

  const { ids, action } = parsed.data;
  const supabase = getAdminSupabase();

  if (action === "delete") {
    // 写真の保存先を先に控える（行を消すと分からなくなり、画像だけが残り続ける）
    const { data: targets } = await supabase
      .from("casts")
      .select("photo_path")
      .in("id", ids);

    const { error } = await supabase.from("casts").delete().in("id", ids);
    if (error) {
      console.error("[vivant] キャストの一括削除に失敗:", error.message);
      return NextResponse.json({ error: "削除できませんでした。" }, { status: 500 });
    }

    // 写真の削除は行の削除と独立しているので、まとめて同時に行う
    await Promise.all(
      (targets ?? []).map((row) => deleteImage("cast-photos", row.photo_path))
    );

    revalidatePublic("casts");
    return NextResponse.json({ done: ids.length });
  }

  const { error } = await supabase
    .from("casts")
    .update({ is_published: action === "publish" })
    .in("id", ids);

  if (error) {
    console.error("[vivant] キャストの一括更新に失敗:", error.message);
    return NextResponse.json({ error: "更新できませんでした。" }, { status: 500 });
  }

  revalidatePublic("casts");
  return NextResponse.json({ done: ids.length });
}
