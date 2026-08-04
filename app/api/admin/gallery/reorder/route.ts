import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "../../../../lib/auth";
import { getAdminSupabase } from "../../../../lib/supabase/admin";
import { revalidatePublic } from "../../../../lib/revalidate";

/**
 * ギャラリーの並び替え。キャストと同じく、並び順を丸ごと受け取って
 * 先頭から1,2,3…と番号を振り直す（途中で番号が重複していてもこの操作で整う）。
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

  for (const [index, id] of parsed.data.ids.entries()) {
    const { error } = await supabase
      .from("gallery_images")
      .update({ sort_order: index + 1 })
      .eq("id", id);

    if (error) {
      console.error("[vivant] ギャラリーの並び替えに失敗:", error.message);
      return NextResponse.json({ error: "並び替えできませんでした。" }, { status: 500 });
    }
  }

  revalidatePublic("gallery");
  return NextResponse.json({ ok: true });
}
