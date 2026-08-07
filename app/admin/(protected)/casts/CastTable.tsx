"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "../../admin.module.css";

/**
 * キャスト一覧の表。並び替え・公開の切替・削除をここで行う。
 * 一覧の取得はサーバー側で済ませ、ここは受け取った内容を表示して操作を送るだけ。
 *
 * 並び替えは、行をつかんで上下に動かす方式（ドラッグ&ドロップ）。
 * 離した時点で、その一覧の並び順を丸ごと送り直す。
 *
 * 補足：この仕組みはマウス操作向けのもので、スマートフォンの指の操作では動かない。
 * そのため画面が狭いときだけ、上下ボタンも併せて表示している。
 *
 * まとめての操作について：
 *   左端の四角に印を付けると、選んだ分だけまとめて公開・非公開・削除ができる。
 *   1人ずつ窓口を呼ぶと人数分の往復が生じるため、専用の窓口（/api/admin/casts/bulk）へ
 *   一度に送り、本人確認1回・書き込み1回で済ませている。
 *
 * 押した瞬間の見た目について：
 *   保存の返事を待ってから表示を変えると、通信のあいだ画面が固まったように見える。
 *   そこで「押した時点の見た目」を先に反映し、通信は裏で行う（先読み表示）。
 *   失敗したら元の見た目へ戻し、これまでどおりエラー文言を出す。
 *   サーバーから新しい一覧が届いたら、先読み分は捨てて本物に置き換える。
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

  // 印を付けた行の id
  const [selected, setSelected] = useState<string[]>([]);

  // 先読み表示のための控え。サーバーの内容が変わった時点で捨てる
  const [pendingOrder, setPendingOrder] = useState<CastRow[] | null>(null);
  const [pendingPublished, setPendingPublished] = useState<Record<string, boolean>>({});

  // サーバーから届いた内容が入れ替わったかどうかを、並び順と公開状態の指紋で見分ける。
  // 描画の途中で控えを捨てるのは React が認めている書き方（派生した状態の作り直し）。
  const orderSignature = casts.map((c) => c.id).join(",");
  const publishedSignature = casts.map((c) => `${c.id}:${c.is_published}`).join(",");
  const lastOrderSignature = useRef(orderSignature);
  const lastPublishedSignature = useRef(publishedSignature);

  if (lastOrderSignature.current !== orderSignature) {
    lastOrderSignature.current = orderSignature;
    setPendingOrder(null);
    // 消えた行の印が残らないようにする
    setSelected((prev) => prev.filter((id) => casts.some((c) => c.id === id)));
  }
  if (lastPublishedSignature.current !== publishedSignature) {
    lastPublishedSignature.current = publishedSignature;
    setPendingPublished({});
  }

  // 画面に出す並び。先読み中はそちらを優先する
  const rows = pendingOrder ?? casts;
  const allSelected = rows.length > 0 && selected.length === rows.length;

  /** その行の公開状態。先読み中はそちらを優先する */
  function publishedOf(cast: CastRow): boolean {
    return pendingPublished[cast.id] ?? cast.is_published;
  }

  function toggleSelect(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function toggleSelectAll() {
    setSelected(allSelected ? [] : rows.map((c) => c.id));
  }

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

  async function send(url: string, options: RequestInit, key: string): Promise<boolean> {
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
    setPendingOrder(next);
    const ok = await send(
      "/api/admin/casts/reorder",
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: next.map((c) => c.id) }),
      },
      "reorder"
    );
    if (!ok) setPendingOrder(null);
  }

  /** from の行を to の位置へ移した並びを返す */
  function reordered(from: number, to: number): CastRow[] {
    const next = [...rows];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    return next;
  }

  async function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= rows.length) return;
    await saveOrder(reordered(index, target));
  }

  async function onDrop(index: number) {
    const from = dragIndexRef.current;
    endDrag();
    if (from === null || from === index) return;
    await saveOrder(reordered(from, index));
  }

  async function togglePublished(cast: CastRow) {
    const next = !publishedOf(cast);
    setPendingPublished((prev) => ({ ...prev, [cast.id]: next }));

    const ok = await send(
      `/api/admin/casts/${cast.id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: cast.name,
          word: cast.word,
          isPublished: next,
        }),
      },
      `toggle-${cast.id}`
    );

    // 失敗したときは先読み分を取り消し、元の表示へ戻す
    if (!ok) {
      setPendingPublished((prev) => {
        const copy = { ...prev };
        delete copy[cast.id];
        return copy;
      });
    }
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

  /** 印を付けた分をまとめて操作する */
  async function bulk(action: "publish" | "unpublish" | "delete") {
    if (selected.length === 0) return;

    const names = rows
      .filter((c) => selected.includes(c.id))
      .map((c) => c.name)
      .join("、");

    if (action === "delete") {
      if (
        !confirm(
          `${selected.length}名（${names}）を削除します。写真も一緒に削除され、元に戻せません。よろしいですか？`
        )
      ) {
        return;
      }
    } else {
      // 公開状態は押した瞬間に見た目へ反映する
      const next = action === "publish";
      setPendingPublished((prev) => {
        const copy = { ...prev };
        for (const id of selected) copy[id] = next;
        return copy;
      });
    }

    const ok = await send(
      "/api/admin/casts/bulk",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selected, action }),
      },
      "bulk"
    );

    if (ok) setSelected([]);
    else if (action !== "delete") setPendingPublished({});
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
        四角に印を付けると、まとめて公開・非公開・削除ができます。
      </p>

      {selected.length > 0 && (
        <div className={styles.bulkBar}>
          <span className={styles.bulkCount}>{selected.length}名を選択中</span>
          <button
            className={styles.btnSecondary}
            type="button"
            onClick={() => bulk("publish")}
            disabled={busy === "bulk"}
          >
            公開にする
          </button>
          <button
            className={styles.btnSecondary}
            type="button"
            onClick={() => bulk("unpublish")}
            disabled={busy === "bulk"}
          >
            非公開にする
          </button>
          <button
            className={styles.btnDanger}
            type="button"
            onClick={() => bulk("delete")}
            disabled={busy === "bulk"}
          >
            {busy === "bulk" ? "処理しています…" : "削除"}
          </button>
          <button
            className={styles.btnLinkPlain}
            type="button"
            onClick={() => setSelected([])}
            disabled={busy === "bulk"}
          >
            選択を解除
          </button>
        </div>
      )}

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.checkCol}>
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  aria-label="すべて選択"
                />
              </th>
              <th>順番</th>
              <th>写真</th>
              <th>源氏名</th>
              <th>一言</th>
              <th>公開</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((cast, index) => {
              // 押せなくするのは、その行で行っている操作の分だけにする。
              // 表全体を止めると、1件の保存のあいだ何も触れなくなり重く感じるため。
              const rowBusy = busy === `toggle-${cast.id}` || busy === `del-${cast.id}`;
              const orderBusy = busy === "reorder";
              const checked = selected.includes(cast.id);

              return (
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
                    checked ? styles.rowSelected : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <td className={styles.checkCol}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleSelect(cast.id)}
                      aria-label={`${cast.name}を選択`}
                    />
                  </td>
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
                          disabled={index === 0 || orderBusy}
                          aria-label={`${cast.name}を上へ`}
                        >
                          ↑
                        </button>
                        <button
                          className={styles.iconBtn}
                          type="button"
                          onClick={() => move(index, 1)}
                          disabled={index === rows.length - 1 || orderBusy}
                          aria-label={`${cast.name}を下へ`}
                        >
                          ↓
                        </button>
                      </span>
                    </div>
                  </td>
                  <td>
                    {cast.photo_url ? (
                      <Image
                        className={styles.thumb}
                        src={cast.photo_url}
                        alt={cast.name}
                        width={48}
                        height={64}
                        sizes="48px"
                      />
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
                      disabled={rowBusy}
                    >
                      <span
                        className={`${styles.badge} ${
                          publishedOf(cast) ? styles.badgeOn : styles.badgeOff
                        }`}
                      >
                        {publishedOf(cast) ? "公開中" : "非公開"}
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
                        disabled={rowBusy}
                        style={{ padding: "4px 10px", fontSize: 13 }}
                      >
                        {busy === `del-${cast.id}` ? "削除中…" : "削除"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
