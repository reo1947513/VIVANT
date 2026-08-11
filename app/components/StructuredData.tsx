import { shop, prices, seo, siteUrl, meta } from "../data/siteData";
import { getSiteLinks } from "../lib/queries/links";

/**
 * 店舗情報を、機械が読み取れる形（構造化データ）で埋め込む。
 *
 * 何のためか：
 *   画面の文章は人が読む前提で書かれているため、機械には
 *   「どれが住所でどれが電話番号か」が確実には分からない。
 *   決められた書式で同じ内容を併記しておくと、検索結果に営業時間や
 *   場所が併せて出たり、AIの案内役が店の情報を取り違えずに答えられる。
 *
 * 書く内容は app/data/siteData.ts の値だけを使う。
 * 画面に出ている内容と食い違うと、かえって信用されないため。
 *
 * SNSのURLは管理画面で登録されたものを使う（sameAs）。
 * これは「この店の公式な発信先はここ」と示すもので、
 * 同名の別店舗と取り違えられるのを防ぐ働きがある。
 */
export default async function StructuredData() {
  const links = (await getSiteLinks()).filter((l) => l.url !== "");

  const data = {
    "@context": "https://schema.org",
    "@type": seo.businessType,
    "@id": `${siteUrl}/#shop`,
    name: shop.nameEn,
    alternateName: [shop.nameKana, shop.nameFull],
    description: meta.description,
    url: siteUrl,
    telephone: shop.tel.display,
    address: {
      "@type": "PostalAddress",
      addressCountry: "JP",
      postalCode: shop.address.postal,
      addressRegion: "大阪府",
      addressLocality: "大阪市北区",
      streetAddress: `${shop.address.line1.replace("大阪府大阪市北区", "")} ${shop.address.line2}`,
    },
    areaServed: seo.areaServed,
    openingHours: seo.openingHours,
    priceRange: seo.priceRange,
    currenciesAccepted: "JPY",
    /* 公式な発信先。同名の別店舗と取り違えられるのを防ぐ */
    sameAs: links.map((l) => l.url),
    /* 料金の内訳。初回料金の3枠をそのまま載せる（税込・50分） */
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "初回料金",
      itemListElement: [prices.counterFirst, prices.tiktokFirst, prices.boxFirst].map(
        (p) => ({
          "@type": "Offer",
          name: p.ja,
          price: p.amount.replace(/,/g, ""),
          priceCurrency: "JPY",
          description: p.unit,
        })
      ),
    },
  };

  return (
    <script
      type="application/ld+json"
      /*
        構造化データは JSON をそのまま置く決まりで、
        画面に表示される文字ではないため文字化けの心配は無い。
        値は全て自分たちのコード（siteData.ts）と管理画面の登録内容だけを使い、
        利用者が入力した文字はここに入れていない。
      */
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
