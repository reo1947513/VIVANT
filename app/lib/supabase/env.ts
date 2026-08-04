/**
 * 環境変数の読み取り。
 *
 * 重要な方針：
 *   モジュールの読み込み時点（トップレベル）では環境変数を評価しない。
 *   このプロジェクトは静的生成が主で、ビルド中にもこれらのファイルが読み込まれる。
 *   トップレベルで `process.env.X!` のように評価すると、環境変数が未設定の環境で
 *   ビルドそのものが落ちる。実際に値が必要になった瞬間（＝関数を呼んだとき）に
 *   初めて読み、足りなければ「どの変数が足りないか」を明示して投げる。
 *
 *   公開ページ側はこの例外を握りつぶして空表示に倒すため、環境変数が無くても
 *   LP は落ちない（新しいブロックが「準備中」になるだけ）。
 */

/** 必須の環境変数を読む。未設定なら、どれが足りないかを明示して投げる */
export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `[vivant] 環境変数 ${name} が設定されていません。ローカルは .env.local、本番は Vercel の Environment Variables（Production と Preview の両方）を確認してください。`
    );
  }
  return value;
}

/** 任意の環境変数を読む。未設定なら空文字を返す */
export function optionalEnv(name: string): string {
  return process.env[name] ?? "";
}

/** Supabase の接続情報が揃っているか（揃っていなければ公開ページは空表示に倒す） */
export function hasSupabaseConfig(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
}
