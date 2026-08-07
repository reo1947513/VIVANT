import { unstable_cache } from "next/cache";
import { getPublicSupabase } from "../supabase/public";
import { hasSupabaseConfig } from "../supabase/env";
import { CACHE_TAGS } from "../revalidate";
import { businessTodayJst, addDays } from "../date";
import type { ShiftStatus } from "../types";

/**
 * 公開ページ用の出勤取得（今日から7日分）。
 *
 * 「今日」は営業日基準。営業が翌5時までなので、日本時間の朝5時より前は前日を今日とする
 * （app/lib/date.ts 参照）。素直に暦日で切ると、営業の真っ最中に本日の出勤が消える。
 *
 * 表示は「縦にキャスト・横に7日」の表なので、ここでもその形（升目）で返す。
 * 記録が無い升目は「未定」とする。休みを毎日入力させずに済ませるための既定値。
 *
 * 非公開のキャストは行ごと出さない。出勤側の is_published は、
 * 特定の日だけ伏せたいときのための仕組みで、伏せた日は「未定」として扱う。
 */
export type ShiftWeek = {
  dates: string[];
  casts: { castId: string; castName: string; statuses: ShiftStatus[] }[];
};

async function fetchWeek(startDate: string): Promise<ShiftWeek> {
  const dates = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));
  const empty: ShiftWeek = { dates, casts: [] };

  if (!hasSupabaseConfig()) {
    console.error("[vivant] Supabase 未設定のため出勤情報を空で描画します");
    return empty;
  }

  try {
    // キャストと出勤は互いに依存しないため同時に取りに行く
    const [castResult, shiftResult] = await Promise.all([
      getPublicSupabase()
        .from("casts")
        .select("id, name")
        .eq("is_published", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true }),
      getPublicSupabase()
        .from("shifts")
        .select("cast_id, work_date, status")
        .eq("is_published", true)
        .gte("work_date", dates[0])
        .lte("work_date", dates[dates.length - 1]),
    ]);

    if (castResult.error) throw new Error(castResult.error.message);
    if (shiftResult.error) throw new Error(shiftResult.error.message);

    // 「キャストID|日付」で引ける形に直しておく
    const byKey = new Map<string, ShiftStatus>();
    for (const row of shiftResult.data ?? []) {
      const status = String(row.status ?? "undecided") as ShiftStatus;
      byKey.set(`${row.cast_id}|${row.work_date}`, status);
    }

    return {
      dates,
      casts: (castResult.data ?? []).map((cast) => ({
        castId: cast.id as string,
        castName: cast.name as string,
        statuses: dates.map((date) => byKey.get(`${cast.id}|${date}`) ?? "undecided"),
      })),
    };
  } catch (e) {
    console.error("[vivant] 出勤情報の取得に失敗しました:", e);
    return empty;
  }
}

/**
 * キャッシュの鍵に日付を含めているのがポイント。
 * 日付が変われば鍵も変わるため、前日の内容が翌日に残ることがない。
 */
const cachedWeek = unstable_cache(fetchWeek, ["published-shifts"], {
  tags: [CACHE_TAGS.shifts, CACHE_TAGS.casts],
});

export async function getWeeklyShifts(): Promise<ShiftWeek> {
  return cachedWeek(businessTodayJst());
}
