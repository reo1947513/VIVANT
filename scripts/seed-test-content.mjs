/**
 * 表示確認用のテストデータ（出勤情報とブログ）を入れるスクリプト。
 *
 * 出勤情報は「ことね」「りあ」の2名分を今日から7日間に散らして入れ、
 * ブログは2名がそれぞれ書いた体裁の記事を1本ずつ公開状態で入れる。
 *
 * 実行：
 *   npm run seed:test            … 入れる
 *   npm run seed:test -- --remove … このスクリプトが入れた分だけ消す
 *
 * 消す対象は下の TEST_POST_SLUGS の記事と、対象2名の今日から7日間の出勤のみ。
 * ほかの記事やキャスト、既存の出勤には触れない。
 *
 * 注意：
 *   本番のデータベースに入るため、公開サイトにもそのまま出る。確認が済んだら
 *   --remove か管理画面から消すこと。
 *   秘密キー（SUPABASE_SECRET_KEY）を使うため、実行できるのは手元だけ（.env.local を読む）。
 */
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

// .env.local を読む（Node からは自動で読み込まれないため）
const envPath = path.join(process.cwd(), ".env.local");
if (existsSync(envPath)) {
  const text = await readFile(envPath, "utf8");
  for (const line of text.split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;
if (!url || !secret) {
  console.error("NEXT_PUBLIC_SUPABASE_URL と SUPABASE_SECRET_KEY が必要です（.env.local）");
  process.exit(1);
}

const remove = process.argv.includes("--remove");

const supabase = createClient(url, secret, {
  auth: { persistSession: false, autoRefreshToken: false },
});

/** 対象のキャスト名 */
const CAST_NAMES = ["ことね", "りあ"];

/** このスクリプトが作る記事。消すときもこの一覧だけを対象にする */
const TEST_POST_SLUGS = ["kotone-hello", "ria-first-day"];

/** 日本時間の「今日」を YYYY-MM-DD で返す */
function todayJst() {
  const now = new Date();
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return jst.toISOString().slice(0, 10);
}

/** YYYY-MM-DD に日数を足す */
function addDays(date, days) {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

const start = todayJst();
const dates = Array.from({ length: 7 }, (_, i) => addDays(start, i));

// 対象キャストの id を引く
const { data: casts, error: castError } = await supabase
  .from("casts")
  .select("id, name")
  .in("name", CAST_NAMES);

if (castError) {
  console.error("キャストの取得に失敗しました:", castError.message);
  process.exit(1);
}

const idOf = new Map((casts ?? []).map((row) => [row.name, row.id]));
for (const name of CAST_NAMES) {
  if (!idOf.has(name)) {
    console.error(`キャストが見つかりません: ${name}（先に登録してください）`);
    process.exit(1);
  }
}

if (remove) {
  const { error: shiftError } = await supabase
    .from("shifts")
    .delete()
    .in("cast_id", CAST_NAMES.map((name) => idOf.get(name)))
    .gte("work_date", dates[0])
    .lte("work_date", dates[dates.length - 1]);

  if (shiftError) console.error("出勤の削除に失敗:", shiftError.message);
  else console.log(`出勤を消しました（${dates[0]}〜${dates[dates.length - 1]}・対象2名）`);

  const { error: postError } = await supabase
    .from("posts")
    .delete()
    .in("slug", TEST_POST_SLUGS);

  if (postError) console.error("記事の削除に失敗:", postError.message);
  else console.log(`記事を消しました（${TEST_POST_SLUGS.join(" / ")}）`);

  console.log("テストデータの削除が完了しました。");
  process.exit(0);
}

// ---------------------------------------------------------------- 出勤情報
// [何日目, キャスト名, 開店時刻, 退勤時刻]。7日目は2人とも休みにして、空の日の見え方も確かめる
const SHIFT_PLAN = [
  [0, "ことね", "20:00", "01:00"],
  [0, "りあ", "21:00", "02:00"],
  [1, "ことね", "20:00", "01:00"],
  [2, "りあ", "20:00", "02:00"],
  [3, "ことね", "21:00", "01:00"],
  [3, "りあ", "21:00", "01:00"],
  [4, "りあ", "20:00", "01:00"],
  [5, "ことね", "20:00", "00:00"],
];

const shiftRows = SHIFT_PLAN.map(([offset, name, startTime, endTime]) => ({
  cast_id: idOf.get(name),
  work_date: dates[offset],
  start_time: startTime,
  end_time: endTime,
  note: "",
  is_published: true,
}));

// 同じキャストの同じ日は1件だけ（unique 制約）。すでにあれば上書きする
const { error: shiftError } = await supabase
  .from("shifts")
  .upsert(shiftRows, { onConflict: "cast_id,work_date" });

if (shiftError) {
  console.error("出勤の登録に失敗しました:", shiftError.message);
} else {
  console.log(`出勤を登録しました（${dates[0]}〜${dates[dates.length - 1]}・${shiftRows.length}件）`);
}

// ---------------------------------------------------------------- ブログ
const now = new Date().toISOString();

const POSTS = [
  {
    slug: "kotone-hello",
    title: "はじめまして、ことねです",
    excerpt: "新しく入りました、ことねです。お店の雰囲気と、わたしのことを少しだけ。",
    body: [
      "はじめまして、ことねです。",
      "",
      "北新地は初めてで、最初はお店の扉を開けるのも緊張しましたが、",
      "先輩たちがすぐに声をかけてくださって、今ではすっかり居心地のいい場所になりました。",
      "",
      "お酒はそこまで強くないので、ゆっくり話しながら飲むのが好きです。",
      "無理に飲ませたりはしないので、お仕事帰りに少しだけ寄る、くらいの気持ちで来てください。",
      "",
      "最近は甘くないハイボールを覚えました。おすすめの一杯があればぜひ教えてください。",
      "",
      "カウンターでお待ちしています。",
      "",
      "ことね",
    ].join("\n"),
  },
  {
    slug: "ria-first-day",
    title: "りあの、はじめての出勤日",
    excerpt: "初出勤の夜に感じたことと、これからお店でやってみたいことを書きました。",
    body: [
      "こんばんは、りあです。",
      "",
      "初出勤の日は、開店前のお店がしんと静かで、グラスを並べる音だけが響いていました。",
      "あの時間の空気がすごく好きで、今でも少し早めに入るようにしています。",
      "",
      "その日いらしたお客様が「緊張してる？」と笑ってくださって、",
      "そこからやっと肩の力が抜けたのを覚えています。",
      "",
      "話を聞くのが好きなので、仕事の愚痴でも、最近見た映画の話でも大丈夫です。",
      "静かに飲みたい日は、こちらから話しかけすぎないようにもしています。",
      "",
      "次はカクテルをもう少し覚えたいと思っています。",
      "",
      "りあ",
    ].join("\n"),
  },
];

for (const post of POSTS) {
  const { error } = await supabase.from("posts").upsert(
    {
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      body: post.body,
      is_published: true,
      published_at: now,
    },
    { onConflict: "slug" }
  );

  if (error) console.error(`記事の登録に失敗: ${post.slug}:`, error.message);
  else console.log(`記事を登録しました: ${post.title}（/blog/${post.slug}・公開）`);
}

console.log("テストデータの投入が完了しました。");
