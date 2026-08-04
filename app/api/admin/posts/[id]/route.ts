import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "../../../../lib/auth";
import { getAdminSupabase } from "../../../../lib/supabase/admin";
import { revalidatePublic } from "../../../../lib/revalidate";
import { deleteImage } from "../../../../lib/upload";
import { slugSchema } from "../route";

/** 記事1件の更新と削除 */
const updateSchema = z.object({
  slug: slugSchema,
  title: z.string().trim().min(1, "題名を入力してください。").max(120, "題名は120文字までです。"),
  excerpt: z.string().trim().max(200, "紹介文は200文字までです。").default(""),
  body: z.string().max(20000, "本文が長すぎます。").default(""),
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

  const supabase = getAdminSupabase();

  // 変更前の状態を控える。URL名が変わった場合、古い住所のページも作り直す必要がある
  const { data: before } = await supabase
    .from("posts")
    .select("slug, is_published, published_at")
    .eq("id", id)
    .maybeSingle();

  // 初めて公開したときに日付を入れる。すでに入っていれば触らない（公開日が動かないように）
  const publishedAt =
    parsed.data.isPublished && !before?.published_at
      ? new Date().toISOString()
      : before?.published_at ?? null;

  const { error } = await supabase
    .from("posts")
    .update({
      slug: parsed.data.slug,
      title: parsed.data.title,
      excerpt: parsed.data.excerpt,
      body: parsed.data.body,
      is_published: parsed.data.isPublished,
      published_at: publishedAt,
    })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "そのURL名は既に使われています。別の名前にしてください。" },
        { status: 422 }
      );
    }
    console.error("[vivant] 記事の更新に失敗:", error.message);
    return NextResponse.json({ error: "更新できませんでした。" }, { status: 500 });
  }

  revalidatePublic("posts", parsed.data.slug);
  if (before?.slug && before.slug !== parsed.data.slug) {
    revalidatePublic("posts", before.slug);
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: Params) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const { id } = await params;
  const supabase = getAdminSupabase();

  const { data: target } = await supabase
    .from("posts")
    .select("slug, cover_path")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) {
    console.error("[vivant] 記事の削除に失敗:", error.message);
    return NextResponse.json({ error: "削除できませんでした。" }, { status: 500 });
  }

  await deleteImage("blog", target?.cover_path);

  revalidatePublic("posts", target?.slug);
  return NextResponse.json({ ok: true });
}
