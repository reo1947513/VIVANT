/**
 * ギャラリー画像を登録するスクリプト。
 *
 * 管理画面のギャラリー管理から手で上げるのと同じことを、手元から行う。
 * 写真の元データが手元のフォルダにあるとき、ブラウザを開かずにまとめて登録できる。
 *
 * 実行：
 *   npm run add:gallery -- "画像のパス" ["画像のパス2" ...]
 *   npm run add:gallery -- --alt "店内の様子" "画像のパス" ["画像のパス2" ...]
 *
 * 動き：
 *   1. 同じ画像を二重に上げないよう、渡されたパスの重複はあらかじめ取り除く
 *   2. 画像を保存先 gallery に入れる
 *   3. gallery_images に行を作る（表示順は既存の最大値の次、公開状態で登録）
 *   4. 行の作成に失敗した場合は、上げた画像を消して元の状態へ戻す
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

// 引数を読む。--alt があれば、その次の1つを画像の説明として全件に付ける
const rawArgs = process.argv.slice(2);
let alt = "";
const filePaths = [];
for (let i = 0; i < rawArgs.length; i += 1) {
  if (rawArgs[i] === "--alt") {
    alt = (rawArgs[i + 1] ?? "").trim();
    i += 1;
    continue;
  }
  filePaths.push(rawArgs[i].trim());
}

if (filePaths.length === 0) {
  console.error('使い方: npm run add:gallery -- [--alt "画像の説明"] "画像のパス" ["画像のパス2" ...]');
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

// 同じ画像が二重に渡された場合は、先に出てきたほうだけを残す
const seen = new Set();
const targets = [];
for (const filePath of filePaths) {
  const resolved = path.resolve(filePath);
  if (seen.has(resolved)) {
    console.log(`重複のため飛ばしました: ${path.basename(resolved)}`);
    continue;
  }
  seen.add(resolved);
  targets.push(resolved);
}

// 先に引数をすべて点検する。1件でもおかしければ、登録を始める前に止める
for (const target of targets) {
  if (!existsSync(target)) {
    console.error(`画像が見つかりません: ${target}`);
    process.exit(1);
  }
  if (!contentTypeOf(target)) {
    console.error(`対応していない画像です（jpg / png / webp のみ）: ${target}`);
    process.exit(1);
  }
}

const supabase = createClient(url, secret, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// 既存の表示順を読む
const { data: existing, error: listError } = await supabase
  .from("gallery_images")
  .select("sort_order");

if (listError) {
  console.error("既存ギャラリーの確認に失敗しました:", listError.message);
  process.exit(1);
}

let nextOrder = (existing ?? []).reduce((max, row) => Math.max(max, row.sort_order ?? 0), 0) + 1;

for (const target of targets) {
  const { type, ext } = contentTypeOf(target);
  const buffer = await readFile(target);
  const objectPath = `${crypto.randomUUID()}${ext}`;

  // 1. 画像を保存先へ入れる
  const { error: uploadError } = await supabase.storage
    .from("gallery")
    .upload(objectPath, buffer, {
      contentType: type,
      cacheControl: "31536000",
      upsert: false,
    });

  if (uploadError) {
    console.error(`保存に失敗: ${path.basename(target)}:`, uploadError.message);
    continue;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("gallery").getPublicUrl(objectPath);

  // 2. 一覧に載せる行を作る
  const { error: insertError } = await supabase.from("gallery_images").insert({
    image_url: publicUrl,
    image_path: objectPath,
    alt,
    sort_order: nextOrder,
    is_published: true,
  });

  if (insertError) {
    // 画像だけが残るのを避けるため、上げた画像を消して元へ戻す
    await supabase.storage.from("gallery").remove([objectPath]);
    console.error(`登録に失敗したため取り消しました: ${path.basename(target)}:`, insertError.message);
    continue;
  }

  console.log(`登録しました: ${path.basename(target)}（表示順 ${nextOrder}・公開）`);
  nextOrder += 1;
}

console.log("処理が完了しました。");
