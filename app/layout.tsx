import type { Metadata } from "next";
import { Cinzel, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { meta } from "./data/siteData";

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

// =====================================================================
// 【仮公開中：noindex 設定】★本公開時にここを解除する★
//   キャストがデモ画像（実在しない人物）のため、検索エンジンに本格的に
//   インデックスさせないよう robots を noindex, nofollow にしています。
//   実写真へ差し替えて本公開する際は、下の metadata 内の `robots` 行を
//   削除する（または index:true, follow:true に変更する）だけで解除できます。
//   解除箇所はこの robots フィールドのみです。
// =====================================================================
export const metadata: Metadata = {
  // タイトル・説明は app/data/siteData.ts に一元管理（店名・料金の表記ゆれ防止）
  title: meta.title,
  description: meta.description,
  // ↓↓↓ 仮公開中のみ：本公開時に削除 or { index: true, follow: true } に変更して解除 ↓↓↓
  robots: { index: false, follow: false },
  // ↑↑↑ noindex, nofollow（仮公開・デモ画像のため）↑↑↑
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${cinzel.variable} ${cormorant.variable}`}>
      <head>
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
