import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "../../../../lib/auth";
import { getAdminSupabase } from "../../../../lib/supabase/admin";
import { revalidatePublic } from "../../../../lib/revalidate";
import { deleteImage } from "../../../../lib/upload";

/** ギャラリー画像1枚の公開切替と削除 */
const updateSchema = z.object({
  isPublished: z.boolean(),
});

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "入力を読み取れませんでした。" }, { status: 400 });
  }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "入力に誤りがあります。" },
      { status: 422 }
    );
  }

  const { error } = await getAdminSupabase()
    .from("gallery_images")
    .update({ is_published: parsed.data.isPublished })
    .eq("id", id);

  if (error) {
    console.error("[vivant] ギャラリー画像の更新に失敗:", error.message);
    return NextResponse.json({ error: "更新できませんでした。" }, { status: 500 });
  }

  revalidatePublic("gallery");
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: Params) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const { id } = await params;
  const supabase = getAdminSupabase();

  // 保存先を先に控える（行を消すと分からなくなり、画像だけが残る）
  const { data: target } = await supabase
    .from("gallery_images")
    .select("image_path")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("gallery_images").delete().eq("id", id);
  if (error) {
    console.error("[vivant] ギャラリー画像の削除に失敗:", error.message);
    return NextResponse.json({ error: "削除できませんでした。" }, { status: 500 });
  }

  await deleteImage("gallery", target?.image_path);

  revalidatePublic("gallery");
  return NextResponse.json({ ok: true });
}
