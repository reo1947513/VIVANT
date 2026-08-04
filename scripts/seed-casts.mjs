/**
 * 既存キャストの移行スクリプト。
 *
 * これまでコードの中に直接書かれていた6名と、public/images/cast/ にある写真を
 * Supabase へ登録する。管理画面から手で登録し直す手間を省くための一度きりの処理。
 *
 * 実行：npm run seed:casts
 *
 * 注意：
 *   - すでに同じ源氏名が登録されている場合は飛ばす（何度実行しても増えない）
 *   - 写真は開発確認用のデモ画像。本公開前に実在・同意済みの写真へ差し替えること
 *   - 秘密キーを使うため、実行できるのは手元だけ（.env.local を読む）
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

const supabase = createClient(url, secret, {
  auth: { persistSession: false, autoRefreshToken: false },
});

/** 移行するキャスト。順番・名前・一言は移行前の表示と同じ */
const CASTS = [
  { name: "Rin", word: "よろしくね。", file: "rin" },
  { name: "Mai", word: "乾杯しましょ。", file: "mai" },
  { name: "Yua", word: "ゆっくりどうぞ。", file: "yua" },
  { name: "Nao", word: "お待ちしてます。", file: "nao" },
  { name: "Saki", word: "楽しみましょう。", file: "saki" },
  { name: "Emi", word: "またお話したいな。", file: "emi" },
];

const { data: existing, error: listError } = await supabase
  .from("casts")
  .select("name");

if (listError) {
  console.error("既存キャストの確認に失敗しました:", listError.message);
  process.exit(1);
}

const already = new Set((existing ?? []).map((row) => row.name));

for (const [index, cast] of CASTS.entries()) {
  if (already.has(cast.name)) {
    console.log(`飛ばしました（登録済み）: ${cast.name}`);
    continue;
  }

  // 1. 本体を登録
  const { data: inserted, error: insertError } = await supabase
    .from("casts")
    .insert({
      name: cast.name,
      word: cast.word,
      sort_order: index + 1,
      is_published: true,
    })
    .select("id")
    .single();

  if (insertError) {
    console.error(`登録に失敗: ${cast.name}:`, insertError.message);
    continue;
  }

  // 2. 写真があれば保存先へ入れて、公開URLを本体に記録する
  const localPath = path.join(process.cwd(), "public", "images", "cast", `${cast.file}.jpg`);
  if (!existsSync(localPath)) {
    console.log(`登録しました（写真なし）: ${cast.name}`);
    continue;
  }

  const buffer = await readFile(localPath);
  const objectPath = `${crypto.randomUUID()}.jpg`;

  const { error: uploadError } = await supabase.storage
    .from("cast-photos")
    .upload(objectPath, buffer, {
      contentType: "image/jpeg",
      cacheControl: "31536000",
      upsert: false,
    });

  if (uploadError) {
    console.error(`写真の保存に失敗: ${cast.name}:`, uploadError.message);
    continue;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("cast-photos").getPublicUrl(objectPath);

  const { error: updateError } = await supabase
    .from("casts")
    .update({ photo_url: publicUrl, photo_path: objectPath })
    .eq("id", inserted.id);

  if (updateError) {
    console.error(`写真の記録に失敗: ${cast.name}:`, updateError.message);
    continue;
  }

  console.log(`登録しました（写真あり）: ${cast.name}`);
}

console.log("移行が完了しました。");
