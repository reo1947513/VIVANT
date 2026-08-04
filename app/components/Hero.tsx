/* eslint-disable @next/next/no-img-element */
import { shop } from "../data/siteData";
import { publicFileExists } from "../lib/publicImage";

/**
 * ヒーロー。左にロゴ・コピー・CTA、右に店内メイン写真（4:3 横長・cover 中央）。
 * 読み込み時の時間差フェードアップは ClientEffects が #top に loaded クラスを付与して発火。
 * 横幅・左端揃え・4:3 写真・縦積み時の上端対応は globals.css 側で再現。
 * 店名・TikTok URL は app/data/siteData.ts から参照。
 */
const HERO_PHOTO = "/images/hero.jpg";

export default function Hero() {
  const heroPhotoExists = publicFileExists(HERO_PHOTO);

  return (
    <section className="hero" id="top">
      <div className="wrap">
        <div className="hero-left">
          <span
            className="logo logo--hero hero-anim d1"
            role="img"
            aria-label={shop.nameEn}
          ></span>
          <h1 className="h-copy hero-anim d2">
            北新地の夜に、
            <br />
            <span>上質な余韻</span>を。
          </h1>
          <p className="h-sub hero-anim d3">
            大阪・北新地（曽根崎新地）。
            <br />
            日常を離れ、ゆったりとした大人の時間をお過ごしください。
          </p>
          <div className="hero-cta hero-anim d4">
            <a className="btn btn-primary" href="#reserve">
              ご予約・お問い合わせ
            </a>
            <a
              className="btn btn-ghost"
              href={shop.tiktokUrl}
              target="_blank"
              rel="noopener"
            >
              TikTokを見る
            </a>
          </div>
        </div>

        <div className="hero-right hero-anim d5">
          {/* 店内メイン写真：/images/hero.jpg を置けば表示／無ければ「NO IMAGE」表示。
              この写真は管理画面の対象外なので public/ に固定で置き、有無をサーバー側で判定する。
              管理画面から差し替えるキャスト写真・ギャラリーは Supabase Storage 側にある。 */}
          <div className={heroPhotoExists ? "hero-photo" : "hero-photo hero-photo--empty"}>
            {heroPhotoExists && (
              <img className="ph-img" src={HERO_PHOTO} alt={`${shop.nameEn} 店内`} />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
