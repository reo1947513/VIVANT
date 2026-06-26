import FallbackImg from "./FallbackImg";

/**
 * GALLERY：店内写真グリッド（4列）。/images/gallery/01.jpg〜08.jpg を置けば表示、
 * 無ければプレースホルダのまま。下に TikTok 誘導ボタン。
 */
const ITEMS = [1, 2, 3, 4, 5, 6, 7, 8];

export default function Gallery() {
  return (
    <section className="section" id="gallery">
      <div className="wrap">
        <div className="sec-head reveal">
          <h2>GALLERY</h2>
          <span className="sub">店内の様子</span>
          <span className="rule"></span>
        </div>
        <div className="gallery-grid">
          {ITEMS.map((n) => {
            const nn = String(n).padStart(2, "0");
            return (
              <div className="ph reveal" key={nn}>
                <FallbackImg
                  className="ph-img"
                  src={`/images/gallery/${nn}.jpg`}
                  alt={`BAR VIVANT 店内 ${n}`}
                />
              </div>
            );
          })}
        </div>

        <div className="sns-cta reveal">
          <a
            className="btn-sns"
            href="https://www.tiktok.com/@bar.vivant"
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
