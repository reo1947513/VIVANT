/**
 * 管理画面で扱う動的データの型。
 *
 * 店舗の固定情報（住所・料金・営業時間など）は app/data/siteData.ts に置く。
 * こちらは管理画面から更新される情報（キャスト・ギャラリー・出勤・ブログ）を扱う。
 *
 * 掲載方針（重要）：
 *   キャストは本人同意を得た実在の方のみを掲載する。開発中はAI生成のデモ画像を
 *   使っているため、本公開前に必ず実在・本人同意済みの実写真へ差し替えること
 *   （景品表示法・風営法の観点から、実在しない人物を在籍キャストとして掲載しない）。
 */

/** キャスト1人分 */
export type Cast = {
  id: string;
  name: string; // 源氏名
  word: string; // 一言（仮公開中は TEMP_HIDE_CWORD により非表示）
  photoUrl: string | null; // 写真の公開URL。null なら「NO IMAGE」表示
  sortOrder: number;
  isPublished: boolean;
};

/** ギャラリーの写真1枚 */
export type GalleryImage = {
  id: string;
  imageUrl: string;
  alt: string;
  sortOrder: number;
  isPublished: boolean;
};

/** 出勤1件（1キャストの1日分） */
export type Shift = {
  id: string;
  castId: string;
  castName: string;
  workDate: string; // "YYYY-MM-DD"（日本時間の暦日。時差の影響を受けない文字列で持つ）
  startTime: string | null; // "HH:MM"
  endTime: string | null; // "HH:MM"
  note: string;
};

/** ブログ記事 */
export type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string; // プレーンテキスト。HTMLとして描画しない（改行のみ反映）
  coverUrl: string | null;
  isPublished: boolean;
  publishedAt: string | null;
};
