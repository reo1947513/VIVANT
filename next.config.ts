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

const nextConfig: NextConfig = {
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
