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
