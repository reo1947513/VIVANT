import "server-only";
import { getAdminSupabase } from "./supabase/admin";

/**
 * 画像のアップロードと削除。
 *
 * 安全のための決まりごと：
 *  1. 受け付ける形式は jpeg / png / webp のみ。種類は「ファイルの申告する形式」で判定する。
 *  2. **保存するファイル名はこちらで作る。利用者が付けたファイル名は一切使わない。**
 *     ファイル名をそのまま使うと、名前に細工をされて意図しない場所へ書かせる余地が生まれる。
 *     拡張子も、ファイル名からではなく形式の対応表から決める。
 *  3. 同じ名前への上書きはしない。差し替えは「新しい名前で入れる → 記録を更新する →
 *     古いものを消す」の順で行う。上書きにすると、配信網に古い画像が残り続けることがある。
 *  4. 上限は5MB。
 */

/** 保存先。用途ごとに分けておくと、容量も削除も権限も別々に扱える */
export type Bucket = "cast-photos" | "gallery" | "blog";

/** 受け付ける形式と、それに対応する拡張子 */
const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB

export type UploadResult = { url: string; path: string };

/** アップロードできない理由を利用者に見せる用のエラー */
export class UploadError extends Error {}

/**
 * 画像を1枚アップロードし、公開URLと保存先の場所を返す。
 * 保存先の場所（path）は、あとで削除するために必ず記録しておくこと。
 * 公開URLから逆算する方法は、URLの形式が変わると壊れるので使わない。
 */
export async function uploadImage(
  bucket: Bucket,
  file: File
): Promise<UploadResult> {
  const ext = EXT_BY_TYPE[file.type];
  if (!ext) {
    throw new UploadError(
      "画像は JPEG・PNG・WebP のいずれかを選んでください。"
    );
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new UploadError("画像のサイズは5MBまでです。");
  }

  const path = `${crypto.randomUUID()}.${ext}`;
  const supabase = getAdminSupabase();

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, await file.arrayBuffer(), {
      contentType: file.type,
      cacheControl: "31536000", // 1年。名前を毎回変えるので長く持たせてよい
      upsert: false,
    });
  if (error) {
    throw new UploadError(`画像の保存に失敗しました: ${error.message}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(path);

  return { url: publicUrl, path };
}

/**
 * 画像を消す。記録を消しても実体は残るため、削除処理では必ずこれも呼ぶ。
 * 実体が既に無い場合でも失敗にはしない（記録の削除を止めたくないため）。
 */
export async function deleteImage(
  bucket: Bucket,
  path: string | null | undefined
): Promise<void> {
  if (!path) return;
  const { error } = await getAdminSupabase().storage.from(bucket).remove([path]);
  if (error) {
    console.error(`[vivant] 画像の削除に失敗しました（${bucket}/${path}）:`, error.message);
  }
}
