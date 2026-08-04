import { redirect } from "next/navigation";
import { getAdminUser } from "../../lib/auth";
import LoginForm from "./LoginForm";
import styles from "../admin.module.css";

/**
 * ログイン画面。管理画面の中で唯一、ログインしていなくても開ける。
 * すでにログイン済みならそのまま管理画面へ送る。
 *
 * force-dynamic を付ける理由：ログイン状態は cookie を見ないと分からないため、
 * この画面は毎回サーバーで組み立てる必要がある（作り置きできない）。
 */
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await getAdminUser()) redirect("/admin/casts");

  return (
    <div className={styles.shell}>
      <div className={styles.loginWrap}>
        <div className={styles.loginCard}>
          <h1 className={styles.loginTitle}>BAR VIVANT 管理画面</h1>
          <p className={styles.loginNote}>
            登録された管理者のみログインできます。
          </p>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
