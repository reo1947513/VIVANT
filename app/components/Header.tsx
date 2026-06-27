import { shop } from "../data/siteData";

/**
 * 固定ヘッダー＋モバイルメニュー（静的マークアップ）。
 * スクロール時の背景付与・ハンバーガー開閉は ClientEffects が id 経由で配線する。
 * 店名は app/data/siteData.ts から参照（表記ゆれ防止）。
 */
export default function Header() {
  return (
    <>
      <header className="header" id="header">
        <div className="wrap">
          <a className="brand" href="#top" aria-label={`${shop.nameFull} トップへ`}>
            <span className="logo logo--header"></span>
          </a>

          <nav className="nav">
            <a href="#top">TOP</a>
            <a href="#concept">CONCEPT</a>
            <a href="#system">SYSTEM</a>
            <a href="#cast">CAST</a>
            <a href="#gallery">GALLERY</a>
            <a href="#access">ACCESS</a>
          </nav>

          {/* 予約導線：LINE/予約フォーム未提供のため当面はページ内 RESERVE へ。実URL確定後に差し替え可 */}
          <a className="btn-reserve desktop" href="#reserve">
            RESERVE
          </a>

          <button
            className="hamb"
            id="hamb"
            aria-label="メニューを開く"
            aria-expanded="false"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </header>

      <div className="mobile-nav" id="mobileNav">
        <ul>
          <li>
            <a href="#top">TOP</a>
          </li>
          <li>
            <a href="#concept">CONCEPT</a>
          </li>
          <li>
            <a href="#system">SYSTEM</a>
          </li>
          <li>
            <a href="#cast">CAST</a>
          </li>
          <li>
            <a href="#gallery">GALLERY</a>
          </li>
          <li>
            <a href="#access">ACCESS</a>
          </li>
          <li>
            <a href="#reserve">RESERVE</a>
          </li>
        </ul>
      </div>
    </>
  );
}
