"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../admin.module.css";

/**
 * ログインフォーム。
 * 入力を /api/admin/login に送り、成功したら管理画面へ移動する。
 * セッションの cookie は API 側で書き込まれるため、ここでは移動するだけでよい。
 */
export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSending(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error ?? "ログインできませんでした。");
        setSending(false);
        return;
      }

      // 認証状態はサーバー側で判定しているため、移動前に最新の状態を読み直させる
      router.replace("/admin/casts");
      router.refresh();
    } catch {
      setError("通信に失敗しました。時間をおいて試してください。");
      setSending(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      {error && <p className={styles.alertError}>{error}</p>}

      <label className={styles.field}>
        <span className={styles.label}>メールアドレス</span>
        <input
          className={styles.input}
          type="email"
          name="email"
          autoComplete="username"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>

      <label className={styles.field}>
        <span className={styles.label}>パスワード</span>
        <input
          className={styles.input}
          type="password"
          name="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>

      <button className={styles.btnPrimary} type="submit" disabled={sending}>
        {sending ? "確認しています…" : "ログイン"}
      </button>
    </form>
  );
}
