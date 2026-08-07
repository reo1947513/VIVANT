"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { shop } from "../data/siteData";
import type { GalleryImage } from "../lib/types";

/**
 * GALLERY の写真グリッドと、写真を押したときの拡大表示。
 *
 * 枠は正方形で大きさを固定し、入る枚数だけ折り返して中央に寄せる（CSS 側 .gallery-grid）。
 * 枠を押すと画面全体に暗幕を敷き、写真を切り抜かずに全体を表示する。
 *
 * 拡大表示の操作：
 *   閉じる     … ×ボタン / 暗幕を押す / Esc キー
 *   前後の写真 … ‹ › ボタン / ← → キー（写真が2枚以上のときだけ出す）
 *
 * 開いている間は背景が動かないよう、body のスクロールを止める。
 * 閉じたときは、押した枠へキーボードの位置（フォーカス）を戻す。
 */
export default function GalleryGrid({ images }: { images: GalleryImage[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  // 拡大表示を開く直前に触っていた枠。閉じたときにここへ戻す
  const openerRef = useRef<HTMLElement | null>(null);

  const isOpen = openIndex !== null;
  const total = images.length;

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

  // openIndex をそのまま使うと、下の JSX の中で「null ではない」と見なされないため控えを置く
  const currentIndex = openIndex;
  const current = currentIndex === null ? null : images[currentIndex];

  return (
    <>
      <div className="gallery-grid">
        {images.map((image, index) => (
          <button
            type="button"
            className="ph gallery-tile reveal"
            key={image.id}
            onClick={(e) => open(index, e)}
            aria-label={`${labelOf(image, index)}を拡大表示する`}
          >
            {/* 枠は1辺240px。倍の解像度の画面でも粗くならないよう480pxで用意し、
                それ以上の原寸は配らない（受信量が10分の1以下になる） */}
            <Image
              className="ph-img"
              src={image.imageUrl}
              alt={labelOf(image, index)}
              width={480}
              height={480}
              sizes="240px"
              loading="lazy"
            />
          </button>
        ))}
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
