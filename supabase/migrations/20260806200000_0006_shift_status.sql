/*
  0006 出勤の記号（○ 出勤 / △ 未定 / ✕ 休み）

  これまでは出勤を「開始時刻と終了時刻」で持ち、行が無い日は出勤なしとして扱っていた。
  表示を時刻から記号へ変えるため、状態そのものを持つ列を足す。

    work      … ○ 出勤
    undecided … △ 未定（既定値。まだ決めていない日）
    off       … ✕ 休み

  start_time / end_time は残すが、画面では使わなくなる。
  過去に入力した時刻を捨てないため、および元に戻したくなったときのために残している。

  ロールバック：
    alter table public.shifts drop constraint if exists shifts_status_check;
    alter table public.shifts drop column if exists status;
*/

alter table public.shifts
  add column if not exists status text not null default 'undecided';

-- すでに時刻が入っている行は「出勤」として引き継ぐ
update public.shifts
   set status = 'work'
 where status = 'undecided'
   and (start_time is not null or end_time is not null);

-- 想定外の値が入らないようにする
alter table public.shifts
  drop constraint if exists shifts_status_check;

alter table public.shifts
  add constraint shifts_status_check
  check (status in ('work', 'undecided', 'off'));
