import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "../../../../lib/auth";
import { getAdminSupabase } from "../../../../lib/supabase/admin";
import { revalidatePublic } from "../../../../lib/revalidate";
import { deleteImage } from "../../../../lib/upload";

/**
 * ギャラリー写真の一括操作（公開／非公開／削除）。
 * 考え方はキャスト側（/api/admin/casts/bulk）と同じで、
 * 本人確認1回・書き込み1回にまとめている。
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
    // 保存先を先に控える（行を消すと分からなくなり、画像だけが残る）
    const { data: targets } = await supabase
      .from("gallery_images")
      .select("image_path")
      .in("id", ids);

    const { error } = await supabase.from("gallery_images").delete().in("id", ids);
    if (error) {
      console.error("[vivant] ギャラリーの一括削除に失敗:", error.message);
      return NextResponse.json({ error: "削除できませんでした。" }, { status: 500 });
    }

    await Promise.all(
      (targets ?? []).map((row) => deleteImage("gallery", row.image_path))
    );

    revalidatePublic("gallery");
    return NextResponse.json({ done: ids.length });
  }

  const { error } = await supabase
    .from("gallery_images")
    .update({ is_published: action === "publish" })
    .in("id", ids);

  if (error) {
    console.error("[vivant] ギャラリーの一括更新に失敗:", error.message);
    return NextResponse.json({ error: "更新できませんでした。" }, { status: 500 });
  }

  revalidatePublic("gallery");
  return NextResponse.json({ done: ids.length });
}
