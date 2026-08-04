/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../../admin.module.css";

/**
 * キャストの追加・編集フォーム。
 *
 * 写真は本体の保存とは別に送る。理由は2つ。
 *  - 画像は文字情報より大きく、送り方（形式）が異なるため
 *  - 新規追加のときは、まず本体を登録して番号を得ないと、どのキャストの写真か決められない
 * そのため新規のときは「登録 → 続けて写真を送信」の順で自動的に処理する。
 */
export type CastFormValues = {
  id?: string;
  name: string;
  word: string;
  isPublished: boolean;
  photoUrl: string | null;
};

export default function CastForm({ initial }: { initial: CastFormValues }) {
  const router = useRouter();
  const isEdit = Boolean(initial.id);

  const [name, setName] = useState(initial.name);
  const [word, setWord] = useState(initial.word);
  const [isPublished, setIsPublished] = useState(initial.isPublished);
  const [photoUrl, setPhotoUrl] = useState(initial.photoUrl);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function uploadPhoto(castId: string): Promise<boolean> {
    if (!file) return true;
    const form = new FormData();
    form.append("photo", file);
    const res = await fetch(`/api/admin/casts/${castId}/photo`, {
      method: "POST",
      body: form,
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "写真を保存できませんでした。");
      return false;
    }
    return true;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const payload = { name, word, isPublished };

      if (isEdit) {
        const res = await fetch(`/api/admin/casts/${initial.id}`, {
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
        if (!(await uploadPhoto(initial.id!))) {
          setSaving(false);
          return;
        }
      } else {
        const res = await fetch("/api/admin/casts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data.error ?? "登録できませんでした。");
          setSaving(false);
          return;
        }
        if (!(await uploadPhoto(data.id))) {
          setSaving(false);
          return;
        }
      }

      router.push("/admin/casts");
      router.refresh();
    } catch {
      setError("通信に失敗しました。");
      setSaving(false);
    }
  }

  async function removePhoto() {
    if (!initial.id) return;
    if (!confirm("写真を削除します。よろしいですか？")) return;

    const res = await fetch(`/api/admin/casts/${initial.id}/photo`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "写真を削除できませんでした。");
      return;
    }
    setPhotoUrl(null);
    setFile(null);
    router.refresh();
  }

  return (
    <form className={styles.card} onSubmit={onSubmit}>
      {error && <p className={styles.alertError}>{error}</p>}

      <label className={styles.field}>
        <span className={styles.label}>源氏名</span>
        <input
          className={styles.input}
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={30}
          required
        />
      </label>

      <label className={styles.field}>
        <span className={styles.label}>一言</span>
        <input
          className={styles.input}
          value={word}
          onChange={(e) => setWord(e.target.value)}
          maxLength={60}
        />
        <span className={styles.hint}>
          仮公開中のため、この一言は現在サイトに表示されません。本公開の際にまとめて表示に戻します。
        </span>
      </label>

      <div className={styles.photoRow}>
        {photoUrl ? (
          <img className={styles.photoPreview} src={photoUrl} alt="現在の写真" />
        ) : (
          <div className={styles.thumbEmpty} style={{ width: 96, height: 128 }}>
            NO IMAGE
          </div>
        )}
        <div style={{ flex: 1 }}>
          <span className={styles.label}>写真</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <span className={styles.hint}>
            JPEG・PNG・WebP、5MBまで。縦長（縦3：横4程度）の写真が最もきれいに表示されます。
            選んだあと保存すると差し替わります。
          </span>
          {isEdit && photoUrl && (
            <div style={{ marginTop: 10 }}>
              <button className={styles.btnDanger} type="button" onClick={removePhoto}>
                写真を削除
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
        サイトに表示する
      </label>

      <div className={styles.formActions}>
        <button className={styles.btnPrimary} type="submit" disabled={saving}>
          {saving ? "保存しています…" : "保存"}
        </button>
        <button
          className={styles.btnSecondary}
          type="button"
          onClick={() => router.push("/admin/casts")}
          disabled={saving}
        >
          キャンセル
        </button>
      </div>
    </form>
  );
}
