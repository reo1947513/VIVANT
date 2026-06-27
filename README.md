> ## ⚠ 公開ステータス：仮公開中（要差し替え）
>
> BAR VIVANT LP は本番（`vivant-kappa.vercel.app` / `main`）に **仮公開中** です。本公開は実写真が揃い次第。
>
> - **キャスト写真**：開発確認用の **デモ画像（AI生成・実在しません）**。本番前に実在・本人同意済みの実写真へ差し替え必須。
> - **キャストの一言**：仮公開中は **表示オフ**（`app/components/CastCarousel.tsx` の `TEMP_HIDE_CWORD = true`）。
> - **検索インデックス**：**noindex, nofollow** を設定中（`app/layout.tsx` の `metadata.robots`）。
> - **未完了（＝本公開時にやること）**：①実写真へ差し替え ②`TEMP_HIDE_CWORD` を `false` に ③`metadata.robots` の noindex を解除。
> - 詳細・手順：`public/images/cast/README.txt` を参照。
>
> 出勤情報・ブログ・キャストログイン（Supabase連携）は次段階で実装予定。

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
