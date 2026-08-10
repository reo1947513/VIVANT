/**
 * 管理画面の住所（URL）を1か所にまとめたもの。
 *
 * なぜ定数にするのか：
 *   管理画面は検索や当てずっぽうで見つからないよう、住所を「/admin」ではなく
 *   意味を持たない文字列にしている。画面ごとにこの文字列を直接書いてしまうと、
 *   住所を変えたくなったときに全ファイルを直す羽目になり、直し漏れも起きる。
 *   ここだけを見れば住所が分かる形にしておく。
 *
 * 住所を変えるときは、次の2か所を必ず同時に直すこと：
 *   1. この ADMIN_BASE の文字列
 *   2. app/ 直下のフォルダ名（現在は app/k7m2xq9p4vhn）
 *   Next.js はフォルダ名がそのまま住所になるため、片方だけ直すと画面が開けなくなる。
 *
 * 注意：
 *   これは目隠しであって、鍵ではない。実際の守りは app/lib/auth.ts の
 *   ログイン確認と、データベース側の管理者台帳が担っている。
 *   住所が漏れても、ログインできなければ中身は見られない。
 */

/** 管理画面の入口。先頭のスラッシュを含み、末尾には付けない */
export const ADMIN_BASE = "/k7m2xq9p4vhn";

/** ログイン画面 */
export const ADMIN_LOGIN_PATH = `${ADMIN_BASE}/login`;

/** ログイン後の最初の画面（キャスト管理） */
export const ADMIN_HOME_PATH = `${ADMIN_BASE}/casts`;

/**
 * 管理画面の中の住所を作る。
 * 使い方： adminPath("posts") → "/k7m2xq9p4vhn/posts"
 *          adminPath(`posts/${id}/edit`) → "/k7m2xq9p4vhn/posts/xxx/edit"
 */
export function adminPath(sub: string): string {
  const trimmed = sub.replace(/^\/+/, "");
  return trimmed ? `${ADMIN_BASE}/${trimmed}` : ADMIN_BASE;
}
