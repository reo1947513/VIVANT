import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ogImage, meta } from "./data/siteData";

/**
 * SNSで共有されたときに出る画像を、店内写真から自動で作る。
 *
 * なぜ自動で作るのか：
 *   写真をそのまま出すと、小さく表示されたときに何の店か分からない。
 *   店名と一言を重ねておけば、一覧に流れてきた状態でも伝わる。
 *   画像編集の手作業も要らず、店名や一言を変えたら自動で作り直される。
 *
 * キャストの写真は使わない。現在の写真は実在しない人物のデモ画像であり、
 * それを店の顔として配るのは避けるため、店内写真だけを使う。
 *
 * 大きさの 1200×630 は、SNS各社が横長の画像として扱う標準的な寸法。
 * これより小さいと拡大されて粗くなり、大きくても縮小されるだけで意味が無い。
 *
 * 書体について：
 *   この画像は文字を絵として描くため、サイト本文の書体設定は効かない。
 *   日本語の書体を読み込ませると実体が大きく生成が遅くなるので、
 *   重ねる文字は英字（店名）を主役にし、日本語は既定の書体で小さく添える。
 */
export const alt = meta.title;

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image() {
  // 店内写真を読み込んで背景に敷く。process.cwd() はこのプロジェクトの場所
  const photo = await readFile(join(process.cwd(), "public/images/hero.jpg"));
  const photoSrc = `data:image/jpeg;base64,${photo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          backgroundColor: "#140f0b",
        }}
      >
        {/* 背景の店内写真。全面に敷いて、上から暗く落として文字を読ませる */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photoSrc}
          alt=""
          width={1200}
          height={630}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />

        {/* 写真の上に重ねる陰。左側を濃く落として、文字の背後を暗くする */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background:
              "linear-gradient(100deg, rgba(16,11,7,0.92) 0%, rgba(16,11,7,0.78) 45%, rgba(16,11,7,0.42) 100%)",
          }}
        />

        {/* 文字。左に寄せて縦に積む */}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "0 84px",
            height: "100%",
          }}
        >
          <div
            style={{
              fontSize: 26,
              letterSpacing: 8,
              color: "#cf6a1e",
              marginBottom: 22,
            }}
          >
            {ogImage.sub}
          </div>

          <div
            style={{
              fontSize: 92,
              letterSpacing: 6,
              color: "#f4ece3",
              lineHeight: 1.1,
            }}
          >
            {ogImage.heading}
          </div>

          {/* 店名の下の細い線。区切りを作って締まって見せる */}
          <div
            style={{
              width: 120,
              height: 2,
              backgroundColor: "#cf6a1e",
              margin: "30px 0",
            }}
          />

          <div
            style={{
              fontSize: 34,
              color: "#cfc3b6",
              letterSpacing: 2,
            }}
          >
            {ogImage.catch}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
