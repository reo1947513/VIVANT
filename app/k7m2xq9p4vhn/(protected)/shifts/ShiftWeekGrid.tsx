"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../../admin.module.css";
import type { ShiftStatus } from "../../../lib/types";
import { adminPath } from "../../../lib/adminPath";

/**
 * 出勤の週表。縦にキャスト、横に7日を並べ、各升目で ○ △ ✕ を選ぶ。
 *
 *   ○ 出勤 / △ 未定 / ✕ 休み
 *
 * 何も選んでいない升目は「未定」として扱う。休みの日を毎回選ばずに済むよう、
 * 出勤する日と休む日だけ触れば足りる形にしている。
 *
 * 選んだ内容はこの画面の中だけで保持し、「保存」を押したときにまとめて送る。
 * 升目ごとに毎回通信すると、選ぶたびに待たされて使いにくいため。
 */
export type CastRow = { id: string; name: string };

const CHOICES: { status: ShiftStatus; mark: string; label: string }[] = [
  { status: "work", mark: "○", label: "出勤" },
  { status: "undecided", mark: "△", label: "未定" },
  { status: "off", mark: "✕", label: "休み" },
];

export default function ShiftWeekGrid({
  casts,
  dates,
  dateParts,
  initial,
  weekStart,
  prevWeek,
  nextWeek,
  isThisWeek,
}: {
  casts: CastRow[];
  dates: string[];
  /** 見出し用。「8/7」と「金」に分けて受け取る（狭い画面で2段に置くため） */
  dateParts: { date: string; weekday: string }[];
  /** "キャストID|日付" をキーにした初期値 */
  initial: Record<string, ShiftStatus>;
  weekStart: string;
  prevWeek: string;
  nextWeek: string;
  isThisWeek: boolean;
}) {
  const router = useRouter();
  const [cells, setCells] = useState<Record<string, ShiftStatus>>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");

  function keyOf(castId: string, date: string) {
    return `${castId}|${date}`;
  }

  function statusOf(castId: string, date: string): ShiftStatus {
    return cells[keyOf(castId, date)] ?? "undecided";
  }

  function choose(castId: string, date: string, status: ShiftStatus) {
    setCells((prev) => ({ ...prev, [keyOf(castId, date)]: status }));
    setSaved("");
  }

  async function save() {
    setError("");
    setSaved("");
    setSaving(true);

    // 画面に出ている升目をすべて送り、その週の状態を丸ごと合わせる。
    // 差分だけを送ると、消したはずの内容が残る事故が起きやすい。
    const entries = casts.flatMap((cast) =>
      dates.map((date) => ({
        castId: cast.id,
        workDate: date,
        status: statusOf(cast.id, date),
      }))
    );

    try {
      const res = await fetch("/api/admin/shifts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "保存できませんでした。");
        return;
      }
      setSaved(`保存しました（出勤 ${data.work} 日・休み ${data.off} 日）。`);
      router.refresh();
    } catch {
      setError("通信に失敗しました。");
    } finally {
      setSaving(false);
    }
  }

  if (casts.length === 0) {
    return (
      <div className={styles.tableWrap}>
        <p className={styles.empty}>
          先にキャストを登録してください。出勤情報はキャストごとに入力します。
        </p>
      </div>
    );
  }

  return (
    <>
      {error && <p className={styles.alertError}>{error}</p>}

      <div className={styles.weekNav}>
        <button
          className={styles.btnSecondary}
          type="button"
          onClick={() => router.push(adminPath(`shifts?week=${prevWeek}`))}
        >
          ← 前の週
        </button>
        <span className={styles.weekLabel}>
          {/* 週の範囲はここでだけ「8/7(金)」の形に組み直して出す */}
          {`${dateParts[0].date}(${dateParts[0].weekday})`} 〜{" "}
          {`${dateParts[dateParts.length - 1].date}(${
            dateParts[dateParts.length - 1].weekday
          })`}
          {isThisWeek && "（今週）"}
        </span>
        <button
          className={styles.btnSecondary}
          type="button"
          onClick={() => router.push(adminPath(`shifts?week=${nextWeek}`))}
        >
          次の週 →
        </button>
        {!isThisWeek && (
          <button
            className={styles.btnSecondary}
            type="button"
            onClick={() => router.push(adminPath("shifts"))}
          >
            今週へ戻る
          </button>
        )}
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.shiftTable}>
          <thead>
            <tr>
              <th className={styles.castCol}>キャスト</th>
              {dateParts.map((part, i) => (
                <th key={dates[i]}>
                  {/* 日付と曜日を上下2段に置く。1列あたりの幅が半分近くまで縮む */}
                  <span className={styles.dateNum}>{part.date}</span>
                  <span className={styles.dateDow}>{part.weekday}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {casts.map((cast) => (
              <tr key={cast.id}>
                <td className={styles.castCol}>{cast.name}</td>
                {dates.map((date) => {
                  const current = statusOf(cast.id, date);
                  return (
                    <td key={date}>
                      <div className={styles.markCell} role="group" aria-label={`${cast.name} ${date}`}>
                        {CHOICES.map((choice) => (
                          <button
                            key={choice.status}
                            type="button"
                            className={`${styles.markBtn} ${
                              current === choice.status ? styles.markBtnOn : ""
                            }`}
                            onClick={() => choose(cast.id, date, choice.status)}
                            aria-pressed={current === choice.status}
                            title={choice.label}
                          >
                            {choice.mark}
                          </button>
                        ))}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.saveBar}>
        <button className={styles.btnPrimary} type="button" onClick={save} disabled={saving}>
          {saving ? "保存しています…" : "この週を保存"}
        </button>
        {saved && <span className={styles.savedNote}>{saved}</span>}
      </div>

      <p className={styles.hint}>
        ○が出勤、△が未定、✕が休みです。何も選んでいない升目は未定として扱われます。
        週の開始日：{weekStart}
      </p>
    </>
  );
}
