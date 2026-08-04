import { NextResponse } from "next/server";
import { requireAdminApi } from "../../../../../lib/auth";
import { getAdminSupabase } from "../../../../../lib/supabase/admin";
import { revalidatePublic } from "../../../../../lib/revalidate";
import { deleteImage, uploadImage, UploadError } from "../../../../../lib/upload";

/**
 * 記事のカバー画像の差し替えと削除。
 * 手順はキャスト写真と同じ「新しい名前で入れる → 記録を更新する → 古いものを消す」。
 */
type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const { id } = await params;

  const form = await request.formData();
  const file = form.get("cover");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "画像が選ばれていません。" }, { status: 422 });
  }

  const supabase = getAdminSupabase();

  const { data: before } = await supabase
    .from("posts")
    .select("slug, cover_path")
    .eq("id", id)
    .maybeSingle();

  let uploaded;
  try {
    uploaded = await uploadImage("blog", file);
  } catch (e) {
    const message = e instanceof UploadError ? e.message : "画像を保存できませんでした。";
    return NextResponse.json({ error: message }, { status: 422 });
  }

  const { error } = await supabase
    .from("posts")
    .update({ cover_url: uploaded.url, cover_path: uploaded.path })
    .eq("id", id);

  if (error) {
    await deleteImage("blog", uploaded.path);
    console.error("[vivant] カバー画像の記録に失敗:", error.message);
    return NextResponse.json({ error: "画像を登録できませんでした。" }, { status: 500 });
  }

  await deleteImage("blog", before?.cover_path);

  revalidatePublic("posts", before?.slug);
  return NextResponse.json({ url: uploaded.url });
}

export async function DELETE(_request: Request, { params }: Params) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const { id } = await params;
  const supabase = getAdminSupabase();

  const { data: before } = await supabase
    .from("posts")
    .select("slug, cover_path")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase
    .from("posts")
    .update({ cover_url: null, cover_path: null })
    .eq("id", id);

  if (error) {
    console.error("[vivant] カバー画像の削除に失敗:", error.message);
    return NextResponse.json({ error: "画像を削除できませんでした。" }, { status: 500 });
  }

  await deleteImage("blog", before?.cover_path);

  revalidatePublic("posts", before?.slug);
  return NextResponse.json({ ok: true });
}
