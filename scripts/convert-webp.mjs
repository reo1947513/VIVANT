/**
 * public/ に置いた画像をWebP形式へ変換するスクリプト。
 *
 * CSSの背景に使う画像はNext.jsの画像機能を通せないため、
 * あらかじめ軽い形式に変換したものを置いておく必要がある。
 *
 * 実行：
 *   npm run img:webp -- public/images/hero-bg.jpg [品質]
 *
 * 元のファイルは残す（見比べたり、戻したりできるようにするため）。
 * 変換後は同じ場所に拡張子だけ .webp のファイルができる。
 */
import { readFile, writeFile, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const [input, qualityArg] = process.argv.slice(2);
if (!input) {
  console.error("使い方: npm run img:webp -- public/images/hero-bg.jpg [品質]");
  process.exit(1);
}

const quality = Number(qualityArg ?? 82);
if (!Number.isFinite(quality) || quality < 1 || quality > 100) {
  console.error("品質は1〜100の数値で指定してください。");
  process.exit(1);
}

const output = input.replace(/\.(jpe?g|png)$/i, ".webp");
if (output === input) {
  console.error("対応しているのは jpg / jpeg / png です。");
  process.exit(1);
}

const source = await readFile(input);
const converted = await sharp(source).webp({ quality }).toBuffer();
await writeFile(output, converted);

const before = (await stat(input)).size;
const after = (await stat(output)).size;
const saved = Math.round((1 - after / before) * 100);

console.log(`変換しました: ${path.basename(input)} → ${path.basename(output)}`);
console.log(`  ${Math.round(before / 1024)}KB → ${Math.round(after / 1024)}KB（${saved}%削減・品質${quality}）`);
