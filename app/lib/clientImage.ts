/**
 * 写真を送る前に、ブラウザの中で縮める（管理画面専用）。
 *
 * 背景：
 *   本番の置き場所（Vercel）は、1回の送信で受け取れる量が約4.5MBまでと決まっている。
 *   これを超えると、こちらのプログラムに届く前に Vercel が門前払いし、
 *   画面には理由の分からない失敗だけが残る。スマートフォンで撮った写真は
 *   そのままだと1枚で数MBあり、2〜3枚まとめるだけで上限を超えていた。
 *   サイト上の表示は大きくても横幅1000px程度なので、原寸を送る意味はない。
 *   送る前に長い辺を2400pxまで縮め、1枚あたりおおむね1MB以下にしてから送る。
 *
 * 決まりごと：
 *   - 縮める必要が無いもの（既に小さく、辺も長すぎないもの）は手を加えずに送る。
 *     作り直すたびに画質は少しずつ落ちるため。
 *   - 縮める途中で何か失敗した場合は、元のファイルをそのまま返す。
 *     縮められないことを理由に送信自体を止めないため（容量の判定はサーバー側でも行う）。
 *   - JPEG はそのまま JPEG で作り直す。PNG と WebP は透明な部分を持てるため、
 *     まず WebP での作り直しを試み、ブラウザが WebP を作れない場合だけ
 *     白地を敷いた JPEG にする（透明な部分が黒く潰れるのを避けるため）。
 *   - 出来上がりがそれでも大きい場合は、辺の長さを段階的に縮めてやり直す。
 *
 * このファイルは画面側（ブラウザ）で読み込まれる。サーバー専用の処理は入れないこと。
 */

/** 縮めたあとの長い辺の上限（px） */
export const MAX_EDGE = 2400;

/** これ以下の大きさで、辺も上限以内なら、手を加えずに送る */
const KEEP_AS_IS_BYTES = 1.5 * 1024 * 1024;

/**
 * 1枚を送るときに超えないようにする目安。Vercel の上限（約4.5MB）に対し、
 * 送信データの包み紙の分を見込んで余裕を持たせている。
 */
export const SEND_LIMIT_BYTES = 4 * 1024 * 1024;

/** 作り直すときの画質（0〜1）。写真の見た目がほぼ変わらない値 */
const QUALITY = 0.85;

/** 出来上がりが大きすぎたとき、辺の長さを縮める割合と回数 */
const SHRINK_STEP = 0.75;
const MAX_ATTEMPTS = 4;

/** 受け付ける形式（サーバー側の app/lib/upload.ts と揃えている） */
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

/**
 * 縦横比を保ったまま、長い辺が maxEdge 以下になる大きさを返す。
 * 既に収まっている場合は元の大きさのまま返す（拡大はしない）。
 */
export function fitWithin(
  width: number,
  height: number,
  maxEdge: number
): { width: number; height: number } {
  const longest = Math.max(width, height);
  if (longest <= maxEdge) return { width, height };
  const scale = maxEdge / longest;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

/**
 * 送信が上手くいかなかったときに画面へ出す文言を決める。
 *
 * 容量オーバーで Vercel に断られた場合（413）は、返事がこちらの決めた形式（JSON）ではなく、
 * 中身から理由を読み取れない。そのまま「失敗しました」とだけ出すと原因が分からないため、
 * 状態番号を見て、容量が原因であることを伝える。
 */
export function uploadErrorMessage(
  status: number,
  data: { error?: unknown },
  fallback: string
): string {
  if (typeof data.error === "string" && data.error) return data.error;
  if (status === 413) {
    return "写真の容量が大きすぎて送れませんでした。別の写真を選ぶか、枚数を減らしてお試しください。";
  }
  return fallback;
}

/** 写真を読み込んで、描ける形にする。向き（縦撮り・横撮り）の情報も反映する */
async function decode(file: File): Promise<{
  source: CanvasImageSource;
  width: number;
  height: number;
  release: () => void;
}> {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
      return {
        source: bitmap,
        width: bitmap.width,
        height: bitmap.height,
        release: () => bitmap.close(),
      };
    } catch {
      // 古いブラウザでは下の方法で読み込み直す
    }
  }

  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    await img.decode();
    return {
      source: img,
      width: img.naturalWidth,
      height: img.naturalHeight,
      release: () => URL.revokeObjectURL(url),
    };
  } catch (e) {
    URL.revokeObjectURL(url);
    throw e;
  }
}

/** 指定の大きさで描き直し、指定の形式で書き出す。作れなかったら null */
function render(
  source: CanvasImageSource,
  width: number,
  height: number,
  type: string,
  whiteBackground: boolean
): Promise<Blob | null> {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return Promise.resolve(null);

  if (whiteBackground) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
  }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, 0, 0, width, height);

  return new Promise((resolve) => canvas.toBlob(resolve, type, QUALITY));
}

/**
 * 形式に合わせて書き出す。PNG・WebP はまず WebP を試し、
 * ブラウザが WebP を作れない場合（別の形式で返ってくる）は白地の JPEG にする。
 */
async function encode(
  source: CanvasImageSource,
  width: number,
  height: number,
  originalType: string
): Promise<Blob | null> {
  if (originalType === "image/jpeg") {
    return render(source, width, height, "image/jpeg", false);
  }
  const webp = await render(source, width, height, "image/webp", false);
  if (webp && webp.type === "image/webp") return webp;
  return render(source, width, height, "image/jpeg", true);
}

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/**
 * 送る前に写真を縮める。縮める必要が無いとき・縮められなかったときは元のまま返す。
 * この関数は失敗しても例外を投げない（呼び出し側で送信を止めないため）。
 */
export async function shrinkImage(file: File): Promise<File> {
  if (!ACCEPTED_TYPES.includes(file.type)) return file;
  if (typeof document === "undefined") return file;

  let decoded;
  try {
    decoded = await decode(file);
  } catch {
    return file;
  }

  try {
    const { source, width, height } = decoded;
    const fitsEdge = Math.max(width, height) <= MAX_EDGE;
    if (fitsEdge && file.size <= KEEP_AS_IS_BYTES) return file;

    let edge = Math.min(MAX_EDGE, Math.max(width, height));
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
      const size = fitWithin(width, height, edge);
      const blob = await encode(source, size.width, size.height, file.type);
      if (!blob) return file;

      if (blob.size <= SEND_LIMIT_BYTES) {
        // 作り直したほうが大きくなる場合（既に強く圧縮された写真など）は元を使う
        if (fitsEdge && blob.size >= file.size) return file;

        const base = file.name.replace(/\.[^.]+$/, "") || "photo";
        const ext = EXT_BY_TYPE[blob.type] ?? "jpg";
        return new File([blob], `${base}.${ext}`, {
          type: blob.type,
          lastModified: file.lastModified,
        });
      }
      edge = Math.round(edge * SHRINK_STEP);
    }
    return file;
  } catch {
    return file;
  } finally {
    decoded.release();
  }
}
