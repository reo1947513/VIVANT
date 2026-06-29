import { features } from "../data/siteData";

/** FEATURES：4カラムのアイコン＋見出し＋説明。線画 SVG。見出し・説明文は app/data/siteData.ts に一元管理。 */
export default function Features() {
  return (
    <section className="section section--alt" id="features">
      <div className="wrap">
        <div className="sec-head reveal">
          <h2>FEATURES</h2>
          <span className="sub">当店の特徴</span>
          <span className="rule"></span>
        </div>
        <div className="features-grid">
          <div className="feature reveal">
            <div className="icon">
              <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.3">
                <rect x="7" y="10" width="34" height="28" rx="2" />
                <path d="M7 18h34M14 10V6M34 10V6" />
              </svg>
            </div>
            <h3>{features[0].title}</h3>
            <p>
              {features[0].lines[0]}
              <br />
              {features[0].lines[1]}
            </p>
          </div>
          <div className="feature reveal">
            <div className="icon">
              <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.3">
                <path d="M16 8h16l-2 14a6 6 0 0 1-12 0L16 8Z" />
                <path d="M24 36v4M18 40h12" />
              </svg>
            </div>
            <h3>{features[1].title}</h3>
            <p>
              {features[1].lines[0]}
              <br />
              {features[1].lines[1]}
            </p>
          </div>
          <div className="feature reveal">
            <div className="icon">
              <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.3">
                <path d="M24 39s-13-8-13-18a8 8 0 0 1 13-6 8 8 0 0 1 13 6c0 10-13 18-13 18Z" />
              </svg>
            </div>
            <h3>{features[2].title}</h3>
            <p>
              {features[2].lines[0]}
              <br />
              {features[2].lines[1]}
            </p>
          </div>
          <div className="feature reveal">
            <div className="icon">
              <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.3">
                <circle cx="24" cy="24" r="15" />
                <path d="M24 15v18M20 20h6a3 3 0 0 1 0 6h-4a3 3 0 0 0 0 6h6" />
              </svg>
            </div>
            <h3>{features[3].title}</h3>
            <p>
              {features[3].lines[0]}
              <br />
              {features[3].lines[1]}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
