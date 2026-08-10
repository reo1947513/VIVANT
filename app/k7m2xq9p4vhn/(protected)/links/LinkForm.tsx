"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../../admin.module.css";

/**
 * SNSリンクの編集。表示名とURLを入れて、まとめて保存する。
 *
 * URLを空にすると、その行は公開ページに出なくなる。
 * 「まだ用意していないSNSのボタンを出さない」を空欄で表せるようにしている。
 * 一時的に隠したいだけならURLは残したまま「非公開」にできる。
 */
export type LinkRow = {
  platform: string;
  label: string;
  url: string;
  is_published: boolean;
};

/** 入力の助けになるよう、各SNSの代表的なURLの形を添える */
const PLACEHOLDERS: Record<string, string> = {
  tiktok: "https://www.tiktok.com/@アカウント名",
  line: "https://lin.ee/xxxxxxx（LINE公式アカウントの友だち追加URL）",
  instagram: "https://www.instagram.com/アカウント名",
  x: "https://x.com/アカウント名",
};

export default function LinkForm({ links }: { links: LinkRow[] }) {
  const router = useRouter();
  const [rows, setRows] = useState<LinkRow[]>(links);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");

  function update(platform: string, patch: Partial<LinkRow>) {
    setRows((prev) =>
      prev.map((row) => (row.platform === platform ? { ...row, ...patch } : row))
    );
    setSaved("");
  }

  async function save() {
    setError("");
    setSaved("");
    setSaving(true);

    try {
      const res = await fetch("/api/admin/links", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entries: rows.map((row) => ({
            platform: row.platform,
            label: row.label,
            url: row.url,
            isPublished: row.is_published,
          })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "保存できませんでした。");
        return;
      }
      setSaved(`保存しました（サイトに出るリンク：${data.shown}件）。`);
      router.refresh();
    } catch {
      setError("通信に失敗しました。");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      {error && <p className={styles.alertError}>{error}</p>}

      <div className={styles.card}>
        {rows.map((row) => (
          <div key={row.platform} className={styles.linkRow}>
            <div className={styles.linkHead}>
              <span className={styles.linkPlatform}>{row.platform}</span>
              <label className={styles.checkbox} style={{ margin: 0 }}>
                <input
                  type="checkbox"
                  checked={row.is_published}
                  onChange={(e) => update(row.platform, { is_published: e.target.checked })}
                />
                サイトに出す
              </label>
            </div>

            <label className={styles.field}>
              <span className={styles.label}>表示名</span>
              <input
                className={styles.input}
                value={row.label}
                onChange={(e) => update(row.platform, { label: e.target.value })}
                maxLength={30}
                placeholder="公式LINE"
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>URL</span>
              <input
                className={styles.input}
                value={row.url}
                onChange={(e) => update(row.platform, { url: e.target.value })}
                maxLength={300}
                inputMode="url"
                placeholder={PLACEHOLDERS[row.platform] ?? "https://"}
              />
              <span className={styles.hint}>
                空欄にすると、このSNSはサイトに出ません。
              </span>
            </label>
          </div>
        ))}

        <div className={styles.saveBar}>
          <button className={styles.btnPrimary} type="button" onClick={save} disabled={saving}>
            {saving ? "保存しています…" : "保存する"}
          </button>
          {saved && <span className={styles.savedNote}>{saved}</span>}
        </div>
      </div>
    </>
  );
}
