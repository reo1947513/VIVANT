"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import styles from "../admin.module.css";
import { ADMIN_LOGIN_PATH, adminPath } from "../../lib/adminPath";

/**
 * 管理画面の枠（ヘッダーとナビ）。
 * 現在地の判定とログアウトの操作があるためブラウザ側で動かす。
 * 認証そのものは親のレイアウト（サーバー側）で済んでいる。
 *
 * 住所は app/lib/adminPath.ts の ADMIN_BASE から組み立てる。
 * ここに直接書かないのは、管理画面の住所を変えるときの直し漏れを防ぐため。
 */
const NAV = [
  { href: adminPath("casts"), label: "キャスト", preview: "/#cast" },
  { href: adminPath("gallery"), label: "ギャラリー", preview: "/#gallery" },
  { href: adminPath("shifts"), label: "出勤情報", preview: "/#schedule" },
  { href: adminPath("posts"), label: "ブログ", preview: "/blog" },
  { href: adminPath("links"), label: "SNSリンク", preview: "/#reserve" },
] as const;

/**
 * いま開いている管理画面に対応する、公開ページの場所を返す。
 * どれにも当てはまらないときはトップページ。
 */
function previewHref(pathname: string): string {
  return NAV.find((item) => pathname.startsWith(item.href))?.preview ?? "/";
}

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
    router.replace(ADMIN_LOGIN_PATH);
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
          <span className={styles.headerEmail}>{email}</span>
          {/* いま編集している内容が実際にどう見えるかを、別タブで開いて確かめられるようにする。
              rel="noopener" は、開いた先から元の画面を操作されないようにするための指定。 */}
          <a
            className={styles.btnSecondary}
            href={previewHref(pathname)}
            target="_blank"
            rel="noopener"
          >
            サイトで確認
          </a>
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
