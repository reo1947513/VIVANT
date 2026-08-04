"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../../admin.module.css";

/**
 * 出勤の週表。縦にキャスト、横に7日を並べ、各升目に開始・終了の時刻を入れる。
 *
 * 時間を空にすると「その日は出勤なし」として扱う（保存時に削除される）。
 * 入力中の値はこの画面の中だけで保持し、「保存」を押したときにまとめて送る。
 * 升目ごとに毎回通信すると、入力のたびに待たされて使いにくいため。
 */
export type ShiftCell = { startTime: string; endTime: string };
export type CastRow = { id: string; name: string };

export default function ShiftWeekGrid({
  casts,
  dates,
  dateLabels,
  initial,
  weekStart,
  prevWeek,
  nextWeek,
  isThisWeek,
}: {
  casts: CastRow[];
  dates: string[];
  dateLabels: string[];
  /** "キャストID|日付" をキーにした初期値 */
  initial: Record<string, ShiftCell>;
  weekStart: string;
  prevWeek: string;
  nextWeek: string;
  isThisWeek: boolean;
}) {
  const router = useRouter();
  const [cells, setCells] = useState<Record<string, ShiftCell>>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");

  function keyOf(castId: string, date: string) {
    return `${castId}|${date}`;
  }

  function update(castId: string, date: string, field: keyof ShiftCell, value: string) {
    const key = keyOf(castId, date);
    setCells((prev) => {
      const current: ShiftCell = prev[key] ?? { startTime: "", endTime: "" };
      return { ...prev, [key]: { ...current, [field]: value } };
    });
    setSaved("");
  }

  async function save() {
    setError("");
    setSaved("");
    setSaving(true);

    // 画面に出ている升目をすべて送る（空の升目は「出勤なし」として消される）
    const entries = casts.flatMap((cast) =>
      dates.map((date) => {
        const cell = cells[keyOf(cast.id, date)] ?? { startTime: "", endTime: "" };
        return {
          castId: cast.id,
          workDate: date,
          startTime: cell.startTime ? cell.startTime : null,
          endTime: cell.endTime ? cell.endTime : null,
        };
      })
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
      setSaved(`保存しました（出勤 ${data.saved} 件）。`);
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
          onClick={() => router.push(`/admin/shifts?week=${prevWeek}`)}
        >
          ← 前の週
        </button>
        <span className={styles.weekLabel}>
          {dateLabels[0]} 〜 {dateLabels[dateLabels.length - 1]}
          {isThisWeek && "（今週）"}
        </span>
        <button
          className={styles.btnSecondary}
          type="button"
          onClick={() => router.push(`/admin/shifts?week=${nextWeek}`)}
        >
          次の週 →
        </button>
        {!isThisWeek && (
          <button
            className={styles.btnSecondary}
            type="button"
            onClick={() => router.push("/admin/shifts")}
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
              {dateLabels.map((label, i) => (
                <th key={dates[i]}>{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {casts.map((cast) => (
              <tr key={cast.id}>
                <td className={styles.castCol}>{cast.name}</td>
                {dates.map((date) => {
                  const cell = cells[keyOf(cast.id, date)] ?? {
                    startTime: "",
                    endTime: "",
                  };
                  return (
                    <td key={date}>
                      <div className={styles.timeCell}>
                        <input
                          className={styles.timeInput}
                          type="time"
                          value={cell.startTime}
                          onChange={(e) =>
                            update(cast.id, date, "startTime", e.target.value)
                          }
                          aria-label={`${cast.name} ${date} 開始`}
                        />
                        <span className={styles.timeSep}>〜</span>
                        <input
                          className={styles.timeInput}
                          type="time"
                          value={cell.endTime}
                          onChange={(e) =>
                            update(cast.id, date, "endTime", e.target.value)
                          }
                          aria-label={`${cast.name} ${date} 終了`}
                        />
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
        時間を空にすると、その日は出勤なしとして扱われます（保存時に消えます）。
        週の開始日：{weekStart}
      </p>
    </>
  );
}
