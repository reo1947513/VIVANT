import { unstable_cache } from "next/cache";
import { getPublicSupabase } from "../supabase/public";
import { hasSupabaseConfig } from "../supabase/env";
import { CACHE_TAGS } from "../revalidate";
import type { GalleryImage } from "../types";

/**
 * 公開ページ用のギャラリー画像取得。
 * 失敗時は空配列を返す（理由は queries/casts.ts と同じ）。
 */
export const getPublishedGalleryImages = unstable_cache(
  async (): Promise<GalleryImage[]> => {
    if (!hasSupabaseConfig()) {
      console.error("[vivant] Supabase 未設定のためギャラリーを空で描画します");
      return [];
    }

    try {
      const { data, error } = await getPublicSupabase()
        .from("gallery_images")
        .select("id, image_url, alt, sort_order, is_published")
        .eq("is_published", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });

      if (error) throw new Error(error.message);

      return (data ?? []).map((row) => ({
        id: row.id as string,
        imageUrl: row.image_url as string,
        alt: (row.alt ?? "") as string,
        sortOrder: (row.sort_order ?? 0) as number,
        isPublished: Boolean(row.is_published),
      }));
    } catch (e) {
      console.error("[vivant] ギャラリーの取得に失敗しました:", e);
      return [];
    }
  },
  ["published-gallery"],
  { tags: [CACHE_TAGS.gallery] }
);
