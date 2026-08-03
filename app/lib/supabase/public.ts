import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { requireEnv } from "./env";

/**
 * 公開ページ（LP・ブログ）から読み取り専用で使う Supabase クライアント。
 *
 * cookie を一切触らないのが要点。cookie を読むクライアント（server.ts）を
 * 公開ページで使うと、そのページはリクエストごとの動的レンダリングに落ちてしまい、
 * 静的生成（ISR）が効かなくなる。公開ページはログイン状態に関係なく同じ内容を出すので、
 * 匿名の公開キーだけで読む。
 *
 * 見えるデータは DB 側の行レベルセキュリティ（RLS）で「公開フラグが立った行のみ」に
 * 制限されている。したがってこのキーがブラウザに渡っても、非公開の下書きは読めない。
 */
export function getPublicSupabase(): SupabaseClient {
  return createClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
    {
      auth: {
        // 公開ページではログイン状態を持たない。セッションの保存も自動更新もしない
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}
