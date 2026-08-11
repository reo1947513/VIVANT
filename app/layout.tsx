import type { Metadata } from "next";
import { Cinzel, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { meta, shop, siteUrl } from "./data/siteData";

/*
  書体の配り方について。

  見出しの Cinzel と数字の Cormorant Garamond は、この2つだけ自前で配る。
  ビルド時に取り込んで自分のサイトから配るため、外部サーバーへ取りに行く分
  （名前解決と暗号化の握手で実測150〜250ミリ秒）が無くなり、文字が早く出る。

  一方 Noto Serif JP / Noto Sans JP は Google から読み込むままにしている。
  日本語の書体は収録文字数が多く実体が大きいが、Google 側は表示に必要な範囲だけを
  細かく分割して配ってくれる。自前配信にすると分割が効かず、かえって重くなる。
  「全部を自前にすれば速い」とはならないため、ここは意図的に分けている。
*/
const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-cinzel",
});

// 500は使用箇所が無いため読み込まない（料金の数字が600、ブログの日付が400）
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
  variable: "--font-cormorant",
});

/**
 * サイト全体のメタ情報。
 *
 * metadataBase を置くと、以下の指定を "/" のような短い書き方にできる。
 * 検索エンジンやSNSは絶対的な住所を求めるので、Next.js がここを基準に組み立てる。
 *
 * 検索エンジンへの掲載について：
 *   以前は仮公開のため noindex（載せない）にしていたが、公開に踏み切ったため外した。
 *   再び伏せたくなった場合は、この metadata に
 *   robots: { index: false, follow: false } を1行足せば元に戻る。
 *   管理画面は別途 app/k7m2xq9p4vhn/layout.tsx 側で常に伏せてあるため、
 *   ここを変えても管理画面が検索に出ることはない。
 *
 * SNSで共有したときの画像は app/opengraph-image.tsx が自動で作る。
 * ファイル名が決まった名前になっていると Next.js が拾って
 * og:image として差し込むため、ここに画像の指定は書かない。
 *
 * Search Console の確認コードは環境変数から読む。コードは検索エンジン側が
 * 発行するもので、コードそのものを書き込んでも害は無いが、
 * 差し替えのたびにコードを直すのは面倒なので設定値として外に出す。
 */
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  // タイトル・説明は app/data/siteData.ts に一元管理（店名・料金の表記ゆれ防止）
  title: meta.title,
  description: meta.description,
  // このページの正式な住所。www 付きなど別の住所で開かれても、こちらが本家だと伝える
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    siteName: shop.nameEn,
    title: meta.title,
    description: meta.description,
    url: "/",
  },
  twitter: {
    // 大きな画像付きの見え方にする（小さな正方形ではなく横長で出る）
    card: "summary_large_image",
    title: meta.title,
    description: meta.description,
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${cinzel.variable} ${cormorant.variable}`}>
      <head>
        {/*
          本体の JavaScript より先に動かす短い処理。

          役割は2つ。
            1. html に js を付ける。CSS はこれが付いているときだけ
               「スクロールで現れる部分」を透明にする。
               付かない環境（JavaScript が無効・読み込み失敗）では
               最初から見えるので、何も出ないまま終わることがない。
            2. 現れる判定（画面に入ったか）を、HTMLを読み終えた時点で始める。

          なぜ本体に任せないのか：
            本体は通信で取りに行くため、HTMLより必ず遅れて届く。
            実測では HTML が764ミリ秒、本体の到着が1477ミリ秒で、
            その差の約675ミリ秒は文字も写真も透明のままだった。
            この処理はHTMLに直接書いてあるので取りに行く時間がゼロで、
            差そのものが無くなる。

          外から取り込む文字列は一切使っていない（固定の処理のみ）。
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var d=document,r=d.documentElement;r.className+=' js';function i(){var e=d.querySelectorAll('.reveal'),n;if(!('IntersectionObserver' in window)){for(n=0;n<e.length;n++)e[n].classList.add('is-visible');return}var o=new IntersectionObserver(function(s){for(var k=0;k<s.length;k++){if(s[k].isIntersecting){s[k].target.classList.add('is-visible');o.unobserve(s[k].target)}}},{threshold:0.12,rootMargin:'0px 0px -8% 0px'});for(n=0;n<e.length;n++)o.observe(e[n])}if(d.readyState!=='loading')i();else d.addEventListener('DOMContentLoaded',i)})();`,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;500;600&family=Noto+Sans+JP:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
