import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireEnv } from "./env";

/**
 * 管理画面用の Supabase クライアント（cookie 連携あり）。
 *
 * ログイン状態は cookie で持つため、管理画面のページと API はこれを使う。
 * このクライアントを使ったページはリクエストごとの動的レンダリングになるので、
 * **公開ページ（LP・ブログ）では絶対に使わない**（静的生成が効かなくなる）。
 * 公開ページ用は public.ts の getPublicSupabase() を使うこと。
 *
 * Next.js 16 では cookies() が非同期になったため await が要る。
 * また、サーバーコンポーネントの描画中は cookie を書き込めない（レスポンスヘッダが
 * すでに確定しているため）。その場合 setAll は例外を投げるので握りつぶす。
 * セッションの更新はログイン・ログアウトの API 側（route handler）で行われるため、
 * ここで書けなくても実害はない。
 */
export async function createSupabaseServerClient(): Promise<SupabaseClient> {
  const cookieStore = await cookies();

  return createServerClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // サーバーコンポーネントからは cookie を書けない。
            // ログイン・ログアウトは route handler 側で行うため、ここは無視してよい。
          }
        },
      },
    }
  );
}
