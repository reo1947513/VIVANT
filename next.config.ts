import type { NextConfig } from "next";

/**
 * 画像の配信元の許可。
 *
 * 管理画面の一覧では、Supabase に置いた原寸の写真（1枚100〜500KB）をそのまま
 * 縮めて表示していた。Next.js の画像機能を通すと、表示に必要な大きさまで
 * サーバー側で縮めてから配るため、受信量が10分の1以下になる。
 * その機能を使うには、どの場所の画像を扱ってよいかをここで明示する必要がある。
 *
 * 場所は環境変数から組み立てる。プロジェクトを移したときに書き換え漏れが起きないため。
 * 環境変数が無い場合（設定前など）は現在のプロジェクトの場所を使う。
 */
const supabaseHost = (() => {
  try {
    return new URL(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://ldwncqptvkrjjxjprflf.supabase.co"
    ).hostname;
  } catch {
    return "ldwncqptvkrjjxjprflf.supabase.co";
  }
})();

/**
 * すべての応答に付ける安全のための指示。
 *
 * どれもブラウザに対する「これ以外は読み込むな・使うな」という宣言で、
 * 万一ページに不正な記述が紛れ込んでも被害を狭める働きをする。
 *
 * Content-Security-Policy（読み込んでよい先の一覧）の各項目：
 *   default-src 'self'   … 既定は自分のサイトからのみ
 *   script-src           … 自分のサイトと、HTMLに直接書いた処理。
 *                          'unsafe-inline' が要るのは、Next.js が画面を組み立て直すための
 *                          記述をHTML内に埋め込むため。これを外すと画面が動かなくなる。
 *   style-src            … 見た目の指定。Google Fonts の読み込みを許す
 *   font-src             … 書体の実体。Google の配信元と、埋め込み形式（data:）
 *   img-src              … 画像。data: は小さな図案、blob: は選んだ写真の下見表示、
 *                          Supabase は管理画面で原寸をそのまま出している箇所のため
 *   connect-src          … 通信先。Supabase への問い合わせを許す
 *   frame-src            … 埋め込む窓。アクセス欄の Google マップのみ
 *   frame-ancestors 'none' … このサイトを他所の窓に埋め込ませない（なりすまし対策）
 *   base-uri / form-action 'self' … 行き先を書き換える細工を防ぐ
 *   object-src 'none'    … 古い埋め込み形式は一切使わない
 *
 * 他のヘッダー：
 *   X-Frame-Options       … frame-ancestors の古いブラウザ向けの言い換え
 *   X-Content-Type-Options… 中身の種類を勝手に推測させない
 *   Referrer-Policy       … 他所へ移動するとき、どのページから来たかを渡しすぎない
 *   Permissions-Policy    … カメラ・マイク・位置情報は使わないと宣言する
 */
const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      `img-src 'self' data: blob: https://${supabaseHost}`,
      `connect-src 'self' https://${supabaseHost}`,
      "frame-src https://www.google.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
      "upgrade-insecure-requests",
    ].join("; "),
  },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  images: {
    /* 縮小した画像を配信側で保持する期間。既定は短く、期限が切れるたびに
       作り直しが走って最初の1人が待たされる。写真を差し替えると保存先の名前
       （URL）ごと変わる作りなので、長く持っても古い写真が残る心配はない。 */
    minimumCacheTTL: 2592000,
    /* 使ってよい画質の一覧。Next.js 16 からは、ここに書いた値しか指定できない
       （書かない場合は 75 だけ）。60 はギャラリー一覧の小さな枠用で、
       205px幅に収めるため75との差が目に見えない一方、受信量だけ減る。
       拡大表示や他の写真は既定の75をそのまま使う。 */
    qualities: [60, 75],
    remotePatterns: [
      {
        protocol: "https",
        hostname: supabaseHost,
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
