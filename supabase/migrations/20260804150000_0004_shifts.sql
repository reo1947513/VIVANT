-- =============================================================================
-- 0004 出勤情報
--
-- 背景：
--   サイトに「今日から1週間分の出勤予定」を載せるため、キャストごとの出勤日と
--   時間を持つ表を追加する。管理画面から週単位でまとめて入力する。
--
-- 変更内容：
--   - shifts：1キャストの1日分の出勤（開始・終了時刻、備考）
--   - 匿名からは昨日以降しか読めない権限設定（過去の出勤履歴を全期間さらさない）
--
-- 設計上の注意（重要）：
--   work_date は必ず date 型にする。timestamptz にすると、サーバーが世界標準時で
--   動くため日本時間との9時間差で日付が1日ずれる。date 型は時差を持たないので、
--   日本時間の日付をそのまま入れて、そのまま読める。
--
--   1キャストにつき1日1行に制限している（unique）。これにより管理画面の
--   一括保存を upsert 1回で書け、二重入力も防げる。1日2部制のような使い方が
--   必要になったら、この制約を外して対応する。
--
-- ロールバック：
--   drop table if exists shifts;
-- =============================================================================

create table if not exists public.shifts (
  id           uuid primary key default gen_random_uuid(),
  cast_id      uuid not null references public.casts(id) on delete cascade,
  work_date    date not null,
  start_time   time,                              -- null 可（時間未定で「出勤」だけ出す運用）
  end_time     time,
  note         text not null default '',
  is_published boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (cast_id, work_date)
);

create index if not exists shifts_date_idx on public.shifts (work_date);

drop trigger if exists shifts_set_updated_at on public.shifts;
create trigger shifts_set_updated_at
  before update on public.shifts
  for each row execute function public.set_updated_at();

alter table public.shifts enable row level security;

-- 匿名（サイトの閲覧者）は、公開中かつ昨日以降の分だけ読める。
-- current_date はデータベースの時間帯設定に依存するため使わず、
-- 日本時間の日付を明示的に組み立てて比較する。
drop policy if exists shifts_public_select on public.shifts;
create policy shifts_public_select on public.shifts
  for select to anon, authenticated
  using (
    is_published = true
    and work_date >= ((now() at time zone 'Asia/Tokyo')::date - 1)
  );

drop policy if exists shifts_admin_all on public.shifts;
create policy shifts_admin_all on public.shifts
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

comment on table public.shifts is '出勤予定。work_date は日本時間の暦日（date型・時差の影響を受けない）';
