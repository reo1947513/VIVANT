import { shop, copyright } from "../data/siteData";

/** フッター：ロゴ・フッターナビ・住所・電話・コピーライト。店舗情報は app/data/siteData.ts 参照。 */
export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <span className="logo logo--footer" role="img" aria-label={shop.nameEn}></span>
        <nav className="footer-nav">
          <a href="#top">TOP</a>
          <a href="#concept">CONCEPT</a>
          <a href="#system">SYSTEM</a>
          <a href="#cast">CAST</a>
          <a href="#gallery">GALLERY</a>
          <a href="#access">ACCESS</a>
        </nav>
        <p className="f-meta">
          〒{shop.address.postal} {shop.address.line1} {shop.address.line2}
          <br />
          TEL {shop.tel.display} ／ {shop.hours.range}（{shop.hours.daysNote}・{shop.closed}定休）
        </p>
        <p className="copy">{copyright}</p>
      </div>
    </footer>
  );
}
