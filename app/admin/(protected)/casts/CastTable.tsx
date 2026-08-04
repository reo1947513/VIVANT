/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "../../admin.module.css";

/**
 * キャスト一覧の表。並び替え・公開の切替・削除をここで行う。
 * 一覧の取得はサーバー側で済ませ、ここは受け取った内容を表示して操作を送るだけ。
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

  if (casts.length === 0) {
    return (
      <div className={styles.tableWrap}>
        <p className={styles.empty}>
          まだキャストが登録されていません。「新規追加」から登録してください。
        </p>
      </div>
    );
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

  /** 1つ上（-1）または下（+1）へ移動し、並び順を丸ごと送り直す */
  async function move(index: number, direction: -1 | 1) {
    const next = [...casts];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];

    await send(
      "/api/admin/casts/reorder",
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: next.map((c) => c.id) }),
      },
      `move-${casts[index].id}`
    );
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

  return (
    <>
      {error && <p className={styles.alertError}>{error}</p>}

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
              <tr key={cast.id}>
                <td>
                  <div style={{ display: "flex", gap: 4 }}>
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
