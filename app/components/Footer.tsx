/** フッター：ロゴ・フッターナビ・住所・電話・コピーライト。 */
export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <span className="logo logo--footer" role="img" aria-label="BAR VIVANT"></span>
        <nav className="footer-nav">
          <a href="#top">TOP</a>
          <a href="#concept">CONCEPT</a>
          <a href="#system">SYSTEM</a>
          <a href="#cast">CAST</a>
          <a href="#gallery">GALLERY</a>
          <a href="#access">ACCESS</a>
        </nav>
        <p className="f-meta">
          〒530-0002 大阪府大阪市北区曽根崎新地1丁目5-15 シャンテ北新地 1階
          <br />
          TEL 06-6690-8636 ／ 20:00 〜 翌5:00（火〜日・月曜定休）
        </p>
        <p className="copy">© 2026 BAR VIVANT. ALL RIGHTS RESERVED.</p>
      </div>
    </footer>
  );
}
