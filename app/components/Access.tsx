import { shop, mapEmbedSrc } from "../data/siteData";

/**
 * ACCESS：左に店舗情報、右に Google マップ埋め込み（APIキー不要・output=embed）。
 * 住所・電話・営業・定休は確定実データ。SNS は TikTok のみ（Instagram/X は未提供）。
 * 店舗情報・地図クエリは app/data/siteData.ts に一元管理。
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
              <dd>{shop.nameFull}</dd>

              <dt>住所</dt>
              <dd>
                〒{shop.address.postal}
                <br />
                {shop.address.line1}
                <br />
                {shop.address.line2}
              </dd>

              <dt>TEL</dt>
              <dd>
                <a className="tel" href={`tel:${shop.tel.link}`}>
                  {shop.tel.display}
                </a>
              </dd>

              <dt>営業</dt>
              <dd>
                {shop.hours.range}（{shop.hours.daysNote}）
              </dd>

              <dt>定休</dt>
              <dd>{shop.closed}</dd>

              <dt>SNS</dt>
              <dd>
                <div className="access-sns">
                  {/* TikTok（実URL反映済み）。Instagram／X は未提供のため掲載なし */}
                  <a
                    href={shop.tiktokUrl}
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
            {/* APIキー不要の埋め込み（output=embed）。住所クエリは siteData の mapQuery から生成 */}
            <iframe
              src={mapEmbedSrc}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`${shop.nameEn} 店舗地図`}
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  );
}
