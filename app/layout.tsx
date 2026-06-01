import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "bar VIVANT KITASHINCHI | 北新地のガールズバー",
  description: "北新地の落ち着いた街並みに佇む「bar VIVANT」。高級感のある空間と、心からのおもてなしで、特別な夜を演出します。",
  keywords: "北新地,ガールズバー,bar VIVANT,大阪,キャバクラ,バー",
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
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Noto+Serif+JP:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
