import { describe, it, expect } from "vitest";
import { fitWithin, uploadErrorMessage } from "../app/lib/clientImage";

/**
 * 送る前に写真を縮める処理の確認。
 *
 * ここを対象にしている理由：
 *   本番の置き場所（Vercel）は1回の送信で約4.5MBまでしか受け取れない。
 *   縮める大きさの計算を誤ると、縦横比が崩れた写真が登録されたり、
 *   縮めたつもりで原寸のまま送って門前払いされたりする。
 *   また門前払いされたときは返事から理由を読み取れないため、
 *   画面に出す文言の決め方も併せて確かめる。
 *
 * 実際に絵を描き直す部分はブラウザの機能を使うため、ここでは扱わない。
 */
describe("長い辺を上限に収める大きさ（fitWithin）", () => {
  it("横長の写真は、横幅を上限に合わせ、縦横比を保つ", () => {
    // 4032×3024（よくあるスマートフォンの写真）→ 2400×1800
    expect(fitWithin(4032, 3024, 2400)).toEqual({ width: 2400, height: 1800 });
  });

  it("縦長の写真は、高さを上限に合わせ、縦横比を保つ", () => {
    expect(fitWithin(3024, 4032, 2400)).toEqual({ width: 1800, height: 2400 });
  });

  it("既に上限以内の写真は、大きさを変えない（拡大しない）", () => {
    expect(fitWithin(1200, 800, 2400)).toEqual({ width: 1200, height: 800 });
  });

  it("ちょうど上限の写真も、大きさを変えない", () => {
    expect(fitWithin(2400, 1600, 2400)).toEqual({ width: 2400, height: 1600 });
  });

  it("極端に細長い写真でも、短い辺が0にならない", () => {
    expect(fitWithin(10000, 1, 2400)).toEqual({ width: 2400, height: 1 });
  });
});

describe("送信に失敗したときの文言（uploadErrorMessage）", () => {
  it("サーバーが理由を返したときは、その理由をそのまま出す", () => {
    expect(
      uploadErrorMessage(422, { error: "画像のサイズは5MBまでです。" }, "失敗しました。")
    ).toBe("画像のサイズは5MBまでです。");
  });

  it("容量オーバーで断られた（413）ときは、容量が原因だと伝える", () => {
    expect(uploadErrorMessage(413, {}, "失敗しました。")).toContain("容量が大きすぎ");
  });

  it("理由が分からないときは、呼び出し側が決めた文言を出す", () => {
    expect(uploadErrorMessage(500, {}, "失敗しました。")).toBe("失敗しました。");
  });

  it("理由が文字でない場合は、使わずに呼び出し側の文言を出す", () => {
    expect(uploadErrorMessage(500, { error: 123 }, "失敗しました。")).toBe("失敗しました。");
  });
});
