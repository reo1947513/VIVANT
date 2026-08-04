import { NextResponse } from "next/server";
import { requireAdminApi } from "../../../../../lib/auth";
import { getAdminSupabase } from "../../../../../lib/supabase/admin";
import { revalidatePublic } from "../../../../../lib/revalidate";
import { deleteImage, uploadImage, UploadError } from "../../../../../lib/upload";

/**
 * キャスト写真の差し替えと削除。
 *
 * 差し替えの手順は「新しい名前で入れる → 記録を更新する → 古いものを消す」の順。
 * 同じ名前に上書きすると、配信網（CDN）に古い画像が残って差し替えたはずの写真が
 * しばらく古いまま見える。順序を守れば、その問題が起きない。
 */
type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const { id } = await params;

  const form = await request.formData();
  const file = form.get("photo");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "画像が選ばれていません。" }, { status: 422 });
  }

  const supabase = getAdminSupabase();

  // 差し替え前の写真の場所を控える（あとで消すため）
  const { data: before } = await supabase
    .from("casts")
    .select("photo_path")
    .eq("id", id)
    .maybeSingle();

  let uploaded;
  try {
    uploaded = await uploadImage("cast-photos", file);
  } catch (e) {
    const message = e instanceof UploadError ? e.message : "画像を保存できませんでした。";
    return NextResponse.json({ error: message }, { status: 422 });
  }

  const { error } = await supabase
    .from("casts")
    .update({ photo_url: uploaded.url, photo_path: uploaded.path })
    .eq("id", id);

  if (error) {
    // 記録できなかった画像は残しても使い道がないので消しておく
    await deleteImage("cast-photos", uploaded.path);
    console.error("[vivant] 写真の記録に失敗:", error.message);
    return NextResponse.json({ error: "写真を登録できませんでした。" }, { status: 500 });
  }

  await deleteImage("cast-photos", before?.photo_path);

  revalidatePublic("casts");
  return NextResponse.json({ url: uploaded.url });
}

/** 写真だけを消す（キャストは残す）。表示は「NO IMAGE」に戻る */
export async function DELETE(_request: Request, { params }: Params) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const { id } = await params;
  const supabase = getAdminSupabase();

  const { data: before } = await supabase
    .from("casts")
    .select("photo_path")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase
    .from("casts")
    .update({ photo_url: null, photo_path: null })
    .eq("id", id);

  if (error) {
    console.error("[vivant] 写真の削除に失敗:", error.message);
    return NextResponse.json({ error: "写真を削除できませんでした。" }, { status: 500 });
  }

  await deleteImage("cast-photos", before?.photo_path);

  revalidatePublic("casts");
  return NextResponse.json({ ok: true });
}
