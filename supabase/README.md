# Supabase（BAR VIVANT）

管理画面（キャスト・ギャラリー・出勤情報・ブログ）のデータ置き場です。

- プロジェクト: `vivant`（組織: れおれお / Free / 東京 ap-northeast-1）
- ダッシュボード: https://supabase.com/dashboard/project/ldwncqptvkrjjxjprflf
- URL: `https://ldwncqptvkrjjxjprflf.supabase.co`

## SQL の当て方

このプロジェクトは Supabase CLI を接続していないため、`migrations/` の SQL は
**ダッシュボードの SQL Editor に貼って実行**します。ファイル名の番号順に、上から順番に実行してください。
実行した SQL はこのリポジトリに残しておくことが、唯一の履歴になります。

1. `20260803160000_0001_common_and_rls_helpers.sql`
   共通の仕組みと管理者判定。**最後の insert 文にあるメールアドレスを、実際の管理者の
   メールアドレスに書き換えてから実行**してください。
2. `20260803160100_0002_casts_and_gallery.sql`
   キャストとギャラリーの表。
3. `20260803160200_0003_storage_buckets_and_policies.sql`
   画像の保存先3つと、その権限。

## 事前に必要な設定

- Authentication → Users で管理者を1人だけ作成する（ここで決めたメールが唯一のログイン口になる）
- Authentication → Sign In / Providers で「Allow new users to sign up」を無効にする（設定済み）
- 環境変数はリポジトリ直下の `.env.example` を参照

## 画像の置き場所の使い分け

| 対象 | 置き場所 | 理由 |
|---|---|---|
| ロゴ・ヒーロー背景・ヒーロー写真 | `public/images/` | 差し替えない固定の画像 |
| キャスト写真・店内写真・記事のカバー | Supabase Storage | 管理画面から差し替えるため |

Vercel では `public/` に書き込めないため、この使い分けが必要です。
