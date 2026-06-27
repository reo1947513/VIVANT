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

/**
 * BAR VIVANT 集客LP（第1段階：見た目の統合）。
 * Desktop 単一HTML版の最新の見た目・挙動を Next.js(App Router) のセクション分割で再現。
 * 出勤情報・ブログ・キャストログイン等の Supabase 連携は第2段階以降で本ページに載せる。
 */
export default function Home() {
  return (
    <>
      <Header />
      <Hero />
      <Concept />
      <Features />
      <CastCarousel />
      <System />
      <Gallery />
      <Access />
      <Reserve />
      <Footer />
      {/* カルーセル以外のクライアント挙動（reveal・ヒーロー読み込み・ヘッダー・ハンバーガー） */}
      <ClientEffects />
    </>
  );
}
