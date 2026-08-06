/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../../admin.module.css";

/**
 * 記事の作成・編集フォーム。
 *
 * 本文はプレーンテキストとして保存し、表示側では改行だけを反映する。
 * HTML として解釈させないので、本文にタグを書いてもそのまま文字として出る。
 * 見出しや太字を使いたくなった場合は、別途その仕組みを足す必要がある。
 */
export type PostFormValues = {
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  isPublished: boolean;
  coverUrl: string | null;
};

export default function PostForm({ initial }: { initial: PostFormValues }) {
  const router = useRouter();
  const isEdit = Boolean(initial.id);

  const [slug, setSlug] = useState(initial.slug);
  const [title, setTitle] = useState(initial.title);
  // URL名を自分で書き換えたかどうか。書き換えた後は題名に追従させない
  const [slugTouched, setSlugTouched] = useState(Boolean(initial.slug));

  /**
   * 題名からURL名を作る。
   * 英数字が含まれていればそれを使い（例：Summer Campaign → summer-campaign）、
   * 日本語だけの題名では作れないため、日付と時刻から作る（例：20260806-1932）。
   * 住所は後から変えると以前の住所で開けなくなるため、記事を新しく作るときだけ働く。
   */
  function makeSlug(source: string): string {
    const fromTitle = source
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60)
      .replace(/-+$/g, "");

    if (fromTitle.length >= 3) return fromTitle;

    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return [
      now.getFullYear(),
      pad(now.getMonth() + 1),
      pad(now.getDate()),
      "-",
      pad(now.getHours()),
      pad(now.getMinutes()),
    ].join("");
  }

  /** 題名の入力。新規作成でURL名に手を入れていない間は、URL名も一緒に決める */
  function changeTitle(value: string) {
    setTitle(value);
    if (!isEdit && !slugTouched) setSlug(makeSlug(value));
  }
  const [excerpt, setExcerpt] = useState(initial.excerpt);
  const [body, setBody] = useState(initial.body);
  const [isPublished, setIsPublished] = useState(initial.isPublished);
  const [coverUrl, setCoverUrl] = useState(initial.coverUrl);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function uploadCover(postId: string): Promise<boolean> {
    if (!file) return true;
    const form = new FormData();
    form.append("cover", file);
    const res = await fetch(`/api/admin/posts/${postId}/cover`, {
      method: "POST",
      body: form,
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "カバー画像を保存できませんでした。");
      return false;
    }
    return true;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const payload = { slug, title, excerpt, body, isPublished };

      if (isEdit) {
        const res = await fetch(`/api/admin/posts/${initial.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.error ?? "保存できませんでした。");
          setSaving(false);
          return;
        }
        if (!(await uploadCover(initial.id!))) {
          setSaving(false);
          return;
        }
      } else {
        const res = await fetch("/api/admin/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data.error ?? "作成できませんでした。");
          setSaving(false);
          return;
        }
        if (!(await uploadCover(data.id))) {
          setSaving(false);
          return;
        }
      }

      router.push("/admin/posts");
      router.refresh();
    } catch {
      setError("通信に失敗しました。");
      setSaving(false);
    }
  }

  async function removeCover() {
    if (!initial.id) return;
    if (!confirm("カバー画像を削除します。よろしいですか？")) return;

    const res = await fetch(`/api/admin/posts/${initial.id}/cover`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "画像を削除できませんでした。");
      return;
    }
    setCoverUrl(null);
    setFile(null);
    router.refresh();
  }

  return (
    <form className={styles.card} onSubmit={onSubmit}>
      {error && <p className={styles.alertError}>{error}</p>}

      <label className={styles.field}>
        <span className={styles.label}>題名</span>
        <input
          className={styles.input}
          value={title}
          onChange={(e) => changeTitle(e.target.value)}
          maxLength={120}
          required
        />
      </label>

      <label className={styles.field}>
        <span className={styles.label}>URL名</span>
        <span className={styles.slugRow}>
          <span className={styles.slugPrefix}>/blog/</span>
          <input
            className={styles.input}
            value={slug}
            onChange={(e) => {
              // 一度でも自分で書き換えたら、以後は題名から作り直さない
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
            maxLength={80}
            required
          />
        </span>
        <span className={styles.hint}>
          {isEdit
            ? "公開後に変更すると、以前の住所では開けなくなります。小文字の英数字とハイフンだけで入力してください。"
            : "題名から自動で決まります。変えたいときだけ書き換えてください（小文字の英数字とハイフンのみ）。日本語の題名のときは日付と時刻から作ります。"}
        </span>
      </label>

      <label className={styles.field}>
        <span className={styles.label}>紹介文</span>
        <input
          className={styles.input}
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          maxLength={200}
        />
        <span className={styles.hint}>
          一覧とトップページに出る短い説明です（200文字まで）。
        </span>
      </label>

      <label className={styles.field}>
        <span className={styles.label}>本文</span>
        <textarea
          className={styles.textarea}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={20000}
        />
        <span className={styles.hint}>
          改行はそのまま反映されます。書式や画像の埋め込みには対応していません。
        </span>
      </label>

      <div className={styles.photoRow}>
        {coverUrl ? (
          <img className={styles.coverPreview} src={coverUrl} alt="現在のカバー画像" />
        ) : (
          <div className={styles.coverPreview} />
        )}
        <div style={{ flex: 1 }}>
          <span className={styles.label}>カバー画像</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <span className={styles.hint}>
            JPEG・PNG・WebP、5MBまで。横長（横16：縦9程度）がきれいに表示されます。
          </span>
          {isEdit && coverUrl && (
            <div style={{ marginTop: 10 }}>
              <button className={styles.btnDanger} type="button" onClick={removeCover}>
                カバー画像を削除
              </button>
            </div>
          )}
        </div>
      </div>

      <label className={styles.checkbox}>
        <input
          type="checkbox"
          checked={isPublished}
          onChange={(e) => setIsPublished(e.target.checked)}
        />
        公開する（外すと下書きのままサイトには出ません）
      </label>

      <div className={styles.formActions}>
        <button className={styles.btnPrimary} type="submit" disabled={saving}>
          {saving ? "保存しています…" : "保存"}
        </button>
        <button
          className={styles.btnSecondary}
          type="button"
          onClick={() => router.push("/admin/posts")}
          disabled={saving}
        >
          キャンセル
        </button>
      </div>
    </form>
  );
}
