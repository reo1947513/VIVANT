import { shop, copyright } from "../data/siteData";

/**
 * フッター：ロゴ・フッターナビ・住所・電話・コピーライト。店舗情報は app/data/siteData.ts 参照。
 *
 * variant は Header と同じ考え方。"page"（ブログなど別ページ）では区画へのリンクを
 * "/#concept" の形にしてトップへ戻す。省略時はトップページ用で従来どおり。
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

export default function Footer({ variant = "home" }: { variant?: Variant }) {
  const href = (hash: string) => (variant === "home" ? hash : `/${hash}`);

  return (
    <footer className="footer">
      <div className="wrap">
        <span className="logo logo--footer" role="img" aria-label={shop.nameEn}></span>
        <nav className="footer-nav">
          {SECTIONS.map((section) => (
            <a key={section.hash} href={href(section.hash)}>
              {section.label}
            </a>
          ))}
          <a href="/blog">BLOG</a>
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
