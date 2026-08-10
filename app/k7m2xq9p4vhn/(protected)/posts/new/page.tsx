import PostForm from "../PostForm";
import styles from "../../../admin.module.css";

export const dynamic = "force-dynamic";

export default function NewPostPage() {
  return (
    <>
      <h1 className={styles.pageTitle}>記事の作成</h1>
      <p className={styles.pageNote}>
        「公開する」に印を付けずに保存すると、下書きとして保管されます。
      </p>
      <PostForm
        initial={{
          slug: "",
          title: "",
          excerpt: "",
          body: "",
          isPublished: false,
          coverUrl: null,
        }}
      />
    </>
  );
}
