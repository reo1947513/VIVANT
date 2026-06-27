import type { Metadata } from "next";
import "./globals.css";

// =====================================================================
// 【仮公開中：noindex 設定】★本公開時にここを解除する★
//   キャストがデモ画像（実在しない人物）のため、検索エンジンに本格的に
//   インデックスさせないよう robots を noindex, nofollow にしています。
//   実写真へ差し替えて本公開する際は、下の metadata 内の `robots` 行を
//   削除する（または index:true, follow:true に変更する）だけで解除できます。
//   解除箇所はこの robots フィールドのみです。
// =====================================================================
export const metadata: Metadata = {
  title: "BAR VIVANT（バー ヴィヴァン）｜大阪・北新地のガールズバー",
  description:
    "大阪・北新地（曽根崎新地）のガールズバー BAR VIVANT。北新地の夜に、上質な余韻を。落ち着いた空間で、ゆったりとした大人の時間を。TikTokをご覧の方は初回3,000円。",
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
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600&family=Cormorant+Garamond:wght@400;500;600&family=Noto+Serif+JP:wght@400;500;600&family=Noto+Sans+JP:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
