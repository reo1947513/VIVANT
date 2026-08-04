import { unstable_cache } from "next/cache";
import { getPublicSupabase } from "../supabase/public";
import { hasSupabaseConfig } from "../supabase/env";
import { CACHE_TAGS } from "../revalidate";
import { businessTodayJst, addDays } from "../date";
import type { Shift } from "../types";

/**
 * 公開ページ用の出勤取得（今日から7日分）。
 *
 * 「今日」は営業日基準。営業が翌5時までなので、日本時間の朝5時より前は前日を今日とする
 * （app/lib/date.ts 参照）。素直に暦日で切ると、営業の真っ最中に本日の出勤が消える。
 *
 * 非公開のキャストの出勤は出さない。casts との結合を内部結合（!inner）にしているのは
 * そのためで、これを外部結合にすると、非公開キャストの行が「名前なし」で残ってしまう。
 */
export type ShiftsByDate = { date: string; shifts: Shift[] }[];

async function fetchWeek(startDate: string): Promise<ShiftsByDate> {
  const dates = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));
  const empty: ShiftsByDate = dates.map((date) => ({ date, shifts: [] }));

  if (!hasSupabaseConfig()) {
    console.error("[vivant] Supabase 未設定のため出勤情報を空で描画します");
    return empty;
  }

  try {
    const { data, error } = await getPublicSupabase()
      .from("shifts")
      .select("id, cast_id, work_date, start_time, end_time, note, casts!inner(name, sort_order, is_published)")
      .eq("is_published", true)
      .eq("casts.is_published", true)
      .gte("work_date", dates[0])
      .lte("work_date", dates[dates.length - 1]);

    if (error) throw new Error(error.message);

    const byDate = new Map<string, Shift[]>(dates.map((d) => [d, []]));

    for (const row of data ?? []) {
      const cast = row.casts as unknown as { name: string; sort_order: number };
      const list = byDate.get(row.work_date as string);
      if (!list) continue;

      list.push({
        id: row.id as string,
        castId: row.cast_id as string,
        castName: cast?.name ?? "",
        workDate: row.work_date as string,
        // "20:00:00" の形で返るため、表示に使う "20:00" まで詰める
        startTime: row.start_time ? String(row.start_time).slice(0, 5) : null,
        endTime: row.end_time ? String(row.end_time).slice(0, 5) : null,
        note: (row.note ?? "") as string,
      });
    }

    // 日ごとに、キャスト一覧と同じ並び順で見せる
    const orderByCast = new Map<string, number>();
    for (const row of data ?? []) {
      const cast = row.casts as unknown as { sort_order: number };
      orderByCast.set(row.cast_id as string, cast?.sort_order ?? 0);
    }

    return dates.map((date) => ({
      date,
      shifts: (byDate.get(date) ?? []).sort(
        (a, b) => (orderByCast.get(a.castId) ?? 0) - (orderByCast.get(b.castId) ?? 0)
      ),
    }));
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
  tags: [CACHE_TAGS.shifts],
});

export async function getWeeklyShifts(): Promise<ShiftsByDate> {
  return cachedWeek(businessTodayJst());
}
