/**
 * SYSTEM / PRICE：料金カード3枚（中央＝主訴求おすすめ）＋その他ブロック。
 * 料金は確定実データ・税込明記。指名料/同伴料/サービス料/TAX は実態未確認のため未掲載。
 * お支払いは確認中表記。シャンパンは銘柄のみ・金額非掲載。文言・注記は Desktop 版を一切変えない。
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
            <div className="ptype">COUNTER</div>
            <div className="ptype-ja">カウンター席・初回</div>
            <div className="pnum">
              5,000<small>円</small>
            </div>
            <div className="punit">50分／税込</div>
          </div>

          {/* 中央：主訴求（TikTokをご覧の方・確定・税込） */}
          <div className="price-card feat reveal">
            <span className="badge">おすすめ</span>
            <div className="ptype">SPECIAL</div>
            <div className="ptype-ja">TikTokをご覧の方・初回</div>
            <div className="pnum">
              3,000<small>円</small>
            </div>
            <div className="punit">50分／税込</div>
            <div className="pnote">カウンター・ボックス共通</div>
          </div>

          {/* 右：ボックス初回（確定・税込） */}
          <div className="price-card reveal">
            <div className="ptype">BOX</div>
            <div className="ptype-ja">ボックス席・初回</div>
            <div className="pnum">
              7,000<small>円</small>
            </div>
            <div className="punit">50分／税込</div>
          </div>
        </div>

        {/* その他ブロック：延長・シャンパン案内・支払い等 */}
        <div className="price-extra reveal">
          <h3>その他のご案内</h3>
          <dl>
            {/* 延長料金（確定・税込） */}
            <dt>延長</dt>
            <dd>30分 4,500円 ／ 50分 7,000円（全席共通・税込）</dd>

            {/* シャンパン・ボトルは銘柄のみ。金額は非掲載（方針） */}
            <dt>シャンパン</dt>
            <dd>
              ドン・ペリニヨン／クリスタル／アルマンド／ベル・エポック／ソウメイ／モエ・エ・シャンドン／ヴーヴ・クリコ　など各種ご用意（金額はスタッフまで）
            </dd>

            {/* お支払い方法：未確認。確認後に差し替え（指名料/同伴料/サービス料/TAX は実態未確認のため未掲載） */}
            <dt>お支払い</dt>
            <dd>
              お支払い方法については、ただいま確認中です。詳しくはスタッフまでお問い合わせください。
            </dd>
          </dl>
          <p className="price-notes">
            ※表示料金はすべて税込です。
            <br />
            ※システムは予告なく変更となる場合があります。
          </p>
        </div>
      </div>
    </section>
  );
}
