import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "../../../lib/auth";
import { getAdminSupabase } from "../../../lib/supabase/admin";
import { revalidatePublic } from "../../../lib/revalidate";

/**
 * 出勤情報の一括保存。
 *
 * 画面からは「その週に表示していた升目すべて」が送られてくる。
 * 時間が入っている升目は登録・更新し、空の升目は削除する。
 * 差分だけを送る方式にすると、消したはずの出勤が残る事故が起きやすいため、
 * 週ごと丸ごと送って状態を合わせる方式にしている。
 *
 * 日付は "YYYY-MM-DD"、時刻は "HH:MM" の文字列で受け取る。
 * 日付を日時（タイムゾーン付き）にしないのは、9時間ずれる事故を避けるため。
 */
const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

const entrySchema = z.object({
  castId: z.uuid(),
  workDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "日付の形式が不正です。"),
  startTime: z.string().regex(timePattern, "時刻は 20:00 の形式で入力してください。").nullable(),
  endTime: z.string().regex(timePattern, "時刻は 20:00 の形式で入力してください。").nullable(),
});

const schema = z.object({
  entries: z.array(entrySchema).max(500, "一度に保存できる量を超えています。"),
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

  const supabase = getAdminSupabase();

  // 時間が1つでも入っていれば「出勤」とみなす。両方空なら「出勤なし」として消す
  const toSave = parsed.data.entries.filter((e) => e.startTime || e.endTime);
  const toDelete = parsed.data.entries.filter((e) => !e.startTime && !e.endTime);

  if (toSave.length > 0) {
    const { error } = await supabase.from("shifts").upsert(
      toSave.map((e) => ({
        cast_id: e.castId,
        work_date: e.workDate,
        start_time: e.startTime,
        end_time: e.endTime,
        is_published: true,
      })),
      { onConflict: "cast_id,work_date" }
    );

    if (error) {
      console.error("[vivant] 出勤の保存に失敗:", error.message);
      return NextResponse.json({ error: "保存できませんでした。" }, { status: 500 });
    }
  }

  for (const entry of toDelete) {
    const { error } = await supabase
      .from("shifts")
      .delete()
      .eq("cast_id", entry.castId)
      .eq("work_date", entry.workDate);

    if (error) {
      console.error("[vivant] 出勤の削除に失敗:", error.message);
      return NextResponse.json({ error: "保存できませんでした。" }, { status: 500 });
    }
  }

  revalidatePublic("shifts");
  return NextResponse.json({ saved: toSave.length, cleared: toDelete.length });
}
