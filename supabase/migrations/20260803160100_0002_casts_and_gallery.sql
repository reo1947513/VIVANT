-- =============================================================================
-- 0002 キャストとギャラリー
--
-- 背景：
--   これまでキャストはコード内の配列、ギャラリーは public/images/gallery の連番ファイル
--   （01.jpg〜08.jpg の8枠固定）で持っていた。管理画面から追加・削除・並び替えが
--   できるようにするため、データベースへ移す。
--
-- 変更内容：
--   - casts：キャスト。写真は Supabase Storage の公開URLで持つ
--   - gallery_images：店内写真。枚数の上限をなくす
--   - どちらも「公開中の行だけ誰でも読める、書き換えは管理者のみ」の権限設定
--
-- 補足：
--   photo_path / image_path は、写真を消すときに必要な保存先の場所。
--   公開URLから逆算する方法はURLの形式が変わると壊れるため、別の列で持つ。
--
-- ロールバック：
--   drop table if exists gallery_images;
--   drop table if exists casts;
-- =============================================================================

-- ---------------------------------------------------------------------------
-- キャスト
-- ---------------------------------------------------------------------------
create table if not exists public.casts (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,                    -- 源氏名
  word         text not null default '',         -- 一言（仮公開中は画面側で非表示）
  photo_url    text,                             -- 写真の公開URL。null なら NO IMAGE 表示
  photo_path   text,                             -- 写真の保存先（削除に使う）
  sort_order   integer not null default 0,       -- 表示順。小さいほど先
  is_published boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists casts_public_idx
  on public.casts (is_published, sort_order);

drop trigger if exists casts_set_updated_at on public.casts;
create trigger casts_set_updated_at
  before update on public.casts
  for each row execute function public.set_updated_at();

alter table public.casts enable row level security;

-- 公開中の行は誰でも読める（LPは匿名で閲覧されるため）
drop policy if exists casts_public_select on public.casts;
create policy casts_public_select on public.casts
  for select to anon, authenticated
  using (is_published = true);

-- 追加・変更・削除は管理者のみ。非公開の行も管理者だけが読める
drop policy if exists casts_admin_all on public.casts;
create policy casts_admin_all on public.casts
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

comment on table public.casts is '在籍キャスト。本人同意を得た実在の方のみ掲載する';

-- ---------------------------------------------------------------------------
-- ギャラリー（店内写真）
-- ---------------------------------------------------------------------------
create table if not exists public.gallery_images (
  id           uuid primary key default gen_random_uuid(),
  image_url    text not null,
  image_path   text not null,                    -- 保存先（削除に使う）
  alt          text not null default '',         -- 画像の説明（読み上げ・検索向け）
  sort_order   integer not null default 0,
  is_published boolean not null default true,
  created_at   timestamptz not null default now()
);

create index if not exists gallery_public_idx
  on public.gallery_images (is_published, sort_order);

alter table public.gallery_images enable row level security;

drop policy if exists gallery_public_select on public.gallery_images;
create policy gallery_public_select on public.gallery_images
  for select to anon, authenticated
  using (is_published = true);

drop policy if exists gallery_admin_all on public.gallery_images;
create policy gallery_admin_all on public.gallery_images
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

comment on table public.gallery_images is '店内写真。表示順は sort_order の昇順';
