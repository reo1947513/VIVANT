import Header from "./components/Header";
import Hero from "./components/Hero";
import Concept from "./components/Concept";
import Features from "./components/Features";
import CastCarousel from "./components/CastCarousel";
import System from "./components/System";
import Gallery from "./components/Gallery";
import Access from "./components/Access";
import Reserve from "./components/Reserve";
import Footer from "./components/Footer";
import ClientEffects from "./components/ClientEffects";
import BackToTop from "./components/BackToTop";
import { CAST, castPhotoSrc } from "./data/cast";
import { publicFileExists } from "./lib/publicImage";

/**
 * BAR VIVANT 集客LP（第1段階：見た目の統合）。
 * Desktop 単一HTML版の最新の見た目・挙動を Next.js(App Router) のセクション分割で再現。
 * 出勤情報・ブログ・キャストログイン等の Supabase 連携は第2段階以降で本ページに載せる。
 */
export default function Home() {
  // キャスト写真が実在するかはここ（サーバー側）で判定して渡す。
  // ブラウザの読み込み失敗に任せると、失敗の合図を取りこぼしたときに壊れた画像アイコンと
  // 代替テキストが残るため、ギャラリーと同じくサーバー側で出し分ける方式に統一している。
  const cast = CAST.map((c) => ({
    ...c,
    hasPhoto: publicFileExists(castPhotoSrc(c.file)),
  }));

  return (
    <>
      <Header />
      <Hero />
      <Concept />
      <Features />
      <CastCarousel cast={cast} />
      <System />
      <Gallery />
      <Access />
      <Reserve />
      <Footer />
      {/* カルーセル以外のクライアント挙動（reveal・ヒーロー読み込み・ヘッダー・ハンバーガー・リロード時の最上部復帰） */}
      <ClientEffects />
      {/* トップに戻るボタン（スクロールで右下にフェード表示） */}
      <BackToTop />
    </>
  );
}
