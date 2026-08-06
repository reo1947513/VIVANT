/**
 * キャストを写真つきで登録するスクリプト。
 *
 * 管理画面（/admin/casts）から手で登録するのと同じことを、手元から行う。
 * 写真の元データが手元のフォルダにあるとき、ブラウザを開かずに登録できる。
 *
 * 実行：
 *   npm run add:cast -- "源氏名" "写真のパス" ["源氏名2" "写真のパス2" ...]
 *
 * 例：
 *   npm run add:cast -- "ことね" ~/Downloads/kotone.jpg "りあ" ~/Downloads/ria.jpg
 *
 * 動き：
 *   1. すでに同じ源氏名が登録されていれば、その名前は飛ばす（二重登録の防止）
 *   2. casts に行を作る（表示順は既存の最大値の次、公開状態で登録）
 *   3. 写真を保存先 cast-photos に入れ、その公開URLを行に書き戻す
 *   4. 写真の保存に失敗した場合は、作った行を消して元の状態へ戻す
 *
 * 注意：
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

// 引数は「名前・写真のパス」の2つで1組。組になっていなければ何もせず終わる
const args = process.argv.slice(2);
if (args.length === 0 || args.length % 2 !== 0) {
  console.error('使い方: npm run add:cast -- "源氏名" "写真のパス" ["源氏名2" "写真のパス2" ...]');
  process.exit(1);
}

/** 拡張子から画像の種類を決める。判別できないものは受け付けない */
function contentTypeOf(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".jpg" || ext === ".jpeg") return { type: "image/jpeg", ext: ".jpg" };
  if (ext === ".png") return { type: "image/png", ext: ".png" };
  if (ext === ".webp") return { type: "image/webp", ext: ".webp" };
  return null;
}

const entries = [];
for (let i = 0; i < args.length; i += 2) {
  entries.push({ name: args[i].trim(), photoPath: args[i + 1].trim() });
}

// 先に引数をすべて点検する。1件でもおかしければ、登録を始める前に止める
for (const entry of entries) {
  if (!entry.name) {
    console.error("源氏名が空です。");
    process.exit(1);
  }
  if (!existsSync(entry.photoPath)) {
    console.error(`写真が見つかりません: ${entry.photoPath}`);
    process.exit(1);
  }
  if (!contentTypeOf(entry.photoPath)) {
    console.error(`対応していない画像です（jpg / png / webp のみ）: ${entry.photoPath}`);
    process.exit(1);
  }
}

const supabase = createClient(url, secret, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// 既存の源氏名と表示順を読む
const { data: existing, error: listError } = await supabase
  .from("casts")
  .select("name, sort_order");

if (listError) {
  console.error("既存キャストの確認に失敗しました:", listError.message);
  process.exit(1);
}

const already = new Set((existing ?? []).map((row) => row.name));
let nextOrder = (existing ?? []).reduce((max, row) => Math.max(max, row.sort_order ?? 0), 0) + 1;

for (const entry of entries) {
  if (already.has(entry.name)) {
    console.log(`飛ばしました（登録済み）: ${entry.name}`);
    continue;
  }

  // 1. 本体を登録する
  const { data: inserted, error: insertError } = await supabase
    .from("casts")
    .insert({
      name: entry.name,
      word: "",
      sort_order: nextOrder,
      is_published: true,
    })
    .select("id")
    .single();

  if (insertError) {
    console.error(`登録に失敗: ${entry.name}:`, insertError.message);
    continue;
  }

  // 2. 写真を保存先へ入れる
  const { type, ext } = contentTypeOf(entry.photoPath);
  const buffer = await readFile(entry.photoPath);
  const objectPath = `${crypto.randomUUID()}${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("cast-photos")
    .upload(objectPath, buffer, {
      contentType: type,
      cacheControl: "31536000",
      upsert: false,
    });

  if (uploadError) {
    // 写真なしの行だけが残るのを避けるため、作った行を消して元へ戻す
    await supabase.from("casts").delete().eq("id", inserted.id);
    console.error(`写真の保存に失敗したため取り消しました: ${entry.name}:`, uploadError.message);
    continue;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("cast-photos").getPublicUrl(objectPath);

  // 3. 写真の公開URLを本体に書き戻す
  const { error: updateError } = await supabase
    .from("casts")
    .update({ photo_url: publicUrl, photo_path: objectPath })
    .eq("id", inserted.id);

  if (updateError) {
    console.error(`写真の記録に失敗: ${entry.name}:`, updateError.message);
    continue;
  }

  already.add(entry.name);
  nextOrder += 1;
  console.log(`登録しました: ${entry.name}（表示順 ${nextOrder - 1}・公開）`);
}

console.log("処理が完了しました。");
