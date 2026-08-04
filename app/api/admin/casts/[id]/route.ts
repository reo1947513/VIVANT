import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "../../../../lib/auth";
import { getAdminSupabase } from "../../../../lib/supabase/admin";
import { revalidatePublic } from "../../../../lib/revalidate";
import { deleteImage } from "../../../../lib/upload";

/**
 * キャスト1件の更新と削除。
 * Next.js 16 では params が非同期になったため await して受け取る。
 */
const updateSchema = z.object({
  name: z.string().trim().min(1, "源氏名を入力してください。").max(30, "源氏名は30文字までです。"),
  word: z.string().trim().max(60, "一言は60文字までです。").default(""),
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
    .from("casts")
    .update({
      name: parsed.data.name,
      word: parsed.data.word,
      is_published: parsed.data.isPublished,
    })
    .eq("id", id);

  if (error) {
    console.error("[vivant] キャストの更新に失敗:", error.message);
    return NextResponse.json({ error: "更新できませんでした。" }, { status: 500 });
  }

  revalidatePublic("casts");
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: Params) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const { id } = await params;
  const supabase = getAdminSupabase();

  // 写真の保存先を先に控える。行を消してからでは分からなくなり、
  // 画像だけが残り続けてしまう（保存容量を無駄に食う）
  const { data: target } = await supabase
    .from("casts")
    .select("photo_path")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("casts").delete().eq("id", id);
  if (error) {
    console.error("[vivant] キャストの削除に失敗:", error.message);
    return NextResponse.json({ error: "削除できませんでした。" }, { status: 500 });
  }

  await deleteImage("cast-photos", target?.photo_path);

  revalidatePublic("casts");
  return NextResponse.json({ ok: true });
}
