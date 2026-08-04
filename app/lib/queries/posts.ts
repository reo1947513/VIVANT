import { unstable_cache } from "next/cache";
import { getPublicSupabase } from "../supabase/public";
import { hasSupabaseConfig } from "../supabase/env";
import { CACHE_TAGS } from "../revalidate";
import type { Post } from "../types";

/**
 * 公開ページ用の記事取得。
 * 下書き（is_published = false）は、権限設定の時点で読めないようになっている。
 * ここでも条件を書いているのは、意図を読み手に明示するため。
 */
type PostRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body: string | null;
  cover_url: string | null;
  is_published: boolean;
  published_at: string | null;
};

function toPost(row: PostRow): Post {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt ?? "",
    body: row.body ?? "",
    coverUrl: row.cover_url ?? null,
    isPublished: Boolean(row.is_published),
    publishedAt: row.published_at ?? null,
  };
}

const SELECT = "id, slug, title, excerpt, body, cover_url, is_published, published_at";

/** 公開中の記事を新しい順に取得する。limit を渡すとその件数まで */
export const getPublishedPosts = unstable_cache(
  async (limit?: number): Promise<Post[]> => {
    if (!hasSupabaseConfig()) {
      console.error("[vivant] Supabase 未設定のため記事を空で描画します");
      return [];
    }

    try {
      let query = getPublicSupabase()
        .from("posts")
        .select(SELECT)
        .eq("is_published", true)
        .order("published_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false });

      if (limit) query = query.limit(limit);

      const { data, error } = await query;
      if (error) throw new Error(error.message);

      return (data ?? []).map((row) => toPost(row as PostRow));
    } catch (e) {
      console.error("[vivant] 記事一覧の取得に失敗しました:", e);
      return [];
    }
  },
  ["published-posts"],
  { tags: [CACHE_TAGS.posts] }
);

/** URL名から記事1件を取得する。無ければ null（呼び出し側で404にする） */
export const getPostBySlug = unstable_cache(
  async (slug: string): Promise<Post | null> => {
    if (!hasSupabaseConfig()) return null;

    try {
      const { data, error } = await getPublicSupabase()
        .from("posts")
        .select(SELECT)
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();

      if (error) throw new Error(error.message);
      return data ? toPost(data as PostRow) : null;
    } catch (e) {
      console.error("[vivant] 記事の取得に失敗しました:", e);
      return null;
    }
  },
  ["published-post"],
  { tags: [CACHE_TAGS.posts] }
);

/** 事前に用意しておく記事のURL名一覧（ビルド時の静的生成に使う） */
export async function getPublishedSlugs(): Promise<string[]> {
  const posts = await getPublishedPosts();
  return posts.map((p) => p.slug);
}
