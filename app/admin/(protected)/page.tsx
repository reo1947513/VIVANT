import { redirect } from "next/navigation";

/** /admin を開いたら、最初の項目であるキャスト管理へ送る */
export default function AdminIndexPage() {
  redirect("/admin/casts");
}
