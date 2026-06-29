==============================================================
【現在の状態】本番（vivant-kappa.vercel.app）に「仮公開中」です。
  - キャスト写真：全6枠（rin/mai/yua/nao/saki/emi）にデモ画像（AI生成・実在しません）を配置済み
  - キャストの「一言」：仮公開中は表示オフ（CastCarousel.tsx の TEMP_HIDE_CWORD=true）
  - 検索インデックス：noindex, nofollow を設定中（app/layout.tsx の metadata.robots）
  - 未完了：実写真への差し替え／一言の再表示／noindex の解除（＝本公開）
本公開の手順（実写真が揃ったら）：
  1) public/images/cast/ に実在・本人同意済みの実写真を同名 jpg で差し替える
  2) app/components/CastCarousel.tsx の TEMP_HIDE_CWORD を false に戻す（一言を再表示）
  3) app/layout.tsx の metadata.robots（noindex）を削除 or index:true,follow:true に変更
  4) このファイルの状態表記を「本公開」に更新する
==============================================================

【重要・必読】キャスト写真について（BAR VIVANT）

■ 現在の状態：開発確認用のデモ画像です（本番公開用の実写真ではありません）
  - rin.jpg / mai.jpg / yua.jpg / nao.jpg / saki.jpg / emi.jpg … AI生成のデモ画像（実在しません）※全6枠配置済み

■ 本番公開前に必ず差し替えること
  - これらは仮のデモ画像です。本番公開前に、実在・本人同意済みのキャストの実写真へ
    必ず差し替えてください（景品表示法・風営法の観点から、実在しない人物を在籍キャストと
    して掲載しないこと）。
  - 掲載は本人の同意を得た実在キャストのみとする方針です。身バレ防止に配慮すること。

■ 差し替え方法
  - このフォルダ（public/images/cast/）に、源氏名のローマ字小文字 .jpg で置くだけで表示されます。
    例：rin.jpg, mai.jpg, yua.jpg, nao.jpg, saki.jpg, emi.jpg
  - 推奨：縦長 3:4 程度、長辺 560px 前後、JPEG。ファイルを置けば自動表示、無ければプレースホルダ。
  - HTML/コンポーネント側の変更は不要（画像の差し替えだけで完結）。

■ 表示名（源氏名）について
  - 現在は仮名（Rin/Mai/Yua/Nao/Saki/Emi）です。実在の源氏名が決まり次第、
    app/components/CastCarousel.tsx の CAST 配列で差し替えてください。
