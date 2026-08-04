import { getAdminSupabase } from "../../../lib/supabase/admin";
import GalleryManager, { type GalleryRow } from "./GalleryManager";
import styles from "../../admin.module.css";

/**
 * ギャラリー管理。
 * 非公開の写真も見せる必要があるため、管理用の接続で読む。
 */
export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const { data, error } = await getAdminSupabase()
    .from("gallery_images")
    .select("id, image_url, sort_order, is_published")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[vivant] ギャラリー一覧の取得に失敗:", error.message);
  }

  const images = (data ?? []) as GalleryRow[];

  return (
    <>
      <h1 className={styles.pageTitle}>ギャラリー</h1>
      <p className={styles.pageNote}>
        店内の写真です。左から順にサイトへ表示されます。1枚も無いときは、サイトのギャラリーの
        区画そのものが表示されません。
      </p>

      <GalleryManager images={images} />
    </>
  );
}
