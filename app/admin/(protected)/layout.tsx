import { requireAdmin } from "../../lib/auth";
import AdminShell from "./AdminShell";

/**
 * 認証で守られた領域のレイアウト。
 *
 * (protected) という括弧付きの名前は URL に現れないので、この下のページは
 * /admin/casts のようにそのままの住所で開ける。ここで1回確認しておけば、
 * 下にページを足したときに確認を書き忘れても親が守る。
 *
 * ただしこれだけを頼りにはしない。書き込みを行う API 側でも毎回確認する。
 *
 * force-dynamic：ログイン状態は cookie を見ないと分からないため、作り置きできない。
 */
export const dynamic = "force-dynamic";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();

  return <AdminShell email={user.email}>{children}</AdminShell>;
}
