/** FEATURES：4カラムのアイコン＋見出し＋説明。線画 SVG。文言は Desktop 版を維持。 */
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
            <h3>上質な空間</h3>
            <p>
              落ち着いた照明と静かな音楽。
              <br />
              北新地の隠れ家でくつろぐ夜を。
            </p>
          </div>
          <div className="feature reveal">
            <div className="icon">
              <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.3">
                <path d="M16 8h16l-2 14a6 6 0 0 1-12 0L16 8Z" />
                <path d="M24 36v4M18 40h12" />
              </svg>
            </div>
            <h3>厳選されたお酒</h3>
            <p>
              定番から銘酒・シャンパンまで。
              <br />
              その日の気分に合う一杯を。
            </p>
          </div>
          <div className="feature reveal">
            <div className="icon">
              <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.3">
                <path d="M24 39s-13-8-13-18a8 8 0 0 1 13-6 8 8 0 0 1 13 6c0 10-13 18-13 18Z" />
              </svg>
            </div>
            <h3>心地よいおもてなし</h3>
            <p>
              気取らない接客で、
              <br />
              初めての方も安心です。
            </p>
          </div>
          <div className="feature reveal">
            <div className="icon">
              <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.3">
                <circle cx="24" cy="24" r="15" />
                <path d="M24 15v18M20 20h6a3 3 0 0 1 0 6h-4a3 3 0 0 0 0 6h6" />
              </svg>
            </div>
            <h3>明朗な料金</h3>
            <p>
              初回3,000円からの分かりやすい料金。
              <br />
              安心してお過ごしいただけます。
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
