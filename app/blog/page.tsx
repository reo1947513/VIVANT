/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ClientEffects from "../components/ClientEffects";
import BackToTop from "../components/BackToTop";
import { getPublishedPosts } from "../lib/queries/posts";
import { formatJstDate } from "../lib/date";
import { shop } from "../data/siteData";

/**
 * 記事の一覧ページ。
 *
 * ヘッダーやフッターは共通のレイアウトにまとめず、このページで直接並べている。
 * 共通化するには現在のトップページの構成を組み替える必要があり、動いているものに
 * 手を入れる範囲が広がる。重複は数行なので、今はこの形にしておく（後から共通化はできる）。
 *
 * Header と Footer に variant="page" を渡すのは、区画へのリンクを "/#concept" の形にして
 * トップページへ戻すため。このページには同じ区画が無いので、そのままでは押しても動かない。
 */
export const revalidate = 300;

export const metadata: Metadata = {
  title: `お知らせ｜${shop.nameFull}`,
  description: `${shop.nameEn} からのお知らせ・イベント情報です。`,
};

export default async function BlogIndexPage() {
  const posts = await getPublishedPosts();

  return (
    <>
      <Header variant="page" />

      <main className="section page-main">
        <div className="wrap">
          <div className="sec-head reveal">
            <h2>BLOG</h2>
            <span className="sub">お知らせ</span>
            <span className="rule"></span>
          </div>

          {posts.length === 0 ? (
            <p className="cast-empty">まだ記事がありません。</p>
          ) : (
            <div className="blog-list">
              {posts.map((post) => (
                <Link className="blog-card reveal" href={`/blog/${post.slug}`} key={post.id}>
                  <div
                    className={post.coverUrl ? "blog-cover" : "blog-cover blog-cover--empty"}
                  >
                    {post.coverUrl && <img src={post.coverUrl} alt="" loading="lazy" />}
                  </div>
                  <div className="blog-body">
                    {post.publishedAt && (
                      <span className="blog-date">{formatJstDate(post.publishedAt)}</span>
                    )}
                    <h3 className="blog-title">{post.title}</h3>
                    {post.excerpt && <p className="blog-excerpt">{post.excerpt}</p>}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer variant="page" />
      <ClientEffects />
      <BackToTop />
    </>
  );
}
