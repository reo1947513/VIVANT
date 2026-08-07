/*
  0007 SNSリンクの台帳

  背景：
    TikTok の URL はコード（app/data/siteData.ts）に直接書かれており、
    公式LINE や Instagram を足すたびに手を入れて再デプロイする必要があった。
    管理画面から差し替えられるようにするため、リンクを1件1行で持つ表を作る。

  設計上の注意：
    - platform を主キーにする。1つのSNSにつき1行だけ持たせるため。
    - url が空、または is_published が false の行は公開ページに出さない。
      「まだ用意していないSNSのボタンを出さない」を空文字で表せるようにする。
    - label は表示名（例：公式LINE）。店舗側の呼び方に合わせて変えられるようにする。
    - sort_order は並び順。小さいほど先に出す。

  ロールバック：
    drop table if exists public.site_links;
*/

create table if not exists public.site_links (
  platform   text primary key,
  label      text not null default '',
  url        text not null default '',
  is_published boolean not null default true,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.site_links enable row level security;

-- 公開中かつURLが入っている行は誰でも読める（LPは匿名で閲覧されるため）
drop policy if exists site_links_public_select on public.site_links;
create policy site_links_public_select on public.site_links
  for select to anon, authenticated
  using (is_published = true and url <> '');

-- 追加・変更・削除は管理者のみ。空欄の行も管理者だけが読める
drop policy if exists site_links_admin_all on public.site_links;
create policy site_links_admin_all on public.site_links
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop trigger if exists site_links_set_updated_at on public.site_links;
create trigger site_links_set_updated_at
  before update on public.site_links
  for each row execute function public.set_updated_at();

-- 扱うSNSの枠をあらかじめ作っておく（URLは管理画面から入れる）。
-- TikTok だけは既にコードに入っていた URL をそのまま引き継ぐ。
insert into public.site_links (platform, label, url, sort_order) values
  ('tiktok',    'TikTok',   'https://www.tiktok.com/@bar.vivant', 1),
  ('line',      '公式LINE', '',                                   2),
  ('instagram', 'Instagram', '',                                  3),
  ('x',         'X',        '',                                   4)
on conflict (platform) do nothing;

comment on table public.site_links is 'SNS等の外部リンク。URLが空の行は公開ページに出さない';
