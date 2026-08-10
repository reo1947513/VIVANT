import { redirect } from "next/navigation";
import { ADMIN_HOME_PATH } from "../../lib/adminPath";

/** 管理画面の入口を開いたら、最初の項目であるキャスト管理へ送る */
export default function AdminIndexPage() {
  redirect(ADMIN_HOME_PATH);
}
