import type { Metadata } from "next";

/**
 * 管理画面の共通レイアウト。
 *
 * ここでは認証しない。ログイン画面も /admin の下にあるため、ここで弾くと
 * ログイン画面自体が開けなくなる。認証は (protected) の中で行う。
 *
 * 検索避けはここで独立して指定する。トップページ側の検索避けは本公開時に外す予定なので、
 * それに巻き込まれて管理画面が検索結果に出ないようにするため。
 */
export const metadata: Metadata = {
  title: "管理画面 | BAR VIVANT",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
