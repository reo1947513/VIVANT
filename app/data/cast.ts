/**
 * 在籍キャストの一覧。
 *
 * ここに置く理由：
 *   キャスト写真が実在するかどうかは、サーバー側（ページを組み立てる時点）で
 *   public/images/cast/ を見て判定する。判定を行う page.tsx と、表示を行う
 *   CastCarousel（ブラウザ側で動くカルーセル）の双方から同じ一覧を参照する必要があるため、
 *   コンポーネントの中ではなくデータとして切り出している。
 *
 * 掲載方針（重要）：
 *   本人同意を得た実在キャストのみを掲載する。現在の写真は【開発確認用のデモ画像】
 *   （AI生成・実在しない）であり、本番公開前に必ず実在・本人同意済みキャストの実写真へ
 *   差し替えること（景品表示法・風営法の観点から、実在しない人物を在籍キャストとして
 *   掲載しない）。差し替え手順は public/images/cast/README.txt を参照。
 *
 * 運用：
 *   ・写真は public/images/cast/<file>.jpg を置けば表示、無ければ「NO IMAGE」表示。
 *   ・表示名は現在は仮名（Rin/Mai/Yua/Nao/Saki/Emi）。実在の源氏名が決まり次第ここを差し替える。
 *   ・辞めた方はこの配列から削除、追加は1件複製。並び順もここで決まる。
 */
export type Cast = {
  name: string; // 表示名（源氏名）
  word: string; // 一言（仮公開中は非表示。CastCarousel の TEMP_HIDE_CWORD で制御）
  file: string; // 写真ファイル名（拡張子なし。public/images/cast/<file>.jpg）
};

/** 写真の有無をサーバー側で判定した結果を添えたキャスト情報 */
export type CastWithPhoto = Cast & { hasPhoto: boolean };

export const CAST: Cast[] = [
  { name: "Rin", word: "よろしくね。", file: "rin" },
  { name: "Mai", word: "乾杯しましょ。", file: "mai" },
  { name: "Yua", word: "ゆっくりどうぞ。", file: "yua" },
  { name: "Nao", word: "お待ちしてます。", file: "nao" },
  { name: "Saki", word: "楽しみましょう。", file: "saki" },
  { name: "Emi", word: "またお話したいな。", file: "emi" },
];

/** キャスト写真のパス（public/ からの相対）。存在判定と表示の双方でここを使う。 */
export function castPhotoSrc(file: string): string {
  return `/images/cast/${file}.jpg`;
}
