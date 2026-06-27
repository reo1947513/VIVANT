/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef } from "react";
import FallbackImg from "./FallbackImg";
import { shop } from "../data/siteData";

/*
  キャスト：本人同意を得た実在キャストのみを掲載する方針です。
  ・現在の写真は【開発確認用のデモ画像】です（AI生成・実在しません）。全6枠（Rin/Mai/Yua/Nao/Saki/Emi）に配置済み。
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
    const slideDur = reduceMotion ? 0.3 : 0.9; // 秒：通常は0.9sでより滑らかに（reduced motion は0.3s据え置き）
    const interval = reduceMotion ? 6000 : 4000; // ms：移動を伸ばしたぶん間隔も4sに（reduced motion は6s据え置き）
    const EASE = "cubic-bezier(0.22, 0.61, 0.36, 1)"; // 開始・終了が柔らかい ease-out 寄りの曲線

    // スワイプ判定のしきい値
    const SWIPE_DECIDE = 8; // px：この移動量で「横スワイプ」か「縦スクロール」かを確定
    const SWIPE_COMMIT = 40; // px：丸めで0枚でも、この量を超える明確なスワイプは最低1枚送る
    const RESUME_MS = 5000; // ms：スワイプ等の操作後、これだけ無操作なら自動再生を再開

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
    // 中央カードのインデックスから、ぴたっと収まる translateX を算出
    const xForIndex = () => {
      const sw = slotWidth();
      const cw = carousel.getBoundingClientRect().width;
      return -(index * sw) + (cw - sw) / 2; // どの slot 幅でも中央カードをビューポート中央に
    };
    const setPos = (animate: boolean) => {
      const x = xForIndex();
      if (animate) {
        track.style.setProperty("transition", "transform " + slideDur + "s " + EASE, "important");
      } else {
        track.style.setProperty("transition", "none", "important");
      }
      track.style.transform = "translateX(" + x + "px)";
      if (!animate) {
        void track.offsetWidth; // リフローを強制してから復帰（瞬間ジャンプを隠す）
        track.style.setProperty("transition", "transform " + slideDur + "s " + EASE, "important");
      }
      highlight();
    };
    // 現在の実トラック位置（アニメ途中でも実値を取得。スワイプ開始点の固定に使う）
    const currentX = () => {
      const st = window.getComputedStyle(track).transform;
      if (st && st !== "none") {
        const m = st.match(/matrix3d\((.+)\)/);
        if (m) {
          const p = m[1].split(",").map((s) => parseFloat(s.trim()));
          if (p.length >= 13 && !Number.isNaN(p[12])) return p[12];
        }
        const m2 = st.match(/matrix\((.+)\)/);
        if (m2) {
          const p = m2[1].split(",").map((s) => parseFloat(s.trim()));
          if (p.length >= 6 && !Number.isNaN(p[4])) return p[4];
        }
      }
      return xForIndex();
    };
    const next = () => {
      if (!loopable) return;
      index++;
      setPos(true);
    };

    let timer: number | null = null;
    let paused = false; // マウスホバー由来の一時停止フラグ（タッチでは使わない）
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

    // スワイプ後の自動再生「再開」予約（無操作 RESUME_MS で復帰）
    let resumeTimer: number | undefined;
    const clearResume = () => {
      if (resumeTimer !== undefined) {
        clearTimeout(resumeTimer);
        resumeTimer = undefined;
      }
    };
    const scheduleResume = () => {
      clearResume();
      resumeTimer = window.setTimeout(() => {
        resumeTimer = undefined;
        // タッチ環境では tap 直後に擬似 mouseenter が走り paused=true になる端末があるため、
        // タッチ操作起点の再開ではフラグを倒してから再生する（マウス専用環境はこの予約を作らない）。
        paused = false;
        play();
      }, RESUME_MS);
    };

    // 端のクローンに達したら、トランジションを切ってインデックスをリセット（シームレス）。
    // 自動再生・スワイプ共通。範囲内なら何もしないので、多重に呼ばれても安全（冪等）。
    const normalizeLoop = () => {
      if (index >= n + c) {
        index -= n;
        setPos(false);
      } else if (index < c) {
        index += n;
        setPos(false);
      }
    };
    const onTransitionEnd = (e: TransitionEvent) => {
      if (e.propertyName !== "transform") return;
      normalizeLoop();
    };
    // スワイプで指がほぼ1スロットぴったり動いた等、スナップ先と現在位置が一致すると
    // トランジションが発火せず transitionend が来ない。その場合でもクローン位置に取り残されない
    // よう、スナップ後にこの保険でループ補正を実行する（範囲内なら no-op）。
    let snapTimer: number | undefined;
    const clearSnap = () => {
      if (snapTimer !== undefined) {
        clearTimeout(snapTimer);
        snapTimer = undefined;
      }
    };
    const scheduleSnapNormalize = () => {
      clearSnap();
      snapTimer = window.setTimeout(() => {
        snapTimer = undefined;
        normalizeLoop();
      }, slideDur * 1000 + 160);
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

    // ===== 機能2：スワイプ（タッチ）での手動スライド＋スナップ =====
    let dragging = false; // タッチ開始〜終了の間
    let decided = false; // 横スワイプ/縦スクロールの判定が済んだか
    let isSwipe = false; // 横スワイプとして処理中か
    let startX = 0;
    let startY = 0;
    let lastX = 0;
    let baseX = 0; // スワイプ開始時の実トラック位置
    let swMeasured = 0; // スワイプ開始時のスロット幅

    const onTouchStart = (e: TouchEvent) => {
      if (!loopable) return;
      const t = e.touches[0];
      if (!t) return;
      startX = t.clientX;
      startY = t.clientY;
      lastX = startX;
      dragging = true;
      decided = false;
      isSwipe = false;
      swMeasured = slotWidth();
      stop(); // 操作中は自動再生を止める
      clearResume(); // 直前の再開予約はいったん取り消し
      clearSnap();
      normalizeLoop(); // 直前のスワイプでループ補正待ちなら、ここで先に確定させてから始める
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!dragging) return;
      const t = e.touches[0];
      if (!t) return;
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;
      lastX = t.clientX;
      if (!decided) {
        if (Math.abs(dx) < SWIPE_DECIDE && Math.abs(dy) < SWIPE_DECIDE) return; // まだ判定できる移動量でない
        if (Math.abs(dx) > Math.abs(dy)) {
          // 横方向が優勢 → スワイプ確定。指に追従させるためトランジションを切る
          isSwipe = true;
          decided = true;
          baseX = currentX();
          track.style.setProperty("transition", "none", "important");
        } else {
          // 縦方向が優勢 → ページの縦スクロールを優先し、スワイプは中止
          decided = true;
          isSwipe = false;
          dragging = false;
          scheduleResume();
          return;
        }
      }
      if (isSwipe) {
        e.preventDefault(); // 横スワイプ中はページ縦スクロールを抑制
        let nx = baseX + dx;
        const limit = swMeasured * c; // クローン枚数ぶんを超えて引っ張れない（端の空白を見せない）
        if (nx > baseX + limit) nx = baseX + limit;
        if (nx < baseX - limit) nx = baseX - limit;
        track.style.transform = "translateX(" + nx + "px)";
      }
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (!dragging && !isSwipe) return; // 既に縦スクロールで離脱済み
      dragging = false;
      if (isSwipe) {
        const endX =
          e.changedTouches && e.changedTouches[0] ? e.changedTouches[0].clientX : lastX;
        const dx = endX - startX;
        const sw = swMeasured || slotWidth();
        let delta = sw > 0 ? Math.round(-dx / sw) : 0; // 最も近いキャストへスナップ
        if (delta === 0 && Math.abs(dx) > SWIPE_COMMIT) {
          delta = dx < 0 ? 1 : -1; // 明確なスワイプは最低1枚送る
        }
        if (delta > c) delta = c; // クローン枚数を超える送りは抑える
        if (delta < -c) delta = -c;
        index += delta;
        setPos(true); // 正確なスロット位置へアニメスナップ。端なら transitionend でシームレス補正
        scheduleSnapNormalize(); // トランジションが発火しない場合の保険（クローン取り残し防止）
      }
      isSwipe = false;
      decided = false;
      scheduleResume(); // RESUME_MS 無操作で自動再生を再開
    };

    // ===== 機能1：キャスト写真の長押し保存・ドラッグ移動・選択を抑制（画像に限定） =====
    // 一般利用者のうっかり保存・移動を防ぐ範囲の対策（スクショや開発者ツール経由までは防がない）。
    const castImgs = Array.from(
      carousel.querySelectorAll<HTMLImageElement>(".cast-photo img")
    );
    castImgs.forEach((img) => {
      img.draggable = false;
    });
    const onContextMenu = (e: Event) => {
      const el = e.target as HTMLElement | null;
      if (el && el.closest && el.closest(".cast-photo")) e.preventDefault();
    };
    const onDragStart = (e: Event) => {
      const el = e.target as HTMLElement | null;
      if (el && el.closest && el.closest(".cast-photo")) e.preventDefault();
    };

    track.addEventListener("transitionend", onTransitionEnd as EventListener);
    carousel.addEventListener("mouseenter", onEnter);
    carousel.addEventListener("mouseleave", onLeave);
    carousel.addEventListener("touchstart", onTouchStart, { passive: true });
    carousel.addEventListener("touchmove", onTouchMove, { passive: false });
    carousel.addEventListener("touchend", onTouchEnd, { passive: true });
    carousel.addEventListener("touchcancel", onTouchEnd, { passive: true });
    carousel.addEventListener("contextmenu", onContextMenu);
    carousel.addEventListener("dragstart", onDragStart);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("resize", onResize);
    window.addEventListener("load", onLoad);

    setPos(false);
    play();

    return () => {
      stop();
      clearResume();
      clearSnap();
      if (rt !== undefined) clearTimeout(rt);
      track.removeEventListener("transitionend", onTransitionEnd as EventListener);
      carousel.removeEventListener("mouseenter", onEnter);
      carousel.removeEventListener("mouseleave", onLeave);
      carousel.removeEventListener("touchstart", onTouchStart);
      carousel.removeEventListener("touchmove", onTouchMove);
      carousel.removeEventListener("touchend", onTouchEnd);
      carousel.removeEventListener("touchcancel", onTouchEnd);
      carousel.removeEventListener("contextmenu", onContextMenu);
      carousel.removeEventListener("dragstart", onDragStart);
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
          {/* 中央スポットライト（固定の装飾。トラックと一緒には動かず中央に留まる／操作を邪魔しない） */}
          <div className="cast-spotlight" aria-hidden="true"></div>
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
            href={shop.tiktokUrl}
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
