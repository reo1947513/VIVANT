import { shop, mapEmbedSrc } from "../data/siteData";
import { getSiteLinks } from "../lib/queries/links";
import SnsIcon from "./SnsIcon";

/**
 * ACCESS：左に店舗情報、右に Google マップ埋め込み（APIキー不要・output=embed）。
 * 住所・電話・営業・定休は確定実データ。
 * SNSは管理画面のSNSリンク画面で入れたURLの分だけ並ぶ。
 * 店舗情報・地図クエリは app/data/siteData.ts に一元管理。
 */
export default async function Access() {
  const links = (await getSiteLinks()).filter((l) => l.url !== "");

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

              {links.length > 0 && (
                <>
                  <dt>SNS</dt>
                  <dd>
                    <div className="access-sns">
                      {links.map((link) => (
                        <a
                          key={link.platform}
                          href={link.url}
                          target="_blank"
                          rel="noopener"
                          aria-label={link.label || link.platform}
                        >
                          <SnsIcon platform={link.platform} />
                        </a>
                      ))}
                    </div>
                  </dd>
                </>
              )}
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
