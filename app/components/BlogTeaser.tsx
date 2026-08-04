/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { formatJstDate } from "../lib/date";
import type { Post } from "../lib/types";

/**
 * トップページに出す最新記事（3件まで）。
 * 記事が1本も無いときは区画ごと出さない。
 */
export default function BlogTeaser({ posts }: { posts: Post[] }) {
  if (posts.length === 0) return null;

  return (
    <section className="section" id="blog">
      <div className="wrap">
        <div className="sec-head reveal">
          <h2>BLOG</h2>
          <span className="sub">お知らせ</span>
          <span className="rule"></span>
        </div>

        <div className="blog-grid">
          {posts.map((post) => (
            <Link className="blog-card reveal" href={`/blog/${post.slug}`} key={post.id}>
              <div className={post.coverUrl ? "blog-cover" : "blog-cover blog-cover--empty"}>
                {post.coverUrl && (
                  <img src={post.coverUrl} alt="" loading="lazy" />
                )}
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

        <div className="sns-cta reveal">
          <Link className="btn-sns" href="/blog">
            記事をすべて見る
          </Link>
        </div>
      </div>
    </section>
  );
}
