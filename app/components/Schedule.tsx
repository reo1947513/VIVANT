import { formatDateLabel } from "../lib/date";
import type { ShiftWeek } from "../lib/queries/shifts";
import type { ShiftStatus } from "../lib/types";

/**
 * SCHEDULE：今日から7日分の出勤予定。
 *
 * 縦にキャスト、横に7日を並べた表で、各升目に ○（出勤）△（未定）✕（休み）を出す。
 * 休みの人も行に残るため、週全体の予定が一目で分かる。
 *
 * スマートフォンでは7列が画面に収まらないため、表だけを横にずらせるようにし、
 * 名前の列は左端に固定して、どの行を見ているか分からなくならないようにしている。
 *
 * 全員が全日「未定」のときは区画ごと出さない。まだ何も入力されていない状態で
 * △ が並ぶ表を見せても、来店の判断材料にならないため。
 */
const MARKS: Record<ShiftStatus, string> = {
  work: "○",
  undecided: "△",
  off: "✕",
};

const MARK_LABELS: Record<ShiftStatus, string> = {
  work: "出勤",
  undecided: "未定",
  off: "休み",
};

export default function Schedule({ week }: { week: ShiftWeek }) {
  if (week.casts.length === 0) return null;

  const hasAnyDecided = week.casts.some((cast) =>
    cast.statuses.some((status) => status !== "undecided")
  );
  if (!hasAnyDecided) return null;

  return (
    <section className="section section--alt" id="schedule">
      <div className="wrap">
        <div className="sec-head reveal">
          <h2>SCHEDULE</h2>
          <span className="sub">出勤情報</span>
          <span className="rule"></span>
        </div>

        <div className="schedule-legend reveal">
          <span>○ 出勤</span>
          <span>△ 未定</span>
          <span>✕ 休み</span>
        </div>

        <div className="schedule-scroll reveal">
          <table className="schedule-table">
            <thead>
              <tr>
                <th className="schedule-castcol" scope="col">
                  キャスト
                </th>
                {week.dates.map((date, index) => (
                  <th key={date} scope="col">
                    {formatDateLabel(date)}
                    {index === 0 && <span className="schedule-today">本日</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {week.casts.map((cast) => (
                <tr key={cast.castId}>
                  <th className="schedule-castcol" scope="row">
                    {cast.castName}
                  </th>
                  {cast.statuses.map((status, index) => (
                    <td key={week.dates[index]} className={`schedule-mark schedule-mark--${status}`}>
                      <span aria-hidden="true">{MARKS[status]}</span>
                      {/* 読み上げでは記号だけだと伝わらないため、言葉も持たせる */}
                      <span className="sr-only">{MARK_LABELS[status]}</span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
