-- =============================================================================
-- 0001 共通の仕組みと、管理者判定
--
-- 背景：
--   BAR VIVANT の LP に管理画面を追加するにあたり、データを Supabase で持つ。
--   全テーブルで共通して使う「更新日時の自動更新」と「管理者かどうかの判定」を先に置く。
--
-- 変更内容：
--   - set_updated_at()：行を更新したとき updated_at を自動で現在時刻にする関数
--   - admin_emails：管理画面にログインできるメールアドレスの台帳
--   - is_admin()：いま操作している人が管理者かを返す関数
--
-- ロールバック：
--   drop function if exists is_admin();
--   drop table if exists admin_emails;
--   drop function if exists set_updated_at();
-- =============================================================================

-- 更新日時の自動更新。各テーブルでトリガーとして使う
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 管理画面にログインできるメールアドレスの台帳。
-- メールを関数の中に直接書くと、変更のたびにSQLを書き直すことになるため台帳にする。
create table if not exists public.admin_emails (
  email      text primary key,
  created_at timestamptz not null default now()
);

-- 行レベルセキュリティを有効にし、かつポリシーを1つも作らない。
-- これにより匿名ユーザーもログイン済みユーザーもこの表を読めない
-- （秘密キーを使うサーバー側の処理だけが読める）。管理者メールの一覧が漏れない。
alter table public.admin_emails enable row level security;

-- いま操作している人が管理者かを返す。
--   security definer：この関数の中だけは所有者の権限で動く。これにより
--     admin_emails を読めない利用者からでも判定ができる。
--   set search_path = public：関数の中で参照する表を固定する。指定しないと
--     呼び出し側が別のスキーマを差し込んで、偽の admin_emails を読ませられる余地が残る。
--   stable：同じ問い合わせの中では結果が変わらないことを示し、無駄な再評価を避ける。
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_emails
    where email = (auth.jwt() ->> 'email')
  );
$$;

-- 管理者メールの登録。
-- 【要編集】下の 'ここに管理者のメールアドレス' を、Supabase の Authentication → Users で
-- 作成したユーザーのメールアドレスに置き換えてから実行すること。
-- アプリ側の環境変数 ADMIN_EMAIL とも一致させる。
insert into public.admin_emails (email)
values ('ここに管理者のメールアドレス')
on conflict (email) do nothing;
