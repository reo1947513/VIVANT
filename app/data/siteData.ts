/**
 * BAR VIVANT 店舗の「不変の固定情報」一元管理ファイル。
 *
 * 目的：今後デザインを大きく作り替えても、住所・電話・営業時間・料金・コンセプト等の
 *       不変情報を各コンポーネントから繰り返し参照できるよう、ここ一箇所に集約する。
 *       各コンポーネントはこの定義を import して表示する（直書き禁止）。
 *
 * 対象：店舗の固定情報のみ（店名・住所・電話・営業時間・定休・TikTok URL・料金・
 *       シャンパン銘柄・コンセプト文・FEATURES 文言・メタ情報・地図クエリ・コピーライト）。
 * 対象外：キャスト・出勤・ブログ等の動的情報（将来 Supabase で扱う。ここには混在させない）。
 *
 * 注意：
 *  - 表示文字列は移行前と一字一句変えないこと（内部リファクタリングであり見た目は不変）。
 *  - 料金は実データ・税込明記を厳守。シャンパンは銘柄のみで金額は非掲載。
 *  - noindex（robots）等の仮公開安全策はここでは扱わない（layout.tsx の robots を維持）。
 */

// 電話番号は表示用を単一の真実とし、tel: リンク用はそこからハイフンを除去して生成する
// （表示用と発信用が食い違わないようにするため）。
const TEL_DISPLAY = "06-6690-8636";

export type ShopAddress = {
  postal: string; // 郵便番号（〒は付けない。表示時に付与）
  line1: string; // 都道府県市区町村・丁目番地
  line2: string; // 建物名・階
};

export type ShopTel = {
  display: string; // 表示用（ハイフンあり）
  link: string; // tel: リンク用（数字のみ）
};

export type ShopHours = {
  range: string; // 営業時間帯
  daysNote: string; // 営業曜日の注記
};

export type Shop = {
  nameEn: string; // 英字表記
  nameKana: string; // かな表記
  nameFull: string; // 表記ゆれ統合：英字（かな）
  address: ShopAddress;
  mapQuery: string; // Google マップ埋め込み用の住所クエリ（建物名まで・階は含めない）
  tel: ShopTel;
  hours: ShopHours;
  closed: string; // 定休日
  tiktokUrl: string;
  copyrightYear: number;
};

export const shop: Shop = {
  nameEn: "BAR VIVANT",
  nameKana: "バー ヴィヴァン",
  nameFull: "BAR VIVANT（バー ヴィヴァン）",
  address: {
    postal: "530-0002",
    line1: "大阪府大阪市北区曽根崎新地1丁目5-15",
    line2: "シャンテ北新地 1階",
  },
  mapQuery: "大阪府大阪市北区曽根崎新地1丁目5-15 シャンテ北新地",
  tel: {
    display: TEL_DISPLAY,
    link: TEL_DISPLAY.replace(/-/g, ""),
  },
  hours: {
    range: "20:00 〜 翌5:00",
    daysNote: "火〜日",
  },
  closed: "月曜",
  tiktokUrl: "https://www.tiktok.com/@bar.vivant",
  copyrightYear: 2026,
};

// Google マップ埋め込み URL（APIキー不要の output=embed 形式）。住所クエリから生成。
export const mapEmbedSrc = `https://www.google.com/maps?q=${encodeURIComponent(
  shop.mapQuery
)}&output=embed`;

// コピーライト表記（年・店名から生成）
export const copyright = `© ${shop.copyrightYear} ${shop.nameEn}. ALL RIGHTS RESERVED.`;

export type PriceCard = {
  en: string; // 英字ラベル
  ja: string; // 日本語ラベル
  amount: string; // 金額（円記号は付けない。表示時に付与）
  unit: string; // 単位・注記
  note?: string; // 補足（中央カードのみ）
  badge?: string; // バッジ（中央カードのみ）
};

export const prices: {
  counterFirst: PriceCard;
  tiktokFirst: PriceCard;
  boxFirst: PriceCard;
  extend: string;
  payment: string;
  notes: string[];
} = {
  // 左：カウンター席・初回（確定・税込）
  counterFirst: { en: "COUNTER", ja: "カウンター席・初回", amount: "5,000", unit: "50分／税込" },
  // 中央：TikTokをご覧の方・初回（主訴求・確定・税込）
  tiktokFirst: {
    en: "SPECIAL",
    ja: "TikTokをご覧の方・初回",
    amount: "3,000",
    unit: "50分／税込",
    note: "カウンター・ボックス共通",
    badge: "おすすめ",
  },
  // 右：ボックス席・初回（確定・税込）
  boxFirst: { en: "BOX", ja: "ボックス席・初回", amount: "7,000", unit: "50分／税込" },
  // 延長（確定・税込）
  extend: "30分 4,500円 ／ 50分 7,000円（全席共通・税込）",
  // お支払い方法（未確認・確認中表記）
  payment: "お支払い方法については、ただいま確認中です。詳しくはスタッフまでお問い合わせください。",
  // 注記（税込明記・変更ありうる旨）
  notes: ["※表示料金はすべて税込です。", "※システムは予告なく変更となる場合があります。"],
};

// シャンパン：銘柄のみ・金額は非掲載（方針）。表示は銘柄を「／」で連結し、末尾に案内文を付ける。
export const champagnes: string[] = [
  "ドン・ペリニヨン",
  "クリスタル",
  "アルマンド",
  "ベル・エポック",
  "ソウメイ",
  "モエ・エ・シャンドン",
  "ヴーヴ・クリコ",
];
export const champagneSuffix = "　など各種ご用意（金額はスタッフまで）";

// CONCEPT 本文（行ごと）
export const concept: { lines: string[] } = {
  lines: [
    "日常を離れ、上質な時間に浸る大人のための隠れ家。",
    "落ち着いた空間と、心をほどくおもてなしで、",
    "ゆったりとした夜の時間をお迎えします。",
  ],
};

export type Feature = {
  title: string; // 見出し
  lines: string[]; // 説明文（行ごと。表示時は <br> で連結）
};

// FEATURES 各見出しと説明文。料金に触れる行は prices から生成して単一ソース化する。
export const features: Feature[] = [
  { title: "上質な空間", lines: ["落ち着いた照明と静かな音楽。", "北新地の隠れ家でくつろぐ夜を。"] },
  { title: "厳選されたお酒", lines: ["定番から銘酒・シャンパンまで。", "その日の気分に合う一杯を。"] },
  { title: "心地よいおもてなし", lines: ["気取らない接客で、", "初めての方も安心です。"] },
  {
    title: "明朗な料金",
    lines: [`初回${prices.tiktokFirst.amount}円からの分かりやすい料金。`, "安心してお過ごしいただけます。"],
  },
];

// メタ情報（タイトル・説明）。店名・料金から生成し、表記ゆれと料金を単一ソース化する。
// robots（noindex）の仮公開安全策は layout.tsx 側で管理し、ここでは扱わない。
export const meta = {
  title: `${shop.nameFull}｜大阪・北新地のガールズバー`,
  description: `大阪・北新地（曽根崎新地）のガールズバー ${shop.nameEn}。北新地の夜に、上質な余韻を。落ち着いた空間で、ゆったりとした大人の時間を。TikTokをご覧の方は初回${prices.tiktokFirst.amount}円。`,
};
