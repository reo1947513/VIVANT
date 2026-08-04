/* eslint-disable @next/next/no-img-element */
import { shop } from "../data/siteData";
import type { GalleryImage } from "../lib/types";

/**
 * GALLERY：店内写真のグリッドと、TikTok への誘導ボタン。
 *
 * 写真は管理画面（/admin/gallery）から登録し、Supabase で管理している。
 * 以前は 01.jpg〜08.jpg の8枠固定だったが、枚数を自由にできるようにした。
 *
 * 1枚も登録が無いときは、この区画そのものを出さない。
 * 空の枠が8つ並ぶより、区画ごと無いほうが未完成な印象を与えないため。
 */
export default function Gallery({ images }: { images: GalleryImage[] }) {
  if (images.length === 0) return null;

  return (
    <section className="section" id="gallery">
      <div className="wrap">
        <div className="sec-head reveal">
          <h2>GALLERY</h2>
          <span className="sub">店内の様子</span>
          <span className="rule"></span>
        </div>
        <div className="gallery-grid">
          {images.map((image, index) => (
            <div className="ph reveal" key={image.id}>
              <img
                className="ph-img"
                src={image.imageUrl}
                alt={image.alt || `${shop.nameEn} 店内 ${index + 1}`}
                loading="lazy"
              />
            </div>
          ))}
        </div>

        <div className="sns-cta reveal">
          <a
            className="btn-sns"
            href={shop.tiktokUrl}
            target="_blank"
            rel="noopener"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 8.2a6.3 6.3 0 0 0 3.7 1.2V6.7a3.6 3.6 0 0 1-2.5-1A3.7 3.7 0 0 1 16 3h-2.7v11.6a2.3 2.3 0 1 1-2.3-2.3c.2 0 .4 0 .6.1V9.6a5 5 0 1 0 4.4 5V8.2Z" />
            </svg>
            TikTokで店内をもっと見る
          </a>
        </div>
      </div>
    </section>
  );
}
