/**
 * RESERVE / CONTACT：電話予約と SNS/LINE 予約を左右2カラム。
 * LINE/予約フォームは未提供のため「準備中」の仮置き。電話は tel: でタップ発信。
 */
export default function Reserve() {
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
            <a className="rtel" href="tel:0666908636">
              06-6690-8636
            </a>
            <div className="rhours">受付：20:00 〜 翌5:00（月曜定休）</div>
          </div>

          <div className="reserve-card reveal">
            <div className="rlabel">ONLINE</div>
            <div className="rja">SNS・LINEでのお問い合わせ</div>
            {/* TikTok（実URL反映済み）。LINE/予約フォームは未提供のため下記は仮置き（準備中） */}
            <a
              className="btn btn-primary"
              href="https://www.tiktok.com/@bar.vivant"
              target="_blank"
              rel="noopener"
            >
              TikTokからDM
            </a>
            <div style={{ marginTop: "14px" }}>
              <a className="btn btn-ghost" href="#" rel="noopener">
                LINEで予約する（準備中）
              </a>
            </div>
            <div className="rhours">お気軽にお問い合わせください</div>
          </div>
        </div>
      </div>
    </section>
  );
}
