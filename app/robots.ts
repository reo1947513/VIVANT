import type { MetadataRoute } from "next";
import { siteUrl } from "./data/siteData";

/**
 * 検索エンジンやAIの巡回に対する案内文（/robots.txt として配られる）。
 *
 * 方針：
 *   公開ページは全て見てよい。窓口（API）だけは見せない。
 *
 * 管理画面をここに書かない理由（重要）：
 *   robots.txt は誰でも読めるファイルで、住所を伏せている場所を
 *   「見ないでください」と書くことは、その住所を自ら公開するのと同じになる。
 *   実際、伏せた管理画面を探すときに最初に読まれるのがこのファイル。
 *   そのため管理画面はここに一切書かない。
 *   代わりに管理画面側（app/k7m2xq9p4vhn/layout.tsx）で
 *   「検索結果に出さない」指定を持たせてあり、万一たどり着かれても
 *   検索には載らない。実際の守りはログイン確認が担っている。
 *
 * AIの巡回について：
 *   案内役（ChatGPT や Claude など）に店の情報を正しく拾ってもらいたいので、
 *   まとめて許可している。考えが変わった場合は、rules を配列にして
 *   userAgent 単位の指定を足せば個別に断れる。
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
