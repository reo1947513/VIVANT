import { shop } from "../data/siteData";
import { getSiteLinks } from "../lib/queries/links";

/**
 * RESERVE / CONTACT：電話予約と SNS でのお問い合わせを左右2カラム。
 *
 * SNSのボタンは管理画面（/admin/links）で入れたURLから作る。
 * URLが空のSNSは行ごと出ない（押しても何も起きないボタンを出さないため）。
 * 1つも登録が無いときだけ「準備中」と出す。
 *
 * 電話・営業時間・定休は app/data/siteData.ts に一元管理。
 */
export default async function Reserve() {
  const links = (await getSiteLinks()).filter((l) => l.url !== "");

  return (
    <section className="section" id="reserve">
      <div className="wrap">
        <div className="sec-head reveal">
          <h2>RESERVE</h2>
          <span className="sub">ご予約・お問い合わせ</span>
          <span className="rule"></span>
        </div>

        <div className="reserve-grid">
          <div className="reserve-card reveal">
            <div className="rlabel">BY PHONE</div>
            <div className="rja">お電話でのご予約</div>
            <a className="rtel" href={`tel:${shop.tel.link}`}>
              {shop.tel.display}
            </a>
            <div className="rhours">
              受付：{shop.hours.range}（{shop.closed}定休）
            </div>
          </div>

          <div className="reserve-card reveal">
            <div className="rlabel">ONLINE</div>
            <div className="rja">SNS・LINEでのお問い合わせ</div>

            {links.length === 0 ? (
              <div className="rhours">現在準備中です。お電話にてご連絡ください。</div>
            ) : (
              <>
                <div className="reserve-links">
                  {links.map((link, index) => (
                    <a
                      key={link.platform}
                      /* 先頭の1つだけ塗りのボタンにして、押してほしい導線を明確にする */
                      className={index === 0 ? "btn btn-primary" : "btn btn-ghost"}
                      href={link.url}
                      target="_blank"
                      rel="noopener"
                    >
                      {link.label || link.platform}
                    </a>
                  ))}
                </div>
                <div className="rhours">お気軽にお問い合わせください</div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
