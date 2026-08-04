import { formatDateLabel } from "../lib/date";
import type { ShiftsByDate } from "../lib/queries/shifts";

/**
 * SCHEDULE：今日から7日分の出勤予定。
 *
 * 日付ごとに1枚のカードを縦に並べ、その日の出勤キャストを横に並べる形にしている。
 * 表（縦にキャスト・横に7日）にすると、スマートフォンでは横スクロールが必要になり読みにくい。
 * このページの閲覧はほとんどがスマートフォンなので、縦に積む形を選んだ。
 *
 * 出勤が1件も無い日は「お休み」と明示する。空欄のままだと、
 * 「まだ入力されていない」のか「休みなのか」が伝わらない。
 */
export default function Schedule({ week }: { week: ShiftsByDate }) {
  // 1週間まったく登録が無いときは、区画ごと出さない（準備中の空表を見せない）
  const hasAny = week.some((day) => day.shifts.length > 0);
  if (!hasAny) return null;

  return (
    <section className="section section--alt" id="schedule">
      <div className="wrap">
        <div className="sec-head reveal">
          <h2>SCHEDULE</h2>
          <span className="sub">出勤情報</span>
          <span className="rule"></span>
        </div>

        <div className="schedule-list">
          {week.map((day, index) => (
            <div className="schedule-day reveal" key={day.date}>
              <div className="schedule-date">
                {formatDateLabel(day.date)}
                {index === 0 && <span className="schedule-today">本日</span>}
              </div>

              {day.shifts.length === 0 ? (
                <p className="schedule-off">お休み</p>
              ) : (
                <ul className="schedule-casts">
                  {day.shifts.map((shift) => (
                    <li className="schedule-cast" key={shift.id}>
                      <span className="schedule-name">{shift.castName}</span>
                      {(shift.startTime || shift.endTime) && (
                        <span className="schedule-time">
                          {shift.startTime ?? ""}
                          {shift.startTime && shift.endTime ? "〜" : ""}
                          {shift.endTime ?? ""}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
