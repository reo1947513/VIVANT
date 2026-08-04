/* eslint-disable @next/next/no-img-element */
"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "../../admin.module.css";

/**
 * キャスト一覧の表。並び替え・公開の切替・削除をここで行う。
 * 一覧の取得はサーバー側で済ませ、ここは受け取った内容を表示して操作を送るだけ。
 *
 * 並び替えは、行をつかんで上下に動かす方式（ドラッグ&ドロップ）。
 * 離した時点で、その週ならぬ「その一覧の並び順」を丸ごと送り直す。
 *
 * 補足：この仕組みはマウス操作向けのもので、スマートフォンの指の操作では動かない。
 * そのため画面が狭いときだけ、上下ボタンも併せて表示している。
 */
export type CastRow = {
  id: string;
  name: string;
  word: string;
  photo_url: string | null;
  sort_order: number;
  is_published: boolean;
};

export default function CastTable({ casts }: { casts: CastRow[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  // つかんでいる行の位置と、いま重なっている行の位置。
  // 位置は「見た目の変化」と「離したときの計算」の両方で使う。
  // 見た目には状態（useState）を使うが、計算には ref も併せて持つ。
  // 状態の反映は次の描画まで待たされるため、掴んですぐ離したような場合に
  // 計算側が古い値（null）を読んでしまい、並び替えが効かないことがあるため。
  const dragIndexRef = useRef<number | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  function beginDrag(index: number) {
    dragIndexRef.current = index;
    setDragIndex(index);
  }

  function endDrag() {
    dragIndexRef.current = null;
    setDragIndex(null);
    setOverIndex(null);
  }

  async function send(
    url: string,
    options: RequestInit,
    key: string
  ): Promise<boolean> {
    setError("");
    setBusy(key);
    try {
      const res = await fetch(url, options);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "操作に失敗しました。");
        return false;
      }
      router.refresh();
      return true;
    } catch {
      setError("通信に失敗しました。");
      return false;
    } finally {
      setBusy(null);
    }
  }

  /** 並び順を丸ごと送り直す（途中で番号が重複していても、この操作で整う） */
  async function saveOrder(next: CastRow[]) {
    await send(
      "/api/admin/casts/reorder",
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: next.map((c) => c.id) }),
      },
      "reorder"
    );
  }

  /** from の行を to の位置へ移した並びを返す */
  function reordered(from: number, to: number): CastRow[] {
    const next = [...casts];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    return next;
  }

  async function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= casts.length) return;
    await saveOrder(reordered(index, target));
  }

  async function onDrop(index: number) {
    const from = dragIndexRef.current;
    endDrag();
    if (from === null || from === index) return;
    await saveOrder(reordered(from, index));
  }

  async function togglePublished(cast: CastRow) {
    await send(
      `/api/admin/casts/${cast.id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: cast.name,
          word: cast.word,
          isPublished: !cast.is_published,
        }),
      },
      `toggle-${cast.id}`
    );
  }

  async function remove(cast: CastRow) {
    if (
      !confirm(
        `「${cast.name}」を削除します。写真も一緒に削除され、元に戻せません。よろしいですか？`
      )
    ) {
      return;
    }
    await send(`/api/admin/casts/${cast.id}`, { method: "DELETE" }, `del-${cast.id}`);
  }

  if (casts.length === 0) {
    return (
      <div className={styles.tableWrap}>
        <p className={styles.empty}>
          まだキャストが登録されていません。「新規追加」から登録してください。
        </p>
      </div>
    );
  }

  return (
    <>
      {error && <p className={styles.alertError}>{error}</p>}
      <p className={styles.hint} style={{ marginBottom: 10 }}>
        行の左端の印をつかんで上下に動かすと、並び順を変えられます。離した時点で保存されます。
      </p>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>順番</th>
              <th>写真</th>
              <th>源氏名</th>
              <th>一言</th>
              <th>公開</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {casts.map((cast, index) => (
              <tr
                key={cast.id}
                draggable={busy === null}
                onDragStart={() => beginDrag(index)}
                onDragEnter={() => setOverIndex(index)}
                onDragOver={(e) => e.preventDefault()}
                onDragEnd={endDrag}
                onDrop={(e) => {
                  e.preventDefault();
                  onDrop(index);
                }}
                className={[
                  dragIndex === index ? styles.rowDragging : "",
                  overIndex === index && dragIndex !== null && dragIndex !== index
                    ? styles.rowDropTarget
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <td>
                  <div className={styles.orderCell}>
                    <span className={styles.dragHandle} title="つかんで上下に動かす">
                      ⠿
                    </span>
                    <span className={styles.orderNumber}>{index + 1}</span>
                    {/* 指の操作ではつかんで動かせないため、画面が狭いときだけ出す */}
                    <span className={styles.rowMoveButtons}>
                      <button
                        className={styles.iconBtn}
                        type="button"
                        onClick={() => move(index, -1)}
                        disabled={index === 0 || busy !== null}
                        aria-label={`${cast.name}を上へ`}
                      >
                        ↑
                      </button>
                      <button
                        className={styles.iconBtn}
                        type="button"
                        onClick={() => move(index, 1)}
                        disabled={index === casts.length - 1 || busy !== null}
                        aria-label={`${cast.name}を下へ`}
                      >
                        ↓
                      </button>
                    </span>
                  </div>
                </td>
                <td>
                  {cast.photo_url ? (
                    <img className={styles.thumb} src={cast.photo_url} alt={cast.name} />
                  ) : (
                    <div className={styles.thumbEmpty}>NO IMAGE</div>
                  )}
                </td>
                <td>{cast.name}</td>
                <td>{cast.word || "—"}</td>
                <td>
                  <button
                    className={styles.iconBtn}
                    type="button"
                    onClick={() => togglePublished(cast)}
                    disabled={busy !== null}
                  >
                    <span
                      className={`${styles.badge} ${
                        cast.is_published ? styles.badgeOn : styles.badgeOff
                      }`}
                    >
                      {cast.is_published ? "公開中" : "非公開"}
                    </span>
                  </button>
                </td>
                <td>
                  <div className={styles.rowActions}>
                    <Link className={styles.iconBtn} href={`/admin/casts/${cast.id}/edit`}>
                      編集
                    </Link>
                    <button
                      className={styles.btnDanger}
                      type="button"
                      onClick={() => remove(cast)}
                      disabled={busy !== null}
                      style={{ padding: "4px 10px", fontSize: 13 }}
                    >
                      削除
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
