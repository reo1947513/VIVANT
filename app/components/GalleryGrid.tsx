"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { shop } from "../data/siteData";
import type { GalleryImage } from "../lib/types";

/**
 * GALLERY：暗闇に浮かぶ一枚岩（スラブ）と、押したときの拡大表示。
 *
 * 見せ方の考え方：
 *   縦長の黒い塊が宙に浮いている。実体は写真を貼った板が4枚、
 *   ほとんど隙間なく重なったもの。板は剥がれず、開かず、塊のまま動く。
 *   塊は垂直の軸を中心にゆっくり自転し続ける。ページを開いた瞬間から止まらない。
 *   画面を送ると自転が少し速くなり、わずかに傾いて側面の層（重なった4枚の厚み）が覗く。
 *   送るのをやめても自転は続き、速さと傾きだけがゆっくり元へ戻る。
 *
 * 作り：
 *   回転は毎フレーム自分で計算して当てる（CSSの繰り返し演出ではなく）。
 *   速さと傾きをその場で変えたいのに、CSS側の演出だと途中から差し込めないため。
 *   区画が画面から外れている間は計算を止める（見えないものを回し続けない）。
 *   動きを減らす設定の利用者には、回さずに少しだけ傾けた姿で見せる。
 *
 * 押したときは拡大表示を開く。そこから左右の送りで全部の写真を見られるため、
 * 塊に貼る4枚に入らなかった写真も辿れる。
 */
export default function GalleryGrid({ images }: { images: GalleryImage[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  // 拡大表示を開く直前に触っていた場所。閉じたときにここへ戻す
  const openerRef = useRef<HTMLElement | null>(null);

  const isOpen = openIndex !== null;
  const total = images.length;

  // 塊を構成する板。仕様どおり4枚まで
  const panels = images.slice(0, 4);

  const labelOf = (image: GalleryImage, index: number) =>
    image.alt || `${shop.nameEn} 店内 ${index + 1}`;

  const close = useCallback(() => setOpenIndex(null), []);

  const showPrev = useCallback(() => {
    setOpenIndex((current) => (current === null ? null : (current - 1 + total) % total));
  }, [total]);

  const showNext = useCallback(() => {
    setOpenIndex((current) => (current === null ? null : (current + 1) % total));
  }, [total]);

  function open(index: number, event: React.MouseEvent<HTMLButtonElement>) {
    openerRef.current = event.currentTarget;
    setOpenIndex(index);
  }

  useEffect(() => {
    if (!isOpen) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        showPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        showNext();
      }
    }

    document.addEventListener("keydown", onKeyDown);

    // 背景が一緒に動くのを防ぐ。元の指定に戻せるよう控えておく
    const bodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    closeButtonRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = bodyOverflow;
      openerRef.current?.focus();
    };
  }, [isOpen, close, showPrev, showNext]);

  // ---- 自転の制御 -------------------------------------------------------
  const stageRef = useRef<HTMLDivElement>(null);
  const slabRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const slab = slabRef.current;
    const stage = stageRef.current;
    if (!slab || !stage) return;

    /* 動きを減らす設定のときは、止めるのではなく半分以下の速さで回し、
       画面を送ったときの加速と傾きだけを無しにする。
       完全に止めると「壊れている」と見えるため、カルーセルと同じ方針に揃えた。 */
    const gentle = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let angle = 0; // 現在の向き（度）
    let boost = 0; // 画面を送った勢いで上乗せする速さ（度/秒）
    let tilt = 0; // 上下の傾き（度）
    let visible = true;
    let previous = 0;
    let lastScrollY = window.scrollY;
    let frameId = 0;

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { threshold: 0 }
    );
    observer.observe(stage);

    function onScroll() {
      if (gentle) return;
      const delta = window.scrollY - lastScrollY;
      lastScrollY = window.scrollY;
      // 勢いは足し込むが上限を設ける（速く弾くと目で追えなくなるため）
      boost = Math.min(boost + Math.abs(delta) * 0.5, 110);
      // 傾きは送った向きに応じて上下へ。ここで側面の層が覗く
      tilt = Math.max(Math.min(tilt + delta * 0.05, 11), -11);
    }

    window.addEventListener("scroll", onScroll, { passive: true });

    function frame(now: number) {
      frameId = window.requestAnimationFrame(frame);
      if (!previous) previous = now;
      const seconds = Math.min((now - previous) / 1000, 0.05);
      previous = now;
      if (!visible) return;

      angle = (angle + ((gentle ? 3 : 7) + boost) * seconds) % 360;
      // 上乗せぶんと傾きは、放っておくとゆっくり元へ戻る（1秒でおよそ8分の1）
      boost *= Math.pow(0.12, seconds);
      tilt *= Math.pow(0.25, seconds);

      slab!.style.transform = `rotateX(${tilt.toFixed(2)}deg) rotateY(${angle.toFixed(2)}deg)`;
    }

    frameId = window.requestAnimationFrame(frame);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, []);

  // openIndex をそのまま使うと、下の JSX の中で「null ではない」と見なされないため控えを置く
  const currentIndex = openIndex;
  const current = currentIndex === null ? null : images[currentIndex];

  return (
    <>
      <div className="slab-stage reveal" ref={stageRef}>
        <button
          type="button"
          className="slab"
          ref={slabRef}
          onClick={(e) => open(0, e)}
          aria-label="店内の写真を拡大表示する"
        >
          {panels.map((image, index) => (
            <span
              className="slab-panel"
              key={image.id}
              /* 手前から何枚目か。奥行きと暗さの計算に使う */
              style={{ ["--i" as string]: index } as React.CSSProperties}
            >
              <Image
                src={image.imageUrl}
                alt={index === 0 ? labelOf(image, index) : ""}
                width={620}
                height={830}
                sizes="(max-width: 680px) 70vw, 310px"
                loading="eager"
              />
            </span>
          ))}
        </button>
      </div>

      {current !== null && currentIndex !== null && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="写真の拡大表示"
          onClick={close}
        >
          <button
            type="button"
            className="lightbox-close"
            onClick={close}
            aria-label="閉じる"
            ref={closeButtonRef}
          >
            ×
          </button>

          {total > 1 && (
            <button
              type="button"
              className="lightbox-nav lightbox-prev"
              onClick={(e) => {
                e.stopPropagation();
                showPrev();
              }}
              aria-label="前の写真"
            >
              ‹
            </button>
          )}

          {/* 写真そのものを押したときは閉じない（誤操作で閉じるのを防ぐ）。
              拡大時の最大幅は900pxなので、それに合わせた大きさで配る */}
          <Image
            className="lightbox-img"
            src={current.imageUrl}
            alt={labelOf(current, currentIndex)}
            width={900}
            height={1350}
            sizes="(max-width: 960px) 92vw, 900px"
            onClick={(e) => e.stopPropagation()}
          />

          {total > 1 && (
            <button
              type="button"
              className="lightbox-nav lightbox-next"
              onClick={(e) => {
                e.stopPropagation();
                showNext();
              }}
              aria-label="次の写真"
            >
              ›
            </button>
          )}

          {total > 1 && (
            <p className="lightbox-count">
              {currentIndex + 1} / {total}
            </p>
          )}
        </div>
      )}
    </>
  );
}
