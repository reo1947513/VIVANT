/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ClientEffects from "../../components/ClientEffects";
import BackToTop from "../../components/BackToTop";
import { getPostBySlug, getPublishedSlugs } from "../../lib/queries/posts";
import { formatJstDate } from "../../lib/date";
import { shop } from "../../data/siteData";

/**
 * 記事ページ。
 *
 * generateStaticParams で公開中の記事を先に用意しておき、
 * dynamicParams を true にしておくことで、あとから追加した記事も
 * サイトを作り直すことなく開けるようにしている。
 *
 * Next.js 16 では params が非同期なので await して受け取る。
 *
 * 本文は白紙の状態から書かれたプレーンテキストとして表示する。
 * HTML として画面に流し込む書き方（dangerouslySetInnerHTML）は使わない。
 * 使うと、本文に紛れ込んだタグがそのまま動いてしまう。
 */
export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = await getPublishedSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) return { title: `お知らせ｜${shop.nameFull}` };

  return {
    title: `${post.title}｜${shop.nameFull}`,
    description: post.excerpt || undefined,
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  // 下書きや存在しないURL名はここで404にする（権限設定の時点で読めない）
  if (!post) notFound();

  return (
    <>
      <Header variant="page" />

      <main className="section page-main">
        <div className="wrap">
          <article className="article">
            <div className="article-head">
              {post.publishedAt && (
                <span className="blog-date">{formatJstDate(post.publishedAt)}</span>
              )}
              <h1 className="article-title">{post.title}</h1>
            </div>

            {post.coverUrl && (
              <img className="article-cover" src={post.coverUrl} alt="" />
            )}

            <div className="article-body">{post.body}</div>

            <Link className="article-back" href="/blog">
              ← お知らせ一覧へ
            </Link>
          </article>
        </div>
      </main>

      <Footer variant="page" />
      <ClientEffects />
      <BackToTop />
    </>
  );
}
