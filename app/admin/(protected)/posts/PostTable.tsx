"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "../../admin.module.css";

/** 記事一覧の表。公開切替と削除をここで行う */
export type PostRow = {
  id: string;
  slug: string;
  title: string;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
};

export default function PostTable({ posts }: { posts: PostRow[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  if (posts.length === 0) {
    return (
      <div className={styles.tableWrap}>
        <p className={styles.empty}>
          まだ記事がありません。「新規作成」から書き始めてください。
        </p>
      </div>
    );
  }

  async function remove(post: PostRow) {
    if (!confirm(`「${post.title}」を削除します。元に戻せません。よろしいですか？`)) return;

    setError("");
    setBusy(post.id);
    try {
      const res = await fetch(`/api/admin/posts/${post.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "削除できませんでした。");
        return;
      }
      router.refresh();
    } catch {
      setError("通信に失敗しました。");
    } finally {
      setBusy(null);
    }
  }

  /** 日付は日本時間で表示する（サーバーは世界標準時で動くため指定が要る） */
  function formatDate(value: string) {
    return new Intl.DateTimeFormat("ja-JP", {
      timeZone: "Asia/Tokyo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(value));
  }

  return (
    <>
      {error && <p className={styles.alertError}>{error}</p>}

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>題名</th>
              <th>URL名</th>
              <th>状態</th>
              <th>公開日</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id}>
                <td>{post.title}</td>
                <td style={{ color: "#6b7280", fontSize: 13 }}>/blog/{post.slug}</td>
                <td>
                  <span
                    className={`${styles.badge} ${
                      post.is_published ? styles.badgeOn : styles.badgeOff
                    }`}
                  >
                    {post.is_published ? "公開中" : "下書き"}
                  </span>
                </td>
                <td style={{ fontSize: 13, color: "#6b7280" }}>
                  {post.published_at ? formatDate(post.published_at) : "—"}
                </td>
                <td>
                  <div className={styles.rowActions}>
                    <Link className={styles.iconBtn} href={`/admin/posts/${post.id}/edit`}>
                      編集
                    </Link>
                    <button
                      className={styles.btnDanger}
                      type="button"
                      onClick={() => remove(post)}
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
