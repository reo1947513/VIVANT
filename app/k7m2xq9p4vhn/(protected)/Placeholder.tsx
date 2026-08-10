import styles from "../admin.module.css";

/**
 * 未実装の項目に出す仮の中身。
 * 段階を分けて作っているため、まだ着手していない項目はこれを表示して
 * 「壊れている」のか「これから作る」のかが分かるようにしておく。
 */
export default function Placeholder({
  title,
  note,
  phase,
}: {
  title: string;
  note: string;
  phase: string;
}) {
  return (
    <>
      <h1 className={styles.pageTitle}>{title}</h1>
      <p className={styles.pageNote}>{note}</p>
      <div className={styles.card}>
        <p>この画面は{phase}で作ります。まだ操作はできません。</p>
      </div>
    </>
  );
}
