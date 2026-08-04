import { getAdminSupabase } from "../../../lib/supabase/admin";
import { businessTodayJst, addDays, formatDateLabel } from "../../../lib/date";
import ShiftWeekGrid, { type ShiftCell, type CastRow } from "./ShiftWeekGrid";
import styles from "../../admin.module.css";

/**
 * 出勤情報の入力。今日から7日分を初期表示し、前後の週へも移動できる。
 *
 * Next.js 16 では searchParams が非同期になったため await して受け取る。
 * 「今日」は営業日基準（朝5時境界）で判定する。
 */
export const dynamic = "force-dynamic";

export default async function ShiftsPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const { week } = await searchParams;

  const today = businessTodayJst();
  // 不正な値が来ても落ちないよう、形式が合うときだけ採用する
  const weekStart = week && /^\d{4}-\d{2}-\d{2}$/.test(week) ? week : today;

  const dates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const dateLabels = dates.map(formatDateLabel);

  const supabase = getAdminSupabase();

  const [{ data: castData }, { data: shiftData }] = await Promise.all([
    supabase
      .from("casts")
      .select("id, name")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true }),
    supabase
      .from("shifts")
      .select("cast_id, work_date, start_time, end_time")
      .gte("work_date", dates[0])
      .lte("work_date", dates[dates.length - 1]),
  ]);

  const casts = (castData ?? []) as CastRow[];

  const initial: Record<string, ShiftCell> = {};
  for (const row of shiftData ?? []) {
    initial[`${row.cast_id}|${row.work_date}`] = {
      // "20:00:00" で返るため、入力欄が扱う "20:00" に詰める
      startTime: row.start_time ? String(row.start_time).slice(0, 5) : "",
      endTime: row.end_time ? String(row.end_time).slice(0, 5) : "",
    };
  }

  return (
    <>
      <h1 className={styles.pageTitle}>出勤情報</h1>
      <p className={styles.pageNote}>
        サイトには、今日から7日分が表示されます。営業が翌5時までのため、
        朝5時より前は前日を「今日」として扱います。
      </p>

      <ShiftWeekGrid
        casts={casts}
        dates={dates}
        dateLabels={dateLabels}
        initial={initial}
        weekStart={weekStart}
        prevWeek={addDays(weekStart, -7)}
        nextWeek={addDays(weekStart, 7)}
        isThisWeek={weekStart === today}
      />
    </>
  );
}
