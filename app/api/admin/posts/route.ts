import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "../../../lib/auth";
import { getAdminSupabase } from "../../../lib/supabase/admin";
import { revalidatePublic } from "../../../lib/revalidate";

/**
 * 記事の一覧取得と新規作成。
 *
 * URL名（slug）は住所の一部になるため、小文字英数字とハイフンだけに制限する。
 * データベース側にも同じ制限を掛けてあるが、ここで先に弾いて分かりやすい文言を返す。
 */
export const slugSchema = z
  .string()
  .trim()
  .min(1, "URL名を入力してください。")
  .max(80, "URL名は80文字までです。")
  .regex(
    /^[a-z0-9]+(-[a-z0-9]+)*$/,
    "URL名は小文字の英数字とハイフンだけで入力してください（例：summer-campaign）。"
  );

const createSchema = z.object({
  slug: slugSchema,
  title: z.string().trim().min(1, "題名を入力してください。").max(120, "題名は120文字までです。"),
  excerpt: z.string().trim().max(200, "紹介文は200文字までです。").default(""),
  body: z.string().max(20000, "本文が長すぎます。").default(""),
  isPublished: z.boolean().default(false),
});

export async function GET() {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const { data, error } = await getAdminSupabase()
    .from("posts")
    .select("id, slug, title, is_published, published_at, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[vivant] 記事一覧の取得に失敗:", error.message);
    return NextResponse.json({ error: "一覧を取得できませんでした。" }, { status: 500 });
  }

  return NextResponse.json({ posts: data ?? [] });
}

export async function POST(request: Request) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "入力を読み取れませんでした。" }, { status: 400 });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "入力に誤りがあります。" },
      { status: 422 }
    );
  }

  const { data, error } = await getAdminSupabase()
    .from("posts")
    .insert({
      slug: parsed.data.slug,
      title: parsed.data.title,
      excerpt: parsed.data.excerpt,
      body: parsed.data.body,
      is_published: parsed.data.isPublished,
      // 公開して保存したときだけ日付を入れる。あとで公開に切り替えたときも同様に入れる
      published_at: parsed.data.isPublished ? new Date().toISOString() : null,
    })
    .select("id")
    .single();

  if (error) {
    // 同じURL名が既にある場合（一意制約）は、原因が分かる文言で返す
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "そのURL名は既に使われています。別の名前にしてください。" },
        { status: 422 }
      );
    }
    console.error("[vivant] 記事の作成に失敗:", error.message);
    return NextResponse.json({ error: "作成できませんでした。" }, { status: 500 });
  }

  revalidatePublic("posts", parsed.data.slug);
  return NextResponse.json({ id: data.id }, { status: 201 });
}
