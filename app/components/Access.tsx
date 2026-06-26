/**
 * ACCESS：左に店舗情報、右に Google マップ埋め込み（APIキー不要・output=embed）。
 * 住所・電話・営業・定休は確定実データ。SNS は TikTok のみ（Instagram/X は未提供）。
 */
export default function Access() {
  return (
    <section className="section section--alt" id="access">
      <div className="wrap">
        <div className="sec-head reveal">
          <h2>ACCESS</h2>
          <span className="sub">アクセス</span>
          <span className="rule"></span>
        </div>

        <div className="access-grid">
          <div className="access-info reveal">
            <dl>
              <dt>店名</dt>
              <dd>BAR VIVANT（バー ヴィヴァン）</dd>

              <dt>住所</dt>
              <dd>
                〒530-0002
                <br />
                大阪府大阪市北区曽根崎新地1丁目5-15
                <br />
                シャンテ北新地 1階
              </dd>

              <dt>TEL</dt>
              <dd>
                <a className="tel" href="tel:0666908636">
                  06-6690-8636
                </a>
              </dd>

              <dt>営業</dt>
              <dd>20:00 〜 翌5:00（火〜日）</dd>

              <dt>定休</dt>
              <dd>月曜</dd>

              <dt>SNS</dt>
              <dd>
                <div className="access-sns">
                  {/* TikTok（実URL反映済み）。Instagram／X は未提供のため掲載なし */}
                  <a
                    href="https://www.tiktok.com/@bar.vivant"
                    target="_blank"
                    rel="noopener"
                    aria-label="TikTok"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M16 8.2a6.3 6.3 0 0 0 3.7 1.2V6.7a3.6 3.6 0 0 1-2.5-1A3.7 3.7 0 0 1 16 3h-2.7v11.6a2.3 2.3 0 1 1-2.3-2.3c.2 0 .4 0 .6.1V9.6a5 5 0 1 0 4.4 5V8.2Z" />
                    </svg>
                  </a>
                </div>
              </dd>
            </dl>
          </div>

          <div className="access-map reveal">
            {/* APIキー不要の埋め込み（output=embed）。住所クエリ反映済み */}
            <iframe
              src="https://www.google.com/maps?q=%E5%A4%A7%E9%98%AA%E5%BA%9C%E5%A4%A7%E9%98%AA%E5%B8%82%E5%8C%97%E5%8C%BA%E6%9B%BD%E6%A0%B9%E5%B4%8E%E6%96%B0%E5%9C%B01%E4%B8%81%E7%9B%AE5-15%20%E3%82%B7%E3%83%A3%E3%83%B3%E3%83%86%E5%8C%97%E6%96%B0%E5%9C%B0&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="BAR VIVANT 店舗地図"
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  );
}
