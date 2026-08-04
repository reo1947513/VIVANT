import fs from "node:fs";
import path from "node:path";

/**
 * public/ 配下に画像ファイルが実在するかをサーバー側で判定する。
 *
 * 【画像の置き場所の使い分け（重要）】
 *   ロゴ・ヒーロー背景・ヒーロー写真のように差し替えない画像だけが public/ にある。
 *   管理画面から差し替える画像（キャスト写真・店内写真・記事のカバー）は
 *   Supabase Storage に置く。Vercel では public/ に書き込めない（配信物であり
 *   読み取り専用）ため、この使い分けは必須。
 *   したがってこの関数は「public/ に固定で置く画像」専用であり、
 *   現在の利用箇所は Hero の店内メイン写真のみ。
 *
 * 目的：
 *   ブラウザの「読み込み失敗（onError）」に頼って表示を切り替える方式は、
 *   HTML を読んだ直後に失敗が確定した場合、React が画面を組み立てて処理を
 *   取り付けるより先に失敗の合図が鳴ってしまい、取りこぼすことがある。
 *   実際にギャラリーで、壊れた画像アイコンと代替テキストが残る事象が発生した。
 *   ファイルの有無はサーバー側で確実に分かるため、最初から出し分ける。
 *
 * 注意：
 *   このページは静的生成のため、判定はビルド時に確定する。画像を追加・削除した場合は
 *   ビルド（＝デプロイ）で反映される。開発サーバーでは都度評価されるため即時反映される。
 *
 * @param relPath public/ からの相対パス（先頭の / は付けても付けなくてもよい）
 */
export function publicFileExists(relPath: string): boolean {
  const clean = relPath.replace(/^\/+/, "");
  try {
    return fs.existsSync(path.join(process.cwd(), "public", clean));
  } catch {
    // 判定に失敗した場合は「無い」扱いにして、壊れた画像を出さない側に倒す
    return false;
  }
}
