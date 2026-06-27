import { prices, champagnes, champagneSuffix } from "../data/siteData";

/**
 * SYSTEM / PRICE：料金カード3枚（中央＝主訴求おすすめ）＋その他ブロック。
 * 料金は確定実データ・税込明記。指名料/同伴料/サービス料/TAX は実態未確認のため未掲載。
 * お支払いは確認中表記。シャンパンは銘柄のみ・金額非掲載。文言・注記は一切変えない。
 * 料金・シャンパン・延長・支払い・注記は app/data/siteData.ts に一元管理。
 */
export default function System() {
  return (
    <section className="section section--alt" id="system">
      <div className="wrap">
        <div className="sec-head reveal">
          <h2>SYSTEM</h2>
          <span className="sub">料金システム（税込）</span>
          <span className="rule"></span>
        </div>

        <div className="price-grid">
          {/* 左：カウンター初回（確定・税込） */}
          <div className="price-card reveal">
            <div className="ptype">{prices.counterFirst.en}</div>
            <div className="ptype-ja">{prices.counterFirst.ja}</div>
            <div className="pnum">
              {prices.counterFirst.amount}
              <small>円</small>
            </div>
            <div className="punit">{prices.counterFirst.unit}</div>
          </div>

          {/* 中央：主訴求（TikTokをご覧の方・確定・税込） */}
          <div className="price-card feat reveal">
            <span className="badge">{prices.tiktokFirst.badge}</span>
            <div className="ptype">{prices.tiktokFirst.en}</div>
            <div className="ptype-ja">{prices.tiktokFirst.ja}</div>
            <div className="pnum">
              {prices.tiktokFirst.amount}
              <small>円</small>
            </div>
            <div className="punit">{prices.tiktokFirst.unit}</div>
            <div className="pnote">{prices.tiktokFirst.note}</div>
          </div>

          {/* 右：ボックス初回（確定・税込） */}
          <div className="price-card reveal">
            <div className="ptype">{prices.boxFirst.en}</div>
            <div className="ptype-ja">{prices.boxFirst.ja}</div>
            <div className="pnum">
              {prices.boxFirst.amount}
              <small>円</small>
            </div>
            <div className="punit">{prices.boxFirst.unit}</div>
          </div>
        </div>

        {/* その他ブロック：延長・シャンパン案内・支払い等 */}
        <div className="price-extra reveal">
          <h3>その他のご案内</h3>
          <dl>
            {/* 延長料金（確定・税込） */}
            <dt>延長</dt>
            <dd>{prices.extend}</dd>

            {/* シャンパン・ボトルは銘柄のみ。金額は非掲載（方針） */}
            <dt>シャンパン</dt>
            <dd>{champagnes.join("／") + champagneSuffix}</dd>

            {/* お支払い方法：未確認。確認後に差し替え（指名料/同伴料/サービス料/TAX は実態未確認のため未掲載） */}
            <dt>お支払い</dt>
            <dd>{prices.payment}</dd>
          </dl>
          <p className="price-notes">
            {prices.notes[0]}
            <br />
            {prices.notes[1]}
          </p>
        </div>
      </div>
    </section>
  );
}
