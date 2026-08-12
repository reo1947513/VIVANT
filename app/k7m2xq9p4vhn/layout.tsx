import type { Metadata, Viewport } from "next";

/**
 * 管理画面の共通レイアウト。
 *
 * ここでは認証しない。ログイン画面も管理画面の下にあるため、ここで弾くと
 * ログイン画面自体が開けなくなる。認証は (protected) の中で行う。
 *
 * 検索避けはここで独立して指定する。トップページ側の検索避けは本公開時に外す予定なので、
 * それに巻き込まれて管理画面が検索結果に出ないようにするため。
 *
 * openGraph.images を空にしているのは、店の顔であるOGP画像をここで打ち切るため。
 * ルート（app/layout.tsx）は openGraph.images を明示していないので、そのままだと
 * app/opengraph-image.tsx が自動生成した画像が管理画面のリンクにもそのまま
 * 付いてきてしまう。images: [] を明示すると、その自動生成分だけ止まる。
 *
 * description を空文字にしているのは、店の説明文（料金や住所を含む案内文）を
 * 完全に断ち切るため。Next.js は openGraph に説明文が無いとき、このページの
 * 説明文（description）で自動的に埋める仕様になっており、ここを空にしないと
 * ルートの店舗説明文がそのまま og:description に漏れてしまう。
 *
 * og:title だけは「管理画面 | BAR VIVANT」のまま残る。これは <title> と同じ文言で、
 * ブラウザのタブに常に出ているものと同一であり、Next.js の仕様上、ページに
 * タイトルがある限り og:title を完全に空にはできない（omitできるのは画像だけ）。
 * 店の情報を明かすものではないため実害は無いと判断し、そのままにしている。
 */
export const metadata: Metadata = {
  title: "管理画面 | BAR VIVANT",
  description: "",
  robots: { index: false, follow: false },
  openGraph: {
    images: [],
  },
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
