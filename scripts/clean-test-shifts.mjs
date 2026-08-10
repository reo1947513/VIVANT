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
 *   npm run clean:test -- --names=Rin,Mai … 対象の名前を変える（既定は Rin,Mai,Yua）
 *
 * 注意：
 *   - 秘密キー（SUPABASE_SECRET_KEY）を使うため、実行できるのは手元だけ（.env.local を読む）。
 *   - 【重要】消したあと、公開ページの表示は放っておいても入れ替わらない。
 *     キャストとギャラリーの取得は unstable_cache に有効期限を付けていないため、
 *     タグを無効化するまで作り置きが残り続ける（ページ側の revalidate = 300 は
 *     ページを作り直すだけで、作り置きのデータはそのまま使われる）。
 *     このスクリプトは手元から動かすため、その無効化を行えない。
 *     消した後は必ず管理画面で何か1つ保存し直すこと。それで作り置きが捨てられる。
 *     実在しない人物が公開ページに残り続けるのは景表法・風営法の観点で問題になるため、
 *     ここは「待てば直る」ではなく「必ず操作が要る」と理解しておくこと。
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

/**
 * 対象の名前を読み取る。
 *
 * --names を書いたのに読み取れなかった場合は、既定値へ落とさずにその場で止める。
 * 落としてしまうと「別の人を消すつもりで打ったのに、既定の3名が消えた」という
 * 取り返しのつかない事故になるため。--names=X と --names X の両方を受ける。
 */
const DEFAULT_NAMES = ["Rin", "Mai", "Yua"];

function readNames() {
  const eqArg = args.find((a) => a.startsWith("--names="));
  const flagIndex = args.indexOf("--names");

  if (eqArg === undefined && flagIndex < 0) return DEFAULT_NAMES;

  let raw;
  if (eqArg !== undefined) {
    raw = eqArg.slice("--names=".length);
  } else {
    const next = args[flagIndex + 1];
    // 値が無い、または次が別のフラグなら指定し損ねている
    if (next === undefined || next.startsWith("--")) raw = "";
    else raw = next;
  }

  const parsed = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (parsed.length === 0) {
    console.error("--names の値が読み取れませんでした。既定の名前では実行しません。");
    console.error('  例: npm run clean:test -- --names "Rin,Mai"');
    console.error("      npm run clean:test -- --names=Rin,Mai");
    process.exit(1);
  }
  return parsed;
}

const names = readNames();

const supabase = createClient(url, secret, {
  auth: { persistSession: false, autoRefreshToken: false },
});

console.log(`対象の名前: ${names.join(" / ")}`);
console.log(apply ? "モード: 削除を実行します" : "モード: 下見（何も消しません）");
console.log("");

/**
 * 出勤情報の件数を数える。
 * 行そのものを取ってきて数えると、PostgREST が既定で1000件までしか返さないため、
 * それを超えた分を見落とす。件数だけを問い合わせる形にして上限の影響を受けないようにする。
 */
async function countShifts(castIds) {
  const { count, error } = await supabase
    .from("shifts")
    .select("*", { count: "exact", head: true })
    .in("cast_id", castIds);
  if (error) throw new Error(error.message);
  return count ?? 0;
}

/** 出勤日の範囲。端の1件ずつだけ取るので、件数がいくら多くても上限にかからない */
async function shiftRange(castIds) {
  const [first, last] = await Promise.all([
    supabase
      .from("shifts")
      .select("work_date")
      .in("cast_id", castIds)
      .order("work_date", { ascending: true })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("shifts")
      .select("work_date")
      .in("cast_id", castIds)
      .order("work_date", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);
  if (first.error) throw new Error(first.error.message);
  if (last.error) throw new Error(last.error.message);
  if (!first.data || !last.data) return null;
  return { first: first.data.work_date, last: last.data.work_date };
}

// 1. 対象のキャストを探す
const { data: casts, error: castError } = await supabase
  .from("casts")
  .select("id, name, photo_url, photo_path, is_published, sort_order")
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

  for (const c of allCasts) {
    try {
      const n = await countShifts([c.id]);
      const r = n > 0 ? await shiftRange([c.id]) : null;
      const period = r ? `（${r.first} 〜 ${r.last}）` : "";
      console.log(
        `  ${String(c.sort_order).padStart(2)} ${c.name}${c.is_published ? "" : "【非公開】"}` +
          `  出勤 ${n} 件 ${period}`
      );
    } catch (e) {
      console.error(`  ${c.name} の出勤情報を数えられませんでした:`, e.message);
    }
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
      c.photo_path ? "あり" : "なし"
    }）`
  );
  console.log(`    id: ${c.id}`);
}
console.log("");

const castIds = casts.map((c) => c.id);

// 2. 紐づく出勤情報を数える
let shiftCount = 0;
try {
  shiftCount = await countShifts(castIds);
  console.log(`■ 該当する出勤情報：${shiftCount} 件`);
  if (shiftCount > 0) {
    for (const c of casts) {
      console.log(`  ${c.name}: ${await countShifts([c.id])} 件`);
    }
    const r = await shiftRange(castIds);
    if (r) console.log(`  期間: ${r.first} 〜 ${r.last}`);
  }
} catch (e) {
  console.error("出勤情報を数えられませんでした:", e.message);
  process.exit(1);
}
console.log("");

if (!apply) {
  console.log("下見はここまでです。消す場合は次を実行してください。");
  console.log("  npm run clean:test -- --apply              … 出勤情報のみ");
  console.log("  npm run clean:test -- --apply --with-casts … キャスト本体と写真も");
  process.exit(0);
}

// 3. 出勤情報を消す
if (shiftCount > 0) {
  const { error } = await supabase.from("shifts").delete().in("cast_id", castIds);
  if (error) {
    console.error("出勤情報を消せませんでした:", error.message);
    process.exit(1);
  }
  // 消したあとに数え直して、実際に0になったことを確かめる
  const remain = await countShifts(castIds).catch(() => null);
  console.log(
    remain === 0
      ? `出勤情報を ${shiftCount} 件消しました。`
      : `出勤情報を消しましたが、${remain} 件残っています。確認してください。`
  );
} else {
  console.log("消す出勤情報はありませんでした。");
}

if (!withCasts) {
  console.log("");
  console.log("キャスト本体は残しています（--with-casts を付けると消します）。");
  console.log("公開ページの表示を入れ替えるには、管理画面で何か1つ保存し直してください。");
  process.exit(0);
}

/*
 * 4. 写真を消す（Storage の実体。消さないと使われない画像が残り続ける）
 *
 * 消す位置は photo_path 列をそのまま使う。公開URLから逆算する方法は、
 * URLの形が変わると静かに外れる（Storage は存在しない位置を渡してもエラーにならないため、
 * 「消しました」と出たまま実体が残る）。app/lib/upload.ts が位置を記録しているのはこのため。
 */
const photoPaths = casts.map((c) => c.photo_path).filter(Boolean);
const missingPath = casts.filter((c) => !c.photo_path && c.photo_url);

if (missingPath.length > 0) {
  console.error(
    `写真の保存位置が記録されていないキャストが ${missingPath.length} 名います。` +
      "この写真は消せないため、Supabase の Storage から手で消してください:"
  );
  for (const c of missingPath) console.error(`  ${c.name}: ${c.photo_url}`);
}

if (photoPaths.length > 0) {
  const { data: removed, error } = await supabase.storage
    .from("cast-photos")
    .remove(photoPaths);
  if (error) {
    // 写真が消せなくてもキャストは消せるため、ここでは止めずに知らせるだけにする
    console.error("写真を消せませんでした（手動で確認してください）:", error.message);
  } else {
    // remove() は存在しない位置を渡してもエラーにならないので、実際に消えた数で報告する
    const n = removed?.length ?? 0;
    console.log(
      n === photoPaths.length
        ? `写真を ${n} 件消しました。`
        : `写真は ${photoPaths.length} 件のうち ${n} 件が消えました。残りは手で確認してください。`
    );
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
console.log("【必須】管理画面で何か1つ保存し直してください。");
console.log("それをしない限り、消したキャストは公開ページに残り続けます（作り置きに期限が無いため）。");
