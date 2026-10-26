> ## ⚠ 公開ステータス：仮公開中
>
> BAR VIVANT LP は本番（`vivant-kappa.vercel.app` / `main`）に **仮公開中** です。
>
> - **キャスト写真**：実在キャストの実写真を掲載済み（2026-10-27 時点：ことね・りあ・ゆき・あゆ）。AI生成などのデモ画像は使っていない。
>   写真はコードではなく Supabase で管理しており、追加・差し替え・削除は管理画面のキャスト管理から行う。
> - **ギャラリー**：店内写真とキャストの撮影写真を掲載。管理画面のギャラリーから管理する。
> - **キャストの一言**：仮公開中は **表示オフ**（`app/components/CastCarousel.tsx` の `TEMP_HIDE_CWORD = true`）。
> - **検索インデックス**：**noindex, nofollow** を設定中（`app/layout.tsx` の `metadata.robots`）。
> - **未完了（＝本公開時にやること）**：①`TEMP_HIDE_CWORD` を `false` に ②`metadata.robots` の noindex を解除。
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
