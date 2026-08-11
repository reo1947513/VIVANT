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
  { href: adminPath("casts"), label: "キャスト", preview: "/" },
  { href: adminPath("gallery"), label: "ギャラリー", preview: "/" },
  { href: adminPath("shifts"), label: "出勤情報", preview: "/" },
  { href: adminPath("posts"), label: "ブログ", preview: "/blog" },
  { href: adminPath("links"), label: "SNSリンク", preview: "/" },
] as const;

/**
 * いま開いている管理画面に対応する、公開ページの場所を返す。
 *
 * 以前は編集中の区画（/#cast など）へ直接飛ばしていたが、
 * 途中から表示されて全体の印象が掴めないため、トップページの先頭を開くようにした。
 * ブログだけは別のページなので /blog を開く。
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
    /* admin-root は、地の色を明るくするための目印（globals.css で使う）。
       管理画面は白基調なので、公開ページ向けの焦茶のままだと
       端まで動かしたときに上下へ暗い帯が出る。 */
    <div className={`admin-root ${styles.shell}`}>
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
