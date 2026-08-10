import { getAdminSupabase } from "../../../lib/supabase/admin";
import LinkForm, { type LinkRow } from "./LinkForm";
import styles from "../../admin.module.css";

/**
 * SNSリンクの設定画面。
 * 空欄の行も含めて全部見せる必要があるため、秘密キーを使う側から読む
 * （公開側の権限設定では、URLが空の行と非公開の行は返らない）。
 */
export const dynamic = "force-dynamic";

export default async function LinksPage() {
  const { data } = await getAdminSupabase()
    .from("site_links")
    .select("platform, label, url, is_published")
    .order("sort_order", { ascending: true });

  const links = (data ?? []) as LinkRow[];

  return (
    <>
      <div className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>SNSリンク</h1>
          <p className={styles.pageNote}>
            公式LINEやInstagramのURLを入れると、サイトのご予約欄とアクセス欄にボタンが出ます。
            URLが空のSNSは表示されません。
          </p>
        </div>
      </div>

      {links.length === 0 ? (
        <div className={styles.tableWrap}>
          <p className={styles.empty}>
            リンクの枠がまだありません。データベースの初期設定が済んでいない可能性があります。
          </p>
        </div>
      ) : (
        <LinkForm links={links} />
      )}
    </>
  );
}
