/* eslint-disable @next/next/no-img-element */
"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../../admin.module.css";

/**
 * ギャラリー管理。追加・並び替え・公開切替・削除を1画面で行う。
 * 枚数の上限は設けていない（以前は8枠固定だった）。
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
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function send(url: string, options: RequestInit): Promise<boolean> {
    setError("");
    setBusy(true);
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
      setBusy(false);
    }
  }

  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const form = new FormData();
    for (const file of Array.from(files)) form.append("images", file);

    setError("");
    setMessage("");
    setBusy(true);
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
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function move(index: number, direction: -1 | 1) {
    const next = [...images];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];

    await send("/api/admin/gallery/reorder", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: next.map((i) => i.id) }),
    });
  }

  async function togglePublished(image: GalleryRow) {
    await send(`/api/admin/gallery/${image.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !image.is_published }),
    });
  }

  async function remove(image: GalleryRow, index: number) {
    if (!confirm(`${index + 1}枚目の写真を削除します。元に戻せません。よろしいですか？`)) {
      return;
    }
    await send(`/api/admin/gallery/${image.id}`, { method: "DELETE" });
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
          disabled={busy}
        />
        <p className={styles.hint}>
          JPEG・PNG・WebP、1枚5MBまで。一度に20枚まで選べます。追加した写真は末尾に並びます。
          横長（横4：縦3程度）の写真がきれいに表示されます。
        </p>
        {message && <p className={styles.hint}>{message}</p>}
      </div>

      {images.length === 0 ? (
        <div className={styles.tableWrap}>
          <p className={styles.empty}>
            まだ写真がありません。写真を追加するまで、サイトのギャラリーは表示されません。
          </p>
        </div>
      ) : (
        <div className={styles.galleryGrid}>
          {images.map((image, index) => (
            <div
              key={image.id}
              className={`${styles.galleryItem} ${
                image.is_published ? "" : styles.galleryItemHidden
              }`}
            >
              <img
                className={styles.galleryImg}
                src={image.image_url}
                alt={`店内 ${index + 1}`}
              />
              <div className={styles.galleryItemBody}>
                <div style={{ display: "flex", gap: 4 }}>
                  <button
                    className={styles.iconBtn}
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={index === 0 || busy}
                    aria-label="前へ"
                  >
                    ←
                  </button>
                  <button
                    className={styles.iconBtn}
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={index === images.length - 1 || busy}
                    aria-label="後ろへ"
                  >
                    →
                  </button>
                </div>
                <button
                  className={styles.iconBtn}
                  type="button"
                  onClick={() => togglePublished(image)}
                  disabled={busy}
                >
                  <span
                    className={`${styles.badge} ${
                      image.is_published ? styles.badgeOn : styles.badgeOff
                    }`}
                  >
                    {image.is_published ? "公開中" : "非公開"}
                  </span>
                </button>
                <button
                  className={styles.btnDanger}
                  type="button"
                  onClick={() => remove(image, index)}
                  disabled={busy}
                  style={{ padding: "4px 10px", fontSize: 13 }}
                >
                  削除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
