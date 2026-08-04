import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { requireEnv } from "./env";

/**
 * 秘密キーを使う管理用クライアント。行レベルセキュリティ（RLS）を無視して読み書きできる。
 *
 * 用途は、画像のアップロードや削除など「認証済み管理者として確実に実行したい処理」に限る。
 * 呼び出す側では**必ず先に管理者かどうかを確認**すること。このクライアント自体は
 * 誰が呼んでいるかを一切見ない。
 *
 * 先頭の import "server-only" は、このファイルが誤ってブラウザ側のコードから
 * 読み込まれたときにビルドを失敗させるための保険。秘密キーがブラウザに配信される
 * 事故を、実行時ではなくビルド時に止められる。
 *
 * 環境変数名に NEXT_PUBLIC_ を付けないこと（付けるとブラウザに配信される）。
 */
let cached: SupabaseClient | null = null;

export function getAdminSupabase(): SupabaseClient {
  if (cached) return cached;

  cached = createClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("SUPABASE_SECRET_KEY"),
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
  return cached;
}
