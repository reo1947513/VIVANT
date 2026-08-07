import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "../../../lib/auth";
import { getAdminSupabase } from "../../../lib/supabase/admin";
import { revalidatePublic } from "../../../lib/revalidate";

/**
 * SNSリンクの保存。画面に出ている行をまとめて受け取り、1回で書き込む。
 *
 * URL の形式はここで確かめる。打ち間違いをそのまま保存すると、
 * 公開ページに押しても開かないボタンが出てしまうため。
 * 空欄は「まだ用意していない」の意味で許し、その行は公開ページに出さない。
 */
const entrySchema = z.object({
  platform: z.string().min(1).max(30),
  label: z.string().trim().max(30),
  url: z
    .string()
    .trim()
    .max(300)
    .refine(
      (v) => v === "" || /^https:\/\/[^\s]+$/.test(v),
      "URLは https:// から始まる形で入力してください。"
    ),
  isPublished: z.boolean(),
});

const schema = z.object({
  entries: z.array(entrySchema).min(1).max(20),
});

export async function PUT(request: Request) {
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

  const { error } = await getAdminSupabase()
    .from("site_links")
    .upsert(
      parsed.data.entries.map((e) => ({
        platform: e.platform,
        label: e.label,
        url: e.url,
        is_published: e.isPublished,
      })),
      { onConflict: "platform" }
    );

  if (error) {
    console.error("[vivant] SNSリンクの保存に失敗:", error.message);
    return NextResponse.json({ error: "保存できませんでした。" }, { status: 500 });
  }

  revalidatePublic("links");
  const shown = parsed.data.entries.filter((e) => e.isPublished && e.url !== "").length;
  return NextResponse.json({ saved: parsed.data.entries.length, shown });
}
