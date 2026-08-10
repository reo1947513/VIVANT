import Link from "next/link";
import { getAdminSupabase } from "../../../lib/supabase/admin";
import { adminPath } from "../../../lib/adminPath";
import CastTable, { type CastRow } from "./CastTable";
import styles from "../../admin.module.css";

/**
 * キャスト一覧。
 * 非公開の行も見せる必要があるため、行レベルセキュリティを通さない管理用の接続で読む。
 * このページに入れるのは (protected) のレイアウトで管理者だけに限られている。
 */
export const dynamic = "force-dynamic";

export default async function CastsPage() {
  const { data, error } = await getAdminSupabase()
    .from("casts")
    .select("id, name, word, photo_url, sort_order, is_published")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[vivant] キャスト一覧の取得に失敗:", error.message);
  }

  const casts = (data ?? []) as CastRow[];

  return (
    <>
      <div className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>キャスト</h1>
          <p className={styles.pageNote}>
            上から順にサイトへ表示されます。非公開にすると、サイトからは見えなくなります。
          </p>
        </div>
        <Link className={styles.btnLink} href={adminPath("casts/new")}>
          新規追加
        </Link>
      </div>

      <CastTable casts={casts} />
    </>
  );
}
