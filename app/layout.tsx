import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BAR VIVANT（バー ヴィヴァン）｜大阪・北新地のガールズバー",
  description:
    "大阪・北新地（曽根崎新地）のガールズバー BAR VIVANT。北新地の夜に、上質な余韻を。落ち着いた空間で、ゆったりとした大人の時間を。TikTokをご覧の方は初回3,000円。",
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
