import type { Metadata, Viewport } from "next";

/**
 * 管理画面の共通レイアウト。
 *
 * ここでは認証しない。ログイン画面も管理画面の下にあるため、ここで弾くと
 * ログイン画面自体が開けなくなる。認証は (protected) の中で行う。
 *
 * 検索避けはここで独立して指定する。トップページ側の検索避けは本公開時に外す予定なので、
 * それに巻き込まれて管理画面が検索結果に出ないようにするため。
 */
export const metadata: Metadata = {
  title: "管理画面 | BAR VIVANT",
  robots: { index: false, follow: false },
};

/**
 * ブラウザの操作バーの色を、管理画面の地の色に合わせる。
 *
 * サイト全体では公開ページ向けの焦茶を指定しているが、管理画面は白基調なので、
 * そのままだと上下に暗い帯が乗って見える。
 * ここで指定すると、この配下のページ（ログイン画面を含む）だけ上書きされる。
 */
export const viewport: Viewport = {
  themeColor: "#f6f7f9",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
