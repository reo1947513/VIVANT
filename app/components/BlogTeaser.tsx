import Link from "next/link";
import Image from "next/image";
import { formatJstDate } from "../lib/date";
import type { Post } from "../lib/types";

/**
 * トップページに出す最新記事（3件まで）。
 * 記事が1本も無いときは区画ごと出さない。
 *
 * カバー画像は Next.js の画像機能を通す。管理画面から上げた写真は縮小せずに
 * そのまま保存されるため（上限5MB）、原寸のまま配ると1枚で数MBになりうる。
 * 通すと枠の大きさに合わせて縮めてから配るので、受信量が大きく下がる。
 *
 * 枠は .blog-cover が16対9で高さを先に確保しているため、
 * 読み込みの前後で下の文字がずれることはない。
 * width と height は縦横比を伝えるためのもので、実際の表示寸法は
 * .blog-cover img（幅・高さとも100%）が決める。
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
                  <Image
                    src={post.coverUrl}
                    alt=""
                    width={640}
                    height={360}
                    /* パソコンでは3列で1枚およそ360px、860px以下では1列で画面幅の9割強。
                       高精細な画面でも粗くならない範囲で用意し、原寸は配らない。 */
                    sizes="(max-width: 860px) 92vw, 360px"
                    quality={60}
                  />
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
