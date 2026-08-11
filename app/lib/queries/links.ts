import { unstable_cache } from "next/cache";
import { getPublicSupabase } from "../supabase/public";
import { hasSupabaseConfig } from "../supabase/env";
import { CACHE_TAGS } from "../revalidate";
import { shop } from "../../data/siteData";

/**
 * 公開ページ用のSNSリンク取得。
 *
 * 管理画面のSNSリンク画面で入れた URL を読む。URL が空の行と非公開の行は
 * データベース側の権限設定で最初から返らないため、ここに届くのは
 * 「出してよいリンク」だけになる。
 *
 * TikTok だけは、取得に失敗した場合に備えてコード側の値（app/data/siteData.ts）を
 * 予備として使う。以前からLPの各所に出ているボタンが、
 * 通信の失敗で急に消えることを避けるため。
 */
type SiteLink = {
  platform: string;
  label: string;
  url: string;
};

async function fetchLinks(): Promise<SiteLink[]> {
  if (!hasSupabaseConfig()) {
    console.error("[vivant] Supabase 未設定のためSNSリンクを既定値で描画します");
    return [{ platform: "tiktok", label: "TikTok", url: shop.tiktokUrl }];
  }

  try {
    const { data, error } = await getPublicSupabase()
      .from("site_links")
      .select("platform, label, url")
      .order("sort_order", { ascending: true });

    if (error) throw new Error(error.message);

    const links = (data ?? []).map((row) => ({
      platform: String(row.platform),
      label: String(row.label ?? ""),
      url: String(row.url ?? ""),
    }));

    // TikTok が1件も無い場合だけ、コード側の値を足す（従来の表示を保つため）
    if (!links.some((l) => l.platform === "tiktok") && shop.tiktokUrl) {
      links.unshift({ platform: "tiktok", label: "TikTok", url: shop.tiktokUrl });
    }

    return links;
  } catch (e) {
    console.error("[vivant] SNSリンクの取得に失敗しました:", e);
    return [{ platform: "tiktok", label: "TikTok", url: shop.tiktokUrl }];
  }
}

const cachedLinks = unstable_cache(fetchLinks, ["site-links"], {
  tags: [CACHE_TAGS.links],
});

export async function getSiteLinks(): Promise<SiteLink[]> {
  return cachedLinks();
}

