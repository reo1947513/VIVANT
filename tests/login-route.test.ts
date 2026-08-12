import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * ログインの窓口（/api/admin/login）の確認。
 *
 * 見たいのは3つ。
 *   1. 入力の検証：形式が違うものを受け付けないこと
 *   2. 順番：パスワードを試す前に、管理者かどうかで弾いていること
 *      （総当たりで他人のアカウントを探られないようにするため）
 *   3. 伝え方：失敗の理由を細かく教えないこと
 *      （どのアドレスが存在するかの手がかりを与えないため）
 *
 * 認証そのもの（Supabase への問い合わせ）は差し替える。
 * 本物につなぐと実在のアカウントに対して試行することになり、
 * 実行するたびに結果が変わってしまうため。
 */

// 管理者と見なすかどうか。テストごとに切り替える
let adminResult = false;
// パスワードの照合結果。null なら成功、文字列ならその理由で失敗
let signInError: string | null = null;
// パスワード照合が呼ばれた回数（順番の確認に使う）
let signInCalls = 0;

vi.mock("../app/lib/auth", () => ({
  isAdminEmail: async () => adminResult,
}));

vi.mock("../app/lib/supabase/server", () => ({
  createSupabaseServerClient: async () => ({
    auth: {
      signInWithPassword: async () => {
        signInCalls++;
        return { error: signInError ? { message: signInError } : null };
      },
    },
  }),
}));

const { POST } = await import("../app/api/admin/login/route");

function post(body: unknown, raw?: string) {
  return new Request("http://localhost/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: raw ?? JSON.stringify(body),
  });
}

describe("ログインの窓口", () => {
  beforeEach(() => {
    adminResult = false;
    signInError = null;
    signInCalls = 0;
    // 失敗の記録が画面に出て読みにくくなるので黙らせる
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("読み取れない中身は400で断る", async () => {
    const res = await POST(post(null, "これはJSONではありません"));
    expect(res.status).toBe(400);
  });

  it("メールアドレスの形式が違えば422で断る", async () => {
    const res = await POST(post({ email: "not-an-email", password: "abc12345" }));
    expect(res.status).toBe(422);
    expect((await res.json()).error).toContain("メールアドレス");
  });

  it("パスワードが空なら422で断る", async () => {
    const res = await POST(post({ email: "owner@example.com", password: "" }));
    expect(res.status).toBe(422);
  });

  it("項目が足りなければ422で断る", async () => {
    const res = await POST(post({ email: "owner@example.com" }));
    expect(res.status).toBe(422);
  });

  it("管理者でないアドレスは、パスワードを試す前に401で断る", async () => {
    adminResult = false;
    const res = await POST(post({ email: "stranger@example.com", password: "abc12345" }));
    expect(res.status).toBe(401);
    // ここが要点。照合まで進んでいたら総当たりの的になる
    expect(signInCalls).toBe(0);
  });

  it("管理者なら、パスワードの照合まで進む", async () => {
    adminResult = true;
    signInError = "Invalid login credentials";
    const res = await POST(post({ email: "staff@example.com", password: "wrong-password" }));
    expect(res.status).toBe(401);
    expect(signInCalls).toBe(1);
  });

  it("管理者でパスワードも正しければ成功する", async () => {
    adminResult = true;
    signInError = null;
    const res = await POST(post({ email: "staff@example.com", password: "correct-password" }));
    expect(res.status).toBe(200);
    expect((await res.json()).ok).toBe(true);
  });

  it("失敗の理由は、どちらが違うか分からない同じ文言にする", async () => {
    adminResult = false;
    const notAdmin = await (await POST(post({ email: "a@example.com", password: "x1234567" }))).json();

    adminResult = true;
    signInError = "Invalid login credentials";
    const wrongPassword = await (
      await POST(post({ email: "b@example.com", password: "x1234567" }))
    ).json();

    expect(notAdmin.error).toBe(wrongPassword.error);
  });
});
