import Header from "./components/Header";
import Hero from "./components/Hero";
import Concept from "./components/Concept";
import Features from "./components/Features";
import CastCarousel from "./components/CastCarousel";
import Schedule from "./components/Schedule";
import System from "./components/System";
import Gallery from "./components/Gallery";
import BlogTeaser from "./components/BlogTeaser";
import Access from "./components/Access";
import Reserve from "./components/Reserve";
import Footer from "./components/Footer";
import ClientEffects from "./components/ClientEffects";
import BackToTop from "./components/BackToTop";
import { getPublishedCasts } from "./lib/queries/casts";
import { getPublishedGalleryImages } from "./lib/queries/gallery";
import { getWeeklyShifts } from "./lib/queries/shifts";
import { getPublishedPosts } from "./lib/queries/posts";

/**
 * BAR VIVANT 集客LP。
 * Desktop 単一HTML版の見た目・挙動を Next.js(App Router) のセクション分割で再現している。
 *
 * キャスト・ギャラリー・出勤情報・ブログは管理画面（/admin）から更新できるよう
 * Supabase で管理している。店舗の固定情報（住所・料金など）は app/data/siteData.ts。
 *
 * revalidate：作った内容を5分間そのまま配り、その後の最初のアクセスで作り直す。
 *   管理画面で保存したときは、その場で作り直しを指示している（app/lib/revalidate.ts）ため
 *   5分待つ必要はない。この5分は、出勤情報のように日付で内容が変わるものが
 *   誰も操作しなくても切り替わるようにするための保険。
 */
export const revalidate = 300;

export default async function Home() {
  // 各問い合わせは互いに関係がないので同時に投げる（順に待つと表示が遅くなる）
  const [cast, galleryImages, week, posts] = await Promise.all([
    getPublishedCasts(),
    getPublishedGalleryImages(),
    getWeeklyShifts(),
    getPublishedPosts(3),
  ]);

  return (
    <>
      <Header />
      <Hero />
      <Concept />
      <Features />
      <CastCarousel cast={cast} />
      {/* 在籍キャスト → その出勤予定、という流れになるようキャストの直後に置く */}
      <Schedule week={week} />
      <System />
      <Gallery images={galleryImages} />
      {/* 回遊の導線なので下部に置く。記事が無ければ区画ごと出ない */}
      <BlogTeaser posts={posts} />
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
