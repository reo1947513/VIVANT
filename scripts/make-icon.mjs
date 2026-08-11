/**
 * ブラウザのタブ等に出す図案（ファビコン）を、ロゴから切り出して作る。
 *
 * 実行：
 *   npm run make:icon
 *
 * なぜスクリプトで先に作るのか：
 *   表示のたびに組み立てる方法も試したが、画像を作る仕組みの制約で
 *   「はみ出した部分を切り取る」指定が効かず、店名の行まで入ってしまった。
 *   ここで一度だけ作って画像として置いておけば、確実に狙った形になり、
 *   表示のたびの組み立ても要らない。
 *
 * 何をしているか：
 *   元のロゴは「VA」の組み文字の下に店名が入った構成で、
 *   16〜32ピクセルまで縮むと店名が潰れて染みに見える。
 *   そこで組み文字の部分だけを切り出し、明るい生成り色の下地に載せる。
 *   下地を明るくするのは、ロゴが濃い茶色一色で、暗い下地だと沈むため。
 *
 * ロゴを描き直したときは MARK の数値（元画像のどこに組み文字があるか）を見直すこと。
 */
import sharp from "sharp";
import path from "node:path";

const ROOT = process.cwd();
const SOURCE = path.join(ROOT, "public/images/logo.png");

/** 元画像の中で組み文字が占めている範囲 */
const MARK = { left: 95, top: 105, width: 230, height: 150 };
/** 下地の色（サイトの明るい文字色と同系） */
const BACKGROUND = { r: 244, g: 236, b: 227, alpha: 1 };

/**
 * 図案を1枚作る。
 * size: 仕上がりの一辺
 * padding: 左右に空ける余白（上下は縦横比なりに中央へ置く）
 */
async function build(size, padding, outFile) {
  const innerWidth = size - padding * 2;
  const innerHeight = Math.round((MARK.height / MARK.width) * innerWidth);

  const mark = await sharp(SOURCE)
    .extract(MARK)
    .resize(innerWidth, innerHeight, { fit: "fill" })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: BACKGROUND,
    },
  })
    .composite([
      {
        input: mark,
        left: padding,
        top: Math.round((size - innerHeight) / 2),
      },
    ])
    .png()
    .toFile(path.join(ROOT, outFile));

  console.log(`${outFile} を作りました（${size}×${size}）`);
}

// タブ用。大きめに作っておけば、小さく表示されるときは縮められる
await build(512, 46, "app/icon.png");
// スマートフォンのホーム画面用。余白を広めに取るのが慣例
await build(180, 22, "app/apple-icon.png");

console.log("");
console.log("Next.js の初期状態の favicon.ico が残っている場合は削除してください。");
console.log("残っていると、ブラウザはそちらを優先して表示します。");
