import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { meta } from "./data/siteData";

/**
 * SNSで共有されたときに出る画像を、ロゴから自動で作る。
 *
 * 店内写真を敷いた版から、ロゴのみのシンプルな版に変更した。
 * 使う画像は public/images/logo-og.png（scripts/recolor-logo-for-og.py で
 * 元の public/images/logo.png からクリーム色 #f0ebe3 に塗り替えて生成した
 * 一度きりの変換物）。next/og（Satori）は CSS の mask-image に対応しておらず、
 * サイト本体のように暗い焦茶色のロゴをその場でクリーム色へ塗り替えられない
 * ため、あらかじめ塗り替え済みの画像を用意している。
 *
 * 大きさの 1200×630 は、SNS各社が横長の画像として扱う標準的な寸法。
 * これより小さいと拡大されて粗くなり、大きくても縮小されるだけで意味が無い。
 */
export const alt = meta.title;

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image() {
  const logo = await readFile(
    join(process.cwd(), "public/images/logo-og.png")
  );
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#140f0b",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoSrc}
          alt=""
          width={340}
          height={340}
          style={{
            width: 340,
            height: 340,
          }}
        />
      </div>
    ),
    { ...size }
  );
}
