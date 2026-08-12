import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

/**
 * 管理者かどうかの判定の確認。
 *
 * ここを対象にしている最大の理由：
 *   2026年8月4日から11日まで、台帳（admin_emails 表）に追加した2人目以降が
 *   ログインできない状態が残っていた。ログイン後の確認は台帳を見ていたのに、
 *   ログインの入口だけが環境変数の1件としか突き合わせていなかったためで、
 *   川上さんが実際に困るまで1週間気づかれなかった。
 *   この確認が1件あれば、その場で失敗として現れていた。
 *
 * データベースへは実際につながない。台帳の応答を差し替えて、
 * 「台帳に有る／無い」それぞれの場合に判定がどうなるかだけを見る。
 * 本物につなぐと、実行するたびに本番のデータに左右され、
 * 確認の結果が日によって変わってしまうため。
 */

// 台帳の応答を、テストごとに差し替えられるようにしておく
let ledgerResponse: { data: { email: string } | null; error: { message: string } | null } = {
  data: null,
  error: null,
};

vi.mock("../app/lib/supabase/admin", () => ({
  getAdminSupabase: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ledgerResponse,
        }),
      }),
    }),
  }),
}));

// 認証そのもの（ログイン済みの利用者を返す部分）はここでは使わないが、
// 取り込みの時点で本物につながらないよう差し替えておく
vi.mock("../app/lib/supabase/server", () => ({
  createSupabaseServerClient: async () => ({
    auth: { getUser: async () => ({ data: { user: null } }) },
  }),
}));

const { isAdminEmail } = await import("../app/lib/auth");

describe("管理者かどうかの判定（isAdminEmail）", () => {
  const originalAdminEmail = process.env.ADMIN_EMAIL;

  beforeEach(() => {
    process.env.ADMIN_EMAIL = "owner@example.com";
    ledgerResponse = { data: null, error: null };
  });

  afterEach(() => {
    if (originalAdminEmail === undefined) delete process.env.ADMIN_EMAIL;
    else process.env.ADMIN_EMAIL = originalAdminEmail;
  });

  it("環境変数のアドレス（オーナー）は管理者と判定する", async () => {
    expect(await isAdminEmail("owner@example.com")).toBe(true);
  });

  it("大文字や前後の空白があっても、同じアドレスとして扱う", async () => {
    expect(await isAdminEmail("  OWNER@Example.com  ")).toBe(true);
  });

  it("【再発防止】台帳に載っているアドレスは管理者と判定する", async () => {
    // 環境変数とは別のアドレス。台帳に有ると答えさせる
    ledgerResponse = { data: { email: "staff@example.com" }, error: null };
    expect(await isAdminEmail("staff@example.com")).toBe(true);
  });

  it("環境変数にも台帳にも無いアドレスは、管理者と判定しない", async () => {
    ledgerResponse = { data: null, error: null };
    expect(await isAdminEmail("stranger@example.com")).toBe(false);
  });

  it("空文字は管理者と判定しない", async () => {
    expect(await isAdminEmail("")).toBe(false);
    expect(await isAdminEmail("   ")).toBe(false);
  });

  it("台帳の読み取りに失敗したときは、管理者と判定しない（通してしまわない）", async () => {
    ledgerResponse = { data: null, error: { message: "接続に失敗しました" } };
    expect(await isAdminEmail("staff@example.com")).toBe(false);
  });

  it("環境変数が未設定でも、台帳に載っていれば管理者と判定する", async () => {
    delete process.env.ADMIN_EMAIL;
    ledgerResponse = { data: { email: "staff@example.com" }, error: null };
    expect(await isAdminEmail("staff@example.com")).toBe(true);
  });

  it("環境変数が未設定で台帳にも無ければ、管理者と判定しない", async () => {
    delete process.env.ADMIN_EMAIL;
    ledgerResponse = { data: null, error: null };
    expect(await isAdminEmail("stranger@example.com")).toBe(false);
  });
});
