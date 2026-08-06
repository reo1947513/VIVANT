import { NextResponse } from "next/server";
import { requireAdminApi } from "../../../lib/auth";
import { getAdminSupabase } from "../../../lib/supabase/admin";
import { revalidatePublic } from "../../../lib/revalidate";
import { deleteImage, uploadImage, UploadError } from "../../../lib/upload";

/**
 * ギャラリー画像の一覧取得と、複数枚まとめてのアップロード。
 *
 * まとめて送れるようにしているのは、店内写真は一度に何枚も入れ替えることが多いため。
 * 途中の1枚が失敗しても、成功した分はそのまま登録する（全部やり直しにしない）。
 * 失敗した枚数だけを画面に伝える。
 */
export async function GET() {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const { data, error } = await getAdminSupabase()
    .from("gallery_images")
    .select("id, image_url, alt, sort_order, is_published")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[vivant] ギャラリー一覧の取得に失敗:", error.message);
    return NextResponse.json({ error: "一覧を取得できませんでした。" }, { status: 500 });
  }

  return NextResponse.json({ images: data ?? [] });
}

export async function POST(request: Request) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const form = await request.formData();
  const files = form.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);

  if (files.length === 0) {
    return NextResponse.json({ error: "画像が選ばれていません。" }, { status: 422 });
  }
  if (files.length > 20) {
    return NextResponse.json(
      { error: "一度にアップロードできるのは20枚までです。" },
      { status: 422 }
    );
  }

  const supabase = getAdminSupabase();

  // 末尾に並べるため、現在の最大の表示順を調べる
  const { data: last } = await supabase
    .from("gallery_images")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const startOrder = (last?.sort_order ?? 0) + 1;
  let uploaded = 0;
  const failures: string[] = [];

  // 表示順は選んだ順のまま保ちたいので、処理を始める前に番号を割り当てておく。
  // 途中で失敗した番号は空き番になるが、並びの前後関係は変わらない。
  const targets = files.map((file, index) => ({ file, sortOrder: startOrder + index }));

  // 3枚ずつの束にして同時に処理する。1枚ずつ順番に待つと、
  // 「画像の保存」と「行の登録」で1枚あたり2往復ぶんの待ち時間が積み上がる
  // （10枚なら20往復）。すべてを一度に流すと通信と記憶域を圧迫するため、
  // 束の大きさは3に抑えている。
  const CHUNK_SIZE = 3;

  for (let i = 0; i < targets.length; i += CHUNK_SIZE) {
    const chunk = targets.slice(i, i + CHUNK_SIZE);

    const results = await Promise.all(
      chunk.map(async ({ file, sortOrder }): Promise<{ ok: boolean; message?: string }> => {
        let saved;
        try {
          saved = await uploadImage("gallery", file);
        } catch (e) {
          return {
            ok: false,
            message: e instanceof UploadError ? e.message : "保存に失敗しました。",
          };
        }

        const { error } = await supabase.from("gallery_images").insert({
          image_url: saved.url,
          image_path: saved.path,
          alt: "",
          sort_order: sortOrder,
          is_published: true,
        });

        if (error) {
          // 記録できなかった画像は使い道がないので消す
          await deleteImage("gallery", saved.path);
          console.error("[vivant] ギャラリー画像の記録に失敗:", error.message);
          return { ok: false, message: "登録に失敗しました。" };
        }

        return { ok: true };
      })
    );

    for (const result of results) {
      if (result.ok) uploaded += 1;
      else failures.push(result.message ?? "失敗しました。");
    }
  }

  if (uploaded > 0) revalidatePublic("gallery");

  if (uploaded === 0) {
    return NextResponse.json(
      { error: failures[0] ?? "アップロードできませんでした。" },
      { status: 422 }
    );
  }

  return NextResponse.json({ uploaded, failed: failures.length }, { status: 201 });
}
