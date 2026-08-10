import { notFound } from "next/navigation";
import { getAdminSupabase } from "../../../../../lib/supabase/admin";
import PostForm from "../../PostForm";
import styles from "../../../../admin.module.css";

/** 記事の編集。Next.js 16 では params が非同期なので await して受け取る */
export const dynamic = "force-dynamic";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data } = await getAdminSupabase()
    .from("posts")
    .select("id, slug, title, excerpt, body, cover_url, is_published")
    .eq("id", id)
    .maybeSingle();

  if (!data) notFound();

  return (
    <>
      <h1 className={styles.pageTitle}>記事の編集</h1>
      <p className={styles.pageNote}>{data.title}</p>
      <PostForm
        initial={{
          id: data.id,
          slug: data.slug,
          title: data.title,
          excerpt: data.excerpt ?? "",
          body: data.body ?? "",
          isPublished: Boolean(data.is_published),
          coverUrl: data.cover_url ?? null,
        }}
      />
    </>
  );
}
