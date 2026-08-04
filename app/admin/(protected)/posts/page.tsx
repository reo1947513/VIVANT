import Link from "next/link";
import { getAdminSupabase } from "../../../lib/supabase/admin";
import PostTable, { type PostRow } from "./PostTable";
import styles from "../../admin.module.css";

/** 記事一覧。下書きも含めて新しい順に表示する */
export const dynamic = "force-dynamic";

export default async function PostsPage() {
  const { data, error } = await getAdminSupabase()
    .from("posts")
    .select("id, slug, title, is_published, published_at, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[vivant] 記事一覧の取得に失敗:", error.message);
  }

  const posts = (data ?? []) as PostRow[];

  return (
    <>
      <div className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>ブログ</h1>
          <p className={styles.pageNote}>
            公開した記事は /blog に一覧で並び、トップページには最新3件が出ます。
          </p>
        </div>
        <Link className={styles.btnLink} href="/admin/posts/new">
          新規作成
        </Link>
      </div>

      <PostTable posts={posts} />
    </>
  );
}
