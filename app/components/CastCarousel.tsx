/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef } from "react";
import FallbackImg from "./FallbackImg";

/*
  キャスト：本人同意を得た実在キャストのみを掲載する方針です。
  ・現在の写真は【開発確認用のデモ画像】です（AI生成・実在しません）。
    Rin/Mai/Yua/Nao にデモ画像を配置、Saki/Emi は未配置でプレースホルダ表示。
  ・本番公開前に必ず実在・本人同意済みキャストの実写真へ差し替えること
    （景品表示法・風営法の観点から、実在しない人物を在籍キャストとして掲載しない）。
    差し替え手順は public/images/cast/README.txt を参照。
  ・写真は public/images/cast/<源氏名小文字>.jpg を置けば表示、無ければプレースホルダ。
  ・表示名は今回は仮名のまま（Rin/Mai/Yua/Nao/Saki/Emi）。実在の源氏名が決まり次第 CAST 配列で差し替え。
  ・並び順・名前・一言は Desktop 単一HTML版を維持。辞めた方は配列から削除、追加は1件複製。
*/
type Cast = { name: string; word: string; file: string };

const CAST: Cast[] = [
  { name: "Rin", word: "よろしくね。", file: "rin" },
  { name: "Mai", word: "乾杯しましょ。", file: "mai" },
  { name: "Yua", word: "ゆっくりどうぞ。", file: "yua" },
  { name: "Nao", word: "お待ちしてます。", file: "nao" },
  { name: "Saki", word: "楽しみましょう。", file: "saki" },
  { name: "Emi", word: "またお話したいな。", file: "emi" },
];

// 【仮公開中の一時設定】デモ画像のため、各キャストの「一言」は表示オフにしています。
// word データは CAST 配列に保持しているので、本公開（実写真へ差し替え）時にこのフラグを
// false に戻すだけで、実在キャストの一言を再表示できます。
const TEMP_HIDE_CWORD: boolean = true; // ← 本公開時に false に戻す（実写真差し替えとセット）

function CastCard({ c }: { c: Cast }) {
  return (
    <article className="cast-card">
      <div className="cast-photo">
        <FallbackImg
          className="ph-img"
          src={`/images/cast/${c.file}.jpg`}
          alt={`BAR VIVANT キャスト ${c.name}`}
        />
      </div>
      <div className="cast-info">
        <div className="cname">{c.name}</div>
        <div className="clabel">CAST</div>
        {/* 仮公開中は一言を表示オフ（TEMP_HIDE_CWORD）。本公開時に false へ戻すと再表示 */}
        {!TEMP_HIDE_CWORD && <div className="cword">{c.word}</div>}
      </div>
    </article>
  );
}

export default function CastCarousel() {
  const carouselRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // クローン枚数は枚数から算出（最大3／繋ぎ目の左右ピークを満たす）。クローンは JSX で宣言的に描画する。
  const n = CAST.length;
  const c = Math.min(n, 3);
  const prepend = CAST.slice(n - c); // 末尾 c 枚（先頭に置く）
  const append = CAST.slice(0, c); // 先頭 c 枚（末尾に置く）

  useEffect(() => {
    const carousel = carouselRef.current;
    const track = trackRef.current;
    if (!carousel || !track) return;

    const reduceMotion = !!(
      window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
    const loopable = n >= 2;
    let index = loopable ? c : 0; // 最初の実カードの位置
    const slideDur = reduceMotion ? 0.3 : 0.6; // 秒：reduced motion では短め・控えめに
    const interval = reduceMotion ? 6000 : 3500; // ms：reduced motion ではゆっくり流す

    const slotWidth = () => {
      const first = track.children[0] as HTMLElement | undefined;
      return first ? first.getBoundingClientRect().width : 0;
    };
    const highlight = () => {
      const kids = track.children;
      for (let k = 0; k < kids.length; k++) {
        const card = kids[k].querySelector(".cast-card");
        if (card) card.classList.toggle("is-center", k === index);
      }
    };
    const setPos = (animate: boolean) => {
      const sw = slotWidth();
      const cw = carousel.getBoundingClientRect().width;
      const x = -(index * sw) + (cw - sw) / 2; // どの slot 幅でも中央カードをビューポート中央に
      if (animate) {
        track.style.setProperty("transition", "transform " + slideDur + "s ease", "important");
      } else {
        track.style.setProperty("transition", "none", "important");
      }
      track.style.transform = "translateX(" + x + "px)";
      if (!animate) {
        void track.offsetWidth; // リフローを強制してから復帰（瞬間ジャンプを隠す）
        track.style.setProperty("transition", "transform " + slideDur + "s ease", "important");
      }
      highlight();
    };
    const next = () => {
      if (!loopable) return;
      index++;
      setPos(true);
    };

    let timer: number | null = null;
    let paused = false;
    const stop = () => {
      if (timer !== null) {
        clearInterval(timer);
        timer = null;
      }
    };
    const play = () => {
      if (!loopable || paused) return; // reduced motion でも自動再生（速度のみ抑制）
      stop();
      timer = window.setInterval(next, interval);
    };

    // 端のクローンに達したら、トランジションを切ってインデックスをリセット（シームレス）
    const onTransitionEnd = (e: TransitionEvent) => {
      if (e.propertyName !== "transform") return;
      if (index >= n + c) {
        index -= n;
        setPos(false);
      } else if (index < c) {
        index += n;
        setPos(false);
      }
    };
    const onEnter = () => {
      paused = true;
      stop();
    };
    const onLeave = () => {
      paused = false;
      play();
    };
    const onVisibility = () => {
      if (document.hidden) stop();
      else play();
    };
    let rt: number | undefined;
    const onResize = () => {
      if (rt !== undefined) clearTimeout(rt);
      rt = window.setTimeout(() => setPos(false), 120);
    };
    const onLoad = () => setPos(false);

    track.addEventListener("transitionend", onTransitionEnd as EventListener);
    carousel.addEventListener("mouseenter", onEnter);
    carousel.addEventListener("mouseleave", onLeave);
    carousel.addEventListener("touchstart", onEnter, { passive: true });
    carousel.addEventListener("touchend", onLeave, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("resize", onResize);
    window.addEventListener("load", onLoad);

    setPos(false);
    play();

    return () => {
      stop();
      if (rt !== undefined) clearTimeout(rt);
      track.removeEventListener("transitionend", onTransitionEnd as EventListener);
      carousel.removeEventListener("mouseenter", onEnter);
      carousel.removeEventListener("mouseleave", onLeave);
      carousel.removeEventListener("touchstart", onEnter);
      carousel.removeEventListener("touchend", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("load", onLoad);
    };
  }, [n, c]);

  return (
    <section className="section" id="cast">
      <div className="wrap">
        <div className="sec-head reveal">
          <h2>CAST</h2>
          <span className="sub">在籍キャスト</span>
          <span className="rule"></span>
        </div>

        <div
          className="cast-carousel"
          ref={carouselRef}
          aria-roledescription="carousel"
          aria-label="在籍キャスト（自動でスライドするカルーセル）"
        >
          <div className="cast-track" ref={trackRef}>
            {prepend.map((m, i) => (
              <div className="cast-slot" key={`pre-${i}`} aria-hidden="true">
                <CastCard c={m} />
              </div>
            ))}
            {CAST.map((m, i) => (
              <div className="cast-slot" key={`o-${i}`}>
                <CastCard c={m} />
              </div>
            ))}
            {append.map((m, i) => (
              <div className="cast-slot" key={`app-${i}`} aria-hidden="true">
                <CastCard c={m} />
              </div>
            ))}
          </div>
        </div>

        <div className="sns-cta reveal">
          <a
            className="btn-sns"
            href="https://www.tiktok.com/@bar.vivant"
            target="_blank"
            rel="noopener"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 8.2a6.3 6.3 0 0 0 3.7 1.2V6.7a3.6 3.6 0 0 1-2.5-1A3.7 3.7 0 0 1 16 3h-2.7v11.6a2.3 2.3 0 1 1-2.3-2.3c.2 0 .4 0 .6.1V9.6a5 5 0 1 0 4.4 5V8.2Z" />
            </svg>
            TikTokで最新情報をチェック
          </a>
        </div>
      </div>
    </section>
  );
}
