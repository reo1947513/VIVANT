-- =============================================================================
-- 0005 ブログ記事
--
-- 背景：
--   お知らせやイベント情報を店舗側で発信できるようにする。
--   トップページには最新3件、/blog に一覧、/blog/<URL名> に本文を出す。
--
-- 変更内容：
--   - posts：記事。URL名（slug）・題名・抜粋・本文・カバー画像・公開状態
--   - 公開中の記事だけ誰でも読める権限設定
--
-- 設計上の注意：
--   - 既定を「下書き（is_published = false）」にしている。書きかけが公開されるより、
--     公開し忘れるほうが被害が小さいため。
--   - body はプレーンテキストとして扱う。HTML として画面に流し込むと、
--     本文に紛れ込んだタグがそのまま動いてしまう（表示側で改行のみ反映する）。
--   - slug は URL に使うため、小文字英数字とハイフンだけに制限する。
--
-- ロールバック：
--   drop table if exists posts;
-- =============================================================================

create table if not exists public.posts (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  title        text not null,
  excerpt      text not null default '',       -- 一覧やトップページに出す短い紹介文
  body         text not null default '',       -- 本文（プレーンテキスト）
  cover_url    text,
  cover_path   text,                           -- カバー画像の保存先（削除に使う）
  is_published boolean not null default false, -- 既定は下書き
  published_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint posts_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

create index if not exists posts_public_idx
  on public.posts (is_published, published_at desc);

drop trigger if exists posts_set_updated_at on public.posts;
create trigger posts_set_updated_at
  before update on public.posts
  for each row execute function public.set_updated_at();

alter table public.posts enable row level security;

drop policy if exists posts_public_select on public.posts;
create policy posts_public_select on public.posts
  for select to anon, authenticated
  using (is_published = true);

drop policy if exists posts_admin_all on public.posts;
create policy posts_admin_all on public.posts
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

comment on table public.posts is 'ブログ記事。body はプレーンテキスト（HTMLとして描画しない）';
