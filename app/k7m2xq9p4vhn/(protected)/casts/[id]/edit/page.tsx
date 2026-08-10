import { notFound } from "next/navigation";
import { getAdminSupabase } from "../../../../../lib/supabase/admin";
import CastForm from "../../CastForm";
import styles from "../../../../admin.module.css";

/** キャストの編集。Next.js 16 では params が非同期なので await して受け取る */
export const dynamic = "force-dynamic";

export default async function EditCastPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data } = await getAdminSupabase()
    .from("casts")
    .select("id, name, word, photo_url, is_published")
    .eq("id", id)
    .maybeSingle();

  if (!data) notFound();

  return (
    <>
      <h1 className={styles.pageTitle}>キャストの編集</h1>
      <p className={styles.pageNote}>{data.name}</p>
      <CastForm
        initial={{
          id: data.id,
          name: data.name,
          word: data.word ?? "",
          isPublished: Boolean(data.is_published),
          photoUrl: data.photo_url ?? null,
        }}
      />
    </>
  );
}
