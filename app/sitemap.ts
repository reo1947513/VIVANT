import type { MetadataRoute } from "next";
import { siteUrl } from "./data/siteData";
import { getPublishedPosts } from "./lib/queries/posts";

/**
 * サイトの地図（/sitemap.xml として配られる）。
 *
 * 検索エンジンに「このサイトにはこのページがあります」と一覧で渡すもの。
 * 渡さなくてもリンクをたどって見つけてはもらえるが、
 * 新しい記事を早く拾ってもらいやすくなる。
 *
 * 記事は公開中のものだけを載せる。下書きは取得の時点で除かれるため、
 * ここで改めて絞る必要はない。
 *
 * changeFrequency と priority は「目安」であって命令ではない。
 * 実際にどれくらいの頻度で見に来るかは検索エンジンが決める。
 *
 * revalidate：トップページと同じ5分。記事を書いてから地図に載るまでの
 * 待ち時間をこの範囲に収める。
 */
export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPublishedPosts();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
  ];

  const postPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    // 公開日が無い記事はいまの日時で代用する（地図から漏らさないため）
    lastModified: post.publishedAt ? new Date(post.publishedAt) : new Date(),
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...staticPages, ...postPages];
}
