import { shop } from "../data/siteData";

/**
 * 固定ヘッダー＋モバイルメニュー（静的マークアップ）。
 * スクロール時の背景付与・ハンバーガー開閉は ClientEffects が id 経由で配線する。
 * 店名は app/data/siteData.ts から参照（表記ゆれ防止）。
 *
 * variant：
 *   "home"（既定）… トップページ用。区画へのリンクは "#concept" のようにページ内移動。
 *   "page" … ブログなど別ページ用。同じ区画が無いため "/#concept" と書いてトップへ戻す。
 *   省略時はこれまでどおりの動きなので、トップページ側の挙動は変わらない。
 */
type Variant = "home" | "page";

const SECTIONS = [
  { hash: "#top", label: "TOP" },
  { hash: "#concept", label: "CONCEPT" },
  { hash: "#system", label: "SYSTEM" },
  { hash: "#cast", label: "CAST" },
  { hash: "#schedule", label: "SCHEDULE" },
  { hash: "#gallery", label: "GALLERY" },
  { hash: "#access", label: "ACCESS" },
] as const;

function href(hash: string, variant: Variant): string {
  return variant === "home" ? hash : `/${hash}`;
}

export default function Header({ variant = "home" }: { variant?: Variant }) {
  return (
    <>
      <header className="header" id="header">
        <div className="wrap">
          <a
            className="brand"
            href={href("#top", variant)}
            aria-label={`${shop.nameFull} トップへ`}
          >
            <span className="logo logo--header"></span>
          </a>

          <nav className="nav">
            {SECTIONS.map((section) => (
              <a key={section.hash} href={href(section.hash, variant)}>
                {section.label}
              </a>
            ))}
            <a href="/blog">BLOG</a>
          </nav>

          {/* 予約導線：LINE/予約フォーム未提供のため当面はページ内 RESERVE へ。実URL確定後に差し替え可 */}
          <a className="btn-reserve desktop" href={href("#reserve", variant)}>
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
          {SECTIONS.map((section) => (
            <li key={section.hash}>
              <a href={href(section.hash, variant)}>{section.label}</a>
            </li>
          ))}
          <li>
            <a href="/blog">BLOG</a>
          </li>
          <li>
            <a href={href("#reserve", variant)}>RESERVE</a>
          </li>
        </ul>
      </div>
    </>
  );
}
