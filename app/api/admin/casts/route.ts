import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "../../../lib/auth";
import { getAdminSupabase } from "../../../lib/supabase/admin";
import { revalidatePublic } from "../../../lib/revalidate";

/**
 * キャストの一覧取得と新規追加。
 *
 * どの処理も次の順で書く：
 *   1. 管理者か確認（していなければ 401）
 *   2. 入力を検証（不正なら 422）
 *   3. データベースを操作（失敗なら 500）
 *   4. 公開ページの作り直しを指示  ← これを忘れると「保存したのにサイトに出ない」
 */
const createSchema = z.object({
  name: z.string().trim().min(1, "源氏名を入力してください。").max(30, "源氏名は30文字までです。"),
  word: z.string().trim().max(60, "一言は60文字までです。").default(""),
  isPublished: z.boolean().default(true),
});

/** 一覧。非公開のキャストも含めて表示順に返す（管理画面用） */
export async function GET() {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const { data, error } = await getAdminSupabase()
    .from("casts")
    .select("id, name, word, photo_url, sort_order, is_published")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[vivant] キャスト一覧の取得に失敗:", error.message);
    return NextResponse.json({ error: "一覧を取得できませんでした。" }, { status: 500 });
  }

  return NextResponse.json({ casts: data ?? [] });
}

/** 新規追加。表示順は末尾に付ける */
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

  const supabase = getAdminSupabase();

  // 末尾に置くため、現在の最大の表示順を調べる
  const { data: last } = await supabase
    .from("casts")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data, error } = await supabase
    .from("casts")
    .insert({
      name: parsed.data.name,
      word: parsed.data.word,
      is_published: parsed.data.isPublished,
      sort_order: (last?.sort_order ?? 0) + 1,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[vivant] キャストの追加に失敗:", error.message);
    return NextResponse.json({ error: "追加できませんでした。" }, { status: 500 });
  }

  revalidatePublic("casts");
  return NextResponse.json({ id: data.id }, { status: 201 });
}
