"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import styles from "../../admin.module.css";

/**
 * ギャラリー管理。追加・並び替え・公開切替・削除を1画面で行う。
 * 枚数の上限は設けていない（以前は8枠固定だった）。
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
  }
  if (lastPublishedSignature.current !== publishedSignature) {
    lastPublishedSignature.current = publishedSignature;
    setPendingPublished({});
  }

  const rows = pendingOrder ?? images;

  function publishedOf(image: GalleryRow): boolean {
    return pendingPublished[image.id] ?? image.is_published;
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

  async function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= rows.length) return;

    const next = [...rows];
    [next[index], next[target]] = [next[target], next[index]];

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
          横長（横4：縦3程度）の写真がきれいに表示されます。
        </p>
        {busy === "upload" && <p className={styles.hint}>アップロードしています…</p>}
        {message && <p className={styles.hint}>{message}</p>}
      </div>

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

            return (
              <div
                key={image.id}
                className={`${styles.galleryItem} ${
                  publishedOf(image) ? "" : styles.galleryItemHidden
                }`}
              >
                <Image
                  className={styles.galleryImg}
                  src={image.image_url}
                  alt={`店内 ${index + 1}`}
                  width={320}
                  height={240}
                  sizes="(max-width: 680px) 50vw, 320px"
                />
                <div className={styles.galleryItemBody}>
                  <div style={{ display: "flex", gap: 4 }}>
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
