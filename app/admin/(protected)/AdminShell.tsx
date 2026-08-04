"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import styles from "../admin.module.css";

/**
 * 管理画面の枠（ヘッダーとナビ）。
 * 現在地の判定とログアウトの操作があるためブラウザ側で動かす。
 * 認証そのものは親のレイアウト（サーバー側）で済んでいる。
 */
const NAV = [
  { href: "/admin/casts", label: "キャスト" },
  { href: "/admin/gallery", label: "ギャラリー" },
  { href: "/admin/shifts", label: "出勤情報" },
  { href: "/admin/posts", label: "ブログ" },
] as const;

export default function AdminShell({
  email,
  children,
}: {
  email: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function onLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.brand}>
          BAR VIVANT
          <span className={styles.brandSub}>管理画面</span>
        </div>
        <div className={styles.headerRight}>
          <span>{email}</span>
          <button className={styles.btnSecondary} type="button" onClick={onLogout}>
            ログアウト
          </button>
        </div>
      </header>

      <nav className={styles.nav}>
        {NAV.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navLink} ${active ? styles.navLinkActive : ""}`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <main className={styles.main}>{children}</main>
    </div>
  );
}
