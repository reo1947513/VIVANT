/**
 * 動作確認用に入れたキャストと出勤情報を、本番から片付けるスクリプト。
 *
 * 既定では何も消さず、対象を一覧で出すだけ（下見）。
 * 実際に消すのは --apply を付けたときだけにしている。
 * 本番のデータを触るため、目で確かめてから消せるようにするのが目的。
 *
 * 実行：
 *   npm run clean:test                    … 対象を一覧表示するだけ（消さない）
 *   npm run clean:test -- --apply         … 出勤情報だけ消す
 *   npm run clean:test -- --apply --with-casts
 *                                         … 出勤情報に加えてキャスト本体と写真も消す
 *   npm run clean:test -- --names "Rin,Mai"
 *                                         … 対象の名前を変える（既定は Rin,Mai,Yua）
 *
 * 注意：
 *   - 秘密キー（SUPABASE_SECRET_KEY）を使うため、実行できるのは手元だけ（.env.local を読む）。
 *   - 消したあとは公開ページの作り置きを捨てないと、しばらく古い内容が出る。
 *     管理画面で何か1つ保存し直すか、最大5分待てば入れ替わる（ISR revalidate 300）。
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

const args = process.argv.slice(2);
const apply = args.includes("--apply");
const withCasts = args.includes("--with-casts");

const namesIndex = args.indexOf("--names");
const names =
  namesIndex >= 0 && args[namesIndex + 1]
    ? args[namesIndex + 1]
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : ["Rin", "Mai", "Yua"];

const supabase = createClient(url, secret, {
  auth: { persistSession: false, autoRefreshToken: false },
});

console.log(`対象の名前: ${names.join(" / ")}`);
console.log(apply ? "モード: 削除を実行します" : "モード: 下見（何も消しません）");
console.log("");

// 1. 対象のキャストを探す
const { data: casts, error: castError } = await supabase
  .from("casts")
  .select("id, name, photo_url, is_published, sort_order")
  .in("name", names);

if (castError) {
  console.error("キャストの取得に失敗しました:", castError.message);
  process.exit(1);
}

if (!casts || casts.length === 0) {
  console.log("該当するキャストはありませんでした。片付け済みか、名前が違います。");
  console.log("");
  console.log("■ 現在登録されている全キャストと出勤件数");

  const { data: allCasts, error: allError } = await supabase
    .from("casts")
    .select("id, name, is_published, sort_order")
    .order("sort_order", { ascending: true });

  if (allError) {
    console.error("一覧の取得に失敗しました:", allError.message);
    process.exit(1);
  }
  if (!allCasts || allCasts.length === 0) {
    console.log("  （キャストの登録がありません）");
    process.exit(0);
  }

  const { data: allShifts, error: allShiftError } = await supabase
    .from("shifts")
    .select("cast_id, work_date");

  if (allShiftError) {
    console.error("出勤情報の取得に失敗しました:", allShiftError.message);
    process.exit(1);
  }

  const counts = {};
  const ranges = {};
  for (const s of allShifts ?? []) {
    counts[s.cast_id] = (counts[s.cast_id] ?? 0) + 1;
    const r = ranges[s.cast_id];
    if (!r) ranges[s.cast_id] = { first: s.work_date, last: s.work_date };
    else {
      if (s.work_date < r.first) r.first = s.work_date;
      if (s.work_date > r.last) r.last = s.work_date;
    }
  }

  for (const c of allCasts) {
    const n = counts[c.id] ?? 0;
    const r = ranges[c.id];
    const period = r ? `（${r.first} 〜 ${r.last}）` : "";
    console.log(
      `  ${String(c.sort_order).padStart(2)} ${c.name}${c.is_published ? "" : "【非公開】"}` +
        `  出勤 ${n} 件 ${period}`
    );
  }
  console.log("");
  console.log("消したい名前が分かったら、次のように指定してください。");
  console.log('  npm run clean:test -- --names "名前1,名前2"');
  process.exit(0);
}

console.log("■ 該当キャスト");
for (const c of casts) {
  console.log(
    `  ${c.name}（${c.is_published ? "公開中" : "非公開"} / 並び順 ${c.sort_order} / 写真 ${
      c.photo_url ? "あり" : "なし"
    }）`
  );
  console.log(`    id: ${c.id}`);
}
console.log("");

const castIds = casts.map((c) => c.id);

// 2. 紐づく出勤情報を数える
const { data: shifts, error: shiftError } = await supabase
  .from("shifts")
  .select("id, cast_id, work_date, status")
  .in("cast_id", castIds)
  .order("work_date", { ascending: true });

if (shiftError) {
  console.error("出勤情報の取得に失敗しました:", shiftError.message);
  process.exit(1);
}

const nameOf = Object.fromEntries(casts.map((c) => [c.id, c.name]));

console.log(`■ 該当する出勤情報：${shifts?.length ?? 0} 件`);
if (shifts && shifts.length > 0) {
  const perCast = {};
  for (const s of shifts) {
    const key = nameOf[s.cast_id] ?? s.cast_id;
    perCast[key] = (perCast[key] ?? 0) + 1;
  }
  for (const [name, count] of Object.entries(perCast)) {
    console.log(`  ${name}: ${count} 件`);
  }
  const first = shifts[0].work_date;
  const last = shifts[shifts.length - 1].work_date;
  console.log(`  期間: ${first} 〜 ${last}`);
}
console.log("");

if (!apply) {
  console.log("下見はここまでです。消す場合は次を実行してください。");
  console.log("  npm run clean:test -- --apply              … 出勤情報のみ");
  console.log("  npm run clean:test -- --apply --with-casts … キャスト本体と写真も");
  process.exit(0);
}

// 3. 出勤情報を消す
if (shifts && shifts.length > 0) {
  const { error } = await supabase.from("shifts").delete().in("cast_id", castIds);
  if (error) {
    console.error("出勤情報を消せませんでした:", error.message);
    process.exit(1);
  }
  console.log(`出勤情報を ${shifts.length} 件消しました。`);
} else {
  console.log("消す出勤情報はありませんでした。");
}

if (!withCasts) {
  console.log("");
  console.log("キャスト本体は残しています（--with-casts を付けると消します）。");
  process.exit(0);
}

// 4. 写真を消す（Storage の実体。消さないと使われない画像が残り続ける）
const photoPaths = casts
  .map((c) => c.photo_url)
  .filter(Boolean)
  .map((u) => {
    // 公開URLは .../object/public/cast-photos/<パス> の形。バケット名より後ろが実体の位置
    const marker = "/cast-photos/";
    const at = u.indexOf(marker);
    return at >= 0 ? u.slice(at + marker.length) : null;
  })
  .filter(Boolean);

if (photoPaths.length > 0) {
  const { error } = await supabase.storage.from("cast-photos").remove(photoPaths);
  if (error) {
    // 写真が消せなくてもキャストは消せるため、ここでは止めずに知らせるだけにする
    console.error("写真を消せませんでした（手動で確認してください）:", error.message);
  } else {
    console.log(`写真を ${photoPaths.length} 件消しました。`);
  }
}

// 5. キャスト本体を消す
const { error: delCastError } = await supabase.from("casts").delete().in("id", castIds);
if (delCastError) {
  console.error("キャストを消せませんでした:", delCastError.message);
  process.exit(1);
}
console.log(`キャストを ${casts.length} 名消しました。`);
console.log("");
console.log("公開ページの表示は、管理画面で何か1つ保存し直すか、最大5分で入れ替わります。");
