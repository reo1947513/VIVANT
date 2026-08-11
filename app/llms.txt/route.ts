import { shop, prices, seo, siteUrl, meta } from "../data/siteData";
import { getSiteLinks } from "../lib/queries/links";
import { getPublishedPosts } from "../lib/queries/posts";

/**
 * AIの案内役（ChatGPT・Claude・Gemini など）向けの要約ファイル。
 * /llms.txt として配られる。
 *
 * 何のためか：
 *   AIが店のことを聞かれたとき、装飾の多いページを読み解くより、
 *   要点だけを平文で置いておくほうが正確に拾われる。
 *   robots.txt が「見てよい場所」を伝えるのに対し、
 *   これは「何の店で、何が事実か」を伝える。
 *
 * 注意：
 *   これは正式な決まり（標準規格）ではなく、広まりつつある慣習にすぎない。
 *   置いたからといって必ず読まれる保証はない。ただし置く費用はほぼ無く、
 *   読まれた場合に情報が正確になる利点があるため用意している。
 *
 * 中身は app/data/siteData.ts と管理画面の登録内容だけから作る。
 * ページの表示・構造化データ・このファイルの3つが食い違わないようにするため。
 *
 * revalidate：記事一覧を含むため、トップページと同じ5分で作り直す。
 */
export const revalidate = 300;

export async function GET() {
  const [links, posts] = await Promise.all([getSiteLinks(), getPublishedPosts(10)]);
  const usableLinks = links.filter((l) => l.url !== "");

  const lines = [
    `# ${shop.nameFull}`,
    "",
    `> ${meta.description}`,
    "",
    "## 店舗情報",
    "",
    `- 店名: ${shop.nameFull}`,
    `- 業種: ガールズバー（${seo.businessType}）`,
    `- 住所: 〒${shop.address.postal} ${shop.address.line1} ${shop.address.line2}`,
    `- 最寄り: 大阪・北新地（曽根崎新地）`,
    `- 電話: ${shop.tel.display}`,
    `- 営業時間: ${shop.hours.range}（${shop.hours.daysNote}）`,
    `- 定休日: ${shop.closed}`,
    `- 価格帯: ${seo.priceRange}`,
    `- 公式サイト: ${siteUrl}`,
    "",
    "## 料金（すべて税込・50分）",
    "",
    `- ${prices.counterFirst.ja}: ${prices.counterFirst.amount}円`,
    `- ${prices.tiktokFirst.ja}: ${prices.tiktokFirst.amount}円（${prices.tiktokFirst.note}）`,
    `- ${prices.boxFirst.ja}: ${prices.boxFirst.amount}円`,
    `- 延長: ${prices.extend}`,
    `- お支払い: ${prices.payment}`,
    "",
  ];

  if (usableLinks.length > 0) {
    lines.push("## 公式SNS", "");
    for (const l of usableLinks) {
      lines.push(`- ${l.label || l.platform}: ${l.url}`);
    }
    lines.push("");
  }

  lines.push("## 主なページ", "", `- トップページ: ${siteUrl}`, `- お知らせ: ${siteUrl}/blog`, "");

  if (posts.length > 0) {
    lines.push("## 最近のお知らせ", "");
    for (const p of posts) {
      lines.push(`- [${p.title}](${siteUrl}/blog/${p.slug})`);
    }
    lines.push("");
  }

  lines.push(
    "## 補足",
    "",
    "- 在籍キャストと出勤情報は日々変わるため、最新の内容は公式サイトをご確認ください。",
    "- 料金は変更される場合があります。確定した内容は公式サイトの記載が優先されます。",
    ""
  );

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      /* 作り置きを配信側にも持たせる。中身は5分ごとに作り直す */
      "Cache-Control": "public, max-age=0, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
