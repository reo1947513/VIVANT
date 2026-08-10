"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../admin.module.css";
import { ADMIN_HOME_PATH } from "../../lib/adminPath";

/**
 * ログインフォーム。
 * 入力を /api/admin/login に送り、成功したら管理画面へ移動する。
 * セッションの cookie は API 側で書き込まれるため、ここでは移動するだけでよい。
 */
export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
      router.replace(ADMIN_HOME_PATH);
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

      {/*
        パスワード欄は目のボタンを内側に重ねるため、label で全体を包まずに
        htmlFor と id で結び付ける（label の中にボタンを置くと、
        ボタンを押しただけで入力欄が反応してしまうため）。
      */}
      <div className={styles.field}>
        <label className={styles.label} htmlFor="admin-password">
          パスワード
        </label>
        <div className={styles.passwordWrap}>
          <input
            id="admin-password"
            className={`${styles.input} ${styles.inputPassword}`}
            type={showPassword ? "text" : "password"}
            name="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            className={styles.passwordToggle}
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "パスワードを隠す" : "パスワードを表示する"}
            aria-pressed={showPassword}
            title={showPassword ? "パスワードを隠す" : "パスワードを表示する"}
          >
            {showPassword ? (
              /* 目に斜線＝いま見えている（押すと隠す） */
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M3 3l18 18" />
                <path d="M10.6 10.6a2 2 0 002.8 2.8" />
                <path d="M9.9 5.2A9.6 9.6 0 0112 5c5 0 9 4.5 9 7 0 1-.7 2.3-1.9 3.5" />
                <path d="M6.5 6.6C4.2 8.1 3 10.2 3 12c0 2.5 4 7 9 7 1.6 0 3-.4 4.3-1.1" />
              </svg>
            ) : (
              /* 目＝いま隠れている（押すと表示する） */
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M3 12s3.5-7 9-7 9 7 9 7-3.5 7-9 7-9-7-9-7z" />
                <circle cx="12" cy="12" r="2.6" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <button className={styles.btnPrimary} type="submit" disabled={sending}>
        {sending ? "確認しています…" : "ログイン"}
      </button>
    </form>
  );
}
