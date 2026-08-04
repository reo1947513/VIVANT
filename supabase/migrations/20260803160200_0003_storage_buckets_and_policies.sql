-- =============================================================================
-- 0003 画像の保存先と、その権限
--
-- 背景：
--   Vercel 上では public/ フォルダに書き込めない（配信物であり読み取り専用）。
--   そのため管理画面からアップロードする画像は Supabase Storage に置く。
--   ロゴ・ヒーロー背景・ヒーロー写真のような差し替えない画像は public/ のまま残す。
--
-- 変更内容：
--   - cast-photos / gallery / blog の3つの保存先を作る（いずれも公開）
--   - 匿名ユーザーには読み取りのみ許し、書き込みは管理者のみに限る
--
-- 補足：
--   実際のアップロードは秘密キーを使うサーバー側の処理が行うため、この権限設定は
--   「ブラウザ側から直接書き換えられないようにする」ための保険。
--   更新の権限には using と with check の両方を書く。片方だけだと、上書き保存が
--   権限違反で弾かれる不具合になる（過去に別プロジェクトで発生）。
--
-- ロールバック：
--   delete from storage.buckets where id in ('cast-photos','gallery','blog');
--   （中身が残っていると消せないため、先にファイルを削除すること）
-- =============================================================================

insert into storage.buckets (id, name, public)
values
  ('cast-photos', 'cast-photos', true),
  ('gallery',     'gallery',     true),
  ('blog',        'blog',        true)
on conflict (id) do update set public = excluded.public;

-- 読み取りは誰でも可（LPは匿名で閲覧される）
drop policy if exists vivant_storage_public_read on storage.objects;
create policy vivant_storage_public_read on storage.objects
  for select to anon, authenticated
  using (bucket_id in ('cast-photos', 'gallery', 'blog'));

-- 追加は管理者のみ
drop policy if exists vivant_storage_admin_insert on storage.objects;
create policy vivant_storage_admin_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id in ('cast-photos', 'gallery', 'blog')
    and public.is_admin()
  );

-- 更新は管理者のみ（using と with check の両方が必要）
drop policy if exists vivant_storage_admin_update on storage.objects;
create policy vivant_storage_admin_update on storage.objects
  for update to authenticated
  using (
    bucket_id in ('cast-photos', 'gallery', 'blog')
    and public.is_admin()
  )
  with check (
    bucket_id in ('cast-photos', 'gallery', 'blog')
    and public.is_admin()
  );

-- 削除は管理者のみ
drop policy if exists vivant_storage_admin_delete on storage.objects;
create policy vivant_storage_admin_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id in ('cast-photos', 'gallery', 'blog')
    and public.is_admin()
  );
