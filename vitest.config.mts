import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

/**
 * テストの実行設定。
 *
 * 対象は tests/ 配下だけにしている。app/ の中に置くと Next.js のビルド対象と
 * 混ざり、どれが画面でどれが確認用か分かりにくくなるため。
 *
 * environment を node にしているのは、確認したいのがサーバー側の判断
 * （認証・権限・日付の計算・入力の検証）だからで、画面の見た目は対象にしていない。
 *
 * server-only の差し替えについて：
 *   app/lib/auth.ts の先頭には import "server-only" がある。これは
 *   「このファイルはサーバーでしか使ってはいけない」という印で、
 *   ブラウザ側から読み込まれると意図的にエラーになる作りになっている。
 *   テストはサーバーでもブラウザでもない場所で動くため、そのままだと
 *   この印だけで失敗する。中身が空のファイルに差し替えて、印を無効にする。
 *   守り自体を弱めるものではなく、本番の動きには一切影響しない。
 */
export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
  },
  resolve: {
    alias: {
      /* このファイルからの相対で場所を決める。__dirname は古い書き方で、
         この設定ファイルは新しい書き方（ESM）として読まれるため使えない。 */
      "server-only": fileURLToPath(
        new URL("./tests/stubs/server-only.ts", import.meta.url)
      ),
    },
  },
});
