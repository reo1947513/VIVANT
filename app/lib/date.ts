/**
 * 日付の扱い。
 *
 * 前提となる事故：
 *   サーバーは世界標準時（UTC）で動く。日本時間との差は9時間あるため、
 *   何も指定せずに日付を扱うと、日本の夜9時が「前日の昼12時」として扱われる。
 *   出勤情報は日付そのものが意味を持つので、ここを間違えると1日ずれた表が出る。
 *   そこで日付は必ず日本時間として組み立て、"YYYY-MM-DD" の文字列で持ち回す。
 *
 * 営業日の境界：
 *   この店の営業は 20:00 〜 翌5:00。つまり深夜3時に見ている人にとっての「今日」は、
 *   暦の上では前日にあたる。素直に暦日で切ると、営業の真っ最中に「本日の出勤」が
 *   消えてしまう。そのため朝5時を境界として扱う。
 */

const TOKYO = "Asia/Tokyo";
/** 営業日が切り替わる時刻（時）。20:00〜翌5:00 営業のため、朝5時までは前日扱い */
const BUSINESS_DAY_START_HOUR = 5;

/** 日本時間での「年・月・日・時」を取り出す */
function tokyoParts(base: Date): { y: number; m: number; d: number; hour: number } {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: TOKYO,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
  });
  const parts = Object.fromEntries(
    fmt.formatToParts(base).map((p) => [p.type, p.value])
  );
  return {
    y: Number(parts.year),
    m: Number(parts.month),
    d: Number(parts.day),
    // 深夜0時は環境により "24" と返ることがあるため 24 は 0 に丸める
    hour: Number(parts.hour) % 24,
  };
}

/** "YYYY-MM-DD" 形式に整える */
function format(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

/** "YYYY-MM-DD" に日数を足す（暦日の加算。時差の影響を受けない） */
export function addDays(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  // 正午を基準にすることで、夏時間などによる境界の揺れを避ける
  const base = new Date(Date.UTC(y, m - 1, d, 12));
  base.setUTCDate(base.getUTCDate() + days);
  return format(base.getUTCFullYear(), base.getUTCMonth() + 1, base.getUTCDate());
}

/**
 * 営業日としての「今日」を "YYYY-MM-DD" で返す。
 * 日本時間の朝5時より前は、前日を返す（まだ前夜の営業中とみなす）。
 */
export function businessTodayJst(now: Date = new Date()): string {
  const { y, m, d, hour } = tokyoParts(now);
  const today = format(y, m, d);
  return hour < BUSINESS_DAY_START_HOUR ? addDays(today, -1) : today;
}

const WEEKDAY_JA = ["日", "月", "火", "水", "木", "金", "土"] as const;

/**
 * 日付と曜日を分けて返す。
 * 出勤表のように7日ぶんを横に並べる場所では、「8/7」と「金」を上下2段に置くと
 * 1列あたりの幅が半分近くまで縮み、画面に収まりやすくなる。
 */
export function formatDateParts(isoDate: string): { date: string; weekday: string } {
  const [y, m, d] = isoDate.split("-").map(Number);
  const dow = new Date(Date.UTC(y, m - 1, d, 12)).getUTCDay();
  return { date: `${m}/${d}`, weekday: WEEKDAY_JA[dow] };
}

/** 日時を日本時間で「2026年8月3日」の形にする（ブログの公開日などの表示用） */
export function formatJstDate(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: TOKYO,
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}
