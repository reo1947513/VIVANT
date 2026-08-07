import { revalidatePath, revalidateTag } from "next/cache";

/**
 * 管理画面で内容を書き換えたあと、公開ページの内容を作り直させる。
 *
 * なぜ必要か：
 *   公開ページは表示を速くするため、いったん作った内容を一定時間そのまま配る
 *   （静的生成＋一定間隔での作り直し）。何もしないと、管理画面で保存しても
 *   LP には最大で数分間反映されない。そこで書き込んだ側から「この種類の内容は
 *   古くなった」と明示的に伝え、次のアクセスで作り直させる。
 *
 * 注意：
 *   **書き込みを行う処理には必ずこれを入れること。** 入れ忘れると
 *   「保存したのにサイトに出ない」という分かりにくい不具合になる。
 */
export type ContentKind = "casts" | "gallery" | "shifts" | "posts" | "links";

/** 内容の種類ごとのキャッシュ札。問い合わせ側（queries/*）と同じ文字列を使う */
export const CACHE_TAGS: Record<ContentKind, string> = {
  casts: "casts",
  gallery: "gallery",
  shifts: "shifts",
  posts: "posts",
  links: "links",
};

/**
 * @param kind 書き換えた内容の種類
 * @param slug ブログ記事を書き換えた場合は、その記事の URL 名（個別ページも作り直す）
 */
export function revalidatePublic(kind: ContentKind, slug?: string): void {
  // Next.js 16 では第2引数が必須になった。
  //   "max" を渡すと「古い内容を配りながら裏で作り直す」動きになり、保存直後の
  //   1回目のアクセスでは古い内容が返る。管理画面で保存してすぐ確認したときに
  //   「反映されていない」と見えるため、ここでは即座に期限切れにする指定を使う。
  //   次のアクセスは作り直しを待つぶん少し遅くなるが、確実に新しい内容が出る。
  revalidateTag(CACHE_TAGS[kind], { expire: 0 });
  // トップページはすべての種類を載せているので常に対象
  revalidatePath("/");

  if (kind === "posts") {
    revalidatePath("/blog");
    if (slug) revalidatePath(`/blog/${slug}`);
  }
}
