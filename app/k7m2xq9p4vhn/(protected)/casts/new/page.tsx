import CastForm from "../CastForm";
import styles from "../../../admin.module.css";

export const dynamic = "force-dynamic";

export default function NewCastPage() {
  return (
    <>
      <h1 className={styles.pageTitle}>キャストの追加</h1>
      <p className={styles.pageNote}>登録すると一覧の末尾に追加されます。</p>
      <CastForm
        initial={{ name: "", word: "", isPublished: true, photoUrl: null }}
      />
    </>
  );
}
