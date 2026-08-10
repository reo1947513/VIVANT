"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import styles from "../../admin.module.css";

/**
 * ギャラリー管理。追加・並び替え・公開切替・削除を1画面で行う。
 * 枚数の上限は設けていない（以前は8枠固定だった）。
 *
 * 並び替えは、写真をつかんで動かす方式（ドラッグ&ドロップ）。離した時点で保存する。
 * この仕組みはマウス操作向けで、スマートフォンの指の操作では動かないため、
 * 画面が狭いときと指操作の環境でのみ、左右の矢印ボタンも併せて表示する。
 *
 * まとめての操作について：
 *   写真の左上の四角に印を付けると、選んだ分だけまとめて公開・非公開・削除ができる。
 *   1枚ずつ窓口を呼ぶと枚数分の往復が生じるため、専用の窓口（/api/admin/gallery/bulk）へ
 *   一度に送り、本人確認1回・書き込み1回で済ませている。
 *
 * 押した瞬間の見た目について：
 *   保存の返事を待ってから表示を変えると、通信のあいだ画面が固まったように見える。
 *   そこで並び順と公開状態は「押した時点の見た目」を先に反映し、通信は裏で行う。
 *   失敗したら元へ戻し、これまでどおりエラー文言を出す。
 *   サーバーから新しい一覧が届いたら、先読み分は捨てて本物に置き換える。
 */
export type GalleryRow = {
  id: string;
  image_url: string;
  sort_order: number;
  is_published: boolean;
};

export default function GalleryManager({ images }: { images: GalleryRow[] }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  // busy は「いま何を処理中か」を表す合言葉。null なら何もしていない
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // 印を付けた写真の id
  const [selected, setSelected] = useState<string[]>([]);

  // 先読み表示のための控え
  const [pendingOrder, setPendingOrder] = useState<GalleryRow[] | null>(null);
  const [pendingPublished, setPendingPublished] = useState<Record<string, boolean>>({});

  // サーバーから届いた内容が入れ替わったら、控えを捨てて本物に合わせる
  const orderSignature = images.map((i) => i.id).join(",");
  const publishedSignature = images.map((i) => `${i.id}:${i.is_published}`).join(",");
  const lastOrderSignature = useRef(orderSignature);
  const lastPublishedSignature = useRef(publishedSignature);

  if (lastOrderSignature.current !== orderSignature) {
    lastOrderSignature.current = orderSignature;
    setPendingOrder(null);
    // 消えた写真の印が残らないようにする
    setSelected((prev) => prev.filter((id) => images.some((i) => i.id === id)));
  }
  if (lastPublishedSignature.current !== publishedSignature) {
    lastPublishedSignature.current = publishedSignature;
    setPendingPublished({});
  }

  const rows = pendingOrder ?? images;
  const allSelected = rows.length > 0 && selected.length === rows.length;

  function publishedOf(image: GalleryRow): boolean {
    return pendingPublished[image.id] ?? image.is_published;
  }

  function toggleSelect(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  // つかんでいる写真の位置と、いま重なっている写真の位置。
  // 状態の反映は次の描画まで待たされるため、計算用に ref も併せて持つ
  // （つかんですぐ離した場合に古い値を読んで並び替えが効かないことがあるため）。
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

  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const form = new FormData();
    for (const file of Array.from(files)) form.append("images", file);

    setError("");
    setMessage("");
    setBusy("upload");
    try {
      const res = await fetch("/api/admin/gallery", { method: "POST", body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "アップロードできませんでした。");
        return;
      }
      setMessage(
        data.failed > 0
          ? `${data.uploaded}枚を追加しました（${data.failed}枚は失敗しました）。`
          : `${data.uploaded}枚を追加しました。`
      );
      router.refresh();
    } catch {
      setError("通信に失敗しました。");
    } finally {
      setBusy(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  /** 並び順を丸ごと送り直す */
  async function saveOrder(next: GalleryRow[]) {
    setPendingOrder(next);
    const ok = await send(
      "/api/admin/gallery/reorder",
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: next.map((i) => i.id) }),
      },
      "reorder"
    );
    if (!ok) setPendingOrder(null);
  }

  /** from の写真を to の位置へ移した並びを返す */
  function reordered(from: number, to: number): GalleryRow[] {
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

  async function togglePublished(image: GalleryRow) {
    const next = !publishedOf(image);
    setPendingPublished((prev) => ({ ...prev, [image.id]: next }));

    const ok = await send(
      `/api/admin/gallery/${image.id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: next }),
      },
      `toggle-${image.id}`
    );

    if (!ok) {
      setPendingPublished((prev) => {
        const copy = { ...prev };
        delete copy[image.id];
        return copy;
      });
    }
  }

  async function remove(image: GalleryRow, index: number) {
    if (!confirm(`${index + 1}枚目の写真を削除します。元に戻せません。よろしいですか？`)) {
      return;
    }
    await send(`/api/admin/gallery/${image.id}`, { method: "DELETE" }, `del-${image.id}`);
  }

  /** 印を付けた分をまとめて操作する */
  async function bulk(action: "publish" | "unpublish" | "delete") {
    if (selected.length === 0) return;

    if (action === "delete") {
      if (!confirm(`${selected.length}枚を削除します。元に戻せません。よろしいですか？`)) {
        return;
      }
    } else {
      const next = action === "publish";
      setPendingPublished((prev) => {
        const copy = { ...prev };
        for (const id of selected) copy[id] = next;
        return copy;
      });
    }

    const ok = await send(
      "/api/admin/gallery/bulk",
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

  return (
    <>
      {error && <p className={styles.alertError}>{error}</p>}

      <div className={styles.uploadBox}>
        <span className={styles.label}>写真を追加</span>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={upload}
          disabled={busy === "upload"}
        />
        <p className={styles.hint}>
          JPEG・PNG・WebP、1枚5MBまで。一度に20枚まで選べます。追加した写真は末尾に並びます。
          写真をつかんで動かすと並び替えでき、離した時点で保存されます。
        </p>
        {busy === "upload" && <p className={styles.hint}>アップロードしています…</p>}
        {message && <p className={styles.hint}>{message}</p>}
      </div>

      {rows.length > 0 && (
        <div className={styles.bulkBar}>
          <label className={styles.bulkCheckLabel}>
            <input
              type="checkbox"
              checked={allSelected}
              onChange={() => setSelected(allSelected ? [] : rows.map((i) => i.id))}
              aria-label="すべて選択"
            />
            すべて選択
          </label>
          {selected.length > 0 && (
            <>
              <span className={styles.bulkCount}>{selected.length}枚を選択中</span>
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
            </>
          )}
        </div>
      )}

      {rows.length === 0 ? (
        <div className={styles.tableWrap}>
          <p className={styles.empty}>
            まだ写真がありません。写真を追加するまで、サイトのギャラリーは表示されません。
          </p>
        </div>
      ) : (
        <div className={styles.galleryGrid}>
          {rows.map((image, index) => {
            // 押せなくするのは、その写真で行っている操作の分だけにする
            const itemBusy = busy === `toggle-${image.id}` || busy === `del-${image.id}`;
            const orderBusy = busy === "reorder";
            const checked = selected.includes(image.id);

            return (
              <div
                key={image.id}
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
                  styles.galleryItem,
                  publishedOf(image) ? "" : styles.galleryItemHidden,
                  dragIndex === index ? styles.rowDragging : "",
                  overIndex === index && dragIndex !== null && dragIndex !== index
                    ? styles.itemDropTarget
                    : "",
                  checked ? styles.itemSelected : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <div className={styles.galleryPick}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleSelect(image.id)}
                    aria-label={`${index + 1}枚目を選択`}
                  />
                  <span className={styles.dragHandle} title="つかんで動かす">
                    ⠿
                  </span>
                  <span className={styles.orderNumber}>{index + 1}</span>
                </div>

                <Image
                  className={styles.galleryImg}
                  src={image.image_url}
                  alt={`店内 ${index + 1}`}
                  width={320}
                  height={240}
                  sizes="(max-width: 680px) 50vw, 320px"
                />

                <div className={styles.galleryItemBody}>
                  {/* つかんで動かせない環境（スマートフォン等）向けの左右ボタン */}
                  <div className={styles.rowMoveButtons}>
                    <button
                      className={styles.iconBtn}
                      type="button"
                      onClick={() => move(index, -1)}
                      disabled={index === 0 || orderBusy}
                      aria-label="前へ"
                    >
                      ←
                    </button>
                    <button
                      className={styles.iconBtn}
                      type="button"
                      onClick={() => move(index, 1)}
                      disabled={index === rows.length - 1 || orderBusy}
                      aria-label="後ろへ"
                    >
                      →
                    </button>
                  </div>
                  <button
                    className={styles.iconBtn}
                    type="button"
                    onClick={() => togglePublished(image)}
                    disabled={itemBusy}
                  >
                    <span
                      className={`${styles.badge} ${
                        publishedOf(image) ? styles.badgeOn : styles.badgeOff
                      }`}
                    >
                      {publishedOf(image) ? "公開中" : "非公開"}
                    </span>
                  </button>
                  <button
                    className={styles.btnDanger}
                    type="button"
                    onClick={() => remove(image, index)}
                    disabled={itemBusy}
                    style={{ padding: "4px 10px", fontSize: 13 }}
                  >
                    {busy === `del-${image.id}` ? "削除中…" : "削除"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
