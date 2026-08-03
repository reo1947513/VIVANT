import { unstable_cache } from "next/cache";
import { getPublicSupabase } from "../supabase/public";
import { hasSupabaseConfig } from "../supabase/env";
import { CACHE_TAGS } from "../revalidate";
import type { Cast } from "../types";

/**
 * 公開ページ用のキャスト取得。
 *
 * 失敗しても例外を投げず空配列を返すのが方針。環境変数の設定漏れや一時的な障害で
 * LP 全体が落ちるより、そのブロックだけが「準備中」になるほうが被害が小さい。
 * 原因はサーバーのログに残す。
 */
export const getPublishedCasts = unstable_cache(
  async (): Promise<Cast[]> => {
    if (!hasSupabaseConfig()) {
      console.error("[vivant] Supabase 未設定のためキャストを空で描画します");
      return [];
    }

    try {
      const { data, error } = await getPublicSupabase()
        .from("casts")
        .select("id, name, word, photo_url, sort_order, is_published")
        .eq("is_published", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });

      if (error) throw new Error(error.message);

      return (data ?? []).map((row) => ({
        id: row.id as string,
        name: row.name as string,
        word: (row.word ?? "") as string,
        photoUrl: (row.photo_url ?? null) as string | null,
        sortOrder: (row.sort_order ?? 0) as number,
        isPublished: Boolean(row.is_published),
      }));
    } catch (e) {
      console.error("[vivant] キャストの取得に失敗しました:", e);
      return [];
    }
  },
  ["published-casts"],
  { tags: [CACHE_TAGS.casts] }
);
